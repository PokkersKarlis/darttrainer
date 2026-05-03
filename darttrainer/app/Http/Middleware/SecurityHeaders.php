<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Pievieno HTTP drošības headerus katrai atbildei.
 *
 * - X-Frame-Options: DENY — neļauj ielādēt lapu iframe (clickjacking aizsardzība).
 * - X-Content-Type-Options: nosniff — neļauj pārlūkam "uzminēt" MIME tipu (MIME sniffing).
 * - Referrer-Policy: strict-origin-when-cross-origin — cross-origin pieprasījumos sūta tikai origin, ne pilnu URL.
 * - Permissions-Policy — izslēdz kameру, mikrofonu, ģeolokāciju u.c. API, ko šī lietotne neizmanto.
 * - Strict-Transport-Security — piespiež HTTPS turpmāko gadu (production).
 * - Content-Security-Policy — ierobežo, no kurienes var ielādēt skriptus, stilus, savienojumus.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // HSTS tikai production — lokāli ar http:// netraucē.
        if (! app()->isLocal()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // CSP: atļauj same-origin + nepieciešamās izņēmumus.
        //
        // Visi .js komponenti ar runtime `template:` ir pārveidoti par .vue SFC (pre-kompilēti),
        // tāpēc 'unsafe-eval' vairs NAV nepieciešams.
        //
        // 'unsafe-inline' style-src: Vite inžektē <style> tagus dev režīmā.
        //
        // img-src: PayPal pogas ielādē attēlus no *.paypal.com / *.paypalobjects.com.
        $viteDevUrl = config('app.vite_dev_server_url');
        $isDev = (bool) $viteDevUrl;

        // Izstrādes režīmā: papildina CSP ar Vite dev servera origin + WebSocket.
        $viteOrigin = '';
        $viteWs = '';
        if ($isDev) {
            $parsed = parse_url($viteDevUrl);
            $viteOrigin = ($parsed['scheme'] ?? 'http') . '://' . ($parsed['host'] ?? 'localhost') . ':' . ($parsed['port'] ?? '5173');
            $wsScheme = ($parsed['scheme'] ?? 'http') === 'https' ? 'wss' : 'ws';
            $viteWs = $wsScheme . '://' . ($parsed['host'] ?? 'localhost') . ':' . ($parsed['port'] ?? '5173');
        }

        $csp = implode('; ', array_filter([
            "default-src 'self'",
            "script-src 'self'" . ($isDev ? " {$viteOrigin}" : ''),
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://*.paypal.com https://*.paypalobjects.com",
            "font-src 'self'",
            "connect-src 'self'" . ($isDev ? " {$viteOrigin} {$viteWs}" : ''),
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]));

        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
