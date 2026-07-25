<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DartX01TeamActiveTurn extends Model
{
    protected $fillable = [
        'leg_id',
        'team_id',
        'player_id',
        'turn_number',
        'points_scored',
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
        return $this->hasMany(DartX01TeamActiveThrow::class, 'turn_id');
    }
}
