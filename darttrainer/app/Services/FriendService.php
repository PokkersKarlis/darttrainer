<?php

namespace App\Services;

use App\Exceptions\FriendException;
use App\Models\FriendRequest;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Draugu biznesa loģika (meklēšana, saraksti, uzaicinājumi). Turēta atsevišķi no
 * kontroliera (DRY / plāns kontrolieris). Atgriež camelCase masīvus front-end pusei.
 */
class FriendService
{
    private const ONLINE_WINDOW_MINUTES = 15;

    /**
     * Lietotāju meklēšana pēc vārda/e-pasta (izņemot sevi un jau esošos draugus).
     *
     * @return array<int, array{id:int, name:string, email:string, relationship:string}>
     */
    public function search(int $me, string $query): array
    {
        $query = trim($query);
        if ($query === '') {
            return [];
        }

        $like = '%' . addcslashes($query, '%_\\') . '%';
        $friendIdSet = array_fill_keys(Friendship::friendUserIdsFor($me), true);

        $usersQuery = User::query()
            ->where('id', '!=', $me)
            ->where(fn ($q) => $q->where('name', 'like', $like)->orWhere('email', 'like', $like));

        if (Schema::hasColumn('users', 'is_banned')) {
            $usersQuery->where('is_banned', false);
        }

        $users = $usersQuery->orderBy('name')->limit(25)->get(['id', 'name', 'email']);

        $pendingTo = array_flip(
            FriendRequest::where('requester_id', $me)->where('status', 'pending')->pluck('addressee_id')->map('intval')->all()
        );
        $pendingFrom = array_flip(
            FriendRequest::where('addressee_id', $me)->where('status', 'pending')->pluck('requester_id')->map('intval')->all()
        );

        return $users
            ->reject(fn ($u) => isset($friendIdSet[(int) $u->id]))
            ->map(function ($u) use ($pendingTo, $pendingFrom) {
                $uid = (int) $u->id;

                return [
                    'id'           => $uid,
                    'name'         => $u->name,
                    'email'        => $u->email,
                    'relationship' => isset($pendingTo[$uid])
                        ? 'outgoing_pending'
                        : (isset($pendingFrom[$uid]) ? 'incoming_pending' : 'none'),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Draugu saraksts ar online statusu.
     *
     * @return array<int, array{id:int, name:string, isOnline:bool}>
     */
    public function friendsList(int $me): array
    {
        $ids = Friendship::friendUserIdsFor($me);
        if ($ids === []) {
            return [];
        }

        $since = now()->subMinutes(self::ONLINE_WINDOW_MINUTES)->getTimestamp();
        $onlineIds = array_fill_keys(
            DB::table('sessions')
                ->whereNotNull('user_id')
                ->where('last_activity', '>=', $since)
                ->whereIn('user_id', $ids)
                ->distinct()
                ->pluck('user_id')
                ->map(fn ($v) => (int) $v)
                ->all(),
            true
        );

        $usersQuery = User::query()->whereIn('id', $ids);
        if (Schema::hasColumn('users', 'is_banned')) {
            $usersQuery->where('is_banned', false);
        }

        return $usersQuery->orderBy('name')->get(['id', 'name'])
            ->map(fn ($u) => [
                'id'       => (int) $u->id,
                'name'     => $u->name,
                'isOnline' => isset($onlineIds[(int) $u->id]),
            ])
            ->values()
            ->all();
    }

    /**
     * Ienākošie (gaidošie) uzaicinājumi.
     *
     * @return array<int, array{id:int, user:array{id:int, name:string}}>
     */
    public function incoming(int $me): array
    {
        return FriendRequest::where('addressee_id', $me)
            ->where('status', 'pending')
            ->with('requester:id,name')
            ->orderByDesc('id')
            ->get()
            ->map(fn ($r) => [
                'id'   => (int) $r->id,
                'user' => ['id' => (int) $r->requester_id, 'name' => $r->requester->name ?? '?'],
            ])
            ->all();
    }

    /**
     * Izejošie uzaicinājumi (viens ieraksts katram adresātam, jaunākais).
     *
     * @return array<int, array{id:int, status:string, updatedAt:?string, user:array{id:int, name:string}}>
     */
    public function outgoing(int $me): array
    {
        return FriendRequest::where('requester_id', $me)
            ->whereIn('status', ['pending', 'accepted', 'rejected'])
            ->with('addressee:id,name')
            ->orderByDesc('updated_at')
            ->limit(80)
            ->get()
            ->unique('addressee_id')
            ->take(50)
            ->map(fn ($r) => [
                'id'        => (int) $r->id,
                'status'    => $r->status,
                'updatedAt' => $r->updated_at?->toIso8601String(),
                'user'      => ['id' => (int) $r->addressee_id, 'name' => $r->addressee->name ?? '?'],
            ])
            ->values()
            ->all();
    }

    /**
     * Nosūta draudzības uzaicinājumu.
     *
     * @throws FriendException
     */
    public function sendRequest(int $me, int $targetId): void
    {
        if ($targetId === $me) {
            throw new FriendException('Nevari nosūtīt sev.');
        }

        $otherQuery = User::whereKey($targetId);
        if (Schema::hasColumn('users', 'is_banned')) {
            $otherQuery->where('is_banned', false);
        }
        if (! $otherQuery->exists()) {
            throw new FriendException('Lietotājs nav atrasts.');
        }

        if (Friendship::areFriends($me, $targetId)) {
            throw new FriendException('Jau esat draugi.');
        }

        $pendingOut = FriendRequest::where('requester_id', $me)
            ->where('addressee_id', $targetId)->where('status', 'pending')->exists();
        if ($pendingOut) {
            throw new FriendException('Uzaicinājums jau nosūtīts.');
        }

        $pendingIn = FriendRequest::where('requester_id', $targetId)
            ->where('addressee_id', $me)->where('status', 'pending')->exists();
        if ($pendingIn) {
            throw new FriendException('Šis lietotājs jau nosūtīja tev uzaicinājumu — apstiprini to sarakstā.');
        }

        FriendRequest::create([
            'requester_id' => $me,
            'addressee_id' => $targetId,
            'status'       => 'pending',
        ]);
    }

    /**
     * Pieņem uzaicinājumu (izveido abpusēju draudzību).
     *
     * @throws FriendException
     */
    public function accept(int $me, FriendRequest $request): void
    {
        $this->assertAddressee($me, $request);

        DB::transaction(function () use ($request) {
            $request->update(['status' => 'accepted']);

            $a = (int) $request->requester_id;
            $b = (int) $request->addressee_id;
            $now = now();

            foreach ([[$a, $b], [$b, $a]] as [$u, $v]) {
                DB::table('friendships')->insertOrIgnore([
                    'user_id'        => $u,
                    'friend_user_id' => $v,
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ]);
            }
        });
    }

    /**
     * Noraida uzaicinājumu.
     *
     * @throws FriendException
     */
    public function reject(int $me, FriendRequest $request): void
    {
        $this->assertAddressee($me, $request);
        $request->update(['status' => 'rejected']);
    }

    /**
     * Noņem draudzību abos virzienos.
     *
     * @throws FriendException
     */
    public function removeFriend(int $me, int $otherId): void
    {
        if ($otherId === $me) {
            throw new FriendException('Nederīgs pieprasījums.');
        }
        if (! Friendship::areFriends($me, $otherId)) {
            throw new FriendException('Šis lietotājs nav tavā draugu sarakstā.');
        }

        DB::transaction(function () use ($me, $otherId) {
            FriendRequest::query()
                ->where('status', 'pending')
                ->where(function ($q) use ($me, $otherId) {
                    $q->where(fn ($q2) => $q2->where('requester_id', $me)->where('addressee_id', $otherId))
                        ->orWhere(fn ($q2) => $q2->where('requester_id', $otherId)->where('addressee_id', $me));
                })
                ->delete();

            Friendship::removePair($me, $otherId);
        });
    }

    /**
     * @throws FriendException
     */
    private function assertAddressee(int $me, FriendRequest $request): void
    {
        if ((int) $request->addressee_id !== $me) {
            throw new FriendException('Nav tiesību.');
        }
        if ($request->status !== 'pending') {
            throw new FriendException('Pieprasījums vairs nav aktīvs.');
        }
    }
}
