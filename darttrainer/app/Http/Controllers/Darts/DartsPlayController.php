<?php

namespace App\Http\Controllers\Darts;

use App\Http\Controllers\Controller;
use App\Models\DartMatch;
use App\Services\Darts\MatchAccessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DartsPlayController extends Controller
{
    public function __construct(
        private readonly MatchAccessService $access,
    ) {}

    public function show(Request $request, string $uuid): Response|RedirectResponse
    {
        $match = DartMatch::query()->where('uuid', $uuid)->first();

        if ($match === null) {
            return redirect()->route('darts.x01.match-gone', ['reason' => 'all_left']);
        }

        if (
            ! $this->access->canAccessPlayBoard($match, $request->user())
            && ! $this->access->canAccessSpectatorState($match, $request->user())
        ) {
            return redirect()->route('darts.x01.match-gone', ['reason' => 'all_left']);
        }

        $isSpectator = $this->access->isSpectator($match, $request->user());

        return Inertia::render('darts/DartsPlay', [
            'matchUuid' => $match->uuid,
            'role' => $isSpectator ? 'spectator' : 'player',
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'is_premium' => (bool) $request->user()->is_premium,
                'default_scoring_mode' => $request->user()->default_scoring_mode ?? 'board',
            ],
            'playerId' => $isSpectator
                ? null
                : $match->players()->where('user_id', $request->user()->id)->value('id'),
            'isHost' => $match->host_user_id === $request->user()->id,
            'isLocal' => $match->loadMissing('config')->config->mode->value === 'local',
        ]);
    }
}
