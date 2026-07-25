<?php

namespace App\Http\Controllers\Settings;

use App\Enums\FriendshipStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\FriendInviteRequest;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class FriendController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $searchQuery = trim($request->string('q')->toString());

        return Inertia::render('settings/Friends', [
            'friends' => $this->acceptedFriends($user),
            'incoming' => $this->pendingIncoming($user),
            'outgoing' => $this->pendingOutgoing($user),
            'searchQuery' => $searchQuery,
            'searchResults' => $this->searchUsers($user, $searchQuery),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(FriendInviteRequest $request): RedirectResponse
    {
        $user = $request->user();
        $addressee = $this->resolveAddressee($request);

        if ($addressee === null) {
            throw ValidationException::withMessages([
                'email' => ['friendship-not-found'],
            ]);
        }

        return $this->sendInvite($user, $addressee);
    }

    public function accept(Request $request, Friendship $friendship): RedirectResponse
    {
        $user = $request->user();
        $this->ensureParticipant($user, $friendship);

        if (! $friendship->isPending() || $friendship->addressee_id !== $user->id) {
            abort(403);
        }

        $friendship->accept();

        return to_route('friends.edit')->with('status', 'friendship-accepted');
    }

    public function decline(Request $request, Friendship $friendship): RedirectResponse
    {
        $user = $request->user();
        $this->ensureParticipant($user, $friendship);

        if (! $friendship->isPending() || $friendship->addressee_id !== $user->id) {
            abort(403);
        }

        $friendship->delete();

        return to_route('friends.edit')->with('status', 'friendship-declined');
    }

    public function destroy(Request $request, Friendship $friendship): RedirectResponse
    {
        $user = $request->user();
        $this->ensureParticipant($user, $friendship);

        if ($friendship->isPending()) {
            if ($friendship->requester_id !== $user->id) {
                abort(403);
            }

            $friendship->delete();

            return to_route('friends.edit')->with('status', 'friendship-cancelled');
        }

        if ($friendship->isAccepted()) {
            $friendship->delete();

            return to_route('friends.edit')->with('status', 'friendship-removed');
        }

        abort(403);
    }

    private function sendInvite(User $requester, User $addressee): RedirectResponse
    {
        if ($requester->id === $addressee->id) {
            throw ValidationException::withMessages([
                'email' => ['friendship-self'],
            ]);
        }

        $existing = Friendship::findBetween($requester, $addressee);

        if ($existing !== null) {
            if ($existing->isAccepted()) {
                throw ValidationException::withMessages([
                    'email' => ['friendship-already-friends'],
                ]);
            }

            if ($existing->isPending()) {
                if ($existing->requester_id === $addressee->id) {
                    $existing->accept();

                    return to_route('friends.edit')->with('status', 'friendship-accepted');
                }

                throw ValidationException::withMessages([
                    'email' => ['friendship-already-sent'],
                ]);
            }
        }

        Friendship::query()->create([
            'requester_id' => $requester->id,
            'addressee_id' => $addressee->id,
            'status' => FriendshipStatus::Pending,
        ]);

        return to_route('friends.edit')->with('status', 'friendship-invite-sent');
    }

    private function resolveAddressee(FriendInviteRequest $request): ?User
    {
        if ($request->filled('user_id')) {
            return User::query()->find($request->integer('user_id'));
        }

        $email = strtolower((string) $request->validated('email'));

        return User::query()->whereRaw('LOWER(email) = ?', [$email])->first();
    }

    /**
     * @return list<array{
     *     id: int,
     *     name: string,
     *     email: string,
     *     friendship_status: string,
     *     friendship_id: int|null
     * }>
     */
    private function searchUsers(User $viewer, string $query): array
    {
        if (mb_strlen($query) < 2) {
            return [];
        }

        $needle = '%'.addcslashes(mb_strtolower($query), '%_\\').'%';

        return User::query()
            ->where('id', '!=', $viewer->id)
            ->where(function ($builder) use ($needle): void {
                $builder->whereRaw('LOWER(name) LIKE ?', [$needle])
                    ->orWhereRaw('LOWER(email) LIKE ?', [$needle]);
            })
            ->orderBy('name')
            ->limit(10)
            ->get()
            ->map(fn (User $candidate) => $this->serializeSearchResult($viewer, $candidate))
            ->values()
            ->all();
    }

    /**
     * @return array{
     *     id: int,
     *     name: string,
     *     email: string,
     *     friendship_status: string,
     *     friendship_id: int|null
     * }
     */
    private function serializeSearchResult(User $viewer, User $candidate): array
    {
        $friendship = Friendship::findBetween($viewer, $candidate);
        $status = 'none';
        $friendshipId = null;

        if ($friendship !== null) {
            $friendshipId = $friendship->id;

            if ($friendship->isAccepted()) {
                $status = 'friends';
            } elseif ($friendship->isPending()) {
                $status = $friendship->requester_id === $viewer->id
                    ? 'pending_outgoing'
                    : 'pending_incoming';
            }
        }

        return [
            'id' => $candidate->id,
            'name' => $candidate->name,
            'email' => $candidate->email,
            'friendship_status' => $status,
            'friendship_id' => $friendshipId,
        ];
    }

    /**
     * @return list<array{id: int, user: array{id: int, name: string, email: string}, created_at: string}>
     */
    private function acceptedFriends(User $user): array
    {
        return Friendship::query()
            ->with(['requester', 'addressee'])
            ->where('status', FriendshipStatus::Accepted)
            ->where(function ($query) use ($user): void {
                $query->where('requester_id', $user->id)
                    ->orWhere('addressee_id', $user->id);
            })
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Friendship $friendship) => $this->serializeFriendship($friendship, $user))
            ->values()
            ->all();
    }

    /**
     * @return list<array{id: int, user: array{id: int, name: string, email: string}, created_at: string}>
     */
    private function pendingIncoming(User $user): array
    {
        return Friendship::query()
            ->with('requester')
            ->where('addressee_id', $user->id)
            ->where('status', FriendshipStatus::Pending)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Friendship $friendship) => [
                'id' => $friendship->id,
                'user' => $this->serializeUser($friendship->requester),
                'created_at' => $friendship->created_at?->toIso8601String() ?? '',
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{id: int, user: array{id: int, name: string, email: string}, created_at: string}>
     */
    private function pendingOutgoing(User $user): array
    {
        return Friendship::query()
            ->with('addressee')
            ->where('requester_id', $user->id)
            ->where('status', FriendshipStatus::Pending)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Friendship $friendship) => [
                'id' => $friendship->id,
                'user' => $this->serializeUser($friendship->addressee),
                'created_at' => $friendship->created_at?->toIso8601String() ?? '',
            ])
            ->values()
            ->all();
    }

    /**
     * @return array{id: int, user: array{id: int, name: string, email: string}, created_at: string}
     */
    private function serializeFriendship(Friendship $friendship, User $viewer): array
    {
        return [
            'id' => $friendship->id,
            'user' => $this->serializeUser($friendship->otherUser($viewer)),
            'created_at' => $friendship->updated_at?->toIso8601String() ?? '',
        ];
    }

    /**
     * @return array{id: int, name: string, email: string}
     */
    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }

    private function ensureParticipant(User $user, Friendship $friendship): void
    {
        if ($friendship->requester_id !== $user->id && $friendship->addressee_id !== $user->id) {
            abort(403);
        }
    }
}
