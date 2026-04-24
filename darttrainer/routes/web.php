<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

// DartTrainer SPA: Vue 3 + Vite, history mode (bez #). public/index.html → novirza uz /.
// Ieeja/reģistrācija tikai SPA (resources/js/dart-app/pages/Login|Register). Breeze Volt skati
// resources/views/livewire/pages/auth/login|register.blade.php nav pieslēgti maršrutiem — nejauc ar SPA.
Route::view('/', 'dart-spa')->name('index');
Route::view('/login', 'dart-spa')->name('login');
Route::view('/register', 'dart-spa')->name('register');

require __DIR__ . '/auth.php';

// Spēles skats: nedrīkst būt pieejams neautorizētiem vai ne-telpas spēlētājiem (citādi SPA ielādējas, bet API bloķē).
Route::get('/game/{match}', function (string $match) {
    if (request()->expectsJson()) {
        abort(404);
    }

    $userId = Auth::id();
    if ($userId === null) {
        abort(404);
    }

    $matchId = (int) $match;
    if ($matchId <= 0) {
        abort(404);
    }

    $roomId = DB::table('matches')->where('id', $matchId)->value('room_id');
    if (!$roomId) {
        abort(404);
    }

    $allowed = DB::table('room_players')
        ->where('room_id', (int) $roomId)
        ->where('user_id', (int) $userId)
        ->exists();

    if (!$allowed) {
        abort(404);
    }

    return view('dart-spa');
})->whereNumber('match');

Route::fallback(function () {
    if (request()->expectsJson()) {
        abort(404);
    }

    // Extra safety: never serve SPA for `/game/*` to guests/non-players via fallback.
    $path = (string) request()->path();
    if (str_starts_with($path, 'game/')) {
        abort(404);
    }

    return view('dart-spa');
});
