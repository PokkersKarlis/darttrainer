<?php

namespace Tests\Feature\Darts;

use App\Models\DartMatch;
use App\Models\MatchChatMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesDartsLobby;
use Tests\TestCase;

class DartsMatchChatTest extends TestCase
{
    use CreatesDartsLobby;
    use RefreshDatabase;

    public function test_participant_can_post_and_fetch_chat_messages(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/chat", [
                'body' => 'Good luck!',
            ])
            ->assertCreated()
            ->assertJsonPath('data.body', 'Good luck!');

        $messages = $this->actingAs($guest)
            ->getJson("/v1/darts/matches/{$match->uuid}/chat")
            ->assertOk()
            ->json('data');

        $this->assertCount(1, $messages);
        $this->assertSame('Good luck!', $messages[0]['body']);
    }

    public function test_spectator_can_read_but_not_post_chat(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $stranger = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest, publicMatch: true);

        MatchChatMessage::query()->create([
            'match_id' => $match->id,
            'user_id' => $host->id,
            'body' => 'Hello watchers',
        ]);

        $this->actingAs($stranger)
            ->getJson("/v1/darts/matches/{$match->uuid}/chat")
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAs($stranger)
            ->postJson("/v1/darts/matches/{$match->uuid}/chat", [
                'body' => 'I should not post',
            ])
            ->assertForbidden();
    }

    /**
     * @return DartMatch
     */
    private function createActiveMatch(User $host, User $guest, bool $publicMatch = false)
    {
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        if ($publicMatch) {
            $this->updateLobbyConfig($host, $match, ['is_public' => true]);
        }

        return $this->startDartsMatch($host, $match);
    }
}
