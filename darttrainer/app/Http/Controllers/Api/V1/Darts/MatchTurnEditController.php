<?php

namespace App\Http\Controllers\Api\V1\Darts;

use App\Http\Controllers\Controller;
use App\Http\Resources\Darts\MatchStateResource;
use App\Models\DartMatch;
use App\Models\DartX01SoloActiveTurn;
use App\Services\Darts\MatchAccessService;
use App\Services\Darts\X01TurnEditService;
use Illuminate\Http\Request;

class MatchTurnEditController extends Controller
{
    public function __construct(
        private readonly X01TurnEditService $turnEditService,
        private readonly MatchAccessService $access,
    ) {}

    public function update(Request $request, string $uuid, int $turn): MatchStateResource
    {
        $validated = $request->validate([
            'throws' => ['required_without:points', 'array', 'min:1', 'max:3'],
            'throws.*.sector' => ['required_with:throws', 'integer', 'min:0', 'max:25'],
            'throws.*.multiplier' => ['required_with:throws', 'integer', 'min:0', 'max:3'],
            'points' => ['required_without:throws', 'integer', 'min:0', 'max:180'],
        ]);

        $match = DartMatch::query()->where('uuid', $uuid)->firstOrFail();

        if (! $this->access->canAccessFullState($match, $request->user())) {
            abort(403);
        }

        $turnModel = DartX01SoloActiveTurn::query()->findOrFail($turn);

        if (array_key_exists('points', $validated)) {
            $state = $this->turnEditService->updateTurnFromVisitPoints(
                $match,
                $request->user(),
                $turnModel->id,
                (int) $validated['points'],
            );
        } else {
            $state = $this->turnEditService->updateTurn(
                $match,
                $request->user(),
                $turnModel->id,
                $validated['throws'],
            );
        }

        return new MatchStateResource($state);
    }
}
