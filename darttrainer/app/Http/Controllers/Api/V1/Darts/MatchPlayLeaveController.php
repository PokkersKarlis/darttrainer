<?php

namespace App\Http\Controllers\Api\V1\Darts;

use App\Http\Controllers\Controller;
use App\Models\DartMatch;
use App\Services\Darts\MatchAccessService;
use App\Services\Darts\MatchPlayLeaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchPlayLeaveController extends Controller
{
    public function __construct(
        private readonly MatchPlayLeaveService $leaveService,
        private readonly MatchAccessService $access,
    ) {}

    public function store(Request $request, string $uuid): JsonResponse
    {
        $match = DartMatch::query()->where('uuid', $uuid)->firstOrFail();

        if (! $this->access->canAccessFullState($match, $request->user())) {
            abort(403);
        }

        $this->leaveService->leave($match, $request->user());

        return response()->json(['left' => true]);
    }
}
