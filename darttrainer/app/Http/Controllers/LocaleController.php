<?php

namespace App\Http\Controllers;

use App\Support\AppLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    /**
     * Persist the user's language choice (session + cookie + optional user preference).
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'in:'.implode(',', AppLocale::SUPPORTED)],
        ]);

        $locale = $validated['locale'];

        $request->session()->put(AppLocale::SESSION_KEY, $locale);
        app()->setLocale($locale);

        if ($user = $request->user()) {
            try {
                $user->forceFill(['locale' => $locale])->save();
            } catch (\Throwable $e) {
                // Session/cookie still apply; avoid 500 if production DB is behind migrations.
                report($e);
            }
        }

        return back();
    }
}
