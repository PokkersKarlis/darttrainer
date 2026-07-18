import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import laravel from 'laravel-vite-plugin';
import path from 'path';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';

export default defineConfig({
    base: '/darttrainer/darttrainer/public/build/',
    plugins: [
        laravel({
            input: ['resources/js/app.ts'], // Tavs TypeScript ieejas punkts
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
    // ---- Pievienojam šo bloku Docker vides atbalstam ----
    server: {
        host: '0.0.0.0', // Ļauj konteineram klausīties visus tīkla pieprasījumus
        hmr: {
            host: 'localhost', // Pārlūks meklēs karsto izmaiņu serveri uz localhost
        },
        watch: {
            usePolling: true, // Nodrošina tūlītēju koda maiņas uztveršanu caur Docker volumes
        },
    },
});