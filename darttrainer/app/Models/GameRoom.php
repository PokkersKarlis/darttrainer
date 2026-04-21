<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Schema;

class GameRoom extends Model
{
    protected $fillable = [
        'code', 'host_user_id', 'game_type', 'play_mode', 'game_config', 'status', 'max_players',
    ];

    protected $casts = [
        'game_config' => 'array',
    ];

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_user_id');
    }

    public function players(): HasMany
    {
        return $this->hasMany(RoomPlayer::class, 'room_id')->orderBy('order');
    }

    public function activePlayers(): HasMany
    {
        return $this->hasMany(RoomPlayer::class, 'room_id')
            ->where('is_spectator', false)
            ->orderBy('order');
    }

    public function activeMatch(): HasOne
    {
        return $this->hasOne(GameMatch::class, 'room_id')
            ->where('status', 'active');
    }

    /** Aktīvs vai pauzēts mačs (lokālā pauze pēc «pārtraukt»). */
    public function ongoingMatch(): HasOne
    {
        return $this->hasOne(GameMatch::class, 'room_id')
            ->whereIn('status', ['active', 'suspended'])
            ->latestOfMany();
    }

    public function matches(): HasMany
    {
        return $this->hasMany(GameMatch::class, 'room_id');
    }

    public function isFull(): bool
    {
        return $this->activePlayers()->count() >= $this->max_players;
    }

    public function isLocalPlay(): bool
    {
        if (!Schema::hasColumn('game_rooms', 'play_mode')) {
            return false;
        }

        return ($this->play_mode ?? 'online') === 'local';
    }
}
