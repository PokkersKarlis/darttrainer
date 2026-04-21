<?php

use App\Http\Controllers\ClosingGameController;
use App\Http\Controllers\TenOfTenGameController;
use Illuminate\Support\Facades\Route;

// DartTrainer SPA: Vue 3 + Vite, history mode (bez #). public/index.html → novirza uz /.
Route::view('/', 'dart-spa')->name('index');
Route::view('/login', 'dart-spa')->name('login');
Route::view('/register', 'dart-spa')->name('register');

Route::view('/cookies', 'cookies')
    ->name('cookies');

Route::view('/dashboard', 'dashboard')
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::view('games', 'games')
    ->middleware(['auth', 'verified'])
    ->name('games');

Route::view('profile', 'profile')
    ->middleware(['auth'])
    ->name('profile');

Route::get('/close-the-number', [ClosingGameController::class, 'index'])
    ->name('close-the-number');

Route::get('/ten-of-ten', [TenOfTenGameController::class, 'index'])
    ->name('ten-of-ten');



require __DIR__ . '/auth.php';

Route::fallback(function () {
    if (request()->expectsJson()) {
        abort(404);
    }

    return view('dart-spa');
});
