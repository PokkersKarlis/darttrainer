<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blokē API darbības ielogotiem, bet vēl neapstiprināta e-pasta lietotājiem (SPA rāda UI, bet bez piekļuves).
 */
class EnsureEmailVerifiedForApi
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('web')->user();

        if ($user && ! $user->hasVerifiedEmail()) {
            return response()->json([
                'code'    => 'email_unverified',
                'message' => 'Apstiprini e-pasta adresi, lai izmantotu šo funkciju.',
            ], 403);
        }

        return $next($request);
    }
}
