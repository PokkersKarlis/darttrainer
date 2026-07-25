<?php

namespace App\Jobs;

use App\Enums\MatchStatus;
use App\Models\DartMatch;
use App\Models\DartX01PlayerStat;
use App\Models\DartX01SoloArchivedThrow;
use App\Models\DartX01SoloActiveThrow;
use App\Models\User;
use App\Services\Darts\X01TurnEditAuditService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CompleteDartsMatchJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $matchId,
    ) {}

    public function handle(): void
    {
        $match = DartMatch::query()
            ->with([
                'players',
                'config',
                'legs.soloTurns.throws',
                'legs.soloTurns.player',
            ])
            ->findOrFail($this->matchId);

        if ($match->status !== MatchStatus::Finished) {
            return;
        }

        $audit = app(X01TurnEditAuditService::class);

        DB::transaction(function () use ($match, $audit): void {
            $match->chatMessages()->delete();

            $audit->archiveForMatch($match);

            foreach ($match->players as $player) {
                if ($player->user_id === null) {
                    continue;
                }

                $user = User::query()->find($player->user_id);
                if ($user === null) {
                    continue;
                }

                $stats = $this->aggregatePlayerStats($match, $player->id);
                $this->incrementPlayerStats($user->id, $stats, $match->winner_id === $player->user_id);

                if ($user->is_premium) {
                    $this->archivePremiumThrows($match, $user->id, $player->id);
                }
            }

            foreach ($match->legs as $leg) {
                foreach ($leg->soloTurns as $turn) {
                    $turn->throws()->delete();
                }
                $leg->soloTurns()->delete();
            }

            $match->legs()->delete();
        });
    }

    /**
     * @return array{
     *     darts_thrown: int,
     *     points_scored: int,
     *     checkout_attempts: int,
     *     checkout_successes: int
     * }
     */
    private function aggregatePlayerStats(DartMatch $match, int $playerId): array
    {
        $dartsThrown = 0;
        $pointsScored = 0;
        $checkoutAttempts = 0;
        $checkoutSuccesses = 0;

        foreach ($match->legs as $leg) {
            foreach ($leg->soloTurns->where('player_id', $playerId) as $turn) {
                if ($turn->is_bust) {
                    continue;
                }

                $pointsScored += $turn->points_scored;
                $dartsThrown += $turn->throws->count();

                if ($match->config->track_checkout_rate && $turn->double_attempts !== null) {
                    $checkoutAttempts += $turn->double_attempts;

                    if ($turn->remaining_points === 0 && ! $turn->is_bust) {
                        $checkoutSuccesses++;
                    }
                }
            }
        }

        return [
            'darts_thrown' => $dartsThrown,
            'points_scored' => $pointsScored,
            'checkout_attempts' => $checkoutAttempts,
            'checkout_successes' => $checkoutSuccesses,
        ];
    }

    /**
     * @param  array{
     *     darts_thrown: int,
     *     points_scored: int,
     *     checkout_attempts: int,
     *     checkout_successes: int
     * }  $stats
     */
    private function incrementPlayerStats(int $userId, array $stats, bool $won): void
    {
        $record = DartX01PlayerStat::query()->firstOrCreate(['user_id' => $userId]);

        $record->increment('matches_played');
        if ($won) {
            $record->increment('legs_won');
        }
        $record->increment('darts_thrown', $stats['darts_thrown']);
        $record->increment('points_scored', $stats['points_scored']);
        $record->increment('checkout_attempts', $stats['checkout_attempts']);
        $record->increment('checkout_successes', $stats['checkout_successes']);

        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            $record->refresh();
            $record->update([
                'three_dart_avg' => $record->darts_thrown === 0
                    ? 0
                    : round(($record->points_scored / $record->darts_thrown) * 3, 2),
                'checkout_percentage' => $record->checkout_attempts === 0
                    ? 0
                    : round(($record->checkout_successes / $record->checkout_attempts) * 100, 2),
            ]);
        }
    }

    private function archivePremiumThrows(DartMatch $match, int $userId, int $playerId): void
    {
        $rows = [];

        foreach ($match->legs as $leg) {
            foreach ($leg->soloTurns->where('player_id', $playerId) as $turn) {
                foreach ($turn->throws as $throw) {
                    $rows[] = [
                        'match_uuid' => $match->uuid,
                        'user_id' => $userId,
                        'leg_number' => $leg->leg_number,
                        'turn_number' => $turn->turn_number,
                        'throw_number' => $throw->throw_number,
                        'sector' => $throw->sector,
                        'multiplier' => $throw->multiplier,
                        'points_scored' => $throw->sector * max($throw->multiplier, 0),
                        'is_bust' => $turn->is_bust,
                        'is_leg_winner' => $throw->is_leg_winner,
                        'archived_at' => now(),
                    ];
                }
            }
        }

        if ($rows !== []) {
            foreach (array_chunk($rows, 500) as $chunk) {
                DartX01SoloArchivedThrow::query()->insert($chunk);
            }
        }
    }
}
