<?php

namespace App\Console\Commands;

use App\Services\Darts\MatchChatService;
use Illuminate\Console\Command;

class PruneMatchChatMessages extends Command
{
    protected $signature = 'darts:prune-chat';

    protected $description = 'Delete match chat messages older than one week';

    public function handle(MatchChatService $chatService): int
    {
        $deleted = $chatService->pruneExpired();
        $this->info("Pruned {$deleted} match chat message(s).");

        return self::SUCCESS;
    }
}
