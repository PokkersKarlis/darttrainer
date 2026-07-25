<?php

namespace App\Services\Darts;

class X01DartPointsMapper
{
    /**
     * @return array{sector: int, multiplier: int}|null
     */
    public function pointsToDart(int $points): ?array
    {
        if ($points === 0) {
            return ['sector' => 0, 'multiplier' => 0];
        }

        if ($points === 50) {
            return ['sector' => 25, 'multiplier' => 2];
        }

        if ($points === 25) {
            return ['sector' => 25, 'multiplier' => 1];
        }

        if ($points >= 1 && $points <= 20) {
            return ['sector' => $points, 'multiplier' => 1];
        }

        if ($points % 2 === 0 && $points >= 2 && $points <= 40) {
            return ['sector' => (int) ($points / 2), 'multiplier' => 2];
        }

        if ($points % 3 === 0 && $points >= 3 && $points <= 60) {
            $sector = (int) ($points / 3);

            if ($sector >= 1 && $sector <= 20) {
                return ['sector' => $sector, 'multiplier' => 3];
            }
        }

        return null;
    }

    public function assertValidPoints(int $points): void
    {
        if ($this->pointsToDart($points) === null) {
            abort(422, 'invalid-dart-points');
        }
    }

    public function isAchievableVisitTotal(int $points): bool
    {
        if ($points < 0 || $points > 180) {
            return false;
        }

        for ($dartCount = 1; $dartCount <= 3; $dartCount++) {
            if ($this->findDartScoreCombination($points, $dartCount) !== null) {
                return true;
            }
        }

        return false;
    }

    public function assertValidVisitPoints(int $points): void
    {
        if ($points < 0 || $points > 180) {
            abort(422, 'invalid-visit-points');
        }

        if (! $this->isAchievableVisitTotal($points)) {
            abort(422, 'invalid-visit-points');
        }
    }

    /**
     * Decompose a visit total (0–180) into 1–3 valid dart scores.
     *
     * @return list<array{sector: int, multiplier: int}>|null
     */
    public function visitPointsToDarts(int $points, ?int $dartCount = null): ?array
    {
        if ($points < 0 || $points > 180) {
            return null;
        }

        $counts = $dartCount !== null ? [$dartCount] : [1, 2, 3];

        foreach ($counts as $count) {
            $scores = $this->findDartScoreCombination($points, $count);
            if ($scores === null) {
                continue;
            }

            $darts = $this->scoresToOrderedDarts(array_reverse($scores));
            if ($darts !== null) {
                return $darts;
            }
        }

        return null;
    }

    /**
     * Build a visit with optional checkout / double constraints from calculator input.
     *
     * @return list<array{sector: int, multiplier: int}>|null
     */
    public function buildVisitDarts(
        int $points,
        ?int $dartCount = null,
        ?int $checkoutDart = null,
        ?int $doubleDarts = null,
        ?int $remainingBefore = null,
        bool $requireDoubleOut = true,
    ): ?array {
        if (! $this->isAchievableVisitTotal($points)) {
            return null;
        }

        if ($checkoutDart !== null || $doubleDarts !== null) {
            $counts = $dartCount !== null ? [$dartCount] : [1, 2, 3];

            foreach ($counts as $count) {
                if ($checkoutDart !== null && $checkoutDart > $count) {
                    continue;
                }

                if ($doubleDarts !== null && $doubleDarts > $count) {
                    continue;
                }

                foreach ($this->enumerateScoreCombinations($points, $count) as $scores) {
                    foreach ($this->permuteScores($scores) as $orderedScores) {
                        $darts = $this->scoresToOrderedDarts($orderedScores);
                        if ($darts === null) {
                            continue;
                        }

                        if ($checkoutDart !== null && $remainingBefore !== null) {
                            if (! $this->sequenceMatchesCheckout($darts, $remainingBefore, $checkoutDart, $requireDoubleOut)) {
                                continue;
                            }
                        }

                        if ($doubleDarts !== null && $this->countDoublesInDarts($darts) !== $doubleDarts) {
                            continue;
                        }

                        return $darts;
                    }
                }
            }

            return null;
        }

        return $this->visitPointsToDarts($points, $dartCount);
    }

    public function minimumDartCountForVisit(int $points): ?int
    {
        for ($dartCount = 1; $dartCount <= 3; $dartCount++) {
            if ($this->findDartScoreCombination($points, $dartCount) !== null) {
                return $dartCount;
            }
        }

        return null;
    }

