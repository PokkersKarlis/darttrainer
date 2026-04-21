<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class Friendship extends Model
{
    protected $fillable = [
        'user_id', 'friend_user_id',
    ];

    public function friend(): BelongsTo
    {
        return $this->belongsTo(User::class, 'friend_user_id');
    }

    /** Vai divi lietotāji ir savstarpēji draugi (jebkurā virzienā saglabātā rinda). */
    public static function areFriends(int $userId, int $otherUserId): bool
    {
        if ($userId === $otherUserId) {
            return false;
        }

        return static::query()
            ->where(function ($q) use ($userId, $otherUserId) {
                $q->where(fn ($q2) => $q2->where('user_id', $userId)->where('friend_user_id', $otherUserId))
                    ->orWhere(fn ($q2) => $q2->where('user_id', $otherUserId)->where('friend_user_id', $userId));
            })
            ->exists();
    }

    /** Visu draugu lietotāju ID (abas tabulas puses). */
    public static function friendUserIdsFor(int $userId): array
    {
        $a = static::where('user_id', $userId)->pluck('friend_user_id');
        $b = static::where('friend_user_id', $userId)->pluck('user_id');

        return $a->merge($b)
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->filter(fn ($id) => $id > 0 && $id !== $userId)
            ->values()
            ->all();
    }

    /** Noņem draudzību abos virzienos (var izsaukt jebkurš no pāra). */
    public static function removePair(int $userId, int $otherUserId): int
    {
        if ($userId === $otherUserId) {
            return 0;
        }

        return (int) DB::table('friendships')
            ->where(function ($q) use ($userId, $otherUserId) {
                $q->where(function ($q2) use ($userId, $otherUserId) {
                    $q2->where('user_id', $userId)->where('friend_user_id', $otherUserId);
                })->orWhere(function ($q2) use ($userId, $otherUserId) {
                    $q2->where('user_id', $otherUserId)->where('friend_user_id', $userId);
                });
            })
            ->delete();
    }
}
