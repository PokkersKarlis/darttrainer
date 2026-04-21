<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserGuestPreset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserGuestPresetController extends Controller
{
    public function index(): JsonResponse
    {
        $items = UserGuestPreset::where('user_id', Auth::id())
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json(['items' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|min:1|max:50',
        ]);

        $preset = UserGuestPreset::create([
            'user_id' => Auth::id(),
            'name' => trim($data['name']),
        ]);

        return response()->json(['id' => $preset->id, 'name' => $preset->name], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $preset = UserGuestPreset::where('user_id', Auth::id())->whereKey($id)->first();
        if (!$preset) {
            return response()->json(['error' => 'Nav atrasts.'], 404);
        }
        $preset->delete();

        return response()->json(['ok' => true]);
    }
}
