<?php

namespace App\Services;

use App\Models\GameX01Training;

class X01TrainingEngine
{
    public function __construct(private readonly X01Engine $x01) {}

    // ── Game lifecycle ────────────────────────────────────────────────────────

    public function startGame(int $variant, string $outMode, string $inMode, ?int $userId, ?string $sessionId): GameX01Training
    {
        return GameX01Training::create([
            'player_id'     => $userId,
            'session_id'    => $sessionId,
            'variant'       => $variant,
            'out_mode'      => $outMode,
            'in_mode'       => $inMode,
            'current_score' => $variant,
            'turns'         => [],
            'finished'      => false,
        ]);
    }

    /**
     * Register a full turn (1–3 darts).
     * Each dart: ['segment'=>int, 'multiplier'=>int, 'value'=>int]
     */
    public function registerThrow(GameX01Training $game, array $darts): array
    {
        $scoreBefore  = $game->current_score;
        $turns        = $game->turns ?? [];
        $opened       = $this->isOpened($game, $turns);
        $scoringDarts = $darts; // darts that actually count toward score

        if (!$opened) {
            // Double-in: find first double in this turn
            $firstDoubleIdx = null;
            foreach ($darts as $i => $d) {
                if ($d['multiplier'] === 2 && $d['segment'] > 0) {
                    $firstDoubleIdx = $i;
                    break;
                }
            }

            if ($firstDoubleIdx === null) {
                // No double — turn scores 0, does not open, not a bust
                $turns[] = $this->buildTurnRecord($scoreBefore, $scoreBefore, 0, false, false, false, $darts);
                $game->turns = $turns;
                $game->save();
                return ['bust' => false, 'checkout' => false, 'scored' => 0, 'score_after' => $scoreBefore, 'opened' => false];
            }

            // Only darts from the first double onward count
            $scoringDarts = array_values(array_slice($darts, $firstDoubleIdx));
            $opened = true;
        }

        $totalScored = $this->x01->calculateScore($scoringDarts);
        $lastDart    = end($scoringDarts);

        $isBust     = $this->x01->isBust($scoreBefore, $totalScored, $game->out_mode);
        $isCheckout = !$isBust && $this->x01->isCheckout($scoreBefore, $totalScored, $lastDart, $game->out_mode);
        $scoreAfter = $isBust ? $scoreBefore : $scoreBefore - $totalScored;

        $turns[] = $this->buildTurnRecord($scoreBefore, $scoreAfter, $isBust ? 0 : $totalScored, $isBust, $isCheckout, true, $darts);

        $game->turns         = $turns;
        $game->current_score = $scoreAfter;
        $game->finished      = $isCheckout;
        $game->save();

        return [
            'bust'        => $isBust,
            'checkout'    => $isCheckout,
            'scored'      => $isBust ? 0 : $totalScored,
            'score_after' => $scoreAfter,
            'opened'      => true,
        ];
    }

    private function buildTurnRecord(int $before, int $after, int $scored, bool $bust, bool $checkout, bool $opened, array $darts): array
    {
        return [
            'score_before' => $before,
            'score_after'  => $after,
            'scored'       => $scored,
            'bust'         => $bust,
            'checkout'     => $checkout,
            'opened'       => $opened,
            'darts'        => array_map(fn ($d) => [
                'seg' => $d['segment'], 'mul' => $d['multiplier'], 'val' => $d['value'],
            ], $darts),
        ];
    }

    public function undo(GameX01Training $game): void
    {
        $turns = $game->turns ?? [];
        if (empty($turns)) {
            return;
        }

        $last = array_pop($turns);
        $game->turns         = $turns;
        $game->current_score = $last['score_before'];
        $game->finished      = false;
        $game->save();
    }

    // ── State snapshot ────────────────────────────────────────────────────────

    public function buildState(GameX01Training $game): array
    {
        $turns   = $game->turns ?? [];
        $stats   = $this->computeStats($turns, $game->variant);
        $opened  = $this->isOpened($game, $turns);
        $checkout = ($game->finished || !$opened) ? [] : $this->x01->suggestCheckout($game->current_score);

        return [
            'id'            => $game->id,
            'variant'       => $game->variant,
            'out_mode'      => $game->out_mode,
            'in_mode'       => $game->in_mode,
            'opened'        => $opened,
            'current_score' => $game->current_score,
            'finished'      => (bool) $game->finished,
            'turn_number'   => count($turns) + 1,
            'turns'         => $turns,
            'stats'         => $stats,
            'checkout'      => $checkout,
        ];
    }

    private function isOpened(GameX01Training $game, array $turns): bool
    {
        if ($game->in_mode === 'straight') {
            return true;
        }
        return !empty(array_filter($turns, fn ($t) => $t['opened'] ?? false));
    }

    private function computeStats(array $turns, int $variant): array
    {
        $nonBust   = array_filter($turns, fn ($t) => !$t['bust']);
        $allDarts  = array_merge(...array_column($turns, 'darts') ?: [[]]);
        $nDarts    = count($allDarts);
        $nTurns    = count($turns);
        $totalPts  = array_sum(array_column(array_values($nonBust), 'scored'));

        // First-9 average (first 3 turns, non-bust points)
        $first3    = array_filter(array_slice($turns, 0, 3), fn ($t) => !$t['bust']);
        $first3pts = array_sum(array_column(array_values($first3), 'scored'));
        $first3d   = count(array_merge(...array_column(array_values(array_slice($turns, 0, 3)), 'darts') ?: [[]]));

        $checkoutAttempts = count(array_filter($turns, fn ($t) => $t['score_before'] <= 170 && $t['score_before'] >= 2));
        $checkoutHits     = count(array_filter($turns, fn ($t) => $t['checkout']));

        return [
            'turns'          => $nTurns,
            'darts'          => $nDarts,
            'average'        => $nDarts > 0 ? round(($totalPts / $nDarts) * 3, 1) : 0.0,
            'first9_avg'     => $first3d  > 0 ? round(($first3pts / $first3d)  * 3, 1) : 0.0,
            'high_turn'      => $nonBust ? max(array_column(array_values($nonBust), 'scored')) : 0,
            'busts'          => count(array_filter($turns, fn ($t) => $t['bust'])),
            'checkout_pct'   => $checkoutAttempts > 0
                ? round($checkoutHits / $checkoutAttempts * 100, 1)
                : 0.0,
        ];
    }
}
