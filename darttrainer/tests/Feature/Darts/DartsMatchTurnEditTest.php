<?php

namespace Tests\Feature\Darts;

use App\Enums\MatchStatus;
use App\Jobs\CompleteDartsMatchJob;
use App\Models\DartMatch;
use App\Models\DartX01ArchivedTurnEdit;
use App\Models\DartX01SoloActiveTurn;
use App\Models\DartX01TurnEdit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesDartsLobby;
use Tests\TestCase;

class DartsMatchTurnEditTest extends TestCase
{
    use CreatesDartsLobby;
    use RefreshDatabase;

    public function test_player_can_edit_own_completed_turn_and_audit_is_recorded(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        foreach ([20, 19, 18] as $sector) {
            $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }

        /** @var DartX01SoloActiveTurn $turn */
        $turn = DartX01SoloActiveTurn::query()
            ->where('player_id', $match->players()->where('user_id', $host->id)->value('id'))
            ->where('turn_number', 1)
            ->firstOrFail();

        $beforePoints = $turn->points_scored;
        $beforeRemaining = $turn->remaining_points;
        $beforeThrows = $turn->throws()->orderBy('throw_number')->get()->map(fn ($throw) => [
            'sector' => $throw->sector,
            'multiplier' => $throw->multiplier,
        ])->all();

        $this->actingAs($host)
            ->patchJson("/v1/darts/matches/{$match->uuid}/turns/{$turn->id}", [
                'throws' => [
                    ['sector' => 20, 'multiplier' => 3],
                    ['sector' => 20, 'multiplier' => 3],
                    ['sector' => 20, 'multiplier' => 3],
                ],
            ])
            ->assertOk();

        $turn->refresh();

        $this->assertDatabaseHas('dart_x01_turn_edits', [
            'match_id' => $match->id,
            'match_uuid' => $match->uuid,
            'leg_number' => 1,
            'turn_number' => 1,
            'edited_by_user_id' => $host->id,
            'before_points_scored' => $beforePoints,
            'after_points_scored' => 180,
            'before_remaining_points' => $beforeRemaining,
            'after_remaining_points' => $turn->remaining_points,
            'before_is_bust' => false,
            'after_is_bust' => false,
        ]);

        $edit = DartX01TurnEdit::query()->firstOrFail();
        $this->assertSame($beforeThrows, $edit->before_throws);
        $this->assertSame([
            ['sector' => 20, 'multiplier' => 3],
            ['sector' => 20, 'multiplier' => 3],
            ['sector' => 20, 'multiplier' => 3],
        ], $edit->after_throws);
    }

    public function test_host_can_edit_guest_turn_in_local_match(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'local');
        $this->addGuestToLobby($host, $match, 'Local Guest');
        $match = $this->startDartsMatch($host, $match);

        foreach ([20, 19, 18] as $sector) {
            $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }

        $guestPlayer = $match->players()->whereNull('user_id')->firstOrFail();

        foreach ([20, 19, 18] as $sector) {
            $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }

        /** @var DartX01SoloActiveTurn $turn */
        $turn = DartX01SoloActiveTurn::query()
            ->where('player_id', $guestPlayer->id)
            ->where('turn_number', 1)
            ->firstOrFail();

        $this->actingAs($host)
            ->patchJson("/v1/darts/matches/{$match->uuid}/turns/{$turn->id}", [
                'throws' => [
                    ['sector' => 20, 'multiplier' => 3],
                    ['sector' => 20, 'multiplier' => 3],
                    ['sector' => 20, 'multiplier' => 3],
                ],
            ])
            ->assertOk();

        $turn->refresh();
        $this->assertSame(180, $turn->points_scored);
        $this->assertDatabaseCount('dart_x01_turn_edits', 1);
    }

    public function test_opponent_cannot_edit_turn(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        foreach ([20, 19, 18] as $sector) {
            $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }

        $turn = DartX01SoloActiveTurn::query()
            ->where('player_id', $match->players()->where('user_id', $host->id)->value('id'))
            ->firstOrFail();

        $this->actingAs($guest)
            ->patchJson("/v1/darts/matches/{$match->uuid}/turns/{$turn->id}", [
                'throws' => [
                    ['sector' => 20, 'multiplier' => 3],
                ],
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('dart_x01_turn_edits', 0);
    }

    public function test_turn_edits_are_archived_when_match_completes(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        foreach ([20, 19, 18] as $sector) {
            $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }

        $turn = DartX01SoloActiveTurn::query()
            ->where('player_id', $match->players()->where('user_id', $host->id)->value('id'))
            ->firstOrFail();

        $this->actingAs($host)
            ->patchJson("/v1/darts/matches/{$match->uuid}/turns/{$turn->id}", [
                'throws' => [
                    ['sector' => 20, 'multiplier' => 3],
                    ['sector' => 20, 'multiplier' => 3],
                    ['sector' => 20, 'multiplier' => 3],
                ],
            ])
            ->assertOk();

        $match->update([
            'status' => MatchStatus::Finished,
            'winner_id' => $host->id,
        ]);

        (new CompleteDartsMatchJob($match->id))->handle();

        $this->assertDatabaseCount('dart_x01_turn_edits', 0);
        $this->assertDatabaseHas('dart_x01_archived_turn_edits', [
            'match_uuid' => $match->uuid,
            'leg_number' => 1,
            'turn_number' => 1,
            'turn_owner_user_id' => $host->id,
            'edited_by_user_id' => $host->id,
            'before_points_scored' => 57,
            'after_points_scored' => 180,
        ]);

        $archived = DartX01ArchivedTurnEdit::query()->firstOrFail();
        $this->assertSame([
            ['sector' => 20, 'multiplier' => 1],
            ['sector' => 19, 'multiplier' => 1],
            ['sector' => 18, 'multiplier' => 1],
        ], $archived->before_throws);
        $this->assertSame([
            ['sector' => 20, 'multiplier' => 3],
            ['sector' => 20, 'multiplier' => 3],
            ['sector' => 20, 'multiplier' => 3],
        ], $archived->after_throws);
    }

    public function test_calculator_turn_can_be_edited_with_visit_points(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $this->actingAs($host)
            ->postJson("/v1/darts/matches/{$match->uuid}/scoring-mode/calculator")
            ->assertOk();

        $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'points' => 45,
        ])->assertOk();

        $turn = DartX01SoloActiveTurn::query()
            ->where('player_id', $match->players()->where('user_id', $host->id)->value('id'))
            ->firstOrFail();

        $this->actingAs($host)
            ->patchJson("/v1/darts/matches/{$match->uuid}/turns/{$turn->id}", [
                'points' => 140,
            ])
            ->assertOk();

        $turn->refresh();
        $this->assertSame(140, $turn->points_scored);
        $this->assertTrue($turn->throws->every(fn ($throw) => $throw->input_source === 'calculator'));
    }

    private function createActiveMatch(User $host, User $guest): DartMatch
    {
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        return $this->startDartsMatch($host, $match);
    }
}
