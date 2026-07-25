<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DartX01SoloActiveThrow extends Model
{
    protected $fillable = [
        'turn_id',
        'throw_number',
        'sector',
        'multiplier',
        'input_source',
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
        return $this->belongsTo(DartX01SoloActiveTurn::class, 'turn_id');
    }

    public function points(): int
    {
        if ($this->multiplier === 0) {
            return 0;
        }

        return $this->sector * $this->multiplier;
    }
}
