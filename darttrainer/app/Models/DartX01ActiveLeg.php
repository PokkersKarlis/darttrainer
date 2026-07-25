<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DartX01ActiveLeg extends Model
{
    protected $fillable = [
        'match_id',
        'leg_number',
        'starting_points',
        'status',
        'winner_player_id',
    ];

    public function match(): BelongsTo
    {
        return $this->belongsTo(DartMatch::class, 'match_id');
    }

    public function soloTurns(): HasMany
    {
        return $this->hasMany(DartX01SoloActiveTurn::class, 'leg_id');
    }

    public function teamTurns(): HasMany
    {
        return $this->hasMany(DartX01TeamActiveTurn::class, 'leg_id');
    }
}
