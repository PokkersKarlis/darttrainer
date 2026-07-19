<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_see_welcome_on_home(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Welcome'));
    }

    public function test_authenticated_users_see_index_on_home(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Index'));
    }

    public function test_home_shares_email_verification_status_for_authenticated_users(): void
    {
        $verified = User::factory()->create();
        $unverified = User::factory()->unverified()->create([
            'email_verification_sent_at' => now()->subMinutes(5),
        ]);

        $this->actingAs($verified)
            ->get('/')
            ->assertInertia(fn ($page) => $page->where('emailVerified', true));

        $this->actingAs($unverified)
            ->get('/')
            ->assertInertia(fn ($page) => $page
                ->where('emailVerified', false)
                ->where('emailVerificationSentAt', fn ($value) => $value !== null));
    }
}
