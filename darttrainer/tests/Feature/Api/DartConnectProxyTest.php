<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DartConnectProxyTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_connectivity_check(): void
    {
        $this->getJson('/api/integrations/dartconnect/connectivity-check')->assertUnauthorized();
    }

    public function test_unverified_user_cannot_access_connectivity_check(): void
    {
        $user = User::factory()->unverified()->create();
        $this->actingAs($user, 'web');

        $this->getJson('/api/integrations/dartconnect/connectivity-check')
            ->assertStatus(403)
            ->assertJsonPath('code', 'email_unverified');
    }

    public function test_verified_user_connectivity_check_ok_when_upstream_responds(): void
    {
        Http::fake([
            'https://tv.dartconnect.com/api/event/dartconnect/search-suggestions' => Http::response(['items' => []], 200),
        ]);

        $user = User::factory()->create();
        $this->actingAs($user, 'web');

        $this->getJson('/api/integrations/dartconnect/connectivity-check')
            ->assertOk()
            ->assertJsonPath('data.ok', true)
            ->assertJsonPath('data.upstream_status', 200)
            ->assertJsonPath('errors', null);
    }

    public function test_guest_cannot_proxy_dartconnect_search(): void
    {
        $this->postJson('/api/integrations/dartconnect/event-search-suggestions', [
            'search' => 'test',
        ])->assertUnauthorized();
    }

    public function test_unverified_user_is_blocked(): void
    {
        $user = User::factory()->unverified()->create();
        $this->actingAs($user, 'web');

        $this->postJson('/api/integrations/dartconnect/event-search-suggestions', [
            'search' => 'test',
        ])->assertStatus(403)
            ->assertJsonPath('code', 'email_unverified');
    }

    public function test_verified_user_receives_upstream_json_in_envelope(): void
    {
        Http::fake([
            'https://tv.dartconnect.com/api/event/dartconnect/search-suggestions' => Http::response(['hits' => [['id' => 1]]], 200),
        ]);

        $user = User::factory()->create();
        $this->actingAs($user, 'web');

        $this->postJson('/api/integrations/dartconnect/event-search-suggestions', [
            'search' => 'open',
        ])
            ->assertOk()
            ->assertJsonPath('errors', null)
            ->assertJsonPath('data.hits.0.id', 1);

        Http::assertSent(function (\Illuminate\Http\Client\Request $request): bool {
            return $request->url() === 'https://tv.dartconnect.com/api/event/dartconnect/search-suggestions'
                && ($request->data()['search'] ?? null) === 'open';
        });
    }

    public function test_verified_user_can_proxy_event_matches(): void
    {
        Http::fake([
            'https://tv.dartconnect.com/api/event/jekabpilskauss26/matches' => Http::response(['matches' => [['id' => 'm1']]], 200),
        ]);

        $user = User::factory()->create();
        $this->actingAs($user, 'web');

        $this->postJson('/api/integrations/dartconnect/events/jekabpilskauss26/matches')
            ->assertOk()
            ->assertJsonPath('errors', null)
            ->assertJsonPath('data.matches.0.id', 'm1')
            ->assertJsonPath('meta.event_id', 'jekabpilskauss26');

        Http::assertSent(function (\Illuminate\Http\Client\Request $request): bool {
            return $request->url() === 'https://tv.dartconnect.com/api/event/jekabpilskauss26/matches'
                && $request->method() === 'POST';
        });
    }
}
