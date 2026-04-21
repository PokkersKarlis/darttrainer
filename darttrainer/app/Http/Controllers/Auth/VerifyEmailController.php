<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

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
            return $this->redirectToSpa();
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->redirectToSpa();
    }

    private function redirectToSpa(): RedirectResponse
    {
        $base = rtrim(config('app.frontend_url', url('/')), '/');

        return redirect()->to($base.'/?verified=1');
    }
}
