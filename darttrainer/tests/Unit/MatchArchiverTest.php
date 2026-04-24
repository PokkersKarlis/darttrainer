<?php

namespace Tests\Unit;

use App\Models\CricketState;
use App\Models\Dart;
use App\Models\GameMatch;
use App\Models\GameRoom;
use App\Models\Leg;
use App\Models\RoomPlayer;
use App\Models\Turn;
use App\Models\User;
use App\Services\MatchArchiver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class MatchArchiverTest extends TestCase
{
    use RefreshDatabase;

    public function test_archiver_snapshots_protocol_and_moves_hot_rows_to_archive(): void
    {
        $u1 = User::factory()->create();
        $u2 = User::factory()->create();

        $room = GameRoom::create([
            'code'         => 'ZXCVBN',
            'host_user_id' => $u1->id,
            'game_type'    => 'cricket',
            'play_mode'    => 'online',
            'game_config'  => ['cricket_segments' => [20, 19, 18, 17, 16, 15, 25]],
            'status'       => 'finished',
            'max_players'  => 2,
        ]);

        $p1 = RoomPlayer::create(['room_id' => $room->id, 'user_id' => $u1->id, 'guest_name' => $u1->name, 'order' => 0, 'team' => 0]);
        $p2 = RoomPlayer::create(['room_id' => $room->id, 'user_id' => $u2->id, 'guest_name' => $u2->name, 'order' => 1, 'team' => 1]);

        $match = GameMatch::create([
            'room_id'           => $room->id,
            'current_player_id' => $p1->id,
            'current_leg'       => 1,
            'current_set'       => 1,
            'legs_config'       => ['legs' => 1, 'sets' => 1],
            'status'            => 'finished',
            'winner_player_id'  => $p1->id,
            'started_at'        => now()->subMinute(),
            'finished_at'       => now(),
        ]);

        $leg = Leg::create([
            'match_id'   => $match->id,
            'leg_number' => 1,
            'set_number' => 1,
            'started_at' => now()->subMinute(),
            'finished_at'=> now(),
            'winner_player_id' => $p1->id,
        ]);

        $t1 = Turn::create([
            'match_id' => $match->id,
            'leg_id' => $leg->id,
            'player_id' => $p1->id,
            'turn_number' => 1,
            'total_scored' => 10,
            'is_undone' => false,
        ]);

        Dart::create(['turn_id' => $t1->id, 'dart_number' => 1, 'segment' => 20, 'multiplier' => 3, 'value' => 60]);
        Dart::create(['turn_id' => $t1->id, 'dart_number' => 2, 'segment' => 19, 'multiplier' => 1, 'value' => 19]);

        CricketState::create([
            'match_id' => $match->id,
            'leg_id' => $leg->id,
            'player_id' => $p1->id,
            'seg_20' => 3,
            'points' => 10,
        ]);

        /** @var MatchArchiver $archiver */
        $archiver = app(MatchArchiver::class);
        $archiver->archiveIfTerminal($match);

        $match->refresh();
        $this->assertNotNull($match->archived_at);

        // Snapshot created.
        $this->assertTrue(DB::table('match_protocols')->where('match_id', $match->id)->exists());

        // Hot tables cleared.
        $this->assertSame(0, DB::table('turns')->where('match_id', $match->id)->count());
        $this->assertSame(0, DB::table('cricket_state')->where('match_id', $match->id)->count());

        // Archive tables populated (same IDs).
        $this->assertSame(1, DB::table('turns_archive')->where('match_id', $match->id)->where('id', $t1->id)->count());
        $this->assertSame(2, DB::table('darts_archive')->where('turn_id', $t1->id)->count());
        $this->assertSame(1, DB::table('cricket_state_archive')->where('match_id', $match->id)->count());

        // Idempotent: second run doesn't crash and doesn't duplicate.
        $archiver->archiveIfTerminal($match);
        $this->assertSame(1, DB::table('turns_archive')->where('match_id', $match->id)->where('id', $t1->id)->count());
    }
}

