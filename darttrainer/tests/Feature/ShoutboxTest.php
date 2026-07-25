<?php

namespace Tests\Feature\Darts;

use App\Models\ShoutboxMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShoutboxTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_post_to_shoutbox(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/v1/shoutbox', ['body' => 'Hello arena!'])
            ->assertCreated()
            ->assertJsonPath('data.body', 'Hello arena!');
    }

    public function test_shoutbox_prune_deletes_old_messages(): void
    {
        $user = User::factory()->create();

        $old = ShoutboxMessage::query()->create([
            'user_id' => $user->id,
            'body' => 'Old',
        ]);
        ShoutboxMessage::query()->whereKey($old->id)->update([
            'created_at' => now()->subDays(8),
            'updated_at' => now()->subDays(8),
        ]);

        $recent = ShoutboxMessage::query()->create([
            'user_id' => $user->id,
            'body' => 'Recent',
        ]);

        $this->artisan('shoutbox:prune')->assertSuccessful();

        $this->assertDatabaseMissing('shoutbox_messages', ['id' => $old->id]);
        $this->assertDatabaseHas('shoutbox_messages', ['id' => $recent->id]);
    }
}
