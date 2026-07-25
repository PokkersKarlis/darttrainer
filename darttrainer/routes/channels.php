<?php

use App\Models\DartMatch;
use App\Models\User;
use App\Services\Darts\MatchAccessService;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('match.{uuid}', function (User $user, string $uuid) {
    $match = DartMatch::query()->where('uuid', $uuid)->first();

    if ($match === null) {
        return false;
    }

    return app(MatchAccessService::class)->broadcastUserPayload($match, $user);
});

Broadcast::channel('user.{id}', function (User $user, int $id) {
    return (int) $user->id === $id;
});

Broadcast::channel('shoutbox', function (User $user) {
    return ['id' => $user->id, 'name' => $user->name];
});
