<?php

namespace App\Http\Controllers\Darts;

use App\Enums\LobbyMode;
use App\Enums\MatchStatus;
use App\Enums\MatchType;
use App\Http\Controllers\Controller;
use App\Models\DartMatch;
use App\Models\LobbyInvite;
use App\Models\MatchPlayer;
use App\Models\User;
use App\Rules\LobbyCode;
use App\Services\Darts\LobbyInviteService;
use App\Services\Darts\LobbySetupService;
use App\Services\Darts\MatchAccessService;
use App\Services\Darts\MatchLobbyService;
use App\Services\Darts\PlayerMatchAvailabilityService;
use App\Support\DisplayName;
use App\Support\LobbyCode as LobbyCodeSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DartsLobbyController extends Controller
{
    public function __construct(
        private readonly MatchLobbyService $lobbyService,
        private readonly MatchAccessService $access,
        private readonly PlayerMatchAvailabilityService $availability,
        private readonly LobbySetupService $setupService,
        private readonly LobbyInviteService $inviteService,
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        // currentMatchFor() (nevis activeLobbyFor()) apzināti — pārvirzīšanas
        // lēmumam vajag tikai uuid+status, un activeLobbyFor() papildus
        // dara loadMissing(['config', 'players']) (2 liekas queries), kas šeit
        // netiek izmantotas nemaz. Augsta trafika dēļ katra liekā query
        // biežākajā ceļā (lietotājam jau ir matčs) ir dārga.
        $match = $this->availability->currentMatchFor($request->user());

        $redirectRoute = match ($match?->status) {
            MatchStatus::Active => 'darts.x01.play',
            MatchStatus::Lobby => 'darts.x01.lobby.show',
            default => null,
        };

        if ($redirectRoute !== null) {
            return redirect()->route($redirectRoute, $match->uuid);
        }

        return Inertia::render('darts/DartsLobby', [
            'friends' => $this->lobbyService->friendsWithActivity($request->user()),
            'savedGuests' => $this->lobbyService->savedGuests($request->user()),
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'is_premium' => (bool) $request->user()->is_premium,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'mode' => ['required', 'in:online,local'],
            'match_type' => ['required', 'in:solo,team'],
        ]);

        $existing = $this->availability->currentMatchFor($request->user());

        if ($existing !== null) {
            return redirect()
                ->route('darts.x01.lobby.show', $existing->uuid)
                ->with('status', 'already-in-lobby');
        }

        $match = $this->lobbyService->createLobby(
            $request->user(),
            LobbyMode::from($validated['mode']),
            MatchType::from($validated['match_type']),
        );

        return redirect()->route('darts.x01.lobby.show', $match->uuid);
    }

    public function show(Request $request, string $uuid): Response|RedirectResponse
    {
        $match = DartMatch::query()->where('uuid', $uuid)->first();

        if ($match === null || ! $this->access->isParticipant($match, $request->user())) {
            return redirect()->route('darts.x01.lobby.index');
        }

        if ($match->status->value === 'active') {
            return redirect()->route('darts.x01.play', $match->uuid);
        }

        return Inertia::render('darts/DartsLobby', [
            'lobby' => $this->lobbyService->serializeLobby($match),
            'friends' => $this->lobbyService->friendsWithActivity($request->user()),
            'savedGuests' => $this->lobbyService->savedGuests($request->user()),
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'is_premium' => (bool) $request->user()->is_premium,
            ],
            'isHost' => $this->access->isHost($match, $request->user()),
        ]);
    }

    public function join(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'lobby_code' => ['required', 'string', 'max:9', new LobbyCode],
        ]);

        $match = $this->lobbyService->joinByCode(
            $request->user(),
            LobbyCodeSupport::normalize($validated['lobby_code']),
        );

        return redirect()->route('darts.x01.lobby.show', $match->uuid);
    }

    public function addPlayer(Request $request, DartMatch $match): RedirectResponse
    {
        $this->authorizeHost($request, $match);

        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'guest_name' => ['nullable', 'string', 'max:'.DisplayName::MAX_LENGTH],
            'guest_email' => ['nullable', 'email', 'max:255'],
            'save_guest' => ['nullable', 'boolean'],
        ]);

        if (isset($validated['user_id'])) {
            $match->loadMissing('config');

            if ($match->config->mode === LobbyMode::Online) {
                throw ValidationException::withMessages([
                    'player' => ['lobby-invite-required'],
                ]);
            }

            $this->lobbyService->addRegisteredUser(
                $match,
                User::query()->findOrFail($validated['user_id']),
            );
        } elseif (! empty($validated['guest_name'])) {
            $saveGuest = (bool) ($validated['save_guest'] ?? false);
            if (! empty($validated['guest_email'])) {
                $saveGuest = true;
            }

            $this->lobbyService->addGuest(
                $match,
                $request->user(),
                $validated['guest_name'],
                $saveGuest,
                $validated['guest_email'] ?? null,
            );
        }

        return back();
    }

    public function updateReady(Request $request, DartMatch $match, MatchPlayer $player): RedirectResponse
    {
        $this->access->assertLobbyAccess($match, $request->user());

        $validated = $request->validate([
            'ready' => ['required', 'boolean'],
        ]);

        $this->lobbyService->updatePlayerReady(
            $match,
            $request->user(),
            $player,
            (bool) $validated['ready'],
        );

        return back();
    }

    public function updateMatchType(Request $request, DartMatch $match): RedirectResponse
    {
        $this->authorizeHost($request, $match);

        $validated = $request->validate([
            'match_type' => ['required', 'in:solo,team'],
        ]);

        $this->lobbyService->updateMatchType(
            $match,
            MatchType::from($validated['match_type']),
        );

        return back();
    }

    public function updateConfig(Request $request, DartMatch $match): RedirectResponse|JsonResponse
    {
        $this->authorizeHost($request, $match);

        $validated = $request->validate([
            'format' => ['required', 'in:best_of,first_to'],
            'legs_target' => ['required', 'integer', 'min:1', 'max:21'],
            'sets_target' => ['required', 'integer', 'min:1', 'max:11'],
            'starting_points' => ['required', 'in:301,501'],
            'in_rule' => ['required', 'in:straight,double'],
            'out_rule' => ['required', 'in:straight,double'],
            'track_checkout_rate' => ['required', 'boolean'],
            'is_public' => ['required', 'boolean'],
        ]);

        $this->lobbyService->updateConfig($match, $validated);

        return $this->respondLobby($request, $match);
    }

    public function updateThrowOrder(Request $request, DartMatch $match): RedirectResponse|JsonResponse
    {
        $this->authorizeHost($request, $match);

        $validated = $request->validate([
            'player_ids' => ['required', 'array', 'min:2', 'max:4'],
            'player_ids.*' => ['required', 'integer'],
        ]);

        $this->setupService->updateThrowOrder($match, array_map('intval', $validated['player_ids']));

        return $this->respondLobby($request, $match);
    }

    public function setFirstThrower(Request $request, DartMatch $match): RedirectResponse|JsonResponse
    {
        $this->authorizeHost($request, $match);

        $validated = $request->validate([
            'player_id' => ['required', 'integer'],
        ]);

        $this->setupService->setFirstThrower($match, (int) $validated['player_id']);

        return $this->respondLobby($request, $match);
    }

    public function updatePlayerStartingPoints(Request $request, DartMatch $match, MatchPlayer $player): RedirectResponse|JsonResponse
    {
        $this->authorizeHost($request, $match);

        $validated = $request->validate([
            'starting_points' => ['nullable', 'integer', 'min:2', 'max:999'],
        ]);

        $this->setupService->updatePlayerStartingPoints(
            $match,
            $player,
            isset($validated['starting_points']) ? (int) $validated['starting_points'] : null,
        );

        return $this->respondLobby($request, $match);
    }

    public function sendInvite(Request $request, DartMatch $match): RedirectResponse|JsonResponse
    {
        $this->authorizeHost($request, $match);

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $this->inviteService->sendInvite(
            $match,
            $request->user(),
            User::query()->findOrFail($validated['user_id']),
        );

        return $this->respondLobby($request, $match);
    }

    public function acceptInvite(Request $request, LobbyInvite $invite): RedirectResponse|JsonResponse
    {
        $match = $this->inviteService->acceptInvite($invite, $request->user());

        if ($request->wantsJson()) {
            return response()->json([
                'redirect' => route('darts.x01.lobby.show', $match->uuid),
            ]);
        }

        return redirect()->route('darts.x01.lobby.show', $match->uuid);
    }

    public function declineInvite(Request $request, LobbyInvite $invite): RedirectResponse|JsonResponse
    {
        $match = $invite->match;
        $this->inviteService->declineInvite($invite, $request->user());

        return $this->respondLobby($request, $match);
    }

    public function start(Request $request, DartMatch $match): RedirectResponse
    {
        $this->authorizeHost($request, $match);

        $this->lobbyService->startMatch($match);

        return redirect()->route('darts.x01.play', $match->uuid);
    }

    public function destroy(Request $request, DartMatch $match): RedirectResponse|JsonResponse
    {
        $this->access->assertLobbyAccess($match, $request->user());

        $this->lobbyService->abandonLobby($match, $request->user());

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return redirect()->route('darts.x01.lobby.index');
    }

    private function authorizeHost(Request $request, DartMatch $match): void
    {
        if (! $this->access->isHost($match, $request->user())) {
            abort(403);
        }
    }

    private function respondLobby(Request $request, DartMatch $match): RedirectResponse|JsonResponse
    {
        $match->refresh(['players', 'config']);

        if ($request->wantsJson()) {
            return response()->json([
                'data' => $this->lobbyService->serializeLobby($match),
            ]);
        }

        return back();
    }
}
