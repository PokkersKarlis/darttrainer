<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchPlayer extends Model
{
    protected $fillable = [
        'match_id',
        'user_id',
        'guest_id',
        'guest_email',
        'display_name',
        'starting_points',
        'slot',
        'team_id',
        'status',
        'scoring_mode',
        'stats_tier',
    ];

    protected function casts(): array
    {
        return [];
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(DartMatch::class, 'match_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