    /**
     * @param  list<int>|null  $dartCounts
     * @return list<int>
     */
    public function achievableDoubleDartCounts(
        int $points,
        ?array $dartCounts = null,
        ?int $remainingBefore = null,
        ?int $checkoutDart = null,
        bool $requireDoubleOut = true,
    ): array {
        $counts = $dartCounts ?? [1, 2, 3];
        $doubles = [];

        foreach ($counts as $count) {
            if ($checkoutDart !== null && $checkoutDart > $count) {
                continue;
            }

            foreach ($this->enumerateScoreCombinations($points, $count) as $scores) {
                foreach ($this->permuteScores($scores) as $orderedScores) {
                    $darts = $this->scoresToOrderedDarts($orderedScores);
                    if ($darts === null) {
                        continue;
                    }

                    if ($checkoutDart !== null && $remainingBefore !== null) {
                        if (! $this->sequenceMatchesCheckout($darts, $remainingBefore, $checkoutDart, $requireDoubleOut)) {
                            continue;
                        }
                    }

                    $doubles[] = $this->countDoublesInDarts($darts);
                }
            }
        }

        $unique = array_values(array_unique($doubles));
        sort($unique);

        return $unique;
    }

    /**
     * @return list<int>
     */
    private function validDartScores(): array
    {
        static $scores = null;

        if ($scores !== null) {
            return $scores;
        }

        $scores = [0];
        for ($sector = 1; $sector <= 20; $sector++) {
            $scores[] = $sector;
            $scores[] = $sector * 2;
            $scores[] = $sector * 3;
        }
        $scores[] = 25;
        $scores[] = 50;

        $scores = array_values(array_unique($scores));
        rsort($scores);

        return $scores;
    }

    /**
     * @return list<int>|null
     */
    private function findDartScoreCombination(int $target, int $dartsLeft): ?array
    {
        if ($target === 0) {
            return [];
        }

        if ($dartsLeft === 0) {
            return null;
        }

        foreach ($this->validDartScores() as $score) {
            if ($score > $target) {
                continue;
            }

            $rest = $this->findDartScoreCombination($target - $score, $dartsLeft - 1);
            if ($rest !== null) {
                return array_merge([$score], $rest);
            }
        }

        return null;
    }

    /**
     * @return list<list<int>>
     */
    private function enumerateScoreCombinations(int $target, int $dartCount): array
    {
        $results = [];
        $this->collectScoreCombinations($target, $dartCount, [], $results);

        return $results;
    }

    /**
     * @param  list<int>  $current
     * @param  list<list<int>>  $results
     */
    private function collectScoreCombinations(int $target, int $dartsLeft, array $current, array &$results): void
    {
        if ($dartsLeft === 0) {
            if ($target === 0) {
                $results[] = $current;
            }

            return;
        }

        foreach ($this->validDartScores() as $score) {
            if ($score > $target) {
                continue;
            }

            $this->collectScoreCombinations(
                $target - $score,
                $dartsLeft - 1,
                array_merge($current, [$score]),
                $results,
            );
        }
    }

    /**
     * @param  list<int>  $scores
     * @return list<list<int>>
     */
    private function permuteScores(array $scores): array
    {
        if (count($scores) <= 1) {
            return [$scores];
        }

        $permutations = [];

        foreach ($scores as $index => $score) {
            $rest = $scores;
            unset($rest[$index]);
            foreach ($this->permuteScores(array_values($rest)) as $perm) {
                $permutations[] = array_merge([$score], $perm);
            }
        }

        $unique = [];
        foreach ($permutations as $perm) {
            $key = implode(',', $perm);
            $unique[$key] = $perm;
        }

        return array_values($unique);
    }

    /**
     * @param  list<int>  $scores
     * @return list<array{sector: int, multiplier: int}>|null
     */
    private function scoresToOrderedDarts(array $scores): ?array
    {
        $darts = [];

        foreach ($scores as $score) {
            $dart = $this->pointsToDart($score);
            if ($dart === null) {
                return null;
            }
            $darts[] = $dart;
        }

        return $darts;
    }

    /**
     * @param  list<array{sector: int, multiplier: int}>  $darts
     */
    private function countDoublesInDarts(array $darts): int
    {
        $count = 0;

        foreach ($darts as $dart) {
            if ($dart['multiplier'] === 2 || ($dart['sector'] === 25 && $dart['multiplier'] === 2)) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * @param  list<array{sector: int, multiplier: int}>  $darts
     */
    private function sequenceMatchesCheckout(
        array $darts,
        int $remainingBefore,
        int $checkoutDart,
        bool $requireDoubleOut,
    ): bool {
        $running = $remainingBefore;
        $scoring = app(X01ScoringService::class);

        foreach ($darts as $index => $dart) {
            $throwNumber = $index + 1;
            $points = $scoring->dartPoints($dart['sector'], $dart['multiplier']);

            if ($points === 0) {
                continue;
            }

            $candidate = $running - $points;

            if ($candidate < 0) {
                return false;
            }

            if ($candidate === 1 && $requireDoubleOut) {
                return false;
            }

            if ($candidate === 0) {
                if ($throwNumber !== $checkoutDart) {
                    return false;
                }

                if ($requireDoubleOut && ! $scoring->isDoubleDart($dart['sector'], $dart['multiplier'])) {
                    return false;
                }

                return true;
            }

            $running = $candidate;
        }

        return false;
    }
}
