<?php

namespace App\Enums;

enum MatchStatus: string
{
    case Lobby = 'lobby';
    case Active = 'active';
    case Finished = 'finished';
    case Cancelled = 'cancelled';
}
