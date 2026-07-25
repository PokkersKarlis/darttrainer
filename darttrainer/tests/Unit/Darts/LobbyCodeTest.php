<?php

namespace Tests\Unit\Darts;

use App\Support\LobbyCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class LobbyCodeTest extends TestCase
{
    use RefreshDatabase;
    public function test_generated_code_matches_expected_format(): void
    {
        for ($i = 0; $i < 50; $i++) {
            $code = LobbyCode::generate();

            $this->assertTrue(LobbyCode::isValid($code), "Invalid generated code: {$code}");
        }
    }

    #[DataProvider('validCodesProvider')]
    public function test_valid_codes_are_accepted(string $code): void
    {
        $this->assertTrue(LobbyCode::isValid(LobbyCode::normalize($code)));
    }

    #[DataProvider('invalidCodesProvider')]
    public function test_invalid_codes_are_rejected(string $code): void
    {
        $this->assertFalse(LobbyCode::isValid(LobbyCode::normalize($code)));
    }

    public static function validCodesProvider(): array
    {
        return [
            ['12-34'],
            ['123-4567'],
            ['1234-56'],
            [' 12-345 '],
        ];
    }

    public static function invalidCodesProvider(): array
    {
        return [
            ['1-23'],
            ['12345-67'],
            ['12-3'],
            ['ABC-123'],
            ['12_34'],
            ['123456'],
            ['12--34'],
        ];
    }
}
