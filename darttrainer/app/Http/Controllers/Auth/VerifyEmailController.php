<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VerifyEmailController extends Controller
{
    /**
     * Apstiprina e-pastu pēc parakstītās saites — darbojas arī bez iepriekšējas sesijas
     * (cita ierīce / pārlūks), jo paraksts un hash jau identificē lietotāju.
     */
    public function __invoke(Request $request, string $id, string $hash): RedirectResponse
    {
        $user = User::query()->find($id);

        if ($user === null) {
            abort(404);
        }

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            abort(403);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->redirectToSpa('login?already_verified=1');
        }

        if (! $user->markEmailAsVerified()) {
            return $this->redirectToSpa('login');
        }

        event(new Verified($user));
        $this->logoutSession($request);

        return $this->redirectToSpa('login?verified=1');
    }

    private function redirectToSpa(string $pathAndQuery): RedirectResponse
    {
        $base = rtrim(config('app.frontend_url', url('/')), '/');
        $path = ltrim($pathAndQuery, '/');

        return redirect()->to($base.'/'.$path);
    }

    private function logoutSession(Request $request): void
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
