<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameMatch;
use App\Models\GameRoom;
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

        $roomsOpen = GameRoom::query()->whereIn('status', ['waiting', 'active'])->count();

        $topPlayers = DB::table('room_players as rp')
            ->join('users as u', 'u.id', '=', 'rp.user_id')
            ->join('matches as m', 'm.room_id', '=', 'rp.room_id')
            ->where('u.is_banned', false)
            ->whereIn('m.status', ['finished', 'active'])
            ->where(function ($q) {
                $q->where('m.exclude_from_stats', false)->orWhereNull('m.exclude_from_stats');
            })
            ->groupBy('u.id', 'u.name')
            ->selectRaw('u.id as user_id, u.name, COUNT(DISTINCT m.id) as matches_count')
            ->orderByDesc('matches_count')
            ->orderBy('u.name')
            ->limit(8)
            ->get()
            ->map(fn ($r) => [
                'user_id'       => (int) $r->user_id,
                'name'          => (string) $r->name,
                'matches_count' => (int) $r->matches_count,
            ])
            ->values()
            ->all();

        return response()->json([
            'users_total'          => User::query()->count(),
            'active_players'       => $activePlayers,
            'games_total'          => GameMatch::query()->count(),
            'matches_active'       => GameMatch::query()->where('status', 'active')->count(),
            'rooms_open'           => $roomsOpen,
            'top_players'          => $topPlayers,
            'last_registration_at' => $lastRegAt?->toIso8601String(),
        ]);
    }
}
