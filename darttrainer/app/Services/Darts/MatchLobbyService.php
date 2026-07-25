<?php

namespace App\Services\Darts;

use App\Enums\FriendshipStatus;
use App\Enums\GameType;
use App\Enums\LobbyMode;
use App\Enums\MatchStatus;
use App\Support\LobbyCode as LobbyCodeGenerator;
use App\Enums\MatchType;
use App\Enums\X01Format;
use App\Enums\X01ScoringRule;
use App\Events\LobbyClosed;
use App\Events\LobbyUpdated;
use App\Models\DartMatch;
use App\Models\DartX01ActiveLeg;
use App\Models\DartX01MatchConfig;
use App\Models\Friendship;
use App\Models\MatchPlayer;
use App\Models\User;
use App\Models\UserLocalGuest;
use App\Services\UserPresenceService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class MatchLobbyService
{
    public const MAX_LOBBY_PLAYERS = 4;

    public function __construct(
        private readonly PlayerMatchAvailabilityService $availability,
        private readonly UserPresenceService $presence,
        private readonly MatchTurnTimerService $turnTimer,
        private readonly MatchStateService $stateService,
    ) {}

    public function createLobby(User $host, LobbyMode $mode, MatchType $matchType): DartMatch
    {
        return DB::transaction(function () use ($host, $mode, $matchType): DartMatch {
            $match = $this->createMatchRecord($host, $mode, $matchType);

            DartX01MatchConfig::query()->create([
                'match_id' => $match->id,
                'mode' => $mode,
                'format' => X01Format::FirstTo,
                'legs_target' => 1,
                'sets_target' => 1,
                'starting_points' => 501,
                'in_rule' => X01ScoringRule::Straight,
                'out_rule' => X01ScoringRule::Double,
                'track_checkout_rate' => false,
                'is_public' => false,
            ]);

            MatchPlayer::query()->create([
                'match_id' => $match->id,
                'user_id' => $host->id,
                'display_name' => $host->name,
                'slot' => 1,
                'team_id' => $matchType === MatchType::Team ? 1 : null,
                'status' => 'ready',
            ]);

            return $match->fresh(['players', 'config']);
        });
    }

    private function createMatchRecord(User $host, LobbyMode $mode, MatchType $matchType): DartMatch
    {
        if ($mode !== LobbyMode::Online) {
            return DartMatch::query()->create([
                'lobby_code' => null,
                'game_type' => GameType::DartsX01,
                'match_type' => $matchType,
                'status' => MatchStatus::Lobby,
                'host_user_id' => $host->id,
            ]);
        }

        for ($attempt = 0; $attempt < 10; $attempt++) {
            try {
                return DartMatch::query()->create([
                    'lobby_code' => LobbyCodeGenerator::generate(),
                    'game_type' => GameType::DartsX01,
                    'match_type' => $matchType,
                    'status' => MatchStatus::Lobby,
                    'host_user_id' => $host->id,
                ]);
            } catch (UniqueConstraintViolationException) {
                continue;
            }
        }

        throw new RuntimeException('Unable to allocate a unique lobby code.');
    }

    public function joinByCode(User $user, string $code): DartMatch
    {
        $normalized = LobbyCodeGenerator::normalize($code);

        $match = DartMatch::query()
            ->where('lobby_code', $normalized)
            ->where('status', MatchStatus::Lobby)
            ->firstOrFail();

        $this->availability->assertAvailableForMatch($user, $match);

        $this->assertLobbyHasCapacity($match);

        $this->addRegisteredUser($match, $user);

        return $match->fresh(['players', 'config']);
    }

    public function addRegisteredUser(DartMatch $match, User $user): MatchPlayer
    {
        if ($match->players()->where('user_id', $user->id)->exists()) {
            return $match->players()->where('user_id', $user->id)->firstOrFail();
        }

        $this->availability->assertAvailableForMatch($user, $match);
        $this->assertLobbyHasCapacity($match);

        $placement = $this->nextPlayerPlacement($match);

        $player = MatchPlayer::query()->create([
            'match_id' => $match->id,
            'user_id' => $user->id,
            'display_name' => $user->name,
            'slot' => $placement['slot'],
            'team_id' => $placement['team_id'],
            'status' => 'ready',
        ]);

        broadcast(new LobbyUpdated($match->fresh(['players', 'config'])))->toOthers();

        return $player;
    }

    public function addGuest(DartMatch $match, User $host, string $name, bool $saveGuest, ?string $email = null): MatchPlayer
    {
        $this->assertLobbyHasCapacity($match);

        $guestId = null;

        if ($saveGuest) {
            $guest = UserLocalGuest::query()->firstOrCreate(
                ['user_id' => $host->id, 'name' => $name],
                ['email' => $email],
            );

            if ($email !== null && $guest->email !== $email) {
                $guest->update(['email' => $email]);
            }

            $guestId = $guest->id;
        }

        $placement = $this->nextPlayerPlacement($match);

        $player = MatchPlayer::query()->create([
            'match_id' => $match->id,
            'guest_id' => $guestId,
            'guest_email' => $email,
            'display_name' => $name,
            'slot' => $placement['slot'],
            'team_id' => $placement['team_id'],
            'status' => 'ready',
        ]);

        broadcast(new LobbyUpdated($match->fresh(['players', 'config'])))->toOthers();

        return $player;
    }

    public function updatePlayerReady(DartMatch $match, User $actor, MatchPlayer $player, bool $ready): MatchPlayer
    {
        if ($match->status !== MatchStatus::Lobby || $player->match_id !== $match->id) {
            abort(404);
        }

        if ($player->user_id !== null) {
            if ($player->user_id !== $actor->id) {
                abort(403);
            }
        } elseif ($match->host_user_id !== $actor->id) {
            abort(403);
        }

        $player->update(['status' => $ready ? 'ready' : 'waiting']);

        broadcast(new LobbyUpdated($match->fresh(['players.user', 'config'])))->toOthers();

        return $player->fresh();
    }

    /**
     * @return list<array{
     *     id: int,
     *     name: string,
     *     email: string,
     *     is_premium: bool,
     *     activity: string
     * }>
     */
    public function friendsWithActivity(User $user): array
    {
        $friendIds = Friendship::query()
            ->where('status', FriendshipStatus::Accepted)
            ->where(function ($query) use ($user): void {
                $query->where('requester_id', $user->id)
                    ->orWhere('addressee_id', $user->id);
            })
            ->get()
            ->map(fn (Friendship $friendship) => $friendship->requester_id === $user->id
                ? $friendship->addressee_id
                : $friendship->requester_id)
            ->values();

        return User::query()
            ->whereIn('id', $friendIds)
            ->orderBy('name')
            ->get()
            ->map(fn (User $friend) => [
                'id' => $friend->id,
                'name' => $friend->name,
                'email' => $friend->email,
                'is_premium' => (bool) $friend->is_premium,
                'activity' => $this->availability->activityStatus($friend),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    public function savedGuests(User $user): array
    {
        return UserLocalGuest::query()
            ->where('user_id', $user->id)
            ->orderBy('name')
            ->get()
            ->map(fn (UserLocalGuest $guest) => [
                'id' => $guest->id,
                'name' => $guest->name,
                'email' => $guest->email,
            ])
            ->values()
            ->all();
    }

    public function canProceed(DartMatch $match): bool
    {
        $players = $match->players;
        $count = $players->count();

        if ($match->match_type === MatchType::Team) {
            if ($count < 4 || $count % 2 !== 0) {
                return false;
            }
        } elseif ($count < 2) {
            return false;
        }

        $match->loadMissing('config');

        if ($match->config->mode === LobbyMode::Local) {
            return true;
        }

        return $players->every(fn (MatchPlayer $player) => $player->status === 'ready');
    }

    public function updateMatchType(DartMatch $match, MatchType $matchType): DartMatch
    {
        if ($match->status !== MatchStatus::Lobby) {
            abort(422, 'lobby-not-ready');
        }

        $match->update(['match_type' => $matchType]);

        broadcast(new LobbyUpdated($match->fresh(['players.user', 'config'])))->toOthers();

        return $match->fresh(['players.user', 'config']);
    }

    /**
     * @param  array{
     *     format: string,
     *     legs_target: int,
     *     sets_target: int,
     *     starting_points: int,
     *     in_rule: string,
     *     out_rule: string,
     *     track_checkout_rate: bool,
     *     is_public: bool
     * }  $configData
     */
    public function updateConfig(DartMatch $match, array $configData): DartX01MatchConfig
    {
        $config = $match->config;
        $config->fill([
            'format' => X01Format::from($configData['format']),
            'legs_target' => (int) $configData['legs_target'],
            'sets_target' => (int) $configData['sets_target'],
            'starting_points' => in_array((int) $configData['starting_points'], [301, 501], true)
                ? (int) $configData['starting_points']
                : 501,
            'in_rule' => X01ScoringRule::from($configData['in_rule']),
            'out_rule' => X01ScoringRule::from($configData['out_rule']),
            'track_checkout_rate' => (bool) $configData['track_checkout_rate'],
            'is_public' => (bool) $configData['is_public'],
        ]);
        $config->save();

        return $config;
    }

    public function applyStartingPointDefaults(DartMatch $match, int $startingPoints): DartX01MatchConfig
    {
        [$inRule, $outRule] = $this->defaultRulesForStartingPoints($startingPoints);

        $config = $match->config;
        $config->fill([
            'starting_points' => $startingPoints,
            'in_rule' => $inRule,
            'out_rule' => $outRule,
        ]);
        $config->save();

        return $config;
    }

    /**
     * @return array{0: X01ScoringRule, 1: X01ScoringRule}
     */
    public function defaultRulesForStartingPoints(int $startingPoints): array
    {
        if ($startingPoints === 301) {
            return [X01ScoringRule::Double, X01ScoringRule::Double];
        }

        return [X01ScoringRule::Straight, X01ScoringRule::Double];
    }

    private function assertLobbyHasCapacity(DartMatch $match): void
    {
        if ($match->players()->count() >= self::MAX_LOBBY_PLAYERS) {
            abort(422, 'lobby-full');
        }
    }

    /**
     * @return array{slot: int, team_id: int|null}
     */
    private function nextPlayerPlacement(DartMatch $match): array
    {
        $count = $match->players()->count();
        $slot = $count + 1;

        if ($match->match_type === MatchType::Team) {
            return [
                'slot' => $slot,
                'team_id' => ($count % 2) + 1,
            ];
        }

        return [
            'slot' => $slot,
            'team_id' => null,
        ];
    }

    public function startMatch(DartMatch $match): DartMatch
    {
        if (! $this->canProceed($match)) {
            abort(422, 'lobby-not-ready');
        }

        app(LobbyInviteService::class)->cancelPendingForMatch($match);

        return DB::transaction(function () use ($match): DartMatch {
            $match->update([
                'status' => MatchStatus::Active,
                'lobby_code' => null,
            ]);

            $match->players()->update(['status' => 'playing']);

            DartX01ActiveLeg::query()->create([
                'match_id' => $match->id,
                'leg_number' => 1,
                'starting_points' => $match->config->starting_points,
                'status' => 'active',
            ]);

            $match = $match->fresh(['players', 'config', 'activeLeg']);
            $firstPlayerId = $this->stateService->resolveActivePlayerId($match, $match->activeLeg->id);
            if ($firstPlayerId !== null) {
                $this->turnTimer->startForPlayer($match, $firstPlayerId);
            }

            return $match;
        });
    }

    public function abandonLobby(DartMatch $match, User $user): void
    {
        if ($match->status !== MatchStatus::Lobby) {
            abort(422, 'lobby-not-abandonable');
        }

        if ($match->host_user_id === $user->id) {
            app(LobbyInviteService::class)->cancelPendingForMatch($match);
            $uuid = $match->uuid;
            broadcast(new LobbyClosed($uuid))->toOthers();
            $match->delete();

            return;
        }

        $player = $match->players()->where('user_id', $user->id)->firstOrFail();
        $player->delete();

        broadcast(new LobbyUpdated($match->fresh(['players', 'config'])))->toOthers();
    }

    /**
     * @return array<string, mixed>
     */
    public function serializeLobby(DartMatch $match): array
    {
        $match->loadMissing(['players.user', 'config']);

        return [
            'uuid' => $match->uuid,
            'host_user_id' => $match->host_user_id,
            'lobby_code' => $match->lobby_code,
            'status' => $match->status->value,
            'match_type' => $match->match_type->value,
            'can_proceed' => $this->canProceed($match),
            'pending_invitee_ids' => app(LobbyInviteService::class)->pendingInviteeIdsFor($match),
            'players' => $match->players->map(fn (MatchPlayer $player) => [
                'id' => $player->id,
                'user_id' => $player->user_id,
                'guest_id' => $player->guest_id,
                'display_name' => $player->display_name,
                'starting_points' => $player->starting_points,
                'guest_email' => $player->guest_email,
                'slot' => $player->slot,
                'team_id' => $player->team_id,
                'status' => $player->status,
                'is_online' => $player->user_id && $player->user
                    ? $this->presence->isOnline($player->user)
                    : null,
            ])->values()->all(),
            'config' => [
                'mode' => $match->config->mode->value,
                'format' => $match->config->format->value,
                'legs_target' => $match->config->legs_target,
                'sets_target' => $match->config->sets_target,
                'starting_points' => $match->config->starting_points,
                'in_rule' => $match->config->in_rule->value,
                'out_rule' => $match->config->out_rule->value,
                'track_checkout_rate' => $match->config->track_checkout_rate,
                'is_public' => $match->config->is_public,
            ],
        ];
    }
}
