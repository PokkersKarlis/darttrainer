<?php

namespace Tests\Feature;

use App\Support\AppVersion;
use Tests\TestCase;

class AppVersionTest extends TestCase
{
    protected function tearDown(): void
    {
        AppVersion::flush();

        parent::tearDown();
    }

    public function test_app_version_is_shared_with_inertia(): void
    {
        config(['app.version' => 'test-version-1']);

        AppVersion::flush();

        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('appVersion', 'test-version-1')
        );
    }

    public function test_app_version_resolves_from_config_override(): void
    {
        config(['app.version' => 'v9.9.9']);

        AppVersion::flush();

        $this->assertSame('v9.9.9', AppVersion::current());
    }
}
