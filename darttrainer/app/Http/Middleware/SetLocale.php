<?php

namespace App\Http\Middleware;

use App\Support\AppLocale;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Resolve locale once per request and align Laravel translations with the UI.
     *
     * Priority: explicit request input → session → authenticated user → cookie → config default.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = AppLocale::resolve(
            $request->input('locale'),
            $request->session()->get(AppLocale::SESSION_KEY),
            $request->user()?->locale,
            $request->cookie(AppLocale::COOKIE),
        );

        app()->setLocale($locale);
        $request->session()->put(AppLocale::SESSION_KEY, $locale);

        /** @var Response $response */
        $response = $next($request);

        return $response->withCookie(cookie(
            AppLocale::COOKIE,
            $locale,
            60 * 24 * 365,
            '/',
            null,
            null,
            false,
            false,
            'lax',
        ));
    }
}
