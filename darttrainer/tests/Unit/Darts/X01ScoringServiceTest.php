<?php

namespace Tests\Unit\Darts;

use App\Enums\X01ScoringRule;
use App\Services\Darts\X01ScoringService;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class X01ScoringServiceTest extends TestCase
{
    private X01ScoringService $scoring;

    protected function setUp(): void
    {
        parent::setUp();
        $this->scoring = app(X01ScoringService::class);
    }

    public function test_double_out_checkout_requires_double(): void
    {
        $result = $this->scoring->evaluateTurn(
            40,
            [
                ['sector' => 20, 'multiplier' => 1],
                ['sector' => 20, 'multiplier' => 1],
            ],
            X01ScoringRule::Straight,
            X01ScoringRule::Double,
            true,
        );

        $this->assertTrue($result['is_bust']);
        $this->assertSame(40, $result['remaining']);
    }

    public function test_successful_double_out_checkout(): void
    {
        $result = $this->scoring->evaluateTurn(
            40,
            [['sector' => 20, 'multiplier' => 2]],
            X01ScoringRule::Straight,
            X01ScoringRule::Double,
            true,
        );

        $this->assertFalse($result['is_bust']);
        $this->assertTrue($result['won']);
        $this->assertSame(0, $result['remaining']);
    }

    public function test_double_in_requires_opening_double(): void
    {
        $result = $this->scoring->evaluateTurn(
            501,
            [
                ['sector' => 20, 'multiplier' => 1],
                ['sector' => 20, 'multiplier' => 1],
            ],
            X01ScoringRule::Double,
            X01ScoringRule::Double,
            false,
        );

        $this->assertSame(501, $result['remaining']);
        $this->assertSame(0, $result['points_scored']);
    }

    #[DataProvider('bustCases')]
    public function test_bust_cases(int $remaining, array $darts): void
    {
        $result = $this->scoring->evaluateTurn(
            $remaining,
            $darts,
            X01ScoringRule::Straight,
            X01ScoringRule::Double,
            true,
        );

        $this->assertTrue($result['is_bust']);
        $this->assertSame($remaining, $result['remaining']);
    }

    /**
     * @return list<array{0: int, 1: list<array{sector: int, multiplier: int}>}>
     */
    public static function bustCases(): array
    {
        return [
            [50, [['sector' => 20, 'multiplier' => 3]]],
            [50, [['sector' => 19, 'multiplier' => 3], ['sector' => 12, 'multiplier' => 1]]],
            [2, [['sector' => 1, 'multiplier' => 1]]],
        ];
    }
}
