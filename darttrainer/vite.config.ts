import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import laravel from 'laravel-vite-plugin';
import path from 'path';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
    // Produkcijā (build): asseti dzīvo shared hosting apakšceļā.
    // Izstrādē (serve): sakne '/', lai Vite dev serveris + HMR strādā uz localhost.
    base: command === 'build' ? '/darttrainer/darttrainer/public/build/' : '/',
    plugins: [
        laravel({
            input: ['resources/js/app.ts'], // TypeScript ieejas punkts
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
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    css: {
        postcss: {
            plugins: [tailwindcss, autoprefixer],
        },
    },
    // Docker vides atbalsts (HMR caur konteineri / Windows bind-mount)
    server: {
        host: '0.0.0.0',
        hmr: {
            host: 'localhost',
        },
        watch: {
            usePolling: true,
        },
    },
}));
