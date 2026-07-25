<?php

namespace App\Http\Controllers\Api\V1\Darts;

use App\Http\Controllers\Controller;
use App\Http\Resources\Darts\MatchStateResource;
use App\Models\DartMatch;
use App\Services\Darts\MatchAccessService;
use App\Services\Darts\MatchStateService;
use Illuminate\Http\Request;

class MatchStateController extends Controller
{
    public function __construct(
        private readonly MatchStateService $stateService,
        private readonly MatchAccessService $access,
    ) {}

    public function show(Request $request, string $uuid): MatchStateResource
    {
        $match = DartMatch::query()->where('uuid', $uuid)->firstOrFail();
        $user = $request->user();

        if ($this->access->canAccessFullState($match, $user)) {
            return new MatchStateResource($this->stateService->buildState($match));
        }

        if ($this->access->canAccessSpectatorState($match, $user)) {
            return new MatchStateResource($this->stateService->buildSpectatorState($match));
        }

        abort(403);
    }
}
