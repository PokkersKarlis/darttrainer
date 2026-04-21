<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * After session auth resolves: if the user is banned, invalidate the session
 * and return JSON so the SPA can show ban_reason (403, not silent 401).
 */
class RejectBannedAuthenticatedUser
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::guard('web')->check()) {
            return $next($request);
        }

        $user = Auth::guard('web')->user();
        $user->refresh();

        if (! $user->is_banned) {
            return $next($request);
        }

        $banReason = $user->ban_reason;

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'code' => 'account_banned',
            'message' => 'Konts ir bloķēts.',
            'ban_reason' => $banReason,
        ], 403);
    }
}
