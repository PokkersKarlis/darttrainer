<?php

namespace App\Console\Commands;

use App\Enums\MatchStatus;
use App\Models\DartMatch;
use App\Models\DartX01SoloActiveThrow;
use App\Services\Darts\MatchAbandonService;
use Illuminate\Console\Command;

class PruneStaleDartsMatches extends Command
{
    protected $signature = 'darts:prune-stale';

    protected $description = 'Delete inactive lobbies and matches with no activity for at least one hour';

    public function handle(MatchAbandonService $abandonService): int
    {
        $threshold = now()->subHour();
        $deleted = 0;

        DartMatch::query()
            ->whereIn('status', [MatchStatus::Lobby, MatchStatus::Active])
            ->where('updated_at', '<', $threshold)
            ->orderBy('id')
            ->chunkById(50, function ($matches) use ($abandonService, $threshold, &$deleted): void {
                foreach ($matches as $match) {
                    if (! $this->shouldDelete($match, $threshold)) {
                        continue;
                    }

                    if ($match->status === MatchStatus::Active) {
                        $abandonService->abandonAndDelete($match, 'stale_cleanup');
                    } else {
                        $match->chatMessages()->delete();
                        $match->delete();
                    }

                    $deleted++;
                }
            });

        $this->info("Deleted {$deleted} stale match(es).");

        return self::SUCCESS;
    }

    private function shouldDelete(DartMatch $match, \Illuminate\Support\Carbon $threshold): bool
    {
        if ($match->players()->count() === 0) {
            return true;
        }

        if ($match->status === MatchStatus::Lobby) {
            return $match->updated_at < $threshold;
        }

        $lastThrowAt = DartX01SoloActiveThrow::query()
            ->whereHas('turn.leg', fn ($q) => $q->where('match_id', $match->id))
            ->max('updated_at');

        if ($lastThrowAt === null) {
            return $match->updated_at < $threshold;
        }

        return \Illuminate\Support\Carbon::parse($lastThrowAt) < $threshold
            && $match->updated_at < $threshold;
    }
}
