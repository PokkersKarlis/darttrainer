<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tournament extends Model
{
    protected $fillable = ['name', 'format', 'status', 'created_by', 'config'];

    protected $casts = ['config' => 'array'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tournamentMatches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class)->orderBy('round')->orderBy('position');
    }

    public function matchesInRound(int $round): HasMany
    {
        return $this->hasMany(TournamentMatch::class)
            ->where('round', $round)
            ->orderBy('position');
    }
}
