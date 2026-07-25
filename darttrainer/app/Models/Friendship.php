<?php

namespace App\Models;

use App\Enums\FriendshipStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Friendship extends Model
{
    protected $fillable = [
        'requester_id',
        'addressee_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => FriendshipStatus::class,
        ];
    }

    /**
     * @param  Builder<Friendship>  $query
     */
    public function scopeBetweenUsers(Builder $query, User $first, User $second): Builder
    {
        return $query->where(function (Builder $query) use ($first, $second): void {
            $query
                ->where(function (Builder $query) use ($first, $second): void {
                    $query->where('requester_id', $first->id)
                        ->where('addressee_id', $second->id);
                })
                ->orWhere(function (Builder $query) use ($first, $second): void {
                    $query->where('requester_id', $second->id)
                        ->where('addressee_id', $first->id);
                });
        });
    }

    public static function findBetween(User $first, User $second): ?self
    {
        return static::query()->betweenUsers($first, $second)->first();
    }

    public static function pendingIncomingCountFor(User $user): int
    {
        return static::query()
            ->where('addressee_id', $user->id)
            ->where('status', FriendshipStatus::Pending)
            ->count();
    }

    public function isPending(): bool
    {
        return $this->status === FriendshipStatus::Pending;
    }

    public function isAccepted(): bool
    {
        return $this->status === FriendshipStatus::Accepted;
    }

    public function accept(): void
    {
        $this->forceFill(['status' => FriendshipStatus::Accepted])->save();
    }

    public function otherUser(User $viewer): User
    {
        return $this->requester_id === $viewer->id
            ? $this->addressee
            : $this->requester;
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function addressee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'addressee_id');
    }
}
