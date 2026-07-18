<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ServeSpaController;
use Illuminate\Support\Facades\Route;

require __DIR__ . '/auth.php';

// ──────────────────────────────────────────────────────────────
// Sākumlapa (/) — Inertia (Phase 2). Aizstāj veco SPA sākumlapu.
// Pārējās sadaļas (lobby/stats/admin) vēl servē vecais SPA (Route::fallback zemāk),
// līdz tās migrējam vai izņemam.
// ──────────────────────────────────────────────────────────────
Route::get('/', HomeController::class)->name('home');

// ──────────────────────────────────────────────────────────────
// Draugi (Inertia). Tikai ielogotiem, ar apstiprinātu e-pastu.
// ──────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/friends', [FriendController::class, 'index'])->name('friends.index');
    Route::post('/friends/requests', [FriendController::class, 'store'])->name('friends.requests.store');
    Route::post('/friends/requests/{friendRequest}/accept', [FriendController::class, 'accept'])->name('friends.requests.accept');
    Route::post('/friends/requests/{friendRequest}/reject', [FriendController::class, 'reject'])->name('friends.requests.reject');
    Route::delete('/friends/{user}', [FriendController::class, 'destroy'])->whereNumber('user')->name('friends.destroy');
});

// Auth (Inertia + Vue lapas). Sesija ir kopīga ar veco SPA (tā pati 'web' guard),
// tāpēc pēc pieteikšanās/reģistrācijas '/' joprojām pareizi atpazīst lietotāju.
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

// Vecie /dart-app/* URL — 301 redirect uz root (SEO + grāmatzīmes).
Route::get('/dart-app/{path?}', function (string $path = '') {
    return redirect('/' . $path, 301);
})->where('path', '.*');

// SPA catch-all: visi pārējie GET pieprasījumi → index.html (Vue Router apstrādā ceļu).
Route::fallback(ServeSpaController::class);
