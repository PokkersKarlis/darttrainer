/**
 * CloudLinux: ja `vite build` lokāli krīt ar WASM/undici OOM, uzbūvi dara
 * .github/workflows/sync-vite-build-to-repo.yml, tad `public/build` nāk ar `git pull`.
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const pollMs = Number(process.env.VITE_POLL_INTERVAL_MS) || 800;
/** CloudLinux / kopīgs hosting: mazāks Rollup/CPU paralelisms, īpaši ar mazu NODE heap */
const hostingBuild = process.env.VITE_HOSTING_BUILD === '1';

export default defineConfig({
    // Vite-only SPA (bez laravel-vite-plugin). Entry: resources/js/dart-app/index.html
    root: 'resources/js/dart-app',
    // Asseti servēti no /dart-app/ (public/dart-app/); Vue Router base override → '/'
    base: process.env.VITE_BASE || '/dart-app/',

    // Docker: ātrāks pre-bundle kešs konteinerī (ne uz lēnā Windows bind mount)
    cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite',

    // Visas komponentes tagad ir .vue SFC (pre-kompilētas) — runtime-only build (mazāks bundle).
    // vue.esm-bundler.js alias VAIRS NAV nepieciešams.

    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        // CORS: atļauj pārlūkam ielādēt skriptus no Vite dev servera (5173),
        // kad lapa servēta no cita origin (nginx :8088 / Laravel).
        cors: true,
        // origin: nodrošina, ka Vite ģenerētie moduļu URL ir absolūti (http://localhost:5173/…),
        // nevis relatīvi — svarīgi, kad HTML nāk no cita porta (nginx :8088).
        origin: 'http://localhost:5173',
        hmr: {
            host: 'localhost',
            port: 5173,
            protocol: 'ws',
        },
        watch: {
            usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
            interval: pollMs,
            ignored: [
                '**/node_modules/**',
                '**/vendor/**',
                '**/storage/**',
                '**/public/**',
                '**/.git/**',
            ],
        },
    },

    css: {
        devSourcemap: false,
    },

    optimizeDeps: {
        include: ['vue', 'vue-router', 'pinia', 'axios'],
    },

    plugins: [
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
    build: {
        // public/dart-app/ — asseti servēti kā statiski faili
        outDir: '../../../public/dart-app',
        emptyOutDir: true,
        chunkSizeWarningLimit: 500,
        // Kopīgā hostingā (CloudLinux LVE): mazāk paralelisma un bez gzip aprēķina — mazāks RAM/WASM spiediens
        reportCompressedSize: false,
        rollupOptions: {
            // Uz kopīga hostinga: 1. Arī npm run build:hosting sūta VITE_MAX_PARALLEL_FILE_OPS=1
            maxParallelFileOps: hostingBuild
                ? 1
                : (Number(process.env.VITE_MAX_PARALLEL_FILE_OPS) || 20),
        },
    },
});
