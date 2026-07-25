<?php

use App\Http\Controllers\Darts\DartsLobbyController;
use App\Http\Controllers\Darts\DartsMatchGoneController;
use App\Http\Controllers\Darts\DartsPlayController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified.darts'])->prefix('darts/x01')->name('darts.x01.')->group(function () {
    Route::get('multiplayer', [DartsLobbyController::class, 'index'])->name('lobby.index');
    Route::post('multiplayer', [DartsLobbyController::class, 'store'])->name('lobby.store');
    Route::post('multiplayer/join', [DartsLobbyController::class, 'join'])->name('lobby.join');
    Route::get('multiplayer/{uuid}', [DartsLobbyController::class, 'show'])
        ->whereUuid('uuid')
        ->name('lobby.show');
    Route::post('multiplayer/{match:uuid}/players', [DartsLobbyController::class, 'addPlayer'])->name('lobby.players.store');
    Route::post('multiplayer/{match:uuid}/invites', [DartsLobbyController::class, 'sendInvite'])->name('lobby.invites.store');
    Route::post('lobby-invites/{invite}/accept', [DartsLobbyController::class, 'acceptInvite'])->name('lobby.invites.accept');
    Route::post('lobby-invites/{invite}/decline', [DartsLobbyController::class, 'declineInvite'])->name('lobby.invites.decline');
    Route::patch('multiplayer/{match:uuid}/players/{player}/ready', [DartsLobbyController::class, 'updateReady'])->name('lobby.players.ready');
    Route::patch('multiplayer/{match:uuid}/match-type', [DartsLobbyController::class, 'updateMatchType'])->name('lobby.match-type.update');
    Route::patch('multiplayer/{match:uuid}/config', [DartsLobbyController::class, 'updateConfig'])->name('lobby.config.update');
    Route::patch('multiplayer/{match:uuid}/throw-order', [DartsLobbyController::class, 'updateThrowOrder'])->name('lobby.throw-order.update');
    Route::patch('multiplayer/{match:uuid}/first-thrower', [DartsLobbyController::class, 'setFirstThrower'])->name('lobby.first-thrower.update');
    Route::patch('multiplayer/{match:uuid}/players/{player}/starting-points', [DartsLobbyController::class, 'updatePlayerStartingPoints'])->name('lobby.players.starting-points');
    Route::post('multiplayer/{match:uuid}/start', [DartsLobbyController::class, 'start'])->name('lobby.start');
    Route::delete('multiplayer/{match:uuid}', [DartsLobbyController::class, 'destroy'])->name('lobby.destroy');
    Route::get('play/{uuid}', [DartsPlayController::class, 'show'])
        ->whereUuid('uuid')
        ->name('play');
    Route::get('match-gone', [DartsMatchGoneController::class, 'show'])->name('match-gone');
});
