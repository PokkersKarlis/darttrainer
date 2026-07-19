<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\AppLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/ForgotPassword', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'locale' => ['nullable', 'in:'.implode(',', AppLocale::SUPPORTED)],
        ]);

        // Locale is applied by SetLocale middleware from request/session/cookie.

        // Ietin mēģinājumu try/catch: ja e-pasta serviss (SMTP/DNS/tīkls) nav
        // sasniedzams, šai kļūdai NEDRĪKST nogāzt visu pieprasījumu ar 500 —
        // lietotājam vienalga jāredz normāla atbilde. Kļūdu pierakstām logā,
        // lai to var izmeklēt, bet nekad neatklājam, vai konkrētais e-pasts
        // eksistē (tas paliktu vienāds neatkarīgi no rezultāta).
        try {
            Password::sendResetLink(
                $request->only('email')
            );
        } catch (\Throwable $e) {
            report($e);

            // Fiksēta atslēga (nevis brīvs teksts) — frontend to iztulko un
            // parāda kā kļūdu. Neatklājam, vai konkrētais e-pasts eksistē.
            return back()->with('status', 'reset-link-failed');
        }

        return back()->with('status', 'reset-link-sent');
    }
}
