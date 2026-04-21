<?php

namespace App\Services;

use App\Models\GameMatch;
use App\Models\Leg;
use App\Models\Turn;

/**
 * Pēc spēles protokola kopsavilkums (DartConnect stila tabulas: MPR, legi, AGP).
 */
class MatchReportService
{
    public function __construct(
        private readonly CricketEngine $cricket,
    ) {}

    public function build(GameMatch $match): array
    {
        $match->load(['room.activePlayers.user', 'winner']);
        $room     = $match->room;
        $gameType = $room->game_type;
        $config   = $room->game_config ?? [];

        $players = $room->activePlayers->sortBy('order')->values();
        $playerIds = $players->pluck('id')->map(fn ($id) => (int) $id)->all();

        $legs = Leg::query()
            ->where('match_id', $match->id)
            ->orderBy('set_number')
            ->orderBy('leg_number')
            ->with([
                'turns' => fn ($q) => $q->with(['darts' => fn ($dq) => $dq->orderBy('dart_number')])
                    ->where('is_undone', false)
                    ->orderBy('turn_number'),
            ])
            ->get();

        $meta = $this->buildMeta($match, $room->code, $gameType, $config, $legs);

        if ($gameType === 'cricket') {
            $segments = $config['cricket_segments'] ?? CricketEngine::STANDARD_SEGMENTS;

            return array_merge($meta, $this->buildCricketReport($match, $players, $playerIds, $segments, $legs));
        }

        if ($gameType === 'x01') {
            return array_merge($meta, $this->buildX01Report($match, $players, $playerIds, $legs));
        }

        return array_merge($meta, [
            'player_rows' => [],
            'agp'         => null,
            'leg_rows'    => [],
        ]);
    }

    private function buildMeta(GameMatch $match, string $roomCode, string $gameType, array $config, $legs): array
    {
        $started = $match->started_at;
        $ended   = $match->finished_at;
        $firstLegStart = $legs->first()?->started_at;

        $startTs = $started ?? $firstLegStart;
        $durSec  = null;
        if ($startTs && $ended) {
            $durSec = max(0, $ended->getTimestamp() - $startTs->getTimestamp());
        }

        $variant = $config['variant'] ?? null;
        $inOut   = null;
        if ($gameType === 'x01') {
            $in  = ($config['in'] ?? 'straight') === 'double' ? 'D' : 'S';
            $out = ($config['out'] ?? 'double') === 'double' ? 'D' : 'S';
            $inOut = $in . '-in / ' . $out . '-out';
        }

        return [
            'meta' => [
                'room_code'        => $roomCode,
                'match_id'         => (string) $match->id,
                'game_type'        => $gameType,
                'game_type_label'  => $gameType === 'cricket'
                    ? 'Cricket'
                    : (($variant ? (string) $variant : '501') . ' (\'01)'),
                'x01_in_out'       => $inOut,
                'status'           => $match->status,
                'started_at'       => $startTs?->toIso8601String(),
                'finished_at'      => $ended?->toIso8601String(),
                'duration_seconds' => $durSec,
                'duration_label'   => $this->formatDuration($durSec),
                'legs_played'      => $legs->count(),
                'sets_config'      => $match->legs_config['sets'] ?? 1,
                'legs_per_set'     => $match->legs_config['legs'] ?? 1,
            ],
        ];
    }

    private function buildCricketReport(
        GameMatch $match,
        $players,
        array $playerIds,
        array $segments,
        $legs
    ): array {
        $totals = [];
        foreach ($playerIds as $pid) {
            $totals[$pid] = ['marks' => 0, 'darts' => 0, 'points' => 0];
        }

        $legRows = [];

        foreach ($legs as $leg) {
            $legStats = $this->replayCricketLeg($leg->turns, $playerIds, $segments);
            foreach ($playerIds as $pid) {
                $totals[$pid]['marks'] += $legStats[$pid]['marks'];
                $totals[$pid]['darts'] += $legStats[$pid]['darts'];
                $totals[$pid]['points'] += $legStats[$pid]['points'];
            }

            $legRows[] = $this->formatCricketLegRow($leg, $players, $legStats);
        }

        $playerRows = $players->map(function ($p) use ($totals, $match) {
            $pid = (int) $p->id;
            $t   = $totals[$pid] ?? ['marks' => 0, 'darts' => 0, 'points' => 0];
            $mpr = $t['darts'] > 0 ? round(($t['marks'] / $t['darts']) * 3, 1) : 0.0;

            return [
                'id'         => $pid,
                'name'       => $p->display_name,
                'order'      => (int) $p->order,
                'sets_won'   => $this->countSetsWonForPlayer($match, $pid),
                'legs_won'   => Leg::where('match_id', $match->id)->where('winner_player_id', $pid)->count(),
                'won_match'  => (int) ($match->winner_player_id ?? 0) === $pid,
                'marks'      => $t['marks'],
                'darts'      => $t['darts'],
                'mpr'        => $mpr,
                'points'     => $t['points'],
            ];
        })->values()->all();

        $sumMarks   = array_sum(array_column($totals, 'marks'));
        $sumDarts   = array_sum(array_column($totals, 'darts'));
        $sumPoints  = array_sum(array_column($totals, 'points'));
        $agpMpr     = $sumDarts > 0 ? round(($sumMarks / $sumDarts) * 3, 1) : 0.0;

        return [
            'player_rows' => $playerRows,
            'agp'         => [
                'marks'  => $sumMarks,
                'points' => $sumPoints,
                'darts'  => $sumDarts,
                'mpr'    => $agpMpr,
            ],
            'leg_rows' => $legRows,
        ];
    }

