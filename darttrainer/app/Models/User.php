<?php

namespace App\Models;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'locale',
        'is_admin',
        'is_banned',
        'ban_reason',
        'account_type',
        'club_name',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'email_verification_sent_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmail);

        $this->forceFill([
            'email_verification_sent_at' => $this->freshTimestamp(),
        ])->save();
    }

    public function friendshipsAsRequester(): HasMany
    {
        return $this->hasMany(Friendship::class, 'requester_id');
    }

    public function friendshipsAsAddressee(): HasMany
    {
        return $this->hasMany(Friendship::class, 'addressee_id');
    }

    public function pendingFriendRequestsCount(): int
    {
        return Friendship::pendingIncomingCountFor($this);
    }
}
