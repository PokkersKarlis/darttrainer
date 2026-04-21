<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FriendRequest;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FriendController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if (mb_strlen($q) < 1) {
            return response()->json(['items' => []]);
        }

        $me = (int) Auth::id();
        $like = '%' . addcslashes($q, '%_\\') . '%';

        $friendIdSet = array_fill_keys(Friendship::friendUserIdsFor($me), true);

        $usersQuery = User::query()
            ->where('id', '!=', $me)
            ->where(function ($qq) use ($like) {
                $qq->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like);
            });

        if (Schema::hasColumn('users', 'is_banned')) {
            $usersQuery->where('is_banned', false);
        }

        $users = $usersQuery
            ->orderBy('name')
            ->limit(25)
            ->get(['id', 'name']);

        $pendingTo = array_map('intval', FriendRequest::where('requester_id', $me)->where('status', 'pending')->pluck('addressee_id')->all());
        $pendingFrom = array_map('intval', FriendRequest::where('addressee_id', $me)->where('status', 'pending')->pluck('requester_id')->all());
        $pendingToFlip = array_flip($pendingTo);
        $pendingFromFlip = array_flip($pendingFrom);

        $items = $users
            ->filter(fn ($u) => !isset($friendIdSet[(int) $u->id]))
            ->values()
            ->map(function ($u) use ($pendingToFlip, $pendingFromFlip) {
                $uid = (int) $u->id;

                return [
                    'id' => $uid,
                    'name' => $u->name,
                    'relationship' => isset($pendingToFlip[$uid])
                        ? 'outgoing_pending'
                        : (isset($pendingFromFlip[$uid]) ? 'incoming_pending' : 'none'),
                ];
            });

        return response()->json(['items' => $items]);
    }

    public function index(): JsonResponse
    {
        $me = (int) Auth::id();
        $ids = Friendship::friendUserIdsFor($me);

        if ($ids === []) {
            return response()->json(['items' => []]);
        }

        $usersQuery = User::query()
            ->whereIn('id', $ids);

        if (Schema::hasColumn('users', 'is_banned')) {
            $usersQuery->where('is_banned', false);
        }

        $users = $usersQuery->orderBy('name')->get(['id', 'name']);

        return response()->json([
            'items' => $users->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
            ])->values(),
        ]);
    }

    public function incoming(): JsonResponse
    {
        $me = (int) Auth::id();
        $rows = FriendRequest::where('addressee_id', $me)
            ->where('status', 'pending')
            ->with('requester:id,name')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'items' => $rows->map(fn ($r) => [
                'id' => $r->id,
                'user' => ['id' => $r->requester_id, 'name' => $r->requester->name ?? '?'],
            ]),
        ]);
    }

    public function outgoing(): JsonResponse
    {
        $me = (int) Auth::id();
        $rows = FriendRequest::where('requester_id', $me)
            ->whereIn('status', ['pending', 'accepted', 'rejected'])
            ->with('addressee:id,name')
            ->orderByDesc('updated_at')
            ->limit(80)
            ->get()
            // Viens ieraksts katram adresātam — saglabā jaunāko (pēc updated_at dilstošās kārtas).
            ->unique('addressee_id')
            ->values()
            ->take(50);

        return response()->json([
            'items' => $rows->map(fn ($r) => [
                'id' => $r->id,
                'status' => $r->status,
                'updated_at' => $r->updated_at?->toIso8601String(),
                'user' => ['id' => $r->addressee_id, 'name' => $r->addressee->name ?? '?'],
            ]),
        ]);
    }

    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $target = (int) $data['user_id'];
        $me = (int) Auth::id();

        if ($target === $me) {
            return response()->json(['error' => 'Nevari nosūtīt sev.'], 422);
        }

        $otherQuery = User::whereKey($target);
        if (Schema::hasColumn('users', 'is_banned')) {
            $otherQuery->where('is_banned', false);
        }
        $other = $otherQuery->first();
        if (!$other) {
            return response()->json(['error' => 'Lietotājs nav atrasts.'], 404);
        }

        if (Friendship::areFriends($me, $target)) {
            return response()->json(['error' => 'Jau esat draugi.'], 409);
        }

        if (FriendRequest::where('requester_id', $me)->where('addressee_id', $target)->where('status', 'pending')->exists()) {
            return response()->json(['error' => 'Uzaicinājums jau nosūtīts.'], 409);
        }

        if (FriendRequest::where('requester_id', $target)->where('addressee_id', $me)->where('status', 'pending')->exists()) {
            return response()->json(['error' => 'Šis lietotājs jau nosūtīja tev uzaicinājumu — apstiprini to paziņojumos.'], 409);
        }

        $req = FriendRequest::create([
            'requester_id' => $me,
            'addressee_id' => $target,
            'status' => 'pending',
        ]);

        return response()->json([
            'id' => $req->id,
            'user' => ['id' => $other->id, 'name' => $other->name],
            'status' => 'pending',
        ], 201);
    }

    public function accept(FriendRequest $friendRequest): JsonResponse
    {
        $me = (int) Auth::id();
        if ((int) $friendRequest->addressee_id !== $me) {
            return response()->json(['error' => 'Nav tiesību.'], 403);
        }
        if ($friendRequest->status !== 'pending') {
            return response()->json(['error' => 'Pieprasījums vairs nav aktīvs.'], 409);
        }

        DB::transaction(function () use ($friendRequest) {
            $friendRequest->status = 'accepted';
            $friendRequest->save();

            $a = (int) $friendRequest->requester_id;
            $b = (int) $friendRequest->addressee_id;
            $now = now();

            foreach ([[$a, $b], [$b, $a]] as [$u, $v]) {
                DB::table('friendships')->insertOrIgnore([
                    'user_id'         => $u,
                    'friend_user_id'  => $v,
                    'created_at'      => $now,
                    'updated_at'      => $now,
                ]);
            }
        });

        return response()->json(['ok' => true, 'status' => 'accepted']);
    }

    public function reject(FriendRequest $friendRequest): JsonResponse
    {
        $me = (int) Auth::id();
        if ((int) $friendRequest->addressee_id !== $me) {
            return response()->json(['error' => 'Nav tiesību.'], 403);
        }
        if ($friendRequest->status !== 'pending') {
            return response()->json(['error' => 'Pieprasījums vairs nav aktīvs.'], 409);
        }

        $friendRequest->status = 'rejected';
        $friendRequest->save();

        return response()->json(['ok' => true, 'status' => 'rejected']);
    }

    /**
     * Noņem draudzību ar norādīto lietotāju (abas virzienas). Var izsaukt jebkurš no diviem.
     */
    public function destroy(int $user): JsonResponse
    {
        $other = (int) $user;
        $me = (int) Auth::id();

        if ($other === $me) {
            return response()->json(['error' => 'Nederīgs pieprasījums.'], 422);
        }

        if (!Friendship::areFriends($me, $other)) {
            return response()->json(['error' => 'Šis lietotājs nav tavā draugu sarakstā.'], 404);
        }

        DB::transaction(function () use ($me, $other) {
            FriendRequest::query()
                ->where('status', 'pending')
                ->where(function ($q) use ($me, $other) {
                    $q->where(fn ($q2) => $q2->where('requester_id', $me)->where('addressee_id', $other))
                        ->orWhere(fn ($q2) => $q2->where('requester_id', $other)->where('addressee_id', $me));
                })
                ->delete();

            Friendship::removePair($me, $other);
        });

        return response()->json(['ok' => true]);
    }
}