    private function buildX01Report(GameMatch $match, $players, array $playerIds, $legs): array
    {
        $totals = [];
        foreach ($playerIds as $pid) {
            $totals[$pid] = [
                'points'    => 0,
                'darts'     => 0,
                'busts'     => 0,
                'checkouts' => 0,
                'high_turn' => 0,
            ];
        }

        $legRows = [];

        foreach ($legs as $leg) {
            $legStats = $this->sumX01Leg($leg->turns, $playerIds);
            foreach ($playerIds as $pid) {
                $totals[$pid]['points'] += $legStats[$pid]['points'];
                $totals[$pid]['darts'] += $legStats[$pid]['darts'];
                $totals[$pid]['busts'] += $legStats[$pid]['busts'];
                $totals[$pid]['checkouts'] += $legStats[$pid]['checkouts'];
                $totals[$pid]['high_turn'] = max($totals[$pid]['high_turn'], $legStats[$pid]['high_turn']);
            }
            $legRows[] = $this->formatX01LegRow($leg, $players, $legStats);
        }

        $playerRows = $players->map(function ($p) use ($totals, $match) {
            $pid = (int) $p->id;
            $t   = $totals[$pid] ?? [
                'points' => 0, 'darts' => 0, 'busts' => 0, 'checkouts' => 0, 'high_turn' => 0,
            ];
            $tda = $t['darts'] > 0 ? round(($t['points'] / $t['darts']) * 3, 2) : 0.0;

            return [
                'id'         => $pid,
                'name'       => $p->display_name,
                'order'      => (int) $p->order,
                'sets_won'   => $this->countSetsWonForPlayer($match, $pid),
                'legs_won'   => Leg::where('match_id', $match->id)->where('winner_player_id', $pid)->count(),
                'won_match'  => (int) ($match->winner_player_id ?? 0) === $pid,
                'points'     => $t['points'],
                'darts'      => $t['darts'],
                'three_da'   => $tda,
                'busts'      => $t['busts'],
                'checkouts'  => $t['checkouts'],
                'high_turn'  => $t['high_turn'],
            ];
        })->values()->all();

        $sumPts    = array_sum(array_column($totals, 'points'));
        $sumDarts  = array_sum(array_column($totals, 'darts'));
        $sumBusts  = array_sum(array_column($totals, 'busts'));
        $agp3da    = $sumDarts > 0 ? round(($sumPts / $sumDarts) * 3, 2) : 0.0;

        return [
            'player_rows' => $playerRows,
            'agp'         => [
                'points'   => $sumPts,
                'darts'    => $sumDarts,
                'three_da' => $agp3da,
                'busts'    => $sumBusts,
            ],
            'leg_rows' => $legRows,
        ];
    }

    /**
     * @param  \Illuminate\Support\Collection<int, \App\Models\Turn>  $turns
     * @return array<int, array{marks: int, darts: int, points: int}>
     */
    private function replayCricketLeg($turns, array $playerIds, array $segments): array
    {
        $hits = [];
        foreach ($playerIds as $pid) {
            foreach ($segments as $seg) {
                $hits[(int) $pid][(int) $seg] = 0;
            }
        }

        $stats = [];
        foreach ($playerIds as $pid) {
            $stats[(int) $pid] = ['marks' => 0, 'darts' => 0, 'points' => 0];
        }

        foreach ($turns as $turn) {
            $tid = (int) $turn->player_id;
            foreach ($turn->darts as $dart) {
                $stats[$tid]['darts']++;
                $seg  = (int) $dart->segment;
                $mult = (int) $dart->multiplier;
                $stats[$tid]['marks'] += $this->cricket->statHitMultiplierBeforeApply(
                    $hits,
                    $playerIds,
                    $segments,
                    $tid,
                    $seg,
                    $mult
                );
                $this->cricket->applyDartToHitMap($hits, $tid, $seg, $mult, $segments);
            }
            $stats[$tid]['points'] += (int) $turn->total_scored;
        }

        return $stats;
    }

