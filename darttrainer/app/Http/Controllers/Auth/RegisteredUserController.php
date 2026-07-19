<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'locale' => ['nullable', 'in:lv,en'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // E-pastam jāatnāk tajā valodā, kas bija izvēlēta lietotnē reģistrācijas
        // brīdī (frontend to nosūta līdzi kā 'locale' lauku).
        if ($request->filled('locale')) {
            app()->setLocale($request->string('locale')->toString());
        }

        // Registered event nosūta e-pasta apstiprinājuma vēstuli. Ja e-pasta
        // serviss tobrīd nav sasniedzams, konta izveide un pieteikšanās
        // TOMĒR jānotiek — lietotājs var apstiprināt e-pastu vēlāk (skat.
        // EmailVerificationNotificationController "Nosūtīt vēlreiz").
        try {
            event(new Registered($user));
        } catch (\Throwable $e) {
            report($e);
        }

        Auth::login($user);

        return to_route('home');
    }
}
