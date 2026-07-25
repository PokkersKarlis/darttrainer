<?php

namespace App\Http\Controllers\Api\V1\Darts;

use App\Http\Controllers\Controller;
use App\Models\DartMatch;
use App\Services\Darts\MatchAccessService;
use App\Services\Darts\MatchTurnTimerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchTurnTimerController extends Controller
{
    public function __construct(
        private readonly MatchTurnTimerService $timerService,
        private readonly MatchAccessService $access,
    ) {}

    public function extend(Request $request, string $uuid): JsonResponse
    {
        $match = DartMatch::query()->where('uuid', $uuid)->firstOrFail();

        if (! $this->access->canAccessFullState($match, $request->user())) {
            abort(403);
        }

        $this->timerService->extend($match, $request->user());

        return response()->json(['extended' => true]);
    }

    public function abandon(Request $request, string $uuid): JsonResponse
    {
        $match = DartMatch::query()->where('uuid', $uuid)->firstOrFail();

        if (! $this->access->canAccessFullState($match, $request->user())) {
            abort(403);
        }

        $this->timerService->abandon($match, $request->user());

        return response()->json(['abandoned' => true]);
    }
}
