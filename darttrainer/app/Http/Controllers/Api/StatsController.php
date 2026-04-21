<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameMatch;
use App\Services\StatisticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StatsController extends Controller
{
    public function __construct(private readonly StatisticsService $statistics) {}

    /**
     * Pabeigtie mači, kurā lietotājs ir telpas dalībnieks (protokola saitei).
     */
    public function recentFinishedMatches(Request $request): JsonResponse
    {
        $userId = Auth::id();
        if ($userId === null) {
            return response()->json(['error' => 'Nepieciešama autentifikācija.'], 401);
        }

        $limit = min(50, max(1, (int) $request->query('limit', 35)));

        $items = GameMatch::query()
            ->where('status', 'finished')
            ->whereNotNull('finished_at')
            ->whereHas('room', function ($q) use ($userId) {
                $q->whereHas('players', fn ($p) => $p->where('user_id', $userId));
            })
            ->with(['room:id,code,game_type', 'winner'])
            ->orderByDesc('finished_at')
            ->limit($limit)
            ->get()
            ->map(function (GameMatch $m) {
                $room = $m->room;

                return [
                    'match_id'    => $m->id,
                    'room_code'   => $room?->code ?? '',
                    'game_type'   => $room?->game_type ?? '',
                    'finished_at' => $m->finished_at?->toIso8601String(),
                    'winner_name' => $m->winner?->display_name,
                ];
            })
            ->values();

        return response()->json(['items' => $items]);
    }

    public function me(): JsonResponse
    {
        $userId = Auth::id();

        return response()->json([
            'cricket_average' => $this->statistics->playerAverage($userId, 'cricket'),
            'cricket'       => $this->statistics->cricketStats($userId),
            'x01_solo'      => $this->statistics->x01SoloStats($userId),
        ]);
    }

    public function leaderboard(Request $request): JsonResponse
    {
        $data = $request->validate([
            'game_type' => 'required|in:cricket,x01_solo',
            'limit'     => 'nullable|integer|min:1|max:50',
        ]);

        $limit = (int) ($data['limit'] ?? 10);

        if ($data['game_type'] === 'x01_solo') {
            return response()->json([
                'game_type' => 'x01_solo',
                'items'     => $this->statistics->x01SoloLeaderboard($limit),
            ]);
        }

        return response()->json([
            'game_type' => 'cricket',
            'items'     => $this->statistics->cricketLeaderboard($limit),
        ]);
    }
}
