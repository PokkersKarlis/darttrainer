<?php

namespace App\Support;

use Illuminate\Support\Facades\Process;

final class AppVersion
{
    private const string BUILD_FILE = 'app/build-version.txt';

    private static ?string $resolved = null;

    public static function current(): string
    {
        return self::$resolved ??= self::resolve();
    }

    public static function flush(): void
    {
        self::$resolved = null;
    }

    private static function resolve(): string
    {
        $configured = trim((string) config('app.version', ''));
        if ($configured !== '') {
            return $configured;
        }

        $buildFile = storage_path(self::BUILD_FILE);
        if (is_readable($buildFile)) {
            $fromBuild = trim((string) file_get_contents($buildFile));
            if ($fromBuild !== '') {
                return $fromBuild;
            }
        }

        $fromGit = self::fromGit();
        if ($fromGit !== null) {
            return $fromGit;
        }

        return 'dev';
    }

    private static function fromGit(): ?string
    {
        foreach (self::gitPaths() as $path) {
            if (! self::gitAvailable($path)) {
                continue;
            }

            $result = Process::path($path)
                ->run(['git', 'describe', '--tags', '--always', '--dirty']);

            if (! $result->successful()) {
                continue;
            }

            $version = trim($result->output());

            if ($version !== '') {
                return $version;
            }
        }

        return null;
    }

    /**
     * @return list<string>
     */
    private static function gitPaths(): array
    {
        $base = base_path();

        return array_values(array_unique([$base, dirname($base)]));
    }

    private static function gitAvailable(string $path): bool
    {
        $result = Process::path($path)->run(['git', 'rev-parse', '--is-inside-work-tree']);

        return $result->successful() && trim($result->output()) === 'true';
    }
}
