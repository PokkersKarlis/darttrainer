<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;

class RegistrationService
{
    /**
     * @param  array{name: string, email: string, password: string, account_type: string, club_name?: string|null}  $data
     */
    public function register(array $data): User
    {
        $user = User::create([
            'name'         => $data['name'],
            'email'        => $data['email'],
            'password'     => Hash::make($data['password']),
            'account_type' => $data['account_type'],
            'club_name'    => $data['account_type'] === User::ACCOUNT_CLUB
                ? ($data['club_name'] ?? null)
                : null,
        ]);

        event(new Registered($user));

        return $user;
    }
}
