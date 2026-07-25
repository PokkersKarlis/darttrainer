<?php

namespace Tests\Unit\Darts;

use App\Services\Darts\X01DartPointsMapper;
use PHPUnit\Framework\TestCase;

class X01DartPointsMapperTest extends TestCase
{
    private X01DartPointsMapper $mapper;

    protected function setUp(): void
    {
        parent::setUp();
        $this->mapper = new X01DartPointsMapper;
    }

    public function test_common_calculator_scores_map_to_darts(): void
    {
        foreach ([60, 57, 54, 51, 45, 40, 26, 25, 50, 20, 0] as $points) {
            $this->assertNotNull($this->mapper->pointsToDart($points), "Expected {$points} to map");
        }
    }

    public function test_invalid_single_dart_scores_are_rejected(): void
    {
        $this->assertNull($this->mapper->pointsToDart(81));
        $this->assertNull($this->mapper->pointsToDart(95));
        $this->assertNull($this->mapper->pointsToDart(61));
    }

    public function test_achievable_visit_totals_with_one_to_three_darts(): void
    {
        foreach ([80, 95, 52, 180, 60, 0] as $points) {
            $this->assertTrue($this->mapper->isAchievableVisitTotal($points), "Expected {$points} to be achievable");
        }

        $this->assertFalse($this->mapper->isAchievableVisitTotal(181));
        $this->assertFalse($this->mapper->isAchievableVisitTotal(-1));
    }

    public function test_visit_points_decompose_with_exact_dart_count(): void
    {
        $darts = $this->mapper->visitPointsToDarts(180);
        $this->assertNotNull($darts);
        $this->assertCount(3, $darts);
        $this->assertSame(['sector' => 20, 'multiplier' => 3], $darts[0]);

        $twoDartVisit = $this->mapper->visitPointsToDarts(95, 2);
        $this->assertNotNull($twoDartVisit);
        $this->assertCount(2, $twoDartVisit);

        $this->assertNotNull($this->mapper->visitPointsToDarts(52));
    }

    public function test_build_visit_darts_honours_double_dart_count(): void
    {
        $darts = $this->mapper->buildVisitDarts(40, 1, null, 1);
        $this->assertNotNull($darts);
        $this->assertCount(1, $darts);
        $this->assertSame(2, $darts[0]['multiplier']);

        $this->assertNull($this->mapper->buildVisitDarts(40, 1, null, 0));
    }

    public function test_build_visit_darts_honours_checkout_dart(): void
    {
        $darts = $this->mapper->buildVisitDarts(40, null, 1, 1, 40, true);
        $this->assertNotNull($darts);
        $this->assertCount(1, $darts);
        $this->assertSame(2, $darts[0]['multiplier']);
    }

    public function test_build_visit_darts_three_dart_score_with_two_doubles(): void
    {
        $darts = $this->mapper->buildVisitDarts(52, 3, null, 2);
        $this->assertNotNull($darts);
        $this->assertCount(3, $darts);

        $doubles = 0;
        foreach ($darts as $dart) {
            if ($dart['multiplier'] === 2) {
                $doubles++;
            }
        }

        $this->assertSame(2, $doubles);
    }
}
