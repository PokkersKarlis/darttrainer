import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/dart-app/**/*.{js,vue}',
    ],

    theme: {
        extend: {
            /* Augstums pret mobilā pārlūka dīnam: h-screen joprojām = 100vh; pilnam apvalkam
               izmanto min-h-dvh / h-dvh, nevis h-screen, ja iespējams. */
            minHeight: {
                dvh: '100dvh',
            },
            height: {
                dvh: '100dvh',
            },
            colors: {
                navy: {
                    950: '#060d18',
                    900: '#0a1120',
                    800: '#0f1c30',
                    700: '#162540',
                    600: '#1e3050',
                },
            },
            fontFamily: {
                sans: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'sans-serif',
                    ...defaultTheme.fontFamily.sans,
                ],
            },
        },
    },

    plugins: [forms],
};
