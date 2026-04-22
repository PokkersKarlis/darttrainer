<?php

namespace Tests\Unit;

use App\Models\User;
use PHPUnit\Framework\Attributes\CoversClass;
use Tests\TestCase;

#[CoversClass(User::class)]
class UserModelTest extends TestCase
{
    public function test_account_type_constants(): void
    {
        $this->assertSame('player', User::ACCOUNT_PLAYER);
        $this->assertSame('club', User::ACCOUNT_CLUB);
    }

    public function test_password_is_hidden_from_array_serialization(): void
    {
        $user = new User;
        $user->name = 'T';
        $user->email = 't@e.lv';
        $user->password = 'secret-hash';

        $this->assertArrayNotHasKey('password', $user->toArray());
    }
}
