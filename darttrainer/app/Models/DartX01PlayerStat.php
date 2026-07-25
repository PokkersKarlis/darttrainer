<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DartX01PlayerStat extends Model
{
    protected $fillable = [
        'user_id',
        'matches_played',
        'legs_won',
        'darts_thrown',
        'points_scored',
        'checkout_attempts',
        'checkout_successes',
        'three_dart_avg',
        'checkout_percentage',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
