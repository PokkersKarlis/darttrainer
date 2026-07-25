<?php

namespace Tests\Feature\Settings;

use App\Enums\FriendshipStatus;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FriendsTest extends TestCase
{
    use RefreshDatabase;

    public function test_friends_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/settings/friends')
            ->assertOk();
    }

    public function test_user_can_send_friend_invite_by_user_id(): void
    {
        $requester = User::factory()->create();
        $addressee = User::factory()->create(['email' => 'friend@example.com']);

        $this->actingAs($requester)
            ->post('/settings/friends', ['user_id' => $addressee->id])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/settings/friends')
            ->assertSessionHas('status', 'friendship-invite-sent');

        $this->assertDatabaseHas('friendships', [
            'requester_id' => $requester->id,
            'addressee_id' => $addressee->id,
            'status' => FriendshipStatus::Pending->value,
        ]);
    }

    public function test_user_can_search_players_by_name(): void
    {
        $viewer = User::factory()->create();
        $match = User::factory()->create(['name' => 'Karlis Ozols', 'email' => 'karlis@example.com']);
        User::factory()->create(['name' => 'Other Player', 'email' => 'other@example.com']);

        $this->actingAs($viewer)
            ->get('/settings/friends?q=karlis')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('searchQuery', 'karlis')
                ->has('searchResults', 1)
                ->where('searchResults.0.id', $match->id)
                ->where('searchResults.0.friendship_status', 'none'));
    }

    public function test_user_can_search_players_by_email(): void
    {
        $viewer = User::factory()->create();
        $match = User::factory()->create(['name' => 'Anna', 'email' => 'anna.b@example.com']);

        $this->actingAs($viewer)
            ->get('/settings/friends?q=anna.b@')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('searchResults', 1)
                ->where('searchResults.0.id', $match->id));
    }

    public function test_search_excludes_current_user(): void
    {
        $viewer = User::factory()->create(['name' => 'Self Search', 'email' => 'self@example.com']);

        $this->actingAs($viewer)
            ->get('/settings/friends?q=self')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('searchResults', []));
    }

    public function test_search_requires_at_least_two_characters(): void
    {
        $viewer = User::factory()->create();
        User::factory()->create(['name' => 'Long Name']);

        $this->actingAs($viewer)
            ->get('/settings/friends?q=a')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('searchResults', []));
    }

    public function test_search_shows_existing_friendship_status(): void
    {
        $viewer = User::factory()->create();
        $friend = User::factory()->create(['name' => 'Existing Friend']);

        Friendship::query()->create([
            'requester_id' => $viewer->id,
            'addressee_id' => $friend->id,
            'status' => FriendshipStatus::Accepted,
        ]);

        $this->actingAs($viewer)
            ->get('/settings/friends?q=existing')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('searchResults.0.friendship_status', 'friends'));
    }

    public function test_user_can_send_friend_invite(): void
    {
        $requester = User::factory()->create();
        $addressee = User::factory()->create(['email' => 'friend@example.com']);

        $this->actingAs($requester)
            ->post('/settings/friends', ['email' => 'friend@example.com'])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/settings/friends')
            ->assertSessionHas('status', 'friendship-invite-sent');

        $this->assertDatabaseHas('friendships', [
            'requester_id' => $requester->id,
            'addressee_id' => $addressee->id,
            'status' => FriendshipStatus::Pending->value,
        ]);
    }

    public function test_user_cannot_invite_self(): void
    {
        $user = User::factory()->create(['email' => 'me@example.com']);

        $this->actingAs($user)
            ->from('/settings/friends')
            ->post('/settings/friends', ['email' => 'me@example.com'])
            ->assertSessionHasErrors('email');
    }

    public function test_user_cannot_invite_unknown_email(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from('/settings/friends')
            ->post('/settings/friends', ['email' => 'missing@example.com'])
            ->assertSessionHasErrors('email');
    }

    public function test_addressee_can_accept_invite(): void
    {
        $requester = User::factory()->create();
        $addressee = User::factory()->create();

        $friendship = Friendship::query()->create([
            'requester_id' => $requester->id,
            'addressee_id' => $addressee->id,
            'status' => FriendshipStatus::Pending,
        ]);

        $this->actingAs($addressee)
            ->post("/settings/friends/{$friendship->id}/accept")
            ->assertRedirect('/settings/friends')
            ->assertSessionHas('status', 'friendship-accepted');

        $this->assertSame(FriendshipStatus::Accepted, $friendship->fresh()->status);
    }

    public function test_addressee_can_decline_invite(): void
    {
        $requester = User::factory()->create();
        $addressee = User::factory()->create();

        $friendship = Friendship::query()->create([
            'requester_id' => $requester->id,
            'addressee_id' => $addressee->id,
            'status' => FriendshipStatus::Pending,
        ]);

        $this->actingAs($addressee)
            ->post("/settings/friends/{$friendship->id}/decline")
            ->assertRedirect('/settings/friends')
            ->assertSessionHas('status', 'friendship-declined');

        $this->assertDatabaseMissing('friendships', ['id' => $friendship->id]);
    }

    public function test_requester_can_cancel_pending_invite(): void
    {
        $requester = User::factory()->create();
        $addressee = User::factory()->create();

        $friendship = Friendship::query()->create([
            'requester_id' => $requester->id,
            'addressee_id' => $addressee->id,
            'status' => FriendshipStatus::Pending,
        ]);

        $this->actingAs($requester)
            ->delete("/settings/friends/{$friendship->id}")
            ->assertRedirect('/settings/friends')
            ->assertSessionHas('status', 'friendship-cancelled');

        $this->assertDatabaseMissing('friendships', ['id' => $friendship->id]);
    }

    public function test_either_user_can_remove_accepted_friend(): void
    {
        $requester = User::factory()->create();
        $addressee = User::factory()->create();

        $friendship = Friendship::query()->create([
            'requester_id' => $requester->id,
            'addressee_id' => $addressee->id,
            'status' => FriendshipStatus::Accepted,
        ]);

        $this->actingAs($addressee)
            ->delete("/settings/friends/{$friendship->id}")
            ->assertRedirect('/settings/friends')
            ->assertSessionHas('status', 'friendship-removed');

        $this->assertDatabaseMissing('friendships', ['id' => $friendship->id]);
    }

    public function test_sending_invite_to_user_who_already_sent_one_auto_accepts(): void
    {
        $userA = User::factory()->create(['email' => 'a@example.com']);
        $userB = User::factory()->create(['email' => 'b@example.com']);

        Friendship::query()->create([
            'requester_id' => $userB->id,
            'addressee_id' => $userA->id,
            'status' => FriendshipStatus::Pending,
        ]);

        $this->actingAs($userA)
            ->post('/settings/friends', ['email' => 'b@example.com'])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/settings/friends')
            ->assertSessionHas('status', 'friendship-accepted');

        $this->assertDatabaseHas('friendships', [
            'requester_id' => $userB->id,
            'addressee_id' => $userA->id,
            'status' => FriendshipStatus::Accepted->value,
        ]);
    }

    public function test_pending_incoming_count_is_shared_with_inertia(): void
    {
        $requester = User::factory()->create();
        $addressee = User::factory()->create();

        Friendship::query()->create([
            'requester_id' => $requester->id,
            'addressee_id' => $addressee->id,
            'status' => FriendshipStatus::Pending,
        ]);

        $this->actingAs($addressee)
            ->get('/settings/profile')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('pendingFriendRequestsCount', 1));
    }

    public function test_non_participant_cannot_accept_invite(): void
    {
        $requester = User::factory()->create();
        $addressee = User::factory()->create();
        $stranger = User::factory()->create();

        $friendship = Friendship::query()->create([
            'requester_id' => $requester->id,
            'addressee_id' => $addressee->id,
            'status' => FriendshipStatus::Pending,
        ]);

        $this->actingAs($stranger)
            ->post("/settings/friends/{$friendship->id}/accept")
            ->assertForbidden();
    }
}
