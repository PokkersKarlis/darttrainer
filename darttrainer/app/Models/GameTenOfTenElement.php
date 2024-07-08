<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameTenOfTenElement extends Model
{
    use HasFactory;

    protected $table = 'game_ten_of_ten_elements';

    protected $guarded = [];

    public function game(): BelongsTo
    {
        return $this->belongsTo(GameTenOfTen::class, 'game_id');
    }
}