    /**
     * @param  \Illuminate\Support\Collection<int, \App\Models\Turn>  $turns
     * @return array<int, array{points: int, darts: int, busts: int, checkouts: int, high_turn: int}>
     */
    private function sumX01Leg($turns, array $playerIds): array
    {
        $stats = [];
        foreach ($playerIds as $pid) {
            $stats[(int) $pid] = [
                'points'    => 0,
                'darts'     => 0,
                'busts'     => 0,
                'checkouts' => 0,
                'high_turn' => 0,
            ];
        }

        foreach ($turns as $turn) {
            $tid = (int) $turn->player_id;
            foreach ($turn->darts as $_dart) {
                $stats[$tid]['darts']++;
            }
            $ts = (int) $turn->total_scored;
            $stats[$tid]['points'] += $ts;
            if ($turn->is_bust) {
                $stats[$tid]['busts']++;
            }
            if ($turn->is_checkout) {
                $stats[$tid]['checkouts']++;
            }
            if ($ts > $stats[$tid]['high_turn']) {
                $stats[$tid]['high_turn'] = $ts;
            }
        }

        return $stats;
    }

    private function formatCricketLegRow(Leg $leg, $players, array $legStats): array
    {
        $ordered = $players->sortBy('order')->values();
        $per     = $ordered->map(function ($p) use ($legStats) {
            $pid = (int) $p->id;
            $s   = $legStats[$pid] ?? ['marks' => 0, 'darts' => 0, 'points' => 0];
            $mpr = $s['darts'] > 0 ? round(($s['marks'] / $s['darts']) * 3, 1) : 0.0;

            return [
                'id'     => $pid,
                'name'   => $p->display_name,
                'marks'  => $s['marks'],
                'darts'  => $s['darts'],
                'mpr'    => $mpr,
                'points' => $s['points'],
            ];
        })->values()->all();

        $totalDarts = (int) array_sum(array_column($legStats, 'darts'));

        return [
            'label'       => $leg->set_number . '.' . $leg->leg_number,
            'set_number'  => (int) $leg->set_number,
            'leg_number'  => (int) $leg->leg_number,
            'winner_id'   => $leg->winner_player_id ? (int) $leg->winner_player_id : null,
            'game_label'  => 'Cricket',
            'total_darts' => $totalDarts,
            'players'     => $per,
        ];
    }

    private function formatX01LegRow(Leg $leg, $players, array $legStats): array
    {
        $ordered = $players->sortBy('order')->values();
        $per     = $ordered->map(function ($p) use ($legStats) {
            $pid = (int) $p->id;
            $s   = $legStats[$pid] ?? [
                'points' => 0, 'darts' => 0, 'busts' => 0, 'checkouts' => 0, 'high_turn' => 0,
            ];
            $tda = $s['darts'] > 0 ? round(($s['points'] / $s['darts']) * 3, 2) : 0.0;

            return [
                'id'         => $pid,
                'name'       => $p->display_name,
                'points'     => $s['points'],
                'darts'      => $s['darts'],
                'three_da'   => $tda,
                'busts'      => $s['busts'],
                'checkouts'  => $s['checkouts'],
                'high_turn'  => $s['high_turn'],
            ];
        })->values()->all();

        $totalDarts = array_sum(array_column($legStats, 'darts'));

        return [
            'label'       => $leg->set_number . '.' . $leg->leg_number,
            'set_number'  => (int) $leg->set_number,
            'leg_number'  => (int) $leg->leg_number,
            'winner_id'   => $leg->winner_player_id ? (int) $leg->winner_player_id : null,
            'game_label'  => '\'01',
            'total_darts' => $totalDarts,
            'players'     => $per,
        ];
    }

    private function countSetsWonForPlayer(GameMatch $match, int $roomPlayerId): int
    {
        $legsPerSet = (int) ($match->legs_config['legs'] ?? 1);
        $legsToWin  = (int) ceil($legsPerSet / 2);
        $maxSet     = (int) (Leg::where('match_id', $match->id)->max('set_number') ?? 0);

        $won = 0;
        for ($s = 1; $s <= $maxSet; $s++) {
            $counts = Leg::query()
                ->where('match_id', $match->id)
                ->where('set_number', $s)
                ->whereNotNull('winner_player_id')
                ->selectRaw('winner_player_id, COUNT(*) as c')
                ->groupBy('winner_player_id')
                ->pluck('c', 'winner_player_id');

            $w = (int) ($counts[$roomPlayerId] ?? 0);
            if ($w >= $legsToWin) {
                $won++;
            }
        }

        return $won;
    }

    private function formatDuration(?int $seconds): string
    {
        if ($seconds === null) {
            return '—';
        }
        $h = intdiv($seconds, 3600);
        $m = intdiv($seconds % 3600, 60);
        $s = $seconds % 60;
        if ($h > 0) {
            return sprintf('%d:%02d:%02d', $h, $m, $s);
        }

        return sprintf('%02d:%02d', $m, $s);
    }
}
