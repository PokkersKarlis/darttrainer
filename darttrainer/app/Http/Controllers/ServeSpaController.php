<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\Response;

/**
 * Invokable kontrolieris: atgriež SPA index.html saturu.
 *
 * JSON pieprasījumi (Accept: application/json) saņem 404,
 * lai API-stila kļūdas neresultētos ar HTML atbildi.
 *
 * Izstrādes režīmā (VITE_DEV_SERVER_URL iestatīts .env):
 * atgriež HTML, kas ielādē skriptus no Vite dev servera (HMR).
 */
class ServeSpaController extends Controller
{
    public function __invoke(): Response
    {
        if (request()->expectsJson()) {
            abort(404);
        }

        // Izstrādes režīms: Vite HMR dev server.
        $viteUrl = config('app.vite_dev_server_url');

        if ($viteUrl) {
            return $this->devResponse($viteUrl);
        }

        // Produkcija: servē uzbūvēto index.html.
        $index = public_path('dart-app/index.html');

        if (! is_file($index)) {
            abort(404);
        }

        return response()->make(
            file_get_contents($index),
            200,
            [
                'Content-Type'  => 'text/html; charset=UTF-8',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
            ],
        );
    }

    /**
     * Atgriež HTML ar Vite dev servera skriptiem (HMR).
     *
     * Vite base = /dart-app/ (vite.config.js), tāpēc dev serveris moduļus
     * servē zem /dart-app/ prefiksa: /@vite/client, /dart-app/main.js.
     */
    private function devResponse(string $viteUrl): Response
    {
        $viteUrl = rtrim($viteUrl, '/');

        $html = <<<HTML
<!doctype html>
<html lang="lv">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DartTrainer</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="{$viteUrl}/@vite/client"></script>
    <script type="module" src="{$viteUrl}/dart-app/main.js"></script>
  </body>
</html>
HTML;

        return response()->make(
            $html,
            200,
            [
                'Content-Type'  => 'text/html; charset=UTF-8',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
            ],
        );
    }
}
