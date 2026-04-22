/**
 * CloudLinux: ja `vite build` krīt ar WebAssembly/undici OOM, uzbūvē ar GitHub Actions
 * (.github/workflows/build-frontend.yml) un publicē tikai public/build/ uz servera.
 */
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

const pollMs = Number(process.env.VITE_POLL_INTERVAL_MS) || 800;
/** CloudLinux / kopīgs hosting: mazāks Rollup/CPU paralelisms, īpaši ar mazu NODE heap */
const hostingBuild = process.env.VITE_HOSTING_BUILD === '1';

export default defineConfig({
    // Docker: ātrāks pre-bundle kešs konteinerī (ne uz lēnā Windows bind mount)
    cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite',

    // .js komponentes ar template: `...` — noklusējuma vue.runtime esm to neapkopo
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js',
        },
    },

    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
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
                '**/public/build/**',
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
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                // DartTrainer SPA (Vue Router history mode); public/index.html → /
                'resources/js/dart-app/main.vue',
            ],
            // Tikai Blade — SPA izmaiņām jāiet caur HMR, ne pilnu pārlādi (ātrāk Docker/Windows)
            refresh: ['resources/views/**'],
        }),
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
