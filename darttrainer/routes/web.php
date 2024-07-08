<?php

use App\Http\Controllers\ClosingGameController;
use App\Http\Controllers\TenOfTenGameController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome')
    ->name('index');

Route::view('/cookies', 'cookies')
    ->name('cookies');

Route::view('dashboard', 'dashboard')
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
