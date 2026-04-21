<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Turn extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'match_id', 'leg_id', 'player_id', 'turn_number',
        'score_before', 'score_after', 'total_scored',
        'is_bust', 'is_checkout', 'is_undone',
    ];

    protected $casts = [
        'is_bust' => 'boolean',
        'is_checkout' => 'boolean',
        'is_undone' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function match(): BelongsTo
    {
        return $this->belongsTo(GameMatch::class, 'match_id');
    }

    public function leg(): BelongsTo
    {
        return $this->belongsTo(Leg::class, 'leg_id');
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(RoomPlayer::class, 'player_id');
    }

    public function darts(): HasMany
    {
        return $this->hasMany(Dart::class, 'turn_id')->orderBy('dart_number');
    }
}
