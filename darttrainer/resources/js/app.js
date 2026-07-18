import './bootstrap';

// Kopīgais dizaina CSS (dth-* shell klases u.c.) — tas pats, ko lieto vecais dart-app SPA,
// lai Inertia lapu izskats paliek identisks. Tiek dzēsts Phase 6, kad vecais SPA aiziet.
// (app.css jau ielādēts caur @vite() app.blade.php — šeit tikai shell dizains.)
import '../css/dart-spa.css';
import '../css/home-design.css';
import '../css/lobby-design-tokens.css';

import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createPinia } from 'pinia';

const appName = import.meta.env.VITE_APP_NAME || 'DartTrainer';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.vue`,
            import.meta.glob('./pages/**/*.vue'),
        ),
    setup({ el, App, props, plugin }) {
        const pinia = createPinia();

        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(pinia)
            .mount(el);

        // dart-spa.css slēpj #app līdz montāžai (#app:not([data-app-mounted])).
        // Vecais main.js šo uzlika pats; Inertia setup to jādara šeit, citādi lapa paliek neredzama.
        el.setAttribute('data-app-mounted', '');
    },
    progress: {
        color: '#4f46e5',
    },
});
