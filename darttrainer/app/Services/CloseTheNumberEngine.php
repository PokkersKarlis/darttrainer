<?php

namespace App\Services;

use App\Models\GameCloseTheNumber;
use App\Models\GameCloseTheNumberElement;

class CloseTheNumberEngine
{
    public const DART_MISS     = -1;
    public const DART_NO_COUNT = -2;

    public const MIN_START = 2;
    public const MAX_END   = 350;

    public function startGame(int $start, int $end, ?int $userId, ?string $sessionId): GameCloseTheNumber
    {
        $start = max(self::MIN_START, $start);
        $end   = min(self::MAX_END, max($start + 1, $end));

        $game = GameCloseTheNumber::create([
            'player_id'      => $userId,
            'session_id'     => $sessionId,
            'starting_number' => $start,
            'ending_number'   => $end,
            'finished'        => 0,
        ]);

        for ($i = $start; $i <= $end; $i++) {
            GameCloseTheNumberElement::create([
                'game_id'      => $game->id,
                'given_number' => $i,
                'darts_count'  => 0,
            ]);
        }

        return $game->fresh();
    }

    public function registerThrow(GameCloseTheNumber $game, int $dartsCount): array
    {
        $element = $game->activeElement;

        if ($element === null) {
            return ['error' => 'No active element'];
        }

        $isLast = $element->given_number === $game->ending_number;

        $element->darts_count = $dartsCount;
        $element->save();

        $finished = false;
        if ($isLast && ($dartsCount > 0 || $dartsCount === self::DART_NO_COUNT)) {
            $game->finished = $game->player_id ? 2 : 1;
            $game->save();
            $finished = true;
        }

        $game->refresh();

        return [
            'finished'    => $finished,
            'next_number' => $finished ? null : $game->activeElement?->given_number,
        ];
    }

    public function undo(GameCloseTheNumber $game): bool
    {
        $last = $game->lastUpdatedElement;

        if ($last === null) {
            return false;
        }

        $last->darts_count = 0;
        $last->save();

        return true;
    }

    public function buildState(GameCloseTheNumber $game): array
    {
        $active = $game->activeElement;

        return [
            'game_id'        => $game->id,
            'start'          => $game->starting_number,
            'end'            => $game->ending_number,
            'finished'       => $game->finished,
            'current_number' => $active?->given_number,
            'progress'       => count($game->finishedElements),
            'total'          => $game->ending_number - $game->starting_number + 1,
            'finished_rounds' => $game->finishedElements->map(fn($e) => [
                'number' => $e->given_number,
                'darts'  => $e->darts_count,
            ])->values()->toArray(),
        ];
    }
}
