<?php

namespace App\Rules;

use App\Support\LobbyCode as LobbyCodeSupport;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class LobbyCode implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! LobbyCodeSupport::isValid(LobbyCodeSupport::normalize($value))) {
            $fail('lobby-invalid-code');
        }
    }
}
