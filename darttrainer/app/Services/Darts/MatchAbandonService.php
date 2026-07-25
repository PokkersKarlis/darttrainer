<?php

namespace App\Services\Darts;

use App\Events\MatchAbandoned;
use App\Models\DartMatch;
use Illuminate\Support\Facades\DB;

class MatchAbandonService
{
    public function abandonAndDelete(DartMatch $match, string $reason): void
    {
        DB::transaction(function () use ($match, $reason): void {
            $uuid = $match->uuid;
            $match->chatMessages()->delete();
            broadcast(new MatchAbandoned($uuid, $reason));
            $match->delete();
        });
    }
}
