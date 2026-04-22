<?php

namespace App\View;

/**
 * Publisks absolūts bāzes URL (Facebook, LinkedIn, X, WhatsApp) — neizpilda JS.
 * Prioritāte: FRONTEND_URL / APP_URL; aiz starpproksa pieprasā arī Host / X-Forwarded-Proto;
 * ja vēl ir localhost, bet pieprasījumā ir reāls domenis — tā bāze.
 */
final class SeoViewData
{
    /**
     * @return array{seoBaseUrl: string, seoPageUrl: string, seoImageUrl: string}
     */
    public static function forDartSpa(): array
    {
        $raw = rtrim((string) config('app.frontend_url', config('app.url')), '/');
        $base = self::normalizePublicBase($raw);

        $path = '/';
        if (! app()->runningInConsole() && function_exists('request') && request()) {
            $path = request()->getRequestUri() ?: '/';
        }
        if ($path === '' || $path[0] !== '/') {
            $path = '/'.ltrim($path, '/');
        }

        return [
            'seoBaseUrl' => $base,
            'seoPageUrl' => $base.$path,
            'seoImageUrl' => $base.'/images/og/og-image.png',
        ];
    }

    private static function normalizePublicBase(string $raw): string
    {
        $isLocalEnv = app()->environment('local', 'testing');

        if (! $isLocalEnv && str_starts_with($raw, 'http://') && ! self::isLocalUrl($raw)) {
            $out = preg_replace('/^http:\/\//i', 'https://', $raw, 1);
            if (is_string($out)) {
                $raw = $out;
            }
        }

        if (self::shouldInferFromRequest($raw) && ! app()->runningInConsole() && function_exists('request') && request()) {
            $r = request();
            if ($r->getHost() !== '') {
                $https = $r->isSecure() || (string) $r->header('X-Forwarded-Proto') === 'https';
                if (app()->environment('production', 'staging')) {
                    $https = true;
                }
                $scheme = $https ? 'https' : 'http';
                $host = $r->getHttpHost();

                return rtrim("{$scheme}://{$host}", '/');
            }
        }

        return $raw;
    }

    private static function shouldInferFromRequest(string $raw): bool
    {
        if (self::isLocalUrl($raw)) {
            return true;
        }
        if ($raw === '' || $raw === 'https://' || $raw === 'http://') {
            return true;
        }
        if (! preg_match('#^https?://[^/]+#i', $raw)) {
            return true;
        }

        return false;
    }

    private static function isLocalUrl(string $raw): bool
    {
        return (bool) preg_match('#^https?://(localhost|127\.0\.0\.1)([:/]|$)#i', $raw);
    }
}
