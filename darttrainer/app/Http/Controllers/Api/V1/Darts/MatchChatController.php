<?php

namespace App\Http\Controllers\Api\V1\Darts;

use App\Http\Controllers\Controller;
use App\Models\DartMatch;
use App\Services\Darts\MatchAccessService;
use App\Services\Darts\MatchChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchChatController extends Controller
{
    public function __construct(
        private readonly MatchChatService $chatService,
        private readonly MatchAccessService $access,
    ) {}

    public function index(Request $request, string $uuid): JsonResponse
    {
        $match = DartMatch::query()->where('uuid', $uuid)->firstOrFail();

        if (! $this->access->canAccessFullState($match, $request->user())
            && ! $this->access->canAccessSpectatorState($match, $request->user())
        ) {
            abort(403);
        }

        $afterId = $request->query('after') !== null ? (int) $request->query('after') : null;

        return response()->json([
            'data' => $this->chatService->listRecent($match, $afterId),
        ]);
    }

    public function store(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:500'],
        ]);

        $match = DartMatch::query()->where('uuid', $uuid)->firstOrFail();

        if (! $this->access->canAccessFullState($match, $request->user())) {
            abort(403);
        }

        $message = $this->chatService->post($match, $request->user(), $validated['body']);

        return response()->json(['data' => $message], 201);
    }
}
