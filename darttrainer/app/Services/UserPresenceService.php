<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserPresenceService
{
    public function onlineThresholdMinutes(): int
    {
        return (int) config('traindart.presence.online_minutes', 5);
    }

    public function touch(User $user): void
    {
        $now = now();

        if ($user->last_seen_at !== null && $user->last_seen_at->gte($now->copy()->subMinute())) {
            return;
        }

        $user->forceFill(['last_seen_at' => $now])->save();
    }

    public function isOnline(User $user): bool
    {
        $threshold = now()->subMinutes($this->onlineThresholdMinutes());

        if ($user->last_seen_at !== null && $user->last_seen_at->gte($threshold)) {
            return true;
        }

        return DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('last_activity', '>=', $threshold->timestamp)
            ->exists();
    }
}
