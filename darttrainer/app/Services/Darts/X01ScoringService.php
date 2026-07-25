<?php

namespace App\Services\Darts;

use App\Enums\X01ScoringRule;
use App\Models\DartX01SoloActiveThrow;

class X01ScoringService
{
    public function dartPoints(int $sector, int $multiplier): int
    {
        if ($multiplier === 0) {
            return 0;
        }

        return $sector * $multiplier;
    }

    public function isDoubleDart(int $sector, int $multiplier): bool
    {
        return $multiplier === 2 || ($sector === 25 && $multiplier === 2);
    }

    public function isValidTurn(
        int $remainingBefore,
        int $turnTotal,
        X01ScoringRule $inRule,
        X01ScoringRule $outRule,
        bool $isFirstScoringTurn,
        bool $lastDartIsDouble,
    ): array {
        if ($isFirstScoringTurn && $inRule === X01ScoringRule::Double && $turnTotal > 0) {
            $openedWithDouble = false;
        }

        $remainingAfter = $remainingBefore - $turnTotal;

        if ($remainingAfter < 0) {
            return ['valid' => false, 'bust' => true, 'remaining' => $remainingBefore, 'won' => false];
        }

        if ($remainingAfter === 1 && $outRule === X01ScoringRule::Double) {
            return ['valid' => false, 'bust' => true, 'remaining' => $remainingBefore, 'won' => false];
        }

        if ($remainingAfter === 0) {
            if ($outRule === X01ScoringRule::Double && ! $lastDartIsDouble) {
                return ['valid' => false, 'bust' => true, 'remaining' => $remainingBefore, 'won' => false];
            }

            return ['valid' => true, 'bust' => false, 'remaining' => 0, 'won' => true];
        }

        return ['valid' => true, 'bust' => false, 'remaining' => $remainingAfter, 'won' => false];
    }

    /**
     * @param  list<array{sector: int, multiplier: int}>  $darts
     */
    public function evaluateTurn(
        int $remainingBefore,
        array $darts,
        X01ScoringRule $inRule,
        X01ScoringRule $outRule,
        bool $playerHasScored,
    ): array {
        $running = $remainingBefore;
        $turnTotal = 0;
        $hasScoredThisTurn = false;
        $lastDartIsDouble = false;

        foreach ($darts as $index => $dart) {
            $points = $this->dartPoints($dart['sector'], $dart['multiplier']);
            $lastDartIsDouble = $this->isDoubleDart($dart['sector'], $dart['multiplier']);

            if ($points === 0) {
                continue;
            }

            if (! $playerHasScored && ! $hasScoredThisTurn && $inRule === X01ScoringRule::Double && ! $lastDartIsDouble) {
                continue;
            }

            $hasScoredThisTurn = true;
            $candidate = $running - $points;

            if ($candidate < 0) {
                return [
                    'points_scored' => 0,
                    'remaining' => $remainingBefore,
                    'is_bust' => true,
                    'won' => false,
                    'throws' => $this->buildThrowResults($darts, $index, false),
                ];
            }

            if ($candidate === 1 && $outRule === X01ScoringRule::Double) {
                return [
                    'points_scored' => 0,
                    'remaining' => $remainingBefore,
                    'is_bust' => true,
                    'won' => false,
                    'throws' => $this->buildThrowResults($darts, $index, false),
                ];
            }

            if ($candidate === 0) {
                if ($outRule === X01ScoringRule::Double && ! $lastDartIsDouble) {
                    return [
                        'points_scored' => 0,
                        'remaining' => $remainingBefore,
                        'is_bust' => true,
                        'won' => false,
                        'throws' => $this->buildThrowResults($darts, $index, false),
                    ];
                }

                $turnTotal += $points;
                $running = 0;

                return [
                    'points_scored' => $turnTotal,
                    'remaining' => 0,
                    'is_bust' => false,
                    'won' => true,
                    'throws' => $this->buildThrowResults($darts, $index, true),
                ];
            }

            $turnTotal += $points;
            $running = $candidate;
        }

        return [
            'points_scored' => $turnTotal,
            'remaining' => $running,
            'is_bust' => false,
            'won' => false,
            'throws' => $this->buildThrowResults($darts, count($darts) - 1, false),
        ];
    }

    /**
     * @param  list<array{sector: int, multiplier: int}>  $darts
     * @return list<array{throw_number: int, sector: int, multiplier: int, is_leg_winner: bool}>
     */
    private function buildThrowResults(array $darts, int $lastIndex, bool $legWinner): array
    {
        $results = [];

        foreach ($darts as $i => $dart) {
            if ($i > $lastIndex) {
                break;
            }

            $results[] = [
                'throw_number' => $i + 1,
                'sector' => $dart['sector'],
                'multiplier' => $dart['multiplier'],
                'is_leg_winner' => $legWinner && $i === $lastIndex,
            ];
        }

        return $results;
    }

    public function throwModelPoints(DartX01SoloActiveThrow $throw): int
    {
        return $this->dartPoints($throw->sector, $throw->multiplier);
    }
}
