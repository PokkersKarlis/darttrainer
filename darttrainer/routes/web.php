<?php

use App\Http\Controllers\LegalController;
use App\Http\Controllers\LocaleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return Inertia::render('Index', [
            'status' => session('status'),
        ]);
    }

    return Inertia::render('Welcome');
})->name('home');

Route::get('/terms', [LegalController::class, 'terms'])->name('terms');
Route::get('/privacy', [LegalController::class, 'privacy'])->name('privacy');

Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
