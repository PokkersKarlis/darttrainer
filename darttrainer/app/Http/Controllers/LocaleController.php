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

        if ($request->user()) {
            $request->user()->forceFill(['locale' => $locale])->save();
        }

        return back();
    }
}
