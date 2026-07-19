import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'storage/app/build-version.txt');

let version = 'dev';

for (const cwd of [root, join(root, '..')]) {
    try {
        version = execSync('git describe --tags --always --dirty', {
            cwd,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();

        if (version) {
            break;
        }
    } catch {
        // Try next candidate path.
    }
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${version}\n`, 'utf8');

console.log(`[build-version] ${version}`);
