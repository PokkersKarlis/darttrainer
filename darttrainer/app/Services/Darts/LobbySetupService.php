<?php

namespace App\Services\Darts;

use App\Enums\MatchStatus;
use App\Events\LobbyUpdated;
use App\Models\DartMatch;
use App\Models\MatchPlayer;
use App\Models\User;
use App\Models\UserLocalGuest;
use Illuminate\Support\Facades\DB;

class LobbySetupService
{
    /**
     * @param  list<int>  $playerIdsInOrder
     */
    public function updateThrowOrder(DartMatch $match, array $playerIdsInOrder): void
    {
        $this->assertLobbyEditable($match);

        $players = $match->players()->get()->keyBy('id');
        $expectedIds = $players->keys()->sort()->values()->all();
        $givenIds = collect($playerIdsInOrder)->sort()->values()->all();

        if ($expectedIds !== $givenIds) {
            abort(422, 'invalid-throw-order');
        }

        DB::transaction(function () use ($playerIdsInOrder, $players): void {
            foreach ($players as $player) {
                $player->update(['slot' => 100 + $player->id]);
            }

            foreach ($playerIdsInOrder as $index => $playerId) {
                /** @var MatchPlayer $player */
                $player = $players->get($playerId);
                $player->update(['slot' => $index + 1]);
            }
        });

        broadcast(new LobbyUpdated($match->fresh(['players', 'config'])))->toOthers();
    }

    public function setFirstThrower(DartMatch $match, int $playerId): void
    {
        $this->assertLobbyEditable($match);

        $players = $match->players()->orderBy('slot')->get();

        if ($players->count() !== 2) {
            abort(422, 'first-thrower-two-players-only');
        }

        $selected = $players->firstWhere('id', $playerId);
        if ($selected === null) {
            abort(422, 'invalid-player');
        }

        if ($selected->slot === 1) {
            return;
        }

        $other = $players->firstWhere('id', '!=', $playerId);
        if ($other === null) {
            return;
        }

        DB::transaction(function () use ($selected, $other, $players): void {
            foreach ($players as $player) {
                $player->update(['slot' => 100 + $player->id]);
            }

            $selected->update(['slot' => 1]);
            $other->update(['slot' => 2]);
        });

        broadcast(new LobbyUpdated($match->fresh(['players', 'config'])))->toOthers();
    }

    public function updatePlayerStartingPoints(DartMatch $match, MatchPlayer $player, ?int $startingPoints): MatchPlayer
    {
        $this->assertLobbyEditable($match);

        if ($player->match_id !== $match->id) {
            abort(404);
        }

        if ($startingPoints !== null && ($startingPoints < 2 || $startingPoints > 999)) {
            abort(422, 'invalid-starting-points');
        }

        $player->update(['starting_points' => $startingPoints]);

        broadcast(new LobbyUpdated($match->fresh(['players', 'config'])))->toOthers();

        return $player->fresh();
    }

    public function resolvePlayerStartingPoints(MatchPlayer $player, int $matchDefault): int
    {
        return $player->starting_points ?? $matchDefault;
    }

    private function assertLobbyEditable(DartMatch $match): void
    {
        if ($match->status !== MatchStatus::Lobby) {
            abort(422, 'lobby-not-editable');
        }
    }
}
