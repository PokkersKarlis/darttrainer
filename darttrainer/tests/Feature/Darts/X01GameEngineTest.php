<?php

namespace Tests\Feature\Darts;

use App\Enums\MatchStatus;
use App\Jobs\CompleteDartsMatchJob;
use App\Models\DartMatch;
use App\Models\DartX01ActiveLeg;
use App\Models\DartX01PlayerStat;
use App\Models\DartX01SoloActiveThrow;
use App\Models\DartX01SoloActiveTurn;
use App\Models\DartX01SoloArchivedThrow;
use App\Models\User;
use App\Models\UserLocalGuest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Queue;
use Tests\Support\CreatesDartsLobby;
use Tests\TestCase;

class X01GameEngineTest extends TestCase
{
    use CreatesDartsLobby;
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // 1. Session & Connection Handling
    // -------------------------------------------------------------------------

    public function test_unverified_or_unauthenticated_user_cannot_access_game(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->addGuestToLobby($host, $match, 'Guest Two');
        $match = $this->startDartsMatch($host, $match);

        auth()->logout();

        $this->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertUnauthorized();

        $unverified = User::factory()->unverified()->create();

        $this->actingAs($unverified)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertForbidden();
    }

    public function test_match_state_persists_for_reconnecting_player(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createActiveMatch($host, $guest);

        $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 20,
            'multiplier' => 1,
        ])->assertOk();

        $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 20,
            'multiplier' => 1,
        ])->assertOk();

        $state = $this->actingAs($host)
            ->getJson("/v1/darts/matches/{$match->uuid}/state")
            ->assertOk()
            ->json('data');

        $hostPlayer = $match->players()->where('user_id', $host->id)->firstOrFail();
        $openTurn = DartX01SoloActiveTurn::query()
            ->where('player_id', $hostPlayer->id)
            ->latest('id')
            ->firstOrFail();

        $this->assertSame(461, $openTurn->remaining_points);
        $this->assertSame(2, $state['current_state']['darts_thrown_this_turn']);
        $this->assertSame(1, $state['current_state']['current_leg']);
        $this->assertSame('active', $state['status']);
    }

    // -------------------------------------------------------------------------
    // 2. Lobby & Player Management
    // -------------------------------------------------------------------------

    public function test_online_lobby_prevents_exceeding_max_players(): void
    {
        $host = User::factory()->create();
        $players = User::factory()->count(3)->create();
        $extra = User::factory()->create();

        $match = $this->createDartsLobby($host, mode: 'online');

        foreach ($players as $player) {
            $this->joinDartsLobby($player, $match);
        }

        $this->assertSame(4, $match->fresh()->players()->count());

        $this->actingAs($extra)
            ->post('/darts/x01/multiplayer/join', [
                'lobby_code' => $match->lobby_code,
            ])
            ->assertStatus(422);
    }

    public function test_next_step_disabled_until_minimum_players_joined(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');

        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/start")
            ->assertStatus(422);
    }

    public function test_local_guest_saving_and_retrieval(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);

        $this->addGuestToLobby($host, $match, 'Saved Guest', save: true);
        $this->assertDatabaseHas('user_local_guests', [
            'user_id' => $host->id,
            'name' => 'Saved Guest',
        ]);

        $matchTwo = $this->createDartsLobby($host);
        $this->addGuestToLobby($host, $matchTwo, 'Temp Guest', save: false);

        $this->assertDatabaseMissing('user_local_guests', [
            'user_id' => $host->id,
            'name' => 'Temp Guest',
        ]);
    }

    // -------------------------------------------------------------------------
    // 3. Configuration & Game Rules
    // -------------------------------------------------------------------------

    public function test_automatic_dido_and_sido_defaults(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);
        $lobby = app(\App\Services\Darts\MatchLobbyService::class);

        $lobby->applyStartingPointDefaults($match, 301);

        $this->assertDatabaseHas('dart_x01_match_configs', [
            'match_id' => $match->id,
            'starting_points' => 301,
            'in_rule' => 'double',
            'out_rule' => 'double',
        ]);

        $lobby->applyStartingPointDefaults($match, 501);

        $this->assertDatabaseHas('dart_x01_match_configs', [
            'match_id' => $match->id,
            'starting_points' => 501,
            'in_rule' => 'straight',
            'out_rule' => 'double',
        ]);

        $this->updateLobbyConfig($host, $match, [
            'starting_points' => 301,
            'in_rule' => 'straight',
            'out_rule' => 'double',
        ]);

        $this->assertDatabaseHas('dart_x01_match_configs', [
            'match_id' => $match->id,
            'starting_points' => 301,
            'in_rule' => 'straight',
            'out_rule' => 'double',
        ]);
    }

    public function test_negative_or_zero_legs_sets_are_rejected(): void
    {
        $host = User::factory()->create();
        $match = $this->createDartsLobby($host);

        $this->actingAs($host)
            ->patch("/darts/x01/multiplayer/{$match->uuid}/config", [
                'format' => 'first_to',
                'legs_target' => 0,
                'sets_target' => 1,
                'starting_points' => 501,
                'in_rule' => 'straight',
                'out_rule' => 'double',
                'track_checkout_rate' => false,
                'is_public' => false,
            ])
            ->assertSessionHasErrors('legs_target');

        $this->actingAs($host)
            ->patch("/darts/x01/multiplayer/{$match->uuid}/config", [
                'format' => 'first_to',
                'legs_target' => 1,
                'sets_target' => 0,
                'starting_points' => 501,
                'in_rule' => 'straight',
                'out_rule' => 'double',
                'track_checkout_rate' => false,
                'is_public' => false,
            ])
            ->assertSessionHasErrors('sets_target');
    }

    // -------------------------------------------------------------------------
    // 4. Game Engine Logic
    // -------------------------------------------------------------------------

    public function test_double_in_rule_ignores_scores_until_double_is_hit(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);
        $this->updateLobbyConfig($host, $match, [
            'starting_points' => 301,
            'in_rule' => 'double',
            'out_rule' => 'double',
        ]);
        $match = $this->startDartsMatch($host, $match);

        $afterSingle = $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 20,
            'multiplier' => 1,
        ])->assertOk()->json('data');

        $hostRow = collect($afterSingle['scoreboard'])->firstWhere('name', $host->name);
        $this->assertSame(301, $hostRow['remaining_points']);

        foreach ([20, 19] as $sector) {
            $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }

        foreach ([20, 19, 18] as $sector) {
            $this->actingAs($guest)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }

        $afterDouble = $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 20,
            'multiplier' => 2,
        ])->assertOk()->json('data');

        $hostRow = collect($afterDouble['scoreboard'])->firstWhere('name', $host->name);
        $this->assertSame(261, $hostRow['remaining_points']);
    }

    public function test_bust_logic_when_score_exceeds_remaining_points(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);
        $match->config->update(['starting_points' => 32]);
        $match = $this->startDartsMatch($host, $match);

        $hostPlayer = $match->players()->where('user_id', $host->id)->firstOrFail();
        $guestPlayer = $match->players()->where('user_id', $guest->id)->firstOrFail();

        $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/scoring-mode/calculator")->assertOk();

        $response = $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'points' => 38,
        ])->assertOk()->json('data');

        $hostRow = collect($response['scoreboard'])->firstWhere('name', $host->name);
        $this->assertSame(32, $hostRow['remaining_points']);
        $this->assertSame($guestPlayer->id, $response['current_state']['active_player_id']);

        $this->assertDatabaseHas('dart_x01_solo_active_turns', [
            'player_id' => $hostPlayer->id,
            'is_bust' => true,
            'remaining_points' => 32,
        ]);
    }

    public function test_bust_logic_when_leaving_exactly_1_point_on_double_out(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);
        $match->config->update(['starting_points' => 20]);
        $match = $this->startDartsMatch($host, $match);

        $response = $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 19,
            'multiplier' => 1,
        ])->assertOk()->json('data');

        $hostRow = collect($response['scoreboard'])->firstWhere('name', $host->name);
        $this->assertSame(20, $hostRow['remaining_points']);

        $this->assertDatabaseHas('dart_x01_solo_active_turns', [
            'player_id' => $match->players()->where('user_id', $host->id)->value('id'),
            'is_bust' => true,
            'remaining_points' => 20,
        ]);
    }

    public function test_bust_logic_when_reaching_0_without_double_on_double_out(): void
    {
        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);
        $match->config->update(['starting_points' => 20]);
        $match = $this->startDartsMatch($host, $match);

        $response = $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 20,
            'multiplier' => 1,
        ])->assertOk()->json('data');

        $hostRow = collect($response['scoreboard'])->firstWhere('name', $host->name);
        $this->assertSame(20, $hostRow['remaining_points']);

        $this->assertDatabaseHas('dart_x01_solo_active_turns', [
            'player_id' => $match->players()->where('user_id', $host->id)->value('id'),
            'is_bust' => true,
            'remaining_points' => 20,
        ]);
    }

    public function test_successful_leg_finish_and_match_win(): void
    {
        Bus::fake();

        $host = User::factory()->create();
        $guest = User::factory()->create();
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);
        $match->config->update(['starting_points' => 40]);
        $match = $this->startDartsMatch($host, $match);

        $response = $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 20,
            'multiplier' => 2,
        ])->assertOk()->json('data');

        $this->assertSame('finished', $response['status']);
        $this->assertSame($host->name, $response['winner']['name']);

        $this->assertDatabaseHas('dart_x01_solo_active_throws', [
            'is_leg_winner' => true,
            'sector' => 20,
            'multiplier' => 2,
        ]);

        Bus::assertDispatched(CompleteDartsMatchJob::class);
    }

    // -------------------------------------------------------------------------
    // 5. Team Rotation Logic
    // -------------------------------------------------------------------------

    public function test_team_rotation_order_in_2vs2(): void
    {
        $host = User::factory()->create();
        $match = $this->createTeamLobby($host);

        $players = $match->players()->orderBy('slot')->get();
        $this->assertCount(4, $players);

        $match = $this->startDartsMatch($host, $match);

        $order = $players->pluck('id')->all();
        $activeId = $match->fresh()->activeLeg
            ? app(\App\Services\Darts\MatchStateService::class)
                ->resolveActivePlayerId($match->fresh(['players']), $match->activeLeg->id)
            : null;

        $this->assertSame($order[0], $activeId);

        foreach ([1, 2, 3] as $index) {
            $this->completeVisitAsHost($match, $host);

            $state = $this->actingAs($host)
                ->getJson("/v1/darts/matches/{$match->uuid}/state")
                ->assertOk()
                ->json('data');

            $this->assertSame($order[$index], $state['current_state']['active_player_id']);
        }
    }

    public function test_team_alternate_leg_starting_player(): void
    {
        $host = User::factory()->create(['is_premium' => false]);
        $match = $this->createTeamLobby($host);
        $match->config->update([
            'legs_target' => 2,
            'starting_points' => 40,
        ]);
        $match = $this->startDartsMatch($host, $match->fresh(['config', 'players']));
        $this->assertSame(40, $match->activeLeg->starting_points);
        $this->assertSame(2, $match->config->legs_target);

        $players = $match->players()->orderBy('slot')->get();
        $teamAP1 = $players[0]->id;
        $teamBP1 = $players[1]->id;

        $stateService = app(\App\Services\Darts\MatchStateService::class);
        $legOneStarter = $stateService->resolveActivePlayerId($match, $match->activeLeg->id);
        $this->assertSame($teamAP1, $legOneStarter);

        $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 20,
            'multiplier' => 2,
        ])->assertOk();

        $match->refresh(['activeLeg', 'players', 'config']);
        $this->assertSame(2, $match->activeLeg->leg_number);

        $legTwoStarter = $stateService->resolveActivePlayerId($match, $match->activeLeg->id);
        $this->assertSame($teamBP1, $legTwoStarter);
    }

    // -------------------------------------------------------------------------
    // 6. Post-Game & Archiving Job
    // -------------------------------------------------------------------------

    public function test_complete_darts_match_job_archives_data_for_premium_users(): void
    {
        Queue::fake();

        $host = User::factory()->create(['is_premium' => true]);
        $guest = User::factory()->create(['is_premium' => false]);
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);
        $match->config->update(['starting_points' => 40]);
        $match = $this->startDartsMatch($host, $match);

        $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
            'sector' => 20,
            'multiplier' => 2,
        ])->assertOk();

        $match->refresh();
        $this->assertSame(MatchStatus::Finished, $match->status);

        Queue::assertPushed(CompleteDartsMatchJob::class, fn (CompleteDartsMatchJob $job) => $job->matchId === $match->id);

        $this->assertGreaterThan(0, DartX01SoloActiveThrow::query()->count());

        (new CompleteDartsMatchJob($match->id))->handle();

        $this->assertDatabaseHas('dart_x01_solo_archived_throws', [
            'match_uuid' => $match->uuid,
            'user_id' => $host->id,
            'sector' => 20,
            'multiplier' => 2,
            'is_leg_winner' => true,
        ]);

        $this->assertDatabaseMissing('dart_x01_solo_archived_throws', [
            'match_uuid' => $match->uuid,
            'user_id' => $guest->id,
        ]);

        $stats = DartX01PlayerStat::query()->where('user_id', $host->id)->firstOrFail();
        $this->assertSame(1, $stats->matches_played);
        $this->assertSame(1, $stats->legs_won);
        $this->assertSame(1, $stats->darts_thrown);
        $this->assertSame(40, $stats->points_scored);
        $this->assertEquals(120.0, (float) $stats->three_dart_avg);

        $this->assertSame(0, DartX01SoloActiveThrow::query()->count());
        $this->assertSame(0, DartX01SoloActiveTurn::query()->count());
        $this->assertSame(0, DartX01ActiveLeg::query()->where('match_id', $match->id)->count());
    }

    /**
     * @return DartMatch
     */
    private function createActiveMatch(User $host, User $guest): DartMatch
    {
        $match = $this->createDartsLobby($host, mode: 'online');
        $this->joinDartsLobby($guest, $match);

        return $this->startDartsMatch($host, $match);
    }

    private function createTeamLobby(User $host): DartMatch
    {
        $match = $this->createDartsLobby($host, matchType: 'team');
        $this->addGuestToLobby($host, $match, 'Team A P2');
        $this->addGuestToLobby($host, $match, 'Team B P1');
        $this->addGuestToLobby($host, $match, 'Team B P2');

        return $match->fresh(['players', 'config']);
    }

    private function completeVisitAsHost(DartMatch $match, User $host): void
    {
        foreach ([20, 19, 18] as $sector) {
            $this->actingAs($host)->postJson("/v1/darts/matches/{$match->uuid}/throws", [
                'sector' => $sector,
                'multiplier' => 1,
            ])->assertOk();
        }
    }
}
