<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class TrackDailyVisit
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $resp */
        $resp = $next($request);

        try {
            // Only track normal web navigation, not API/json/assets.
            if ($request->expectsJson()) {
                return $resp;
            }
            if (str_starts_with($request->path(), 'api/')) {
                return $resp;
            }
            if ($request->method() !== 'GET') {
                return $resp;
            }

            $ip = (string) $request->ip();
            if ($ip === '') {
                return $resp;
            }

            $path = trim((string) $request->path(), '/');
            // Skip typical static assets (/build/*, images, icons, etc.)
            if ($path === '' || str_starts_with($path, 'build/') || str_contains($path, '.')) {
                return $resp;
            }
            $hitLogin = $path === 'login' ? 1 : 0;
            $hitRegister = $path === 'register' ? 1 : 0;

            $uid = (int) (Auth::id() ?? 0);
            $name = Auth::user()?->name;

            $date = now()->toDateString();
            $now = now()->toDateTimeString();

            // Atomic aggregation (fast): INSERT ... ON DUPLICATE KEY UPDATE hits = hits + 1
            DB::statement(
                'INSERT INTO daily_visits
                    (visit_date, ip_address, user_id, user_name, hits, hit_login, hit_register, first_seen_at, last_seen_at)
                 VALUES
                    (?, ?, ?, ?, 1, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    hits = hits + 1,
                    last_seen_at = VALUES(last_seen_at),
                    user_name = COALESCE(VALUES(user_name), user_name),
                    hit_login = (hit_login OR VALUES(hit_login)),
                    hit_register = (hit_register OR VALUES(hit_register))',
                [$date, $ip, $uid, $name, $hitLogin, $hitRegister, $now, $now]
            );
        } catch (\Throwable) {
            // Do not break requests on analytics write failures.
        }

        return $resp;
    }
}

