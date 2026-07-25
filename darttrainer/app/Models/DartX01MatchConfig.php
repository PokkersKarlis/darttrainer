<?php

namespace App\Models;

use App\Enums\LobbyMode;
use App\Enums\X01Format;
use App\Enums\X01ScoringRule;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DartX01MatchConfig extends Model
{
    protected $fillable = [
        'match_id',
        'mode',
        'format',
        'legs_target',
        'sets_target',
        'starting_points',
        'in_rule',
        'out_rule',
        'track_checkout_rate',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'mode' => LobbyMode::class,
            'format' => X01Format::class,
            'in_rule' => X01ScoringRule::class,
            'out_rule' => X01ScoringRule::class,
            'track_checkout_rate' => 'boolean',
            'is_public' => 'boolean',
        ];
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(DartMatch::class, 'match_id');
    }
}
