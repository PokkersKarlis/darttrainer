/**
 * Inertia.js + Laravel Vite plugin.
 *
 * SVARĪGI (migrācijas periods): vecais Vite-only SPA (resources/js/dart-app,
 * base=/dart-app/) VAIRS netiek būvēts no šī config faila. Tā jau uzbūvētie
 * asseti (public/dart-app/) turpina strādāt nemainīti — nginx/ServeSpaController
 * tos servē kā statiskus failus. Ja vēl vajag pārbūvēt veco SPA daļu manuāli:
 *   npx vite build --config vite.config.dart-app.js
 * (izveido šo failu ar veco konfigurāciju, ja tas kādreiz vajadzīgs).
 *
 * Jaunās (Inertia) lapas iet caur standarta Laravel Vite plūsmu:
 *   resources/js/app.js → resources/js/pages/**\/*.vue
 *   Build izvads: public/build/ (manifest.json), ko lasa @vite() Blade direktīva.
 */
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

const pollMs = Number(process.env.VITE_POLL_INTERVAL_MS) || 800;

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
        },
    },

    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
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

    // Docker: ātrāks pre-bundle kešs konteinerī (ne uz lēnā Windows bind mount)
    cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite',

    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        cors: true,
        // Absolūti moduļu URL (http://localhost:5173/…), lai strādā aiz nginx (:8088).
        origin: 'http://localhost:5173',
        hmr: {
            host: 'localhost',
            port: 5173,
            protocol: 'ws',
        },
        watch: {
            // Retāks polling = mazāk slodzes uz Windows bind mount (HMR joprojām strādā)
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
        include: ['vue', '@inertiajs/vue3', 'pinia', 'axios'],
    },

    build: {
        chunkSizeWarningLimit: 500,
        reportCompressedSize: false,
    },
});
