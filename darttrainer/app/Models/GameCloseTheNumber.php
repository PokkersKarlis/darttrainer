<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class GameCloseTheNumber extends Model
{
    use HasFactory;

    protected $table = 'game_close_the_numbers';

    protected $guarded = [];

    public function activeElement(): HasOne
    {
        return $this->hasOne(GameCloseTheNumberElement::class, 'game_id')
            ->whereIn('darts_count', [-1, 0])
            ->orderByRaw('darts_count = -1 DESC, darts_count = 0 DESC, given_number ASC');
    }

    public function finishedElements(): HasMany
    {
        return $this->hasMany(GameCloseTheNumberElement::class, 'game_id')
            ->whereIn('darts_count', [-2, 1, 2, 3, 4, 5, 6])
            ->orderBy('given_number', 'asc');
    }

    public function allElements(): HasMany
    {
        return $this->hasMany(GameCloseTheNumberElement::class, 'game_id');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'id', 'player_id');
    }

    public function lastUpdatedElement(): HasOne
    {
        return $this->hasOne(GameCloseTheNumberElement::class, 'game_id')
            ->whereIn('darts_count', [-2, -1, 1, 2, 3, 4, 5, 6])
            ->orderBy('id', 'desc');
    }
}
