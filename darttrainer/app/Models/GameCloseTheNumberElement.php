<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameCloseTheNumberElement extends Model
{
    use HasFactory;

    protected $table = 'game_close_the_number_elements';

    protected $guarded = [];

    public function game(): BelongsTo
    {
        return $this->belongsTo(GameCloseTheNumber::class, 'game_id');
    }
}
