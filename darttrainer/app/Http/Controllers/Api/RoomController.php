<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Friendship;
use App\Models\GameMatch;
use App\Models\GameRoom;
use App\Models\Leg;
use App\Models\RoomPlayer;
use App\Models\User;
use App\Models\UserGuestPreset;
use App\Services\CricketEngine;
use App\Services\GameStateManager;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class RoomController extends Controller
{
    public function __construct(
        private readonly GameStateManager $stateManager,
        private readonly CricketEngine $cricket,
    ) {}

    public function myActive(Request $request): JsonResponse
    {
        $allowedTypes = ['ten_of_ten', 'close_the_number', 'x01', 'cricket'];
        $gameType     = $request->query('game_type');
        $playMode     = $request->query('play_mode');

        $query = GameRoom::whereHas('players', fn ($q) => $q->where('user_id', Auth::id()))
            ->whereIn('status', ['waiting', 'active', 'suspended'])
            ->with(['ongoingMatch', 'players.user']);

        if (is_string($gameType) && in_array($gameType, $allowedTypes, true)) {
            $query->where('game_type', $gameType);
        }

        if (is_string($playMode) && in_array($playMode, ['online', 'local'], true)) {
            $this->wherePlayModeMatches($query, $playMode);
        }

        $rooms = $query->orderByDesc('id')->limit(40)->get();

        foreach ($rooms as $room) {
            if ($this->wizardSetupMatchesRoom($room, $request)) {
                return response()->json(['room' => $this->roomResource($room)]);
            }
        }

        return response()->json(['room' => null]);
    }

    /**
     * Visas telpas, kurās lietotājs ir spēlētājs un sesija vēl nav noslēgta (sākumlapai).
     */
    public function myActives(): JsonResponse
    {
        $rooms = GameRoom::whereHas('players', fn ($q) => $q->where('user_id', Auth::id()))
            ->whereIn('status', ['waiting', 'active', 'suspended'])
            ->with(['ongoingMatch', 'players.user'])
            ->orderByDesc('id')
            ->limit(40)
            ->get();

        return response()->json([
            'items' => $rooms->map(fn (GameRoom $r) => $this->roomResource($r))->values()->all(),
        ]);
    }

    public function create(Request $request): JsonResponse
    {
        $data = $request->validate([
            'game_type'    => 'required|in:ten_of_ten,close_the_number,x01,cricket',
            'game_config'  => 'required|array',
            'max_players'  => 'integer|min:1|max:4',
            'play_mode'    => 'nullable|in:online,local',
            'local_roster' => 'nullable|array|max:3',
        ]);

        $playMode = $data['play_mode'] ?? 'online';
        if ($playMode !== 'local') {
            $playMode = 'online';
        }

        // Viens nenoslēgts mačs uz kombināciju game_type + play_mode (lokālais netraucē jaunai tiešsaistes telpai).
        $existingQuery = GameRoom::whereHas('players', fn ($q) => $q->where('user_id', Auth::id()))
            ->where('game_type', $data['game_type'])
            ->whereIn('status', ['waiting', 'active', 'suspended']);

        $this->wherePlayModeMatches($existingQuery, $playMode);

        $candidates = $existingQuery->with(['ongoingMatch', 'players.user'])->orderByDesc('id')->limit(40)->get();

        foreach ($candidates as $existing) {
            if (!$this->sameGameConfig($existing->game_config ?? [], $data['game_type'], $data['game_config'])) {
                continue;
            }

            return response()->json([
                'error' => 'Tev jau ir aktīva ' . strtoupper($data['game_type']) . ' telpa šajā režīmā. Turpini esošo vai pamest to.',
                'room'  => $this->roomResource($existing),
            ], 409);
        }

        $gameConfig = $data['game_config'];

        // Pre-generate random cricket segments at room creation so all legs share the same set
        if ($data['game_type'] === 'cricket' && ($gameConfig['cricket_type'] ?? 'standard') === 'random') {
            $gameConfig['cricket_segments'] = $this->cricket->generateRandomSegments();
        }

        $hostId = (int) Auth::id();
        $maxPlayers = $data['max_players'] ?? 4;
        /** @var list<array{guest_name: string, user_id: int|null}> $localPlayers */
        $localPlayers = [];

        if ($playMode === 'local') {
            $roster = $request->input('local_roster', []);
            if (!is_array($roster) || count($roster) < 1) {
                return response()->json([
                    'error' => 'Lokālajai spēlei pievieno vismaz vienu papildu spēlētāju (draugu, viesi vai saglabāto).',
                ], 422);
            }
            if (count($roster) > 3) {
                return response()->json(['error' => 'Lokālajā režīmā kopā ar tevi ne vairāk kā 4 spēlētāji.'], 422);
            }
            foreach ($roster as $item) {
                if (!is_array($item)) {
                    return response()->json(['error' => 'Nederīgs lokālais sastāvs.'], 422);
                }
                $resolved = $this->resolveLocalRosterPlayer($hostId, $item);
                if ($resolved instanceof JsonResponse) {
                    return $resolved;
                }
                $localPlayers[] = $resolved;
            }
            $maxPlayers = min(4, 1 + count($localPlayers));
        }

        $room = GameRoom::create([
            'code'         => $this->generateCode(),
            'host_user_id' => $hostId,
            'game_type'    => $data['game_type'],
            'play_mode'    => $playMode,
            'game_config'  => $gameConfig,
            'max_players'  => $maxPlayers,
            'status'       => 'waiting',
        ]);

        // Host joins automatically
        RoomPlayer::create([
            'room_id'    => $room->id,
            'user_id'    => $hostId,
            'guest_name' => Auth::user()?->name ?? 'Host',
            'order'      => 0,
            'team'       => 0,
        ]);

        foreach ($localPlayers as $i => $entry) {
            RoomPlayer::create([
                'room_id'    => $room->id,
                'user_id'    => $entry['user_id'],
                'guest_name' => $entry['guest_name'],
                'order'      => $i + 1,
                'team'       => ($i + 1) % 2,
            ]);
        }

        return response()->json($this->roomResource($room->fresh(['players.user'])), 201);
    }

    /**
     * Lokālā sastāva viena rinda: reģistrētam draugam — arī `user_id`, lai protokols un statistika
     * būtu pieejami viņa kontā (`/stats`, `GET /games/{match}/protocol`).
     *
     * @return array{guest_name: string, user_id: int|null}|JsonResponse
     */
    private function resolveLocalRosterPlayer(int $hostUserId, array $item): array|JsonResponse
    {
        $kind = $item['kind'] ?? '';

        if ($kind === 'friend') {
            $fid = (int) ($item['user_id'] ?? 0);
            if ($fid <= 0 || $fid === $hostUserId) {
                return response()->json(['error' => 'Nederīgs draugs sarakstā.'], 422);
            }
            if (!Friendship::areFriends($hostUserId, $fid)) {
                return response()->json(['error' => 'Vienam no atlasītajiem nav drauga statusa.'], 422);
            }
            $name = User::whereKey($fid)->where('is_banned', false)->value('name');
            if (!$name) {
                return response()->json(['error' => 'Lietotājs nav atrasts.'], 422);
            }

            return [
                'guest_name' => (string) $name,
                'user_id'    => $fid,
            ];
        }

        if ($kind === 'preset') {
            $pid = (int) ($item['preset_id'] ?? 0);
            $preset = UserGuestPreset::where('user_id', $hostUserId)->whereKey($pid)->first();
            if (!$preset) {
                return response()->json(['error' => 'Nederīgs saglabātais viesis.'], 422);
            }

            return ['guest_name' => $preset->name, 'user_id' => null];
        }

        if ($kind === 'guest') {
            $name = trim((string) ($item['name'] ?? ''));
            if ($name === '' || mb_strlen($name) > 50) {
                return response()->json(['error' => 'Nederīgs viesa vārds.'], 422);
            }

            return ['guest_name' => $name, 'user_id' => null];
        }

        return response()->json(['error' => 'Katram lokālajam spēlētājam norādi veidu (friend / guest / preset).'], 422);
    }

    public function join(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'       => 'required|string|size:6',
            'guest_name' => 'nullable|string|max:50',
        ]);

        $room = GameRoom::where('code', strtoupper($data['code']))->firstOrFail();

        if ($room->isLocalPlay()) {
            return response()->json(['error' => 'Šī telpa ir lokālai spēlei — pievienošanās ar kodu nav pieejama.'], 409);
        }

        if ($room->status !== 'waiting') {
            return response()->json(['error' => 'Spēle jau sākta vai beigta.'], 409);
        }

        if ($room->isFull()) {
            return response()->json(['error' => 'Telpa ir pilna.'], 409);
        }

        // Prevent duplicate join
        $existing = $room->players()
            ->where('user_id', Auth::id())
            ->exists();

        if ($existing) {
            return response()->json($this->roomResource($room->load('players.user')));
        }

        $order = $room->players()->max('order') + 1;

        RoomPlayer::create([
            'room_id'    => $room->id,
            'user_id'    => Auth::id(),
            'guest_name' => $data['guest_name'] ?? (Auth::user()?->name ?? 'Guest'),
            'order'      => $order,
            'team'       => $order % 2,
        ]);

        return response()->json($this->roomResource($room->fresh(['players.user'])));
    }

    public function show(GameRoom $room): JsonResponse
    {
        $room->load('players.user', 'ongoingMatch');
        return response()->json($this->roomResource($room));
    }

    public function start(Request $request, GameRoom $room): JsonResponse
    {
        if ($room->host_user_id !== Auth::id()) {
            return response()->json(['error' => 'Tikai hosts var sākt spēli.'], 403);
        }

        if ($room->status !== 'waiting') {
            return response()->json(['error' => 'Spēle jau sākta.'], 409);
        }

        $players = $room->activePlayers()->count();
        if ($players < 1) {
            return response()->json(['error' => 'Nav spēlētāju.'], 422);
        }
        if (!$room->isLocalPlay() && $players < 2) {
            return response()->json(['error' => 'Tiešsaistes spēlei vajag vismaz 2 spēlētājus.'], 422);
        }

        $data = $request->validate([
            'legs'           => 'integer|min:1|max:21',
            'sets'           => 'integer|min:1|max:10',
            'player_order'   => 'nullable|array',
            'player_order.*' => 'integer',
        ]);

        // Apply custom player order if provided (array of room_player IDs in desired sequence)
        if (!empty($data['player_order'])) {
            foreach ($data['player_order'] as $seq => $roomPlayerId) {
                $room->players()->where('id', (int) $roomPlayerId)->update(['order' => $seq]);
            }
            $room->refresh();
        }

        $firstPlayer = $room->activePlayers()->orderBy('order')->first();

        $match = GameMatch::create([
            'room_id'           => $room->id,
            'local_session_id'  => $room->isLocalPlay() ? session()->getId() : null,
            'current_player_id' => $firstPlayer->id,
            'current_leg'       => 1,
            'current_set'       => 1,
            'legs_config'       => [
                'legs' => $data['legs'] ?? 1,
                'sets' => $data['sets'] ?? 1,
            ],
            'status'     => 'active',
            'started_at' => now(),
        ]);

        $this->stateManager->createLeg($match);

        $room->status = 'active';
        $room->save();

        $match->load('room');
        if ($this->stateManager->useTurnTimerForMatch($match)) {
            $this->stateManager->bumpTurnDeadline($match, GameStateManager::TURN_TIMER_MAIN_SECONDS);
        }

        return response()->json([
            'match_id' => $match->id,
            'state'    => $this->stateManager->buildSnapshot($match->fresh()),
        ]);
    }

    public function leave(GameRoom $room): JsonResponse
    {
        // Lokālajā mačā hosts ir vienīgais reālais lietotājs — ja viņu izņem no telpas,
        // `myActive` vairs neatrod telpu un nevar turpināt pauzēto spēli.
        if ($room->isLocalPlay()
            && (int) $room->host_user_id === (int) Auth::id()
            && $room->matches()->whereIn('status', ['active', 'suspended'])->exists()) {
            return response()->json([
                'error' => 'Lokālajā spēlē tu paliec telpas dalībnieks. Lai aizvērtu skatu, saglabājot spēli, spied «Iziet (saglabājot)» spēles skatā; lai pārtrauktu un dzēstu datus — «Pārtraukt» vai «Dzēst pauzi».',
            ], 409);
        }

        $room->players()->where('user_id', Auth::id())->delete();

        if ($room->players()->count() === 0) {
            $match = $room->matches()->whereIn('status', ['active', 'suspended'])->orderByDesc('id')->first();
            if ($match) {
                $match->update(['status' => 'abandoned', 'finished_at' => now()]);
            }
            $room->status = 'abandoned';
            $room->save();
        }

        return response()->json(['ok' => true]);
    }

    /** Vecās rindas ar `play_mode` NULL uztver kā tiešsaisti (`online`). */
    private function wherePlayModeMatches(Builder $query, string $playMode): void
    {
        if ($playMode === 'online') {
            $query->where(fn ($q) => $q->where('play_mode', 'online')->orWhereNull('play_mode'));

            return;
        }

        $query->where('play_mode', 'local');
    }

    private function roomResource(GameRoom $room): array
    {
        $hostUserId = $room->host_user_id;

        return [
            'id'           => $room->id,
            'code'         => $room->code,
            'game_type'    => $room->game_type,
            'play_mode'    => $room->play_mode ?? 'online',
            'game_config'  => $room->game_config,
            'status'       => $room->status,
            'max_players'  => $room->max_players,
            'host_user_id' => $hostUserId,
            'players'      => $room->players->map(fn ($p) => [
                'id'           => $p->id,
                'user_id'      => $p->user_id,
                'name'         => $p->display_name,
                'order'        => $p->order,
                'team'         => $p->team,
                'is_spectator' => $p->is_spectator,
                'is_host'      => $p->user_id === $hostUserId,
            ])->values()->toArray(),
            'match_id' => $room->ongoingMatch?->id,
            'match_status' => $room->ongoingMatch?->status,
        ];
    }

    private function generateCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (GameRoom::where('code', $code)->exists());

        return $code;
    }

    /**
     * Vīzarda query parametri (variant, in_mode, …) salīdzina ar telpas game_config un — ja norādīti legs/sets —
     * ar aktīvā/pauzētā mača legs_config.
     */
    private function wizardSetupMatchesRoom(GameRoom $room, Request $request): bool
    {
        $gameType = $request->query('game_type');
        if (is_string($gameType) && $gameType !== $room->game_type) {
            return false;
        }

        if ($room->game_type === 'x01') {
            if (!$this->x01WizardParamsMatchRoom($room, $request)) {
                return false;
            }
        } elseif ($room->game_type === 'cricket') {
            if (!$this->cricketWizardParamsMatchRoom($room, $request)) {
                return false;
            }
        }

        return $this->wizardLegsSetsMatchOngoing($room, $request);
    }

    private function x01WizardParamsMatchRoom(GameRoom $room, Request $request): bool
    {
        $cfg = $room->game_config ?? [];

        if ($request->filled('variant')) {
            if ((int) ($cfg['variant'] ?? 0) !== (int) $request->query('variant')) {
                return false;
            }
        }
        if ($request->filled('in_mode')) {
            if (($cfg['in'] ?? '') !== (string) $request->query('in_mode')) {
                return false;
            }
        }
        if ($request->filled('out_mode')) {
            if (($cfg['out'] ?? '') !== (string) $request->query('out_mode')) {
                return false;
            }
        }

        return true;
    }

    private function cricketWizardParamsMatchRoom(GameRoom $room, Request $request): bool
    {
        $cfg = $room->game_config ?? [];

        if ($request->filled('cricket_type')) {
            if (($cfg['cricket_type'] ?? 'standard') !== (string) $request->query('cricket_type')) {
                return false;
            }
        }

        if (($cfg['cricket_type'] ?? 'standard') === 'random' && $request->filled('cricket_segments')) {
            $reqSeg = $request->query('cricket_segments');
            $reqArr = is_array($reqSeg) ? $reqSeg : (json_decode((string) $reqSeg, true) ?: []);
            $roomSeg = $cfg['cricket_segments'] ?? [];
            if ($this->normalizeSegmentsList($roomSeg) !== $this->normalizeSegmentsList($reqArr)) {
                return false;
            }
        }

        return true;
    }

    /** Salīdzina segmentu masīvus kā sakārtotas virknes (nejaušā cricket vienādi lauki). */
    private function normalizeSegmentsList(array $segments): string
    {
        $nums = array_map('intval', $segments);
        sort($nums);

        return implode(',', $nums);
    }

    /**
     * Ja query satur `legs` un `sets`, un telpai ir aktīvs/pauzēts mačs — jāsakrīt legs_config.
     * Gaidošai telpai bez mača legs/sets netiek prasīti (vienāds rules setup pietiek).
     */
    private function wizardLegsSetsMatchOngoing(GameRoom $room, Request $request): bool
    {
        if (!$request->filled('legs') || !$request->filled('sets')) {
            return true;
        }

        $wantLegs = (int) $request->query('legs');
        $wantSets = (int) $request->query('sets');
        $match    = $room->ongoingMatch;

        if (!$match || !in_array($match->status, ['active', 'suspended'], true)) {
            return true;
        }

        $lc = $match->legs_config ?? [];

        return (int) ($lc['legs'] ?? 0) === $wantLegs && (int) ($lc['sets'] ?? 0) === $wantSets;
    }

    /** Izveides payload game_config salīdzinājums ar esošu telpu. */
    private function sameGameConfig(array $stored, string $gameType, array $incoming): bool
    {
        if ($gameType === 'x01') {
            return (int) ($stored['variant'] ?? 0) === (int) ($incoming['variant'] ?? 0)
                && ($stored['in'] ?? '') === ($incoming['in'] ?? '')
                && ($stored['out'] ?? '') === ($incoming['out'] ?? '');
        }

        if ($gameType === 'cricket') {
            // Nejaušajiem laukiem katrā telpā savs segments — dublikātu kontrole pēc tipsa.
            return ($stored['cricket_type'] ?? 'standard') === ($incoming['cricket_type'] ?? 'standard');
        }

        return $stored === $incoming;
    }
}
