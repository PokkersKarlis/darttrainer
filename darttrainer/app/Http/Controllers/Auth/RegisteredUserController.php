<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AppLocale;
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
        if ($request->filled('company')) {
            return back()->withInput()->withErrors([
                'email' => __('Registration could not be completed.'),
            ]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'locale' => ['nullable', 'in:'.implode(',', AppLocale::SUPPORTED)],
            'terms_accepted' => ['accepted'],
        ]);

        $locale = AppLocale::resolve($request->input('locale'), app()->getLocale());

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'locale' => $locale,
        ]);

        $request->session()->put(AppLocale::SESSION_KEY, $locale);
        app()->setLocale($locale);

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
