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

        return Inertia::render('settings/Friends', [
            'friends' => $this->acceptedFriends($user),
            'incoming' => $this->pendingIncoming($user),
            'outgoing' => $this->pendingOutgoing($user),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(FriendInviteRequest $request): RedirectResponse
    {
        $user = $request->user();
        $email = strtolower($request->validated('email'));

        if (strtolower($user->email) === $email) {
            throw ValidationException::withMessages([
                'email' => ['friendship-self'],
            ]);
        }

        $addressee = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();

        if ($addressee === null) {
            throw ValidationException::withMessages([
                'email' => ['friendship-not-found'],
            ]);
        }

        $existing = Friendship::findBetween($user, $addressee);

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
            'requester_id' => $user->id,
            'addressee_id' => $addressee->id,
            'status' => FriendshipStatus::Pending,
        ]);

        return to_route('friends.edit')->with('status', 'friendship-invite-sent');
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
