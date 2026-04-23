<?php

use Illuminate\Support\Facades\Route;

// DartTrainer SPA: Vue 3 + Vite, history mode (bez #). public/index.html → novirza uz /.
// Ieeja/reģistrācija tikai SPA (resources/js/dart-app/pages/Login|Register). Breeze Volt skati
// resources/views/livewire/pages/auth/login|register.blade.php nav pieslēgti maršrutiem — nejauc ar SPA.
Route::view('/', 'dart-spa')->name('index');
Route::view('/login', 'dart-spa')->name('login');
Route::view('/register', 'dart-spa')->name('register');

require __DIR__ . '/auth.php';

Route::fallback(function () {
    if (request()->expectsJson()) {
        abort(404);
    }

    return view('dart-spa');
});
