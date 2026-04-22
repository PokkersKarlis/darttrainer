<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminApiSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_api(): void
    {
        $this->getJson('/api/admin/overview')->assertUnauthorized();
    }

    public function test_normal_user_cannot_access_admin_api(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user, 'web');

        $this->getJson('/api/admin/overview')
            ->assertStatus(403)
            ->assertJsonFragment(['message' => 'Forbidden.']);
    }

    public function test_unverified_admin_still_blocked_by_verified_email_middleware(): void
    {
        $user = User::factory()->unverified()->create(['is_admin' => true]);

        $this->actingAs($user, 'web');

        $this->getJson('/api/admin/overview')
            ->assertStatus(403)
            ->assertJsonPath('code', 'email_unverified');
    }

    public function test_verified_admin_can_read_overview(): void
    {
        $admin = User::factory()->create(['is_admin' => true, 'email_verified_at' => now()]);

        $this->actingAs($admin, 'web');

        $this->getJson('/api/admin/overview')
            ->assertOk()
            ->assertJsonStructure(['users_total', 'active_players', 'games_total', 'matches_active', 'analytics', 'build']);
    }
}
