<?php

use App\Http\Controllers\ServeSpaController;
use Illuminate\Support\Facades\Route;

require __DIR__ . '/auth.php';

// ──────────────────────────────────────────────────────────────
// DartTrainer SPA: Vite-only build (bez Blade skatiem).
// Statiskie asseti: public/dart-app/  (JS, CSS, img)
// index.html tiek servēts visiem HTML pieprasījumiem (SPA catch-all).
// ──────────────────────────────────────────────────────────────

// Nosauktie maršruti (Laravel auth atsaucēm — login/register).
Route::get('/login', ServeSpaController::class)->name('login');
Route::get('/register', ServeSpaController::class)->name('register');

// Vecie /dart-app/* URL — 301 redirect uz root (SEO + grāmatzīmes).
Route::get('/dart-app/{path?}', function (string $path = '') {
    return redirect('/' . $path, 301);
})->where('path', '.*');

// SPA catch-all: visi pārējie GET pieprasījumi → index.html (Vue Router apstrādā ceļu).
Route::fallback(ServeSpaController::class);
