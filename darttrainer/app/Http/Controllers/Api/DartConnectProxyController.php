<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventSearchSuggestionsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DartConnectProxyController extends Controller
{
    private const UPSTREAM_URL = 'https://tv.dartconnect.com/api/event/dartconnect/search-suggestions';

    /**
     * Viegla pārbaude: vai no servera līdz DartConnect var sasniegt vismaz vienu zināmo endpointu.
     * Pietiek ar HTTP atbildi (pat 4xx/5xx), lai uzskatītu transportu par derīgu.
     */
    public function connectivityCheck(): JsonResponse
    {
        try {
            $response = Http::timeout(8)
                ->withHeaders([
                    'Accept' => 'application/json',
                ])
                ->asJson()
                ->post(self::UPSTREAM_URL, ['search' => '__dt_connectivity__']);

            $status = $response->status();
            if ($status < 100 || $status >= 600) {
                return response()->json([
                    'data'   => ['ok' => false],
                    'meta'   => null,
                    'errors' => [
                        'message' => 'DartConnect neatbilda paredzētajā formātā.',
                    ],
                ], 503);
            }

            return response()->json([
                'data'   => [
                    'ok'               => true,
                    'upstream_status'  => $status,
                ],
                'meta'   => null,
                'errors' => null,
            ]);
        } catch (\Throwable $e) {
            Log::warning('DartConnect savienojuma pārbaude neizdevās', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'data'   => ['ok' => false],
                'meta'   => null,
                'errors' => [
                    'message' => 'Neizdevās sasniegt DartConnect.',
                ],
            ], 503);
        }
    }

    public function eventSearchSuggestions(EventSearchSuggestionsRequest $request): JsonResponse
    {
        $search = $request->validated()['search'];

        try {
            $response = Http::timeout(12)
                ->withHeaders([
                    'Accept' => 'application/json',
                ])
                ->asJson()
                ->post(self::UPSTREAM_URL, ['search' => $search]);

            if (! $response->successful()) {
                Log::warning('DartConnect search-suggestions atgrieza kļūdas statusu', [
                    'status' => $response->status(),
                ]);

                return response()->json([
                    'data' => null,
                    'meta' => ['upstream_status' => $response->status()],
                    'errors' => [
                        'message' => 'Ārējais pakalpojums neatgrieza datus.',
                    ],
                ], 502);
            }

            $payload = $response->json();

            return response()->json([
                'data' => $payload,
                'meta' => null,
                'errors' => null,
            ]);
        } catch (\Throwable $e) {
            Log::error('DartConnect search-suggestions izņēmums', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'data' => null,
                'meta' => null,
                'errors' => [
                    'message' => 'Neizdevās sasniegt DartConnect.',
                ],
            ], 502);
        }
    }

    /**
     * DartConnect: POST /api/event/{eventId}/matches — spēļu saraksts konkrētam turnīram.
     */
    public function eventMatches(string $eventId): JsonResponse
    {
        if (! preg_match('/^[a-zA-Z0-9_-]{1,80}$/', $eventId)) {
            return response()->json([
                'data' => null,
                'meta' => null,
                'errors' => [
                    'message' => 'Nederīgs turnīra identifikators.',
                ],
            ], 422);
        }

        $url = 'https://tv.dartconnect.com/api/event/'.$eventId.'/matches';

        try {
            // Liels turnīrs: ārējā API atbilde var būt daudz ilgāka par noklusējuma klienta 15 s.
            $response = Http::timeout(90)
                ->withHeaders([
                    'Accept' => 'application/json',
                ])
                ->asJson()
                ->post($url, new \stdClass());

            if (! $response->successful()) {
                Log::warning('DartConnect event matches atgrieza kļūdas statusu', [
                    'status' => $response->status(),
                    'event_id' => $eventId,
                ]);

                return response()->json([
                    'data' => null,
                    'meta' => ['upstream_status' => $response->status(), 'event_id' => $eventId],
                    'errors' => [
                        'message' => 'Ārējais pakalpojums neatgrieza spēļu sarakstu.',
                    ],
                ], 502);
            }

            $payload = $response->json();

            return response()->json([
                'data' => $payload,
                'meta' => ['event_id' => $eventId],
                'errors' => null,
            ]);
        } catch (\Throwable $e) {
            Log::error('DartConnect event matches izņēmums', [
                'message' => $e->getMessage(),
                'event_id' => $eventId,
            ]);

            return response()->json([
                'data' => null,
                'meta' => null,
                'errors' => [
                    'message' => 'Neizdevās sasniegt DartConnect.',
                ],
            ], 502);
        }
    }
}
