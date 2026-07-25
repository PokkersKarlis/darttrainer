<?php

namespace Tests\Support;

use App\Models\DartMatch;
use App\Models\User;

trait CreatesDartsLobby
{
    protected function createDartsLobby(User $host, string $mode = 'local', string $matchType = 'solo'): DartMatch
    {
        $this->actingAs($host)
            ->post('/darts/x01/multiplayer', [
                'mode' => $mode,
                'match_type' => $matchType,
            ])
            ->assertRedirect();

        return DartMatch::query()->where('host_user_id', $host->id)->latest('id')->firstOrFail();
    }

    protected function joinDartsLobby(User $user, DartMatch $match): void
    {
        $this->actingAs($user)
            ->post('/darts/x01/multiplayer/join', [
                'lobby_code' => $match->lobby_code,
            ])
            ->assertRedirect();
    }

    protected function addGuestToLobby(User $host, DartMatch $match, string $name, bool $save = false): void
    {
        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/players", [
                'guest_name' => $name,
                'save_guest' => $save,
            ])
            ->assertRedirect();
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    protected function updateLobbyConfig(User $host, DartMatch $match, array $overrides = []): void
    {
        $payload = array_merge([
            'format' => 'first_to',
            'legs_target' => 1,
            'sets_target' => 1,
            'starting_points' => 501,
            'in_rule' => 'straight',
            'out_rule' => 'double',
            'track_checkout_rate' => false,
            'is_public' => false,
        ], $overrides);

        $this->actingAs($host)
            ->patch("/darts/x01/multiplayer/{$match->uuid}/config", $payload)
            ->assertRedirect();
    }

    protected function startDartsMatch(User $host, DartMatch $match): DartMatch
    {
        $this->actingAs($host)
            ->post("/darts/x01/multiplayer/{$match->uuid}/start")
            ->assertRedirect(route('darts.x01.play', $match->uuid));

        return $match->fresh(['config', 'players']);
    }
}
