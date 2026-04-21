<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FriendController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\PublicStatsController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\TrainingController;
use App\Http\Controllers\Api\UserGuestPresetController;
use Illuminate\Support\Facades\Route;

/** Sets XSRF-TOKEN cookie; call once before mutating requests (see SPA bootstrap). */
Route::get('/csrf-cookie', fn () => response()->noContent());

Route::middleware('throttle:60,1')->group(function () {
    Route::get('/public/home-summary', [PublicStatsController::class, 'homeSummary']);
});

// ── Auth (sesija; daļa bez e-pasta apstiprinājuma) ───────────────────────────
Route::middleware('throttle:8,1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

/** Sesijas stāvoklis bez pieslēgšanās — atgriež { user: null }, nevis 401 */
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('throttle:120,1');

Route::middleware('auth:web')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/email/resend', [AuthController::class, 'sendVerificationEmail'])
        ->middleware('throttle:6,1');
});

// ── Rooms, draugi, spēles — tikai ar apstiprinātu e-pastu ─────────────────────
Route::middleware(['auth:web', 'verified.email'])->group(function () {
    Route::get('/rooms/my-active', [RoomController::class, 'myActive']);
    Route::get('/rooms/my-actives', [RoomController::class, 'myActives']);
    Route::post('/rooms', [RoomController::class, 'create']);
    Route::post('/rooms/join', [RoomController::class, 'join']);
    Route::get('/rooms/{room}', [RoomController::class, 'show']);
    Route::post('/rooms/{room}/start', [RoomController::class, 'start']);
    Route::delete('/rooms/{room}', [RoomController::class, 'leave']);

    Route::get('/friends/search', [FriendController::class, 'search']);
    Route::get('/friends', [FriendController::class, 'index']);
    Route::get('/friends/requests/incoming', [FriendController::class, 'incoming']);
    Route::get('/friends/requests/outgoing', [FriendController::class, 'outgoing']);
    Route::post('/friends/requests', [FriendController::class, 'send']);
    Route::post('/friends/requests/{friendRequest}/accept', [FriendController::class, 'accept']);
    Route::post('/friends/requests/{friendRequest}/reject', [FriendController::class, 'reject']);
    Route::delete('/friends/{user}', [FriendController::class, 'destroy'])->whereNumber('user');

    Route::get('/guest-presets', [UserGuestPresetController::class, 'index']);
    Route::post('/guest-presets', [UserGuestPresetController::class, 'store']);
    Route::delete('/guest-presets/{id}', [UserGuestPresetController::class, 'destroy'])->whereNumber('id');

    Route::get('/games/{match}/state', [GameController::class, 'state']);
    Route::post('/games/{match}/throw', [GameController::class, 'submitThrow']);
    Route::post('/games/{match}/undo', [GameController::class, 'undo']);
    Route::get('/games/{match}/history', [GameController::class, 'history']);
    Route::get('/games/{match}/protocol', [GameController::class, 'protocol']);
    Route::post('/games/{match}/abandon', [GameController::class, 'abandon']);
    Route::post('/games/{match}/suspend-local', [GameController::class, 'suspendLocal']);
    Route::post('/games/{match}/resume', [GameController::class, 'resume']);
    Route::post('/games/{match}/discard-suspended', [GameController::class, 'discardSuspended']);
    Route::post('/games/{match}/turn-timeout/grant-extra', [GameController::class, 'turnTimeoutGrantExtra']);
    Route::post('/games/{match}/turn-timeout/end-no-stats', [GameController::class, 'turnTimeoutEndNoStats']);

    Route::get('/stats/me', [StatsController::class, 'me']);
    Route::get('/stats/recent-matches', [StatsController::class, 'recentFinishedMatches']);
});

// ── Statistics (publiski) ────────────────────────────────────────────────────
Route::get('/stats/leaderboard', [StatsController::class, 'leaderboard'])->middleware('throttle:60,1');

// ── Admin ─────────────────────────────────────────────────────────────────────
Route::middleware(['auth:web', 'admin', 'verified.email', 'throttle:120,1'])->prefix('admin')->group(function () {
    Route::get('/overview', [AdminController::class, 'overview']);
    Route::get('/audit-log', [AdminController::class, 'auditLog']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::patch('/users/{user}', [AdminController::class, 'updateUser']);
    Route::post('/users/{user}/revoke-sessions', [AdminController::class, 'revokeUserSessions']);
    Route::get('/inspect/matches/{match}', [AdminController::class, 'matchDetail']);
    Route::get('/inspect/rooms/{room}', [AdminController::class, 'roomDetail']);
    Route::post('/inspect/matches/{match}/force-abandon', [AdminController::class, 'forceAbandonMatch']);
    Route::post('/inspect/rooms/{room}/force-close', [AdminController::class, 'forceCloseRoom']);
});

// ── Training: lasīšana bez e-pasta apstiprinājuma; izmaiņas — tikai apstiprinātiem ─
Route::prefix('training')->middleware('throttle:180,1')->group(function () {
    Route::get('/x01/state', [TrainingController::class, 'x01State']);
    Route::get('/x01/finished', [TrainingController::class, 'x01FinishedList']);
    Route::get('/x01/games/{game}', [TrainingController::class, 'x01Protocol']);

    Route::middleware('verified.email')->group(function () {
        Route::post('/x01/start', [TrainingController::class, 'x01Start']);
        Route::post('/x01/throw', [TrainingController::class, 'x01Throw']);
        Route::post('/x01/undo', [TrainingController::class, 'x01Undo']);
        Route::post('/x01/abandon', [TrainingController::class, 'x01Abandon']);
    });
});
