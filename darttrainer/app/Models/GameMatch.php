<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class GameMatch extends Model
{
    public $timestamps = false;

    protected $table = 'matches';

    protected $fillable = [
        'room_id', 'current_player_id', 'current_leg', 'current_set',
        'legs_config', 'status', 'winner_player_id', 'started_at', 'finished_at',
        'turn_deadline_at', 'turn_timeout_pending', 'turn_timer_window_seconds', 'exclude_from_stats',
    ];

    protected $casts = [
        'legs_config' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'updated_at' => 'datetime',
        'turn_deadline_at' => 'datetime',
        'turn_timeout_pending' => 'boolean',
        'turn_timer_window_seconds' => 'integer',
        'exclude_from_stats' => 'boolean',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(GameRoom::class, 'room_id');
    }

    public function currentPlayer(): BelongsTo
    {
        return $this->belongsTo(RoomPlayer::class, 'current_player_id');
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(RoomPlayer::class, 'winner_player_id');
    }

    public function legs(): HasMany
    {
        return $this->hasMany(Leg::class, 'match_id')->orderBy('leg_number');
    }

    public function currentLeg(): HasOne
    {
        return $this->hasOne(Leg::class, 'match_id')
            ->where('leg_number', $this->current_leg)
            ->where('set_number', $this->current_set);
    }

    public function turns(): HasMany
    {
        return $this->hasMany(Turn::class, 'match_id');
    }
}
