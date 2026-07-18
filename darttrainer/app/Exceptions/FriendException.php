<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Draugu darbību biznesa kļūda (piem. jau draugi, uzaicinājums jau nosūtīts).
 * Kontrolieris to notver un parāda lietotājam kā flash paziņojumu.
 */
class FriendException extends RuntimeException
{
}
