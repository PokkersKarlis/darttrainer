<?php

namespace App\Support;

final class AppLocale
{
    public const string SESSION_KEY = 'locale';

    public const string COOKIE = 'td_locale';

    /** @var list<string> */
    public const array SUPPORTED = ['lv', 'en'];

    public static function normalize(?string $locale): ?string
    {
        return in_array($locale, self::SUPPORTED, true) ? $locale : null;
    }

    public static function default(): string
    {
        return self::normalize((string) config('app.locale')) ?? 'lv';
    }

    public static function resolve(?string ...$candidates): string
    {
        foreach ($candidates as $candidate) {
            $normalized = self::normalize($candidate);
            if ($normalized !== null) {
                return $normalized;
            }
        }

        return self::default();
    }
}
