<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ShoutboxService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShoutboxController extends Controller
{
    public function __construct(
        private readonly ShoutboxService $shoutbox,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $afterId = $request->query('after') !== null ? (int) $request->query('after') : null;

        return response()->json([
            'data' => $this->shoutbox->listRecent($afterId),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:500'],
        ]);

        $message = $this->shoutbox->post($request->user(), $validated['body']);

        return response()->json(['data' => $message], 201);
    }
}
