<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FriendSearchApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_friend_search_returns_name_and_email_for_matches(): void
    {
        $searcher = User::factory()->create();
        $target = User::factory()->create([
            'name'  => 'UniqueSearchNameXy',
            'email' => 'target-search@example.org',
        ]);

        $this->actingAs($searcher, 'web');

        $response = $this->getJson('/api/friends/search?q=UniqueSearchNameXy');

        $response->assertOk();
        $items = $response->json('items');
        $this->assertIsArray($items);
        $hit = collect($items)->firstWhere('id', $target->id);
        $this->assertNotNull($hit, 'Meklēšanai jāatrod lietotājs pēc vārda.');
        $this->assertSame('UniqueSearchNameXy', $hit['name']);
        $this->assertSame('target-search@example.org', $hit['email']);
        $this->assertArrayHasKey('relationship', $hit);
    }

    public function test_users_cannot_list_themselves_in_friend_search_hits_exclusion(): void
    {
        $u = User::factory()->create(['name' => 'SelfNameOnly']);

        $this->actingAs($u, 'web');

        $response = $this->getJson('/api/friends/search?q=SelfNameOnly');
        $response->assertOk();
        $ids = collect($response->json('items', []))->pluck('id')->all();
        $this->assertNotContains($u->id, $ids, 'Meklēšana nedrīkst atgriezt pašu sevi.');
    }
}
