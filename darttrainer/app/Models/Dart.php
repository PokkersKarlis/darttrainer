<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dart extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'turn_id', 'dart_number', 'segment', 'multiplier', 'value',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function turn(): BelongsTo
    {
        return $this->belongsTo(Turn::class, 'turn_id');
    }

    public function getLabel(): string
    {
        if ($this->segment === 0 || $this->multiplier === 0) {
            return 'Miss';
        }
        if ($this->segment === 25 && $this->multiplier === 2) {
            return 'Bull';
        }
        if ($this->segment === 25) {
            return 'Outer Bull';
        }

        return match ($this->multiplier) {
            2 => 'D' . $this->segment,
            3 => 'T' . $this->segment,
            default => (string) $this->segment,
        };
    }
}
