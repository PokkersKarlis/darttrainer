<?php

namespace App\Models;

use App\Notifications\TrainDartVerifyEmail;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, MustVerifyEmailTrait, Notifiable;

    /**
     * Pielāgota vēstule (resources/views/mail/verify-email.blade.php), nevis Laravel Markdown noklusējums.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new TrainDartVerifyEmail);
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    public const ACCOUNT_PLAYER = 'player';

    public const ACCOUNT_CLUB = 'club';

    protected $fillable = [
        'name',
        'email',
        'account_type',
        'club_name',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
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
            'password' => 'hashed',
            'is_admin'  => 'boolean',
            'is_banned' => 'boolean',
        ];
    }
}
