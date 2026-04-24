<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConsentController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'consent_id' => 'required|string|min:8|max:120',
            'version'    => 'required|integer|min:1|max:9999',
            'functional' => 'required|boolean',
            'analytics'  => 'required|boolean',
            'marketing'  => 'required|boolean',
        ]);

        $id = (string) $data['consent_id'];
        $hash = hash('sha256', $id);

        $ip = (string) ($request->ip() ?? '');
        $ipPrefix = null;
        if ($ip !== '') {
            // Keep only coarse prefix (no full IP).
            $ipPrefix = str_contains($ip, ':')
                ? implode(':', array_slice(explode(':', $ip), 0, 4)) . '::'
                : implode('.', array_slice(explode('.', $ip), 0, 3)) . '.0';
        }

        $ua = (string) $request->userAgent();
        $uaHash = $ua !== '' ? hash('sha256', $ua) : null;

        DB::table('cookie_consents')->insert([
            'consent_hash'   => $hash,
            'version'        => (int) $data['version'],
            'functional'     => (bool) $data['functional'],
            'analytics'      => (bool) $data['analytics'],
            'marketing'      => (bool) $data['marketing'],
            'ip_prefix'      => $ipPrefix,
            'user_agent_hash'=> $uaHash,
            'created_at'     => now(),
        ]);

        return response()->json(['ok' => true]);
    }
}

