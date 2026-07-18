/**
 * Vienkāršs, atkarību brīvs i18n composable (LV/EN).
 * Valoda tiek glabāta viena reaktīva singltona ref (koplietota visos komponentos,
 * kas izsauc useLocale()), un persistēta localStorage, lai izvēle saglabātos starp apmeklējumiem.
 */
import { computed, ref } from 'vue';

export type Locale = 'lv' | 'en';

const STORAGE_KEY = 'td_locale';

function detectInitialLocale(): Locale {
    if (typeof window === 'undefined') return 'lv';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'lv' || saved === 'en' ? saved : 'lv';
}

// Singltona stāvoklis — visi useLocale() izsaukumi dala to pašu ref.
const locale = ref<Locale>(detectInitialLocale());
if (typeof document !== 'undefined') {
    document.documentElement.lang = locale.value;
}

type Dict = Record<string, string>;

const messages: Record<Locale, Dict> = {
    lv: {
        'lang.lv': 'LV',
        'lang.en': 'EN',

        'guest.h1Line1': 'Seko katram metienam.',
        'guest.h1Line2': 'Asini katru leju.',
        'guest.lead': 'Piesakies vai izveido kontu, lai piekļūtu savai statistikai, tiešsaistes mačiem un treniņiem.',
        'guest.register': 'Reģistrēties',
        'guest.login': 'Pieteikties',

        'header.title': 'Sākums',
        'header.welcome': 'Sveiks atpakaļ, {name}. Ķersim dubultniekus.',
        'header.search': 'Meklēt',
        'header.notifications': 'Paziņojumi',
        'header.openMenu': 'Atvērt izvēlni',
        'header.closeMenu': 'Aizvērt izvēlni',

        'nav.dashboard': 'Sākums',
        'nav.play': 'Spēlēt',
        'nav.training': 'Treniņš',
        'nav.tournaments': 'Turnīri',
        'nav.live': 'Tiešraide',
        'nav.friends': 'Draugi',

        'usercard.rank': '4. vieta · Vid. 74.2',

        'menu.profile': 'Profils',
        'menu.password': 'Parole',
        'menu.appearance': 'Izskats',
        'menu.logout': 'Iziet',

        'cards.x01.title': 'X01 vairākiem spēlētājiem',
        'cards.x01.desc': 'Izaicini draugu vai atrodi pretinieku tiešsaistē.',
        'cards.x01.start': 'Sākt spēli',

        'cards.solo.title': 'Individuāls treniņš',
        'cards.solo.desc': 'Trenējies viens. Izvēlies sākuma punktus.',
        'cards.solo.start': 'Trenēties tagad',

        'cards.cricket.title': 'Cricket režīms',
        'cards.cricket.desc': 'Aizver 15.–20. lauciņus un bulli ātrāk par pretinieku.',
        'cards.cricket.start': 'Spēlēt Cricket',

        'cards.drills.title': 'Treniņu vingrinājumi',
        'cards.drills.desc': 'Strukturētas rutīnas dubultniekiem un finišiem.',
        'cards.drills.badge': 'Drīzumā vairāk',
        'cards.drills.browse': 'Skatīt vingrinājumus',

        'panel.stats.title': 'Sniegums',
        'panel.stats.period': 'Pēdējās 7 dienas',
        'panel.form': 'Forma — pēdējās 10',

        'stat.avg': '3-metienu vid.',
        'stat.checkout': 'Checkout %',
        'stat.180s': '180-i',
        'stat.legsWon': 'Uzvarētās lejas',

        'panel.live.title': 'Notiek tagad',
        'live.leg': 'Leja',
        'live.avg': 'Vid.',

        'side.activity': 'Aktivitāte',
        'side.friends': 'Draugi',
        'side.leaderboard': 'Nedēļas līderi',

        'friend.online': 'Tiešsaistē',
        'friend.inMatch': 'Spēlē maču',
        'friend.offline': 'Nesaistē',

        'mobile.home': 'Sākums',
        'mobile.play': 'Spēlēt',
        'mobile.stats': 'Statistika',
        'mobile.profile': 'Profils',
    },
    en: {
        'lang.lv': 'LV',
        'lang.en': 'EN',

        'guest.h1Line1': 'Track every dart.',
        'guest.h1Line2': 'Sharpen every leg.',
        'guest.lead': 'Log in or create an account to access your stats, online matches and training.',
        'guest.register': 'Sign Up',
        'guest.login': 'Log In',

        'header.title': 'Dashboard',
        'header.welcome': 'Welcome back, {name}. Let’s hit some doubles.',
        'header.search': 'Search',
        'header.notifications': 'Notifications',
        'header.openMenu': 'Open menu',
        'header.closeMenu': 'Close menu',

        'nav.dashboard': 'Dashboard',
        'nav.play': 'Play',
        'nav.training': 'Training',
        'nav.tournaments': 'Tournaments',
        'nav.live': 'Live Feed',
        'nav.friends': 'Friends',

        'usercard.rank': 'Rank #4 · Avg 74.2',

        'menu.profile': 'Profile',
        'menu.password': 'Password',
        'menu.appearance': 'Appearance',
        'menu.logout': 'Log Out',

        'cards.x01.title': 'X01 Multiplayer',
        'cards.x01.desc': 'Challenge a friend or find an opponent online.',
        'cards.x01.start': 'Start Match',

        'cards.solo.title': 'Solo Practice',
        'cards.solo.desc': 'Train alone. Pick a starting score.',
        'cards.solo.start': 'Practice Now',

        'cards.cricket.title': 'Cricket Mode',
        'cards.cricket.desc': 'Close numbers 15–20 and bull before your opponent.',
        'cards.cricket.start': 'Play Cricket',

        'cards.drills.title': 'Training Drills',
        'cards.drills.desc': 'Structured routines for doubles, trebles and finishing.',
        'cards.drills.badge': 'More routines coming soon',
        'cards.drills.browse': 'Browse Drills',

        'panel.stats.title': 'Performance Stats',
        'panel.stats.period': 'Last 7 days',
        'panel.form': 'Form Guide — Last 10',

        'stat.avg': '3-Dart Avg',
        'stat.checkout': 'Checkout %',
        'stat.180s': '180s',
        'stat.legsWon': 'Legs Won',

        'panel.live.title': 'Live Now',
        'live.leg': 'Leg',
        'live.avg': 'Avg',

        'side.activity': 'Live Activity',
        'side.friends': 'Friends',
        'side.leaderboard': 'Weekly Leaderboard',

        'friend.online': 'Online',
        'friend.inMatch': 'In a match',
        'friend.offline': 'Offline',

        'mobile.home': 'Home',
        'mobile.play': 'Play',
        'mobile.stats': 'Stats',
        'mobile.profile': 'Profile',
    },
};

function interpolate(str: string, params?: Record<string, string | number>): string {
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`));
}

/**
 * @param key Tulkojuma atslēga, piem. 'nav.dashboard'
 * @param params Vērtības aizvietošanai, piem. { name: 'Kārlis' } priekš '{name}'
 */
export function useLocale() {
    const t = (key: string, params?: Record<string, string | number>): string => {
        const dict = messages[locale.value] ?? messages.lv;
        const raw = dict[key] ?? messages.lv[key] ?? key;
        return interpolate(raw, params);
    };

    const setLocale = (l: Locale) => {
        locale.value = l;
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, l);
            document.documentElement.lang = l;
        }
    };

    return { locale: computed(() => locale.value), setLocale, t };
}
