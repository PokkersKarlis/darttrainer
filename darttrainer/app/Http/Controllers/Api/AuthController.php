<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name'         => $data['name'],
            'email'        => $data['email'],
            'password'     => Hash::make($data['password']),
            'account_type' => $data['account_type'],
            'club_name'    => $data['account_type'] === User::ACCOUNT_CLUB
                ? $data['club_name']
                : null,
        ]);

        // Sesija pirms apstiprinājuma vēstules — tā pati plūsma kā Livewire reģistrācijai
        // (SendEmailVerificationNotification uz Registered); izvairās no «tikai resend sūta».
        Auth::login($user);
        event(new Registered($user));

        return response()->json([
            'user' => $this->userResource($user->fresh()),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (! Auth::attempt($data, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['Nepareizs e-pasts vai parole.'],
            ]);
        }

        $user = Auth::user();
        if ($user->is_banned) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            throw ValidationException::withMessages([
                'email' => ['Šis konts ir bloķēts.'.($user->ban_reason ? ' '.$user->ban_reason : '')],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'user' => $this->userResource($user->fresh()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        $u = $request->user();
        if ($u !== null) {
            $u->refresh();
        }

        return response()->json([
            'user' => $u ? $this->userResource($u) : null,
        ]);
    }

    public function sendVerificationEmail(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->hasVerifiedEmail()) {
            return response()->json(['ok' => true, 'already_verified' => true]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['ok' => true]);
    }

    private function userResource(User $user): array
    {
        return [
            'id'                 => $user->id,
            'name'               => $user->name,
            'email'              => $user->email,
            'account_type'       => $user->account_type ?? User::ACCOUNT_PLAYER,
            'club_name'          => $user->club_name,
            'email_verified_at'  => $user->email_verified_at?->toIso8601String(),
            'is_admin'           => (bool) $user->is_admin,
            'is_banned'          => (bool) $user->is_banned,
            'ban_reason'         => $user->is_banned ? $user->ban_reason : null,
        ];
    }
}
