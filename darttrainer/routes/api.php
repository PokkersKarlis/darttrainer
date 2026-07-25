<?php

use App\Http\Controllers\Api\V1\Darts\MatchChatController;
use App\Http\Controllers\Api\V1\Darts\MatchLobbyController;
use App\Http\Controllers\Api\V1\Darts\MatchPlayController;
use App\Http\Controllers\Api\V1\Darts\MatchPlayLeaveController;
use App\Http\Controllers\Api\V1\Darts\MatchScoringModeController;
use App\Http\Controllers\Api\V1\Darts\MatchStateController;
use App\Http\Controllers\Api\V1\Darts\MatchTurnEditController;
use App\Http\Controllers\Api\V1\Darts\MatchTurnTimerController;
use App\Http\Controllers\Api\V1\ShoutboxController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified.darts'])->prefix('v1')->group(function () {
    Route::get('shoutbox', [ShoutboxController::class, 'index'])->name('api.shoutbox.index');
    Route::post('shoutbox', [ShoutboxController::class, 'store'])->name('api.shoutbox.store');

    Route::get('darts/matches/{uuid}/lobby', [MatchLobbyController::class, 'show'])
        ->name('api.darts.matches.lobby');
    Route::get('darts/matches/{uuid}/state', [MatchStateController::class, 'show'])
        ->name('api.darts.matches.state');
    Route::post('darts/matches/{uuid}/throws', [MatchPlayController::class, 'store'])
        ->name('api.darts.matches.throws.store');
    Route::post('darts/matches/{uuid}/scoring-mode/calculator', [MatchScoringModeController::class, 'storeCalculator'])
        ->name('api.darts.matches.scoring-mode.calculator');
    Route::post('darts/matches/{uuid}/scoring-mode/board', [MatchScoringModeController::class, 'storeBoard'])
        ->name('api.darts.matches.scoring-mode.board');
    Route::post('darts/matches/{uuid}/leave', [MatchPlayLeaveController::class, 'store'])
        ->name('api.darts.matches.leave');
    Route::patch('darts/matches/{uuid}/turns/{turn}', [MatchTurnEditController::class, 'update'])
        ->name('api.darts.matches.turns.update');
    Route::post('darts/matches/{uuid}/turn-timer/extend', [MatchTurnTimerController::class, 'extend'])
        ->name('api.darts.matches.turn-timer.extend');
    Route::post('darts/matches/{uuid}/turn-timer/abandon', [MatchTurnTimerController::class, 'abandon'])
        ->name('api.darts.matches.turn-timer.abandon');
    Route::get('darts/matches/{uuid}/chat', [MatchChatController::class, 'index'])
        ->name('api.darts.matches.chat.index');
    Route::post('darts/matches/{uuid}/chat', [MatchChatController::class, 'store'])
        ->name('api.darts.matches.chat.store');
});
