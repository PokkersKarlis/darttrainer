<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class StatisticsService
{
    public function playerAverage(int $userId, string $gameType): float
    {
        $totalScore = (float) DB::table('turns')
            ->join('matches', 'matches.id', '=', 'turns.match_id')
            ->join('game_rooms', 'game_rooms.id', '=', 'matches.room_id')
            ->join('room_players', 'room_players.id', '=', 'turns.player_id')
            ->where('room_players.user_id', $userId)
            ->where('game_rooms.game_type', $gameType)
            ->where('turns.is_undone', false)
            ->sum('turns.total_scored');

        $totalDarts = (int) DB::table('darts')
            ->join('turns', 'turns.id', '=', 'darts.turn_id')
            ->join('matches', 'matches.id', '=', 'turns.match_id')
            ->join('game_rooms', 'game_rooms.id', '=', 'matches.room_id')
            ->join('room_players', 'room_players.id', '=', 'turns.player_id')
            ->where('room_players.user_id', $userId)
            ->where('game_rooms.game_type', $gameType)
            ->where('turns.is_undone', false)
            ->count();
        if ($totalDarts === 0) {
            return 0.0;
        }

        return round(($totalScore / $totalDarts) * 3, 2);
    }

    /** Solo X01 training (finished games only), aggregated from JSON turns. */
    public function x01SoloStats(int $userId): array
    {
        $rows = DB::table('game_x01_training')
            ->where('player_id', $userId)
            ->where('finished', 1)
            ->select('turns', 'variant')
            ->get();

        $agg = $this->emptySoloAgg();

        foreach ($rows as $row) {
            $turns = json_decode($row->turns ?? '[]', true);
            if (!is_array($turns)) {
                continue;
            }
            $agg['games_finished']++;
            $v = (int) $row->variant;
            $agg['by_variant'][$v] = ($agg['by_variant'][$v] ?? 0) + 1;
            $this->mergeSoloTurnsIntoAgg($agg, $turns);
        }

        return $this->formatSoloAgg($agg);
    }

    public function x01SoloLeaderboard(int $limit = 10): array
    {
        $games = DB::table('game_x01_training as g')
            ->join('users as u', 'u.id', '=', 'g.player_id')
            ->where('g.finished', 1)
            ->whereNotNull('g.player_id')
            ->select('g.player_id', 'u.name', 'g.turns')
            ->get();

        $byUser = [];

        foreach ($games as $row) {
            $uid = (int) $row->player_id;
            if (!isset($byUser[$uid])) {
                $byUser[$uid] = ['name' => $row->name, 'agg' => $this->emptySoloAgg()];
            }
            $turns = json_decode($row->turns ?? '[]', true);
            if (!is_array($turns) || count($turns) === 0) {
                continue;
            }
            $byUser[$uid]['agg']['games_finished']++;
            $this->mergeSoloTurnsIntoAgg($byUser[$uid]['agg'], $turns);
        }

        $out = [];
        foreach ($byUser as $uid => $pack) {
            $b = $pack['agg'];
            if ($b['total_darts'] < 3) {
                continue;
            }
            $out[] = [
                'user_id'     => $uid,
                'name'        => $pack['name'],
                'average'     => round(($b['total_scored'] / $b['total_darts']) * 3, 2),
                'total_darts' => $b['total_darts'],
                'games'       => $b['games_finished'],
            ];
        }

        usort($out, fn ($a, $b) => $b['average'] <=> $a['average']);

        return array_slice($out, 0, $limit);
    }

    public function cricketStats(int $userId): array
    {
        $rows = DB::table('legs')
            ->join('matches', 'matches.id', '=', 'legs.match_id')
            ->join('game_rooms', 'game_rooms.id', '=', 'matches.room_id')
            ->join('room_players', function ($j) use ($userId) {
                $j->on('room_players.room_id', '=', 'game_rooms.id')
                  ->where('room_players.user_id', $userId);
            })
            ->where('game_rooms.game_type', 'cricket')
            ->whereNotNull('legs.winner_player_id')
            ->selectRaw('legs.id, legs.winner_player_id, room_players.id as rp_id')
            ->get();

        $legsPlayed = $rows->count();
        $legsWon    = $rows->filter(fn ($r) => (int) $r->winner_player_id === (int) $r->rp_id)->count();

        $avgPts = DB::table('cricket_state')
            ->join('legs', 'legs.id', '=', 'cricket_state.leg_id')
            ->join('matches', 'matches.id', '=', 'legs.match_id')
            ->join('game_rooms', 'game_rooms.id', '=', 'matches.room_id')
            ->join('room_players', 'room_players.id', '=', 'cricket_state.player_id')
            ->where('room_players.user_id', $userId)
            ->where('game_rooms.game_type', 'cricket')
            ->avg('cricket_state.points');

        return [
            'legs_played'        => $legsPlayed,
            'legs_won'           => $legsWon,
            'win_rate'           => $legsPlayed > 0 ? round($legsWon / $legsPlayed * 100, 1) : 0.0,
            'avg_points_per_leg' => round((float) ($avgPts ?? 0), 1),
        ];
    }

    public function cricketLeaderboard(int $limit = 10): array
    {
        $rows = DB::table('legs')
            ->join('matches', 'matches.id', '=', 'legs.match_id')
            ->join('game_rooms', 'game_rooms.id', '=', 'matches.room_id')
            ->join('room_players', 'room_players.room_id', '=', 'game_rooms.id')
            ->join('users', 'users.id', '=', 'room_players.user_id')
            ->where('game_rooms.game_type', 'cricket')
            ->whereNotNull('legs.winner_player_id')
            ->whereNotNull('room_players.user_id')
            ->selectRaw('
                users.id,
                users.name,
                COUNT(DISTINCT legs.id)                                                      AS legs_played,
                SUM(CASE WHEN legs.winner_player_id = room_players.id THEN 1 ELSE 0 END)    AS legs_won
            ')
            ->groupBy('users.id', 'users.name')
            ->having('legs_played', '>', 0)
            ->orderByDesc(DB::raw('legs_won / legs_played'))
            ->limit($limit)
            ->get();

        return $rows->map(fn ($r) => [
            'user_id'     => (int) $r->id,
            'name'        => $r->name,
            'legs_played' => (int) $r->legs_played,
            'legs_won'    => (int) $r->legs_won,
            'win_rate'    => round($r->legs_won / $r->legs_played * 100, 1),
        ])->values()->all();
    }

    /** @return array<string, mixed> */
    private function emptySoloAgg(): array
    {
        return [
            'games_finished'      => 0,
            'total_darts'         => 0,
            'total_scored'        => 0,
            'busts'               => 0,
            'checkout_attempts'   => 0,
            'checkout_hits'       => 0,
            'high_turn'           => 0,
            'by_variant'          => [],
        ];
    }

    private function mergeSoloTurnsIntoAgg(array &$agg, array $turns): void
    {
        foreach ($turns as $t) {
            $darts = $t['darts'] ?? [];
            $agg['total_darts'] += count($darts);

            if (!empty($t['bust'])) {
                $agg['busts']++;

                continue;
            }

            $scored = (int) ($t['scored'] ?? 0);
            $agg['total_scored'] += $scored;
            if ($scored > $agg['high_turn']) {
                $agg['high_turn'] = $scored;
            }

            $before = (int) ($t['score_before'] ?? 0);
            if ($before >= 2 && $before <= 170) {
                $agg['checkout_attempts']++;
                if (!empty($t['checkout'])) {
                    $agg['checkout_hits']++;
                }
            }
        }
    }

    /** @param array<string, mixed> $agg */
    private function formatSoloAgg(array $agg): array
    {
        $td = (int) $agg['total_darts'];
        $avg = $td > 0 ? round(((float) $agg['total_scored'] / $td) * 3, 2) : 0.0;
        $ca  = (int) $agg['checkout_attempts'];
        $cp  = $ca > 0 ? round($agg['checkout_hits'] / $ca * 100, 1) : 0.0;

        return [
            'games_finished'    => (int) $agg['games_finished'],
            'total_darts'       => $td,
            'average'           => $avg,
            'checkout_percent'  => $cp,
            'high_turn'         => (int) $agg['high_turn'],
            'busts'             => (int) $agg['busts'],
            'by_variant'        => $agg['by_variant'],
        ];
    }
}
