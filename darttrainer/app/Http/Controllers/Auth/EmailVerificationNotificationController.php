<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('home', absolute: false));
        }

        $request->validate([
            'locale' => ['nullable', 'in:lv,en'],
        ]);

        if ($request->filled('locale')) {
            app()->setLocale($request->string('locale')->toString());
        }

        // Ja e-pasta nosūtīšana neizdodas (SMTP/DNS/tīkla kļūda), nedrīkst
        // nogāzt pieprasījumu — parādām lietotājam skaidru kļūdas statusu,
        // nevis 500 lapu.
        try {
            $request->user()->sendEmailVerificationNotification();
        } catch (\Throwable $e) {
            report($e);

            return back()->with('status', 'verification-link-failed');
        }

        return back()->with('status', 'verification-link-sent');
    }
}
