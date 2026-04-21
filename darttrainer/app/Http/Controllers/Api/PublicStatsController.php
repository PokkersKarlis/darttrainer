<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameMatch;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PublicStatsController extends Controller
{
    public function homeSummary(): JsonResponse
    {
        $since = now()->subMinutes(15)->getTimestamp();

        $activePlayers = (int) DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', $since)
            ->selectRaw('COUNT(DISTINCT user_id) as c')
            ->value('c');

        $lastRegAt = User::query()->orderByDesc('id')->value('created_at');

        return response()->json([
            'users_total'            => User::query()->count(),
            'active_players'         => $activePlayers,
            'games_total'            => GameMatch::query()->count(),
            'matches_active'         => GameMatch::query()->where('status', 'active')->count(),
            'last_registration_at'   => $lastRegAt?->toIso8601String(),
        ]);
    }
}
