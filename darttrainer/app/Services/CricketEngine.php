<?php

namespace App\Services;

use App\Models\CricketState;
use App\Models\Leg;
use App\Models\RoomPlayer;

class CricketEngine
{
    public const STANDARD_SEGMENTS = [20, 19, 18, 17, 16, 15, 25];
    public const HITS_TO_CLOSE = 3;

    public function initStates(Leg $leg, array $playerIds, array $segments): void
    {
        // Build initial seg_data JSON from active segments
        $segData = array_fill_keys(array_map('strval', $segments), 0);

        foreach ($playerIds as $playerId) {
            CricketState::create([
                'match_id'  => $leg->match_id,
                'leg_id'    => $leg->id,
                'player_id' => $playerId,
                'seg_15'    => 0,
                'seg_16'    => 0,
                'seg_17'    => 0,
                'seg_18'    => 0,
                'seg_19'    => 0,
                'seg_20'    => 0,
                'seg_bull'  => 0,
                'points'    => 0,
                'seg_data'  => $segData,
            ]);
        }
    }

    /**
     * Register a dart hit and update the player's cricket state.
     * Returns ['hits_added' => int, 'points_scored' => int].
     */
    public function registerHit(
        CricketState $playerState,
        int $segment,
        int $multiplier,
        array $allStates,
        array $activeSegments
    ): array {
        if (!in_array($segment, $activeSegments, true)) {
            return ['hits_added' => 0, 'points_scored' => 0];
        }

        $currentHits = $playerState->getSegmentHits($segment);

        if ($currentHits >= self::HITS_TO_CLOSE) {
            // already closed by this player — score points if segment still open for others
            $pointsScored = $this->scorePoints($segment, $multiplier, $allStates, $playerState->player_id);
            $playerState->points += $pointsScored;
            $playerState->save();
            return ['hits_added' => 0, 'points_scored' => $pointsScored];
        }

        $hitsNeededToClose = self::HITS_TO_CLOSE - $currentHits;
        $hitsAdded         = min($multiplier, $hitsNeededToClose);
        $overflowHits      = $multiplier - $hitsAdded;
        $newHits           = $currentHits + $hitsAdded;

        $playerState->setSegmentHits($segment, $newHits);

        $pointsScored = 0;
        if ($newHits >= self::HITS_TO_CLOSE && $overflowHits > 0) {
            // dart closed the segment and still has remaining multiplier to score
            $pointsScored = $this->scorePoints($segment, $overflowHits, $allStates, $playerState->player_id);
            $playerState->points += $pointsScored;
        }

        $playerState->save();

        return ['hits_added' => $hitsAdded, 'points_scored' => $pointsScored];
    }

    private function scorePoints(int $segment, int $multiplier, array $allStates, int $currentPlayerId): int
    {
        // Points only count if at least one opponent has NOT closed this segment
        foreach ($allStates as $state) {
            if ($state->player_id === $currentPlayerId) {
                continue;
            }
            if ($state->getSegmentHits($segment) < self::HITS_TO_CLOSE) {
                $segmentValue = $segment === 25 ? 25 : $segment;
                return $segmentValue * $multiplier;
            }
        }
        return 0;
    }

    /**
     * Check win condition: a player wins when they have closed all active segments
     * AND have >= points than all opponents, OR all opponents have lower points.
     */
    public function checkWinCondition(array $allStates, array $activeSegments): ?int
    {
        foreach ($allStates as $state) {
            if (!$state->allClosed($activeSegments)) {
                continue;
            }

            // This player closed all segments — check if they have the most (or equal) points
            $isWinner = true;
            foreach ($allStates as $other) {
                if ($other->player_id === $state->player_id) {
                    continue;
                }
                if ($other->points > $state->points) {
                    $isWinner = false;
                    break;
                }
            }

            if ($isWinner) {
                return $state->player_id;
            }
        }
        return null;
    }

    public function generateRandomSegments(int $count = 7): array
    {
        $pool = range(1, 20);
        shuffle($pool);
        $segments = array_slice($pool, 0, $count - 1);
        $segments[] = 25; // always include bull
        sort($segments);
        return array_values(array_reverse($segments));
    }

    public function getSegmentLabel(int $segment): string
    {
        return $segment === 25 ? 'Bull' : (string) $segment;
    }

    /**
     * Hit marks to count toward H/T before applying this dart (miss / dead segment = 0).
     *
     * @param  array<int, array<int, int>>  $hits  [room_player_id][segment] => marks 0–3
     * @param  array<int>                   $playerIds  room_player ids in stable order
     */
    public function statHitMultiplierBeforeApply(
        array $hits,
        array $playerIds,
        array $activeSegments,
        int $throwerId,
        int $segment,
        int $multiplier
    ): int {
        if ($multiplier <= 0 || $segment <= 0) {
            return 0;
        }
        if (!in_array($segment, $activeSegments, true)) {
            return 0;
        }

        // Segment dead (all players closed) — dart has no closing value
        $allClosed = true;
        foreach ($playerIds as $pid) {
            if ((int) ($hits[$pid][$segment] ?? 0) < self::HITS_TO_CLOSE) {
                $allClosed = false;
                break;
            }
        }
        if ($allClosed) {
            return 0;
        }

        // Thrower already closed this segment — remaining darts only score points, not counted toward avg
        $myHits = (int) ($hits[$throwerId][$segment] ?? 0);
        if ($myHits >= self::HITS_TO_CLOSE) {
            return 0;
        }

        // Cap at marks actually needed to close
        return min($multiplier, self::HITS_TO_CLOSE - $myHits);
    }

    /**
     * Apply dart to in-memory hit map (marks toward closing only; mirrors registerHit mark updates).
     *
     * @param  array<int, array<int, int>>  $hits
     */
    public function applyDartToHitMap(
        array &$hits,
        int $throwerId,
        int $segment,
        int $multiplier,
        array $activeSegments
    ): void {
        if ($multiplier <= 0 || $segment <= 0) {
            return;
        }
        if (!in_array($segment, $activeSegments, true)) {
            return;
        }
        $current = (int) ($hits[$throwerId][$segment] ?? 0);
        if ($current >= self::HITS_TO_CLOSE) {
            return;
        }
        $need = self::HITS_TO_CLOSE - $current;
        $add  = min($multiplier, $need);
        $hits[$throwerId][$segment] = $current + $add;
    }
}
