<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DartX01SoloArchivedThrow extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'match_uuid',
        'user_id',
        'leg_number',
        'turn_number',
        'throw_number',
        'sector',
        'multiplier',
        'points_scored',
        'is_bust',
        'is_leg_winner',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'is_bust' => 'boolean',
            'is_leg_winner' => 'boolean',
            'archived_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
