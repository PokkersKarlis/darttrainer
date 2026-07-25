<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DartX01SoloActiveTurn extends Model
{
    protected $fillable = [
        'leg_id',
        'player_id',
        'guest_id',
        'guest_name',
        'turn_number',
        'points_scored',
        'double_attempts',
        'is_bust',
        'remaining_points',
    ];

    protected function casts(): array
    {
        return [
            'is_bust' => 'boolean',
        ];
    }

    public function leg(): BelongsTo
    {
        return $this->belongsTo(DartX01ActiveLeg::class, 'leg_id');
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(MatchPlayer::class, 'player_id');
    }

    public function throws(): HasMany
    {
        return $this->hasMany(DartX01SoloActiveThrow::class, 'turn_id');
    }
}
