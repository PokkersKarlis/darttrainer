<?php

namespace Tests\Feature\Web;

use App\Models\GameMatch;
use App\Models\GameRoom;
use App\Models\RoomPlayer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameRouteAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_open_game_route(): void
    {
        $this->get('/game/15')->assertNotFound();
    }

    public function test_non_player_cannot_open_game_route(): void
    {
        /** @var User $u1 */
        $u1 = User::factory()->create();
        /** @var User $u2 */
        $u2 = User::factory()->create();

        $room = GameRoom::create([
            'code'         => 'ROOM15',
            'host_user_id' => $u1->id,
            'game_type'    => 'cricket',
            'play_mode'    => 'online',
            'game_config'  => ['cricket_segments' => [20, 19, 18, 17, 16, 15, 25]],
            'status'       => 'active',
            'max_players'  => 2,
        ]);

        $p1 = RoomPlayer::create([
            'room_id' => $room->id,
            'user_id' => $u1->id,
            'guest_name' => $u1->name,
            'order' => 0,
            'team' => 0,
        ]);

        $match = GameMatch::create([
            'room_id'           => $room->id,
            'current_player_id' => $p1->id,
            'current_leg'       => 1,
            'current_set'       => 1,
            'legs_config'       => ['legs' => 1, 'sets' => 1],
            'status'            => 'active',
            'started_at'        => now(),
        ]);

        $this->actingAs($u2, 'web');
        $this->get("/game/{$match->id}")->assertNotFound();
    }

    public function test_player_can_open_game_route(): void
    {
        /** @var User $u1 */
        $u1 = User::factory()->create();

        $room = GameRoom::create([
            'code'         => 'ROOM16',
            'host_user_id' => $u1->id,
            'game_type'    => 'cricket',
            'play_mode'    => 'online',
            'game_config'  => ['cricket_segments' => [20, 19, 18, 17, 16, 15, 25]],
            'status'       => 'active',
            'max_players'  => 2,
        ]);

        $p1 = RoomPlayer::create([
            'room_id' => $room->id,
            'user_id' => $u1->id,
            'guest_name' => $u1->name,
            'order' => 0,
            'team' => 0,
        ]);

        $match = GameMatch::create([
            'room_id'           => $room->id,
            'current_player_id' => $p1->id,
            'current_leg'       => 1,
            'current_set'       => 1,
            'legs_config'       => ['legs' => 1, 'sets' => 1],
            'status'            => 'active',
            'started_at'        => now(),
        ]);

        $this->actingAs($u1, 'web');
        $this->get("/game/{$match->id}")
            ->assertOk()
            ->assertSee('<div id="app"></div>', false);
    }
}

