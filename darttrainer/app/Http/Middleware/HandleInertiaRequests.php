<?php

namespace App\Http\Middleware;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Inertia\Middleware;

/**
 * Kopīgie props, kas pieejami VISĀM Inertia lapām (piem. auth.user, flash paziņojumi).
 * Lapas-specifiskos props liek katrs controlleris savā Inertia::render() izsaukumā.
 */
class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                // camelCase resurss — sakrīt ar Vue komponentos gaidītajiem atslēgu nosaukumiem.
                'user' => $user ? (new UserResource($user))->resolve($request) : null,
            ],
            // Vienreizējie servera paziņojumi (session()->flash(...)) → toast Vue pusē.
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
