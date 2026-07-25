<?php

namespace App\Events;

use App\Models\LobbyInvite;
use App\Services\Darts\LobbyInviteService;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LobbyInviteReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public LobbyInvite $invite,
    ) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->invite->invitee_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'LobbyInviteReceived';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return app(LobbyInviteService::class)->serializeInvite(
            $this->invite->loadMissing(['match.config', 'inviter']),
        );
    }
}
