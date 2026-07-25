<?php

namespace App\Support;

use App\Enums\MatchStatus;
use App\Models\DartMatch;

final class LobbyCode
{
    public const PATTERN = '/^\d{2,4}-\d{2,4}$/';

    public static function generate(): string
    {
        do {
            $code = self::buildRandomCode();
        } while (DartMatch::query()
            ->where('lobby_code', $code)
            ->where('status', MatchStatus::Lobby)
            ->exists());

        return $code;
    }

    public static function normalize(string $code): string
    {
        return preg_replace('/\s+/', '', trim($code)) ?? '';
    }

    public static function isValid(string $code): bool
    {
        return preg_match(self::PATTERN, $code) === 1;
    }

    private static function buildRandomCode(): string
    {
        $leftLength = random_int(2, 4);
        $rightLength = random_int(2, 4);

        $left = self::randomDigits($leftLength);
        $right = self::randomDigits($rightLength);

        return "{$left}-{$right}";
    }

    private static function randomDigits(int $length): string
    {
        $max = (10 ** $length) - 1;

        return str_pad((string) random_int(0, $max), $length, '0', STR_PAD_LEFT);
    }
}
