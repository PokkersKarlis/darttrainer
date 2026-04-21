<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameX01Training extends Model
{
    protected $table = 'game_x01_training';

    protected $fillable = [
        'player_id',
        'session_id',
        'variant',
        'out_mode',
        'in_mode',
        'current_score',
        'turns',
        'finished',
    ];

    protected $casts = [
        'turns'    => 'array',
        'finished' => 'boolean',
    ];
}
