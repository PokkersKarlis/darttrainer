<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * API maršrutu autentifikācija, e-pasta apstiprinājuma un admin aizsardzība.
 */
class ApiAuthAndSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_auth_me_returns_null_user(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJson(['user' => null]);
    }

    public function test_guest_cannot_call_protected_friends_routes(): void
    {
        $this->getJson('/api/friends')->assertUnauthorized();
        $this->getJson('/api/friends/search?q=ab')->assertUnauthorized();
    }

    public function test_guest_cannot_logout(): void
    {
        $this->postJson('/api/auth/logout')->assertUnauthorized();
    }

    public function test_authenticated_unverified_user_gets_403_on_verified_routes(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user, 'web');

        $this->getJson('/api/friends')
            ->assertStatus(403)
            ->assertJsonPath('code', 'email_unverified');

        $this->getJson('/api/friends/search?q=te')
            ->assertStatus(403)
            ->assertJsonPath('code', 'email_unverified');
    }

    public function test_resend_verification_requires_authentication(): void
    {
        $this->postJson('/api/auth/email/resend')->assertUnauthorized();
    }

    public function test_public_routes_accessible_without_auth(): void
    {
        $this->getJson('/api/csrf-cookie')->assertNoContent();
        $this->getJson('/api/public/home-summary')->assertOk();
        $this->getJson('/api/training/x01/state')->assertOk();
    }

    public function test_leaderboard_requires_game_type(): void
    {
        $this->getJson('/api/stats/leaderboard')->assertStatus(422);
        $this->getJson('/api/stats/leaderboard?game_type=cricket&limit=5')->assertOk();
    }
}
