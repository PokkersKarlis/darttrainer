<?php

namespace App\Events;

use App\Models\DartMatch;
use App\Services\Darts\MatchStateService;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MatchStateUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public DartMatch $match,
    ) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('match.'.$this->match->uuid),
        ];
    }

    public function broadcastAs(): string
    {
        return 'MatchStateUpdated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return app(MatchStateService::class)->buildState(
            $this->match->fresh(['config', 'players', 'legs.soloTurns.throws', 'activeLeg.soloTurns.throws', 'activeLeg.soloTurns.player']),
        );
    }
}
