<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class GameTenOfTen extends Model
{
    use HasFactory;

    protected $table = 'game_ten_of_tens';

    protected $guarded = [];

    public function activeElement(): HasOne
    {
        return $this->hasOne(GameTenOfTenElement::class, 'game_id')
            ->whereIn('darts_count', [-1, 0])
            ->orderByRaw('darts_count = -1 DESC, darts_count = 0 DESC, id ASC');
    }

    public function finishedElements(): HasMany
    {
        return $this->hasMany(GameTenOfTenElement::class, 'game_id')
            ->whereIn('darts_count', [-2, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
            ->orderBy('id', 'asc');
    }

    public function allElements(): HasMany
    {
        return $this->hasMany(GameTenOfTenElement::class, 'game_id');
    }

    public function lastUpdatedElement(): HasOne
    {
        return $this->hasOne(GameTenOfTenElement::class, 'game_id')
            ->whereIn('darts_count', [-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
            ->orderBy('id', 'desc');
    }
}
