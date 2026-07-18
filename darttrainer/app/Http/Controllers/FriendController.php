<?php

namespace App\Http\Controllers;

use App\Exceptions\FriendException;
use App\Http\Requests\Friend\SendFriendRequestRequest;
use App\Models\FriendRequest;
use App\Models\User;
use App\Services\FriendService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Draugi (Inertia). Tievs kontrolieris — biznesa loģika FriendService klasē.
 * Meklēšana notiek caur Inertia daļējo pārlādi (only: ['searchResults']).
 */
class FriendController extends Controller
{
    public function __construct(private readonly FriendService $friends) {}

    public function index(Request $request): Response
    {
        $me = (int) Auth::id();
        $query = trim((string) $request->query('q', ''));

        return Inertia::render('Friends', [
            // Slinkie props (closures): daļējā pārlāde izsauc tikai vajadzīgos.
            'friends'       => fn () => $this->friends->friendsList($me),
            'incoming'      => fn () => $this->friends->incoming($me),
            'outgoing'      => fn () => $this->friends->outgoing($me),
            'searchResults' => fn () => $query !== '' ? $this->friends->search($me, $query) : [],
            'query'         => $query,
        ]);
    }

    public function store(SendFriendRequestRequest $request): RedirectResponse
    {
        try {
            $this->friends->sendRequest((int) Auth::id(), (int) $request->validated('userId'));
        } catch (FriendException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Uzaicinājums nosūtīts.');
    }

    public function accept(FriendRequest $friendRequest): RedirectResponse
    {
        try {
            $this->friends->accept((int) Auth::id(), $friendRequest);
        } catch (FriendException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Uzaicinājums pieņemts.');
    }

    public function reject(FriendRequest $friendRequest): RedirectResponse
    {
        try {
            $this->friends->reject((int) Auth::id(), $friendRequest);
        } catch (FriendException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Uzaicinājums noraidīts.');
    }

    public function destroy(User $user): RedirectResponse
    {
        try {
            $this->friends->removeFriend((int) Auth::id(), (int) $user->id);
        } catch (FriendException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Draugs noņemts.');
    }
}
