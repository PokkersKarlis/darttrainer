<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\UserPresenceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserPresenceServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_is_online_when_recently_seen(): void
    {
        $user = User::factory()->create(['last_seen_at' => now()]);
        $presence = app(UserPresenceService::class);

        $this->assertTrue($presence->isOnline($user));
    }

    public function test_user_is_offline_when_not_seen_recently(): void
    {
        $user = User::factory()->create(['last_seen_at' => now()->subHours(2)]);
        $presence = app(UserPresenceService::class);

        $this->assertFalse($presence->isOnline($user));
    }

    public function test_touch_updates_last_seen_at(): void
    {
        $user = User::factory()->create(['last_seen_at' => now()->subHour()]);
        $presence = app(UserPresenceService::class);

        $presence->touch($user);

        $this->assertTrue($user->fresh()->last_seen_at?->gte(now()->subMinute()));
    }
}
