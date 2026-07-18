<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Kopīga pieteikšanās loģika — izmanto gan Inertia auth (AuthenticatedSessionController),
 * gan (pārejas periodā) veco JSON API (Api\AuthController), lai izvairītos no dublēšanās (DRY).
 */
class AuthenticationService
{
    /**
     * @param  array{email: string, password: string}  $credentials
     *
     * @throws ValidationException
     */
    public function attempt(array $credentials, bool $remember = false): User
    {
        if (! Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => ['Nepareizs e-pasts vai parole.'],
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        if ($user->is_banned) {
            $this->logout();

            throw ValidationException::withMessages([
                'email' => ['Šis konts ir bloķēts.'.($user->ban_reason ? ' '.$user->ban_reason : '')],
            ]);
        }

        return $user;
    }

    public function logout(): void
    {
        Auth::guard('web')->logout();
    }
}
