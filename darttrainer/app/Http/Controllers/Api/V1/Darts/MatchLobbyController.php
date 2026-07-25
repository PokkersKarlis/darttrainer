<?php

namespace App\Http\Controllers\Api\V1\Darts;

use App\Enums\MatchStatus;
use App\Http\Controllers\Controller;
use App\Models\DartMatch;
use App\Services\Darts\MatchAccessService;
use App\Services\Darts\MatchLobbyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchLobbyController extends Controller
{
    public function __construct(
        private readonly MatchLobbyService $lobbyService,
        private readonly MatchAccessService $access,
    ) {}

    public function show(Request $request, string $uuid): JsonResponse
    {
        $match = DartMatch::query()->where('uuid', $uuid)->firstOrFail();
        $this->access->assertLobbyAccess($match, $request->user());

        if ($match->status !== MatchStatus::Lobby) {
            abort(404);
        }

        $match->load(['players', 'config']);

        return response()->json($this->lobbyService->serializeLobby($match));
    }
}
