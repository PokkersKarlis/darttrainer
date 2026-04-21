<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Leg extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'match_id', 'leg_number', 'set_number', 'starting_score',
        'winner_player_id', 'started_at', 'finished_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function match(): BelongsTo
    {
        return $this->belongsTo(GameMatch::class, 'match_id');
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(RoomPlayer::class, 'winner_player_id');
    }

    public function turns(): HasMany
    {
        return $this->hasMany(Turn::class, 'leg_id')->orderBy('turn_number');
    }

    public function cricketStates(): HasMany
    {
        return $this->hasMany(CricketState::class, 'leg_id');
    }
}
