<?php

namespace App\Console\Commands;

use App\Services\ShoutboxService;
use Illuminate\Console\Command;

class PruneShoutboxMessages extends Command
{
    protected $signature = 'shoutbox:prune';

    protected $description = 'Delete shoutbox messages older than one week';

    public function handle(ShoutboxService $shoutbox): int
    {
        $deleted = $shoutbox->pruneExpired();
        $this->info("Pruned {$deleted} shoutbox message(s).");

        return self::SUCCESS;
    }
}
