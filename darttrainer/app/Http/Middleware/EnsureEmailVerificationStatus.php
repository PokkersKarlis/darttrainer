<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensures the user is authenticated and exposes email verification state to Inertia.
 * Does not block unverified users — UI surfaces approval status instead.
 */
class EnsureEmailVerificationStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return redirect()->guest(route('login'));
        }

        $request->attributes->set('email_verified', $request->user()->hasVerifiedEmail());

        return $next($request);
    }
}
