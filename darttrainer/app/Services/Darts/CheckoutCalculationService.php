<?php

namespace App\Services\Darts;

class CheckoutCalculationService
{
    /** @var list<int> */
    private const IMPOSSIBLE_CHECKOUTS = [
        159, 162, 163, 165, 166, 168, 169, 172, 173, 175, 176, 178, 179,
    ];

    public function __construct(
        private readonly X01DartPointsMapper $dartPoints,
    ) {}

    public function isFinishableCheckout(int $remaining): bool
    {
        return $remaining >= 2
            && $remaining <= 170
            && ! in_array($remaining, self::IMPOSSIBLE_CHECKOUTS, true);
    }

    public function isInCheckoutRange(int $remaining): bool
    {
        return $this->isFinishableCheckout($remaining);
    }

    /**
     * @return array{
     *     is_in_checkout_range: bool,
     *     is_finishable: bool,
     *     suggested_route: list<string>
     * }
     */
    public function checkoutContext(int $remaining, bool $requireDoubleOut = true): array
    {
        return [
            'is_in_checkout_range' => $this->isInCheckoutRange($remaining),
            'is_finishable' => $this->isFinishableCheckout($remaining),
            'suggested_route' => $this->getCheckoutRoutes($remaining, $requireDoubleOut),
        ];
    }

    /**
     * @return list<string>
     */
    public function getCheckoutRoutes(int $remainingPoints, bool $requireDoubleOut = true): array
    {
        if (! $this->isFinishableCheckout($remainingPoints)) {
            return [];
        }

        $darts = $this->dartPoints->visitPointsToDarts($remainingPoints);
        if ($darts === null) {
            return [];
        }

        return array_map(
            fn (array $dart): string => $this->formatDartLabel($dart['sector'], $dart['multiplier']),
            $darts,
        );
    }

    public function requiresDoubleAttemptsPrompt(
        int $points,
        int $remainingBefore,
        bool $wouldBust,
    ): bool {
        if (! $this->isFinishableCheckout($remainingBefore)) {
            return false;
        }

        if ($wouldBust) {
            return true;
        }

        return $points < $remainingBefore - 1 || $points === $remainingBefore;
    }

    /**
     * @return list<int>
     */
    public function getAllowedDoubleAttempts(
        int $startingScore,
        int $scoredPoints,
        ?int $dartCount = null,
        bool $requireDoubleOut = true,
    ): array {
        $max = $this->getMaxDoubleAttempts($startingScore, $scoredPoints, $dartCount, $requireDoubleOut);

        if ($max === 0) {
            return [];
        }

        return range(0, $max);
    }

    public function getMaxDoubleAttempts(
        int $startingScore,
        int $scoredPoints,
        ?int $dartCount = null,
        bool $requireDoubleOut = true,
    ): int {
        if (! $this->isInCheckoutRange($startingScore)) {
            return 0;
        }

        $effectiveDartCount = $dartCount ?? $this->dartPoints->minimumDartCountForVisit($scoredPoints) ?? 3;
        $effectiveDartCount = min(3, max(1, $effectiveDartCount));

        if ($scoredPoints === $startingScore) {
            return 4 - $effectiveDartCount;
        }

        $achievable = $this->dartPoints->achievableDoubleDartCounts(
            $scoredPoints,
            [$effectiveDartCount],
            $startingScore,
            null,
            $requireDoubleOut,
        );

        $maxDoublesInVisit = $achievable === [] ? 0 : max($achievable);

        return $maxDoublesInVisit + (3 - $effectiveDartCount);
    }

    private function formatDartLabel(int $sector, int $multiplier): string
    {
        if ($sector === 0) {
            return 'M';
        }

        if ($sector === 25) {
            return $multiplier === 2 ? 'B50' : 'B25';
        }

        return match ($multiplier) {
            2 => 'D'.$sector,
            3 => 'T'.$sector,
            default => (string) $sector,
        };
    }
}
