<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DartX01TurnEdit extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'match_id',
        'match_uuid',
        'leg_number',
        'turn_number',
        'player_id',
        'edited_by_user_id',
        'before_throws',
        'after_throws',
        'before_points_scored',
        'after_points_scored',
        'before_remaining_points',
        'after_remaining_points',
        'before_is_bust',
        'after_is_bust',
        'edited_at',
    ];

    protected function casts(): array
    {
        return [
            'before_throws' => 'array',
            'after_throws' => 'array',
            'before_is_bust' => 'boolean',
            'after_is_bust' => 'boolean',
            'edited_at' => 'datetime',
        ];
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(DartMatch::class, 'match_id');
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(MatchPlayer::class, 'player_id');
    }

    public function editedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'edited_by_user_id');
    }
}
