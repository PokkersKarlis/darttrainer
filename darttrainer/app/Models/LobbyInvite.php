<?php

namespace App\Models;

use App\Enums\LobbyInviteStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LobbyInvite extends Model
{
    protected $fillable = [
        'match_id',
        'inviter_id',
        'invitee_id',
        'status',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => LobbyInviteStatus::class,
            'expires_at' => 'datetime',
        ];
    }

    public function isPending(): bool
    {
        return $this->status === LobbyInviteStatus::Pending;
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(DartMatch::class, 'match_id');
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inviter_id');
    }

    public function invitee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invitee_id');
    }
}
