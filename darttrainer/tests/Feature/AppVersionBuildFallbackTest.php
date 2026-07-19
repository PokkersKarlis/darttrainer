<?php

namespace Tests\Feature;

use App\Support\AppVersion;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class AppVersionBuildFallbackTest extends TestCase
{
    protected function tearDown(): void
    {
        AppVersion::flush();

        parent::tearDown();
    }

    public function test_dev_build_file_is_ignored_when_app_version_is_configured(): void
    {
        config(['app.version' => 'v9.9.9-test']);

        $buildFile = storage_path('app/build-version.txt');
        File::ensureDirectoryExists(dirname($buildFile));
        File::put($buildFile, "dev\n");

        AppVersion::flush();

        $this->assertSame('v9.9.9-test', AppVersion::current());

        File::delete($buildFile);
    }
}
