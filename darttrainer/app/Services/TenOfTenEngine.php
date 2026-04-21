<?php

namespace App\Services;

use App\Models\GameTenOfTen;
use App\Models\GameTenOfTenElement;

class TenOfTenEngine
{
    public const TYPE_SINGLES = 1;
    public const TYPE_DOUBLES = 2;
    public const TYPE_TRIPLES = 3;
    public const TYPE_MIXED   = 4;

    public const GREEN = -1; // Outer bull (singles)
    public const BULL  = -2; // Inner bull (doubles)

    public const DART_MISS    = -1;
    public const DART_NO_COUNT = -2;

    private const OUTER_FIELDS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

    public function startGame(int $gameType, ?int $userId, ?string $sessionId): GameTenOfTen
    {
        $game = GameTenOfTen::create([
            'game_type'  => $gameType,
            'player_id'  => $userId,
            'session_id' => $sessionId,
            'finished'   => 0,
        ]);

        $pool = self::OUTER_FIELDS;

        match ($gameType) {
            self::TYPE_SINGLES => $pool[] = self::GREEN,
            self::TYPE_DOUBLES => $pool[] = self::BULL,
            self::TYPE_MIXED   => array_push($pool, self::GREEN, self::BULL),
            default            => null,
        };

        $indices = array_rand($pool, 10);
        shuffle($indices);

        foreach ($indices as $index) {
            $number = $pool[$index];

            $type = match (true) {
                $number === self::GREEN                         => self::TYPE_SINGLES,
                $number === self::BULL                         => self::TYPE_DOUBLES,
                $gameType === self::TYPE_MIXED                 => random_int(1, 3),
                default                                        => $gameType,
            };

            GameTenOfTenElement::create([
                'game_id'           => $game->id,
                'given_number'      => $number,
                'given_number_type' => $type,
                'darts_count'       => 0,
            ]);
        }

        return $game->fresh();
    }

    public function registerThrow(GameTenOfTen $game, int $dartsCount): array
    {
        $element = $game->activeElement;

        if ($element === null) {
            return ['error' => 'No active element'];
        }

        $element->darts_count = $dartsCount;
        $element->save();
        $game->refresh();

        $finished = false;
        if ($game->activeElement === null && ($dartsCount > 0 || $dartsCount === self::DART_NO_COUNT)) {
            $game->finished = $game->player_id ? 2 : 1;
            $game->save();
            $finished = true;
        }

        return [
            'finished'   => $finished,
            'next_number' => $finished ? null : $game->activeElement?->given_number,
            'next_type'   => $finished ? null : $game->activeElement?->given_number_type,
        ];
    }

    public function undo(GameTenOfTen $game): bool
    {
        $last = $game->lastUpdatedElement;

        if ($last === null) {
            return false;
        }

        $last->darts_count = 0;
        $last->save();

        return true;
    }

    public function getAreaLabel(int $number, int $type): string
    {
        if ($number === self::GREEN) {
            return 'Outer';
        }
        if ($number === self::BULL) {
            return 'Bull';
        }

        return match ($type) {
            self::TYPE_DOUBLES => 'd' . $number,
            self::TYPE_TRIPLES => 't' . $number,
            default            => 's' . $number,
        };
    }

    public function buildState(GameTenOfTen $game): array
    {
        $active = $game->activeElement;

        return [
            'game_id'          => $game->id,
            'game_type'        => $game->game_type,
            'finished'         => $game->finished,
            'round'            => count($game->finishedElements) + 1,
            'total_rounds'     => count($game->allElements),
            'active_number'    => $active?->given_number,
            'active_type'      => $active?->given_number_type,
            'active_label'     => $active ? $this->getAreaLabel($active->given_number, $active->given_number_type) : null,
            'finished_rounds'  => $game->finishedElements->map(fn($e) => [
                'number'     => $e->given_number,
                'type'       => $e->given_number_type,
                'darts'      => $e->darts_count,
                'label'      => $this->getAreaLabel($e->given_number, $e->given_number_type),
            ])->values()->toArray(),
        ];
    }
}
