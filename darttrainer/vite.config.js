import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

const pollMs = Number(process.env.VITE_POLL_INTERVAL_MS) || 800;

export default defineConfig({
    // Docker: ātrāks pre-bundle kešs konteinerī (ne uz lēnā Windows bind mount)
    cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite',

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
            // Uz kopīga hostinga iestatīt VITE_MAX_PARALLEL_FILE_OPS=1 (sk. npm run build:hosting)
            maxParallelFileOps: Number(process.env.VITE_MAX_PARALLEL_FILE_OPS) || 20,
        },
    },
});
