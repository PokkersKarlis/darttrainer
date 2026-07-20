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
