<?php

namespace App\Http\Controllers\Api\V1\Darts;

use App\Http\Controllers\Controller;
use App\Http\Resources\Darts\MatchStateResource;
use App\Models\DartMatch;
use App\Services\Darts\MatchAccessService;
use App\Services\Darts\X01MatchPlayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchPlayController extends Controller
{
    public function __construct(
        private readonly X01MatchPlayService $playService,
        private readonly MatchAccessService $access,
    ) {}

    public function store(Request $request, string $uuid): MatchStateResource|JsonResponse
    {
        $match = DartMatch::query()->where('uuid', $uuid)->firstOrFail();

        if (! $this->access->canAccessFullState($match, $request->user())) {
            abort(403);
        }

        if ($request->has('points')) {
            $validated = $request->validate([
                'points' => ['required', 'integer', 'min:0', 'max:180'],
                'dart_count' => ['sometimes', 'integer', 'min:1', 'max:3'],
                'checkout_dart' => ['sometimes', 'integer', 'min:1', 'max:3'],
                'double_darts' => ['sometimes', 'integer', 'min:0', 'max:3'],
                'double_attempts' => ['sometimes', 'integer', 'min:0', 'max:3'],
                'throws_detail' => ['sometimes', 'array', 'min:1', 'max:3'],
                'throws_detail.*.sector' => ['required', 'integer', 'min:0', 'max:25'],
                'throws_detail.*.multiplier' => ['required', 'integer', 'min:0', 'max:3'],
            ]);

            $doubleAttempts = $validated['double_darts']
                ?? $validated['double_attempts']
                ?? null;

            $state = $this->playService->recordPointsThrow(
                $match,
                $request->user(),
                (int) $validated['points'],
                isset($validated['dart_count']) ? (int) $validated['dart_count'] : null,
                isset($validated['checkout_dart']) ? (int) $validated['checkout_dart'] : null,
                $doubleAttempts !== null ? (int) $doubleAttempts : null,
                $validated['throws_detail'] ?? null,
            );

            return new MatchStateResource($state);
        }

        $validated = $request->validate([
            'sector' => ['required', 'integer', 'min:0', 'max:25'],
            'multiplier' => ['required', 'integer', 'min:0', 'max:3'],
        ]);

        $state = $this->playService->recordThrow(
            $match,
            $request->user(),
            (int) $validated['sector'],
            (int) $validated['multiplier'],
        );

        return new MatchStateResource($state);
    }
}
