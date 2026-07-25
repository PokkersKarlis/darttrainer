<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DartX01TeamActiveThrow extends Model
{
    protected $fillable = [
        'turn_id',
        'throw_number',
        'sector',
        'multiplier',
        'is_leg_winner',
    ];

    protected function casts(): array
    {
        return [
            'is_leg_winner' => 'boolean',
        ];
    }

    public function turn(): BelongsTo
    {
        return $this->belongsTo(DartX01TeamActiveTurn::class, 'turn_id');
    }
}
