<?php

namespace App\Http\Controllers\Api\V1\Darts;

use App\Http\Controllers\Controller;
use App\Http\Resources\Darts\MatchStateResource;
use App\Models\DartMatch;
use App\Services\Darts\MatchAccessService;
use App\Services\Darts\MatchScoringModeService;
use Illuminate\Http\Request;

class MatchScoringModeController extends Controller
{
    public function __construct(
        private readonly MatchScoringModeService $scoringMode,
        private readonly MatchAccessService $access,
    ) {}

    public function storeCalculator(Request $request, string $uuid): MatchStateResource
    {
        $match = DartMatch::query()->where('uuid', $uuid)->firstOrFail();

        if (! $this->access->canAccessFullState($match, $request->user())) {
            abort(403);
        }

        $state = $this->scoringMode->lockCalculatorMode($match, $request->user());

        return new MatchStateResource($state);
    }

    public function storeBoard(Request $request, string $uuid): MatchStateResource
    {
        $match = DartMatch::query()->where('uuid', $uuid)->firstOrFail();

        if (! $this->access->canAccessFullState($match, $request->user())) {
            abort(403);
        }

        $state = $this->scoringMode->switchToBoardMode($match, $request->user());

        return new MatchStateResource($state);
    }
}
