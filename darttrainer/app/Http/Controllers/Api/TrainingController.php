<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameCloseTheNumber;
use App\Models\GameTenOfTen;
use App\Models\GameX01Training;
use App\Services\CloseTheNumberEngine;
use App\Services\TenOfTenEngine;
use App\Services\X01TrainingEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrainingController extends Controller
{
    public function __construct(
        private readonly TenOfTenEngine $tenEngine,
        private readonly CloseTheNumberEngine $closeEngine,
        private readonly X01TrainingEngine $x01Engine,
    ) {}

    // ── Ten of Ten ────────────────────────────────────────────────────────────

    public function tenStart(Request $request): JsonResponse
    {
        $data = $request->validate([
            'game_type' => 'required|integer|min:1|max:4',
        ]);

        // Cancel any existing active game
        $this->cancelActiveTenGame($request);

        $game = $this->tenEngine->startGame(
            $data['game_type'],
            Auth::id(),
            session()->getId()
        );

        return response()->json(['state' => $this->tenEngine->buildState($game)], 201);
    }

    public function tenState(Request $request): JsonResponse
    {
        $game = $this->findActiveTenGame($request);

        if (!$game) {
            return response()->json(['error' => 'Nav aktīvas spēles.'], 404);
        }

        return response()->json(['state' => $this->tenEngine->buildState($game)]);
    }

    public function tenThrow(Request $request): JsonResponse
    {
        $data = $request->validate([
            'darts_count' => 'required|integer|min:-2|max:10',
        ]);

        $game = $this->findActiveTenGame($request);
        if (!$game) {
            return response()->json(['error' => 'Nav aktīvas spēles.'], 404);
        }

        $result = $this->tenEngine->registerThrow($game, $data['darts_count']);

        return response()->json([
            'result' => $result,
            'state'  => $this->tenEngine->buildState($game->fresh()),
        ]);
    }

    public function tenUndo(Request $request): JsonResponse
    {
        $game = $this->findActiveTenGame($request);
        if (!$game) {
            return response()->json(['error' => 'Nav aktīvas spēles.'], 404);
        }

        $this->tenEngine->undo($game);

        return response()->json(['state' => $this->tenEngine->buildState($game->fresh())]);
    }

    public function tenPause(Request $request): JsonResponse
    {
        $game = $this->findActiveTenGame($request);
        if (!$game) {
            return response()->json(['error' => 'Nav aktīvas spēles.'], 404);
        }

        if (!Auth::check()) {
            $game->delete();
        }

        return response()->json(['ok' => true]);
    }

    // ── Close the Number ──────────────────────────────────────────────────────

    public function closeStart(Request $request): JsonResponse
    {
        $data = $request->validate([
            'start' => 'required|integer|min:2|max:349',
            'end'   => 'required|integer|min:3|max:350',
        ]);

        $this->cancelActiveCloseGame($request);

        $game = $this->closeEngine->startGame(
            $data['start'],
            $data['end'],
            Auth::id(),
            session()->getId()
        );

        return response()->json(['state' => $this->closeEngine->buildState($game)], 201);
    }

    public function closeState(Request $request): JsonResponse
    {
        $game = $this->findActiveCloseGame($request);
        if (!$game) {
            return response()->json(['error' => 'Nav aktīvas spēles.'], 404);
        }

        return response()->json(['state' => $this->closeEngine->buildState($game)]);
    }

    public function closeThrow(Request $request): JsonResponse
    {
        $data = $request->validate([
            'darts_count' => 'required|integer|min:-2|max:6',
        ]);

        $game = $this->findActiveCloseGame($request);
        if (!$game) {
            return response()->json(['error' => 'Nav aktīvas spēles.'], 404);
        }

        $result = $this->closeEngine->registerThrow($game, $data['darts_count']);

        return response()->json([
            'result' => $result,
            'state'  => $this->closeEngine->buildState($game->fresh()),
        ]);
    }

    public function closeUndo(Request $request): JsonResponse
    {
        $game = $this->findActiveCloseGame($request);
        if (!$game) {
            return response()->json(['error' => 'Nav aktīvas spēles.'], 404);
        }

        $this->closeEngine->undo($game);

        return response()->json(['state' => $this->closeEngine->buildState($game->fresh())]);
    }

    public function closePause(Request $request): JsonResponse
    {
        $game = $this->findActiveCloseGame($request);
        if (!$game) {
            return response()->json(['error' => 'Nav aktīvas spēles.'], 404);
        }

        if (!Auth::check()) {
            $game->delete();
        }

        return response()->json(['ok' => true]);
    }

    // ── X01 Training ─────────────────────────────────────────────────────────

    public function x01Start(Request $request): JsonResponse
    {
        $data = $request->validate([
            'variant'  => 'required|integer|in:301,501',
            'out_mode' => 'nullable|in:double,straight',
            'in_mode'  => 'nullable|in:double,straight',
        ]);

        $this->cancelActiveX01Game($request);

        $game = $this->x01Engine->startGame(
            $data['variant'],
            $data['out_mode'] ?? 'double',
            $data['in_mode']  ?? 'straight',
            Auth::id(),
            session()->getId()
        );

        return response()->json(['state' => $this->x01Engine->buildState($game)], 201);
    }

    public function x01State(Request $request): JsonResponse
    {
        $game = $this->findActiveX01Game($request);

        if (!$game) {
            return response()->json(['state' => null]);
        }

        return response()->json(['state' => $this->x01Engine->buildState($game)]);
    }

    public function x01Throw(Request $request): JsonResponse
    {
        $data = $request->validate([
            'darts'              => 'required|array|min:1|max:3',
            'darts.*.segment'    => 'required|integer|min:0|max:25',
            'darts.*.multiplier' => 'required|integer|min:0|max:3',
        ]);

        $game = $this->findActiveX01Game($request);
        if (!$game) {
            return response()->json(['error' => 'Nav aktīvas spēles.'], 404);
        }

        $darts = array_map(fn ($d) => [
            'segment'    => $d['segment'],
            'multiplier' => $d['multiplier'],
            'value'      => $d['segment'] * $d['multiplier'],
        ], $data['darts']);

        $result = $this->x01Engine->registerThrow($game, $darts);

        return response()->json([
            'result' => $result,
            'state'  => $this->x01Engine->buildState($game->fresh()),
        ]);
    }

    public function x01Undo(Request $request): JsonResponse
    {
        $game = $this->findActiveX01Game($request);
        if (!$game) {
            return response()->json(['error' => 'Nav aktīvas spēles.'], 404);
        }

        $this->x01Engine->undo($game);

        return response()->json(['state' => $this->x01Engine->buildState($game->fresh())]);
    }

    public function x01Abandon(Request $request): JsonResponse
    {
        $this->cancelActiveX01Game($request);
        return response()->json(['ok' => true]);
    }

    /**
     * Pabeigtās solo X01 spēles (protokolu sarakstam / statistikai).
     */
    public function x01FinishedList(Request $request): JsonResponse
    {
        $limit = min(50, max(1, (int) $request->query('limit', 30)));

        $q = GameX01Training::query()
            ->where('finished', true)
            ->orderByDesc('updated_at')
            ->limit($limit);

        if (Auth::check()) {
            $q->where('player_id', Auth::id());
        } else {
            $q->where('session_id', session()->getId())->whereNull('player_id');
        }

        $items = $q->get(['id', 'variant', 'in_mode', 'out_mode', 'turns', 'updated_at'])->map(function (GameX01Training $g) {
            $turns = $g->turns ?? [];
            $darts = 0;
            foreach ($turns as $t) {
                $darts += count($t['darts'] ?? []);
            }

            return [
                'id'           => $g->id,
                'variant'      => $g->variant,
                'in_mode'      => $g->in_mode,
                'out_mode'     => $g->out_mode,
                'turns_count'  => count($turns),
                'darts_count'  => $darts,
                'finished_at'  => $g->updated_at?->toIso8601String(),
            ];
        });

        return response()->json(['items' => $items]);
    }

    /**
     * Pilns stāvokļa snapšots (t. sk. kārtas) vienai solo X01 spēlei — protokola skatam.
     */
    public function x01Protocol(Request $request, GameX01Training $game): JsonResponse
    {
        if (!$this->userCanAccessX01Training($request, $game)) {
            abort(403, 'Nav pieejas šai spēlei.');
        }

        if (!$game->finished) {
            return response()->json(['error' => 'Protokols pieejams tikai pabeigtām spēlēm.'], 422);
        }

        return response()->json(['state' => $this->x01Engine->buildState($game)]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function findActiveTenGame(Request $request): ?GameTenOfTen
    {
        if (Auth::check()) {
            return GameTenOfTen::where('player_id', Auth::id())
                ->where('finished', 0)
                ->first();
        }

        return GameTenOfTen::where('session_id', session()->getId())
            ->where('finished', 0)
            ->first();
    }

    private function findActiveCloseGame(Request $request): ?GameCloseTheNumber
    {
        if (Auth::check()) {
            return GameCloseTheNumber::where('player_id', Auth::id())
                ->where('finished', 0)
                ->first();
        }

        return GameCloseTheNumber::where('session_id', session()->getId())
            ->where('finished', 0)
            ->first();
    }

    private function cancelActiveTenGame(Request $request): void
    {
        $this->findActiveTenGame($request)?->delete();
    }

    private function cancelActiveCloseGame(Request $request): void
    {
        $this->findActiveCloseGame($request)?->delete();
    }

    private function findActiveX01Game(Request $request): ?GameX01Training
    {
        if (Auth::check()) {
            return GameX01Training::where('player_id', Auth::id())
                ->where('finished', 0)
                ->latest()
                ->first();
        }

        return GameX01Training::where('session_id', session()->getId())
            ->where('finished', 0)
            ->latest()
            ->first();
    }

    private function cancelActiveX01Game(Request $request): void
    {
        $this->findActiveX01Game($request)?->delete();
    }

    private function userCanAccessX01Training(Request $request, GameX01Training $game): bool
    {
        if (Auth::check()) {
            return (int) $game->player_id === (int) Auth::id();
        }

        return $game->session_id === session()->getId() && $game->player_id === null;
    }
}
