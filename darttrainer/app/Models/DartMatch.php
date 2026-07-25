<?php

namespace App\Models;

use App\Enums\GameType;
use App\Enums\MatchStatus;
use App\Enums\MatchType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class DartMatch extends Model
{
    protected $table = 'matches';

    protected $fillable = [
        'uuid',
        'lobby_code',
        'game_type',
        'match_type',
        'status',
        'tournament_id',
        'winner_id',
        'host_user_id',
        'turn_timer_player_id',
        'turn_timer_expires_at',
        'turn_timer_status',
        'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'game_type' => GameType::class,
            'match_type' => MatchType::class,
            'status' => MatchStatus::class,
            'finished_at' => 'datetime',
            'turn_timer_expires_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (DartMatch $match): void {
            if ($match->uuid === null) {
                $match->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function players(): HasMany
    {
        return $this->hasMany(MatchPlayer::class, 'match_id');
    }

    public function config(): HasOne
    {
        return $this->hasOne(DartX01MatchConfig::class, 'match_id');
    }

    public function legs(): HasMany
    {
        return $this->hasMany(DartX01ActiveLeg::class, 'match_id');
    }

    public function activeLeg(): HasOne
    {
        return $this->hasOne(DartX01ActiveLeg::class, 'match_id')->where('status', 'active');
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(MatchChatMessage::class, 'match_id');
    }
}
