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

        $liveMatches = GameMatch::query()
            ->where('status', 'active')
            ->with([
                'room' => function ($q) {
                    $q->select('id', 'code', 'game_type', 'game_config');
                },
            ])
            ->orderByDesc('id')
            ->limit(12)
            ->get()
            ->map(function (GameMatch $match) {
                $room = $match->room;
                if (! $room instanceof GameRoom) {
                    return null;
                }

                $players = $room->activePlayers()
                    ->with('user:id,name')
                    ->orderBy('order')
                    ->limit(2)
                    ->get();

                $n1 = $players->get(0);
                $n2 = $players->get(1);
                $p1 = $n1 ? ($n1->user?->name ?? $n1->guest_name ?? 'Guest') : '—';
                $p2 = $n2 ? ($n2->user?->name ?? $n2->guest_name ?? '—') : '—';
                $code = (string) ($room->code ?? '');
                $short = $code !== '' ? strtoupper(substr($code, 0, min(4, strlen($code)))) : (string) $match->id;

                $kind = $this->publicGameKind($room);

                return [
                    'match_id' => (int) $match->id,
                    'short_id' => $short,
                    'game_kind' => $kind,
                    'p1' => (string) $p1,
                    'p2' => (string) $p2,
                    'round' => (int) $match->current_leg,
                ];
            })
            ->filter()
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
            'live_matches'         => $liveMatches,
        ]);
    }

    private function publicGameKind(GameRoom $room): string
    {
        if ($room->game_type === 'cricket') {
            return 'cricket';
        }
        if ($room->game_type === 'x01') {
            $v = $room->game_config['variant'] ?? null;
            if ((int) $v === 301) {
                return 'x01_301';
            }
            if ((int) $v === 501) {
                return 'x01_501';
            }

            return 'x01';
        }

        return 'other';
    }
}
