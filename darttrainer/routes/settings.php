<?php

use App\Http\Controllers\Settings\FriendController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/friends', [FriendController::class, 'index'])->name('friends.edit');
    Route::post('settings/friends', [FriendController::class, 'store'])->name('friends.store');
    Route::post('settings/friends/{friendship}/accept', [FriendController::class, 'accept'])->name('friends.accept');
    Route::post('settings/friends/{friendship}/decline', [FriendController::class, 'decline'])->name('friends.decline');
    Route::delete('settings/friends/{friendship}', [FriendController::class, 'destroy'])->name('friends.destroy');
});
