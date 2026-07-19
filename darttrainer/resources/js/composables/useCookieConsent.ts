import { setAnalyticsConsent } from '@/lib/analytics';
import { ref } from 'vue';

export const CONSENT_STORAGE_KEY = 'traindart:cookie-consent';
export const CONSENT_VERSION = 1;

export type CookiePreferences = {
    analytics: boolean;
};

export type StoredConsent = CookiePreferences & {
    decided: boolean;
    version: number;
    updatedAt: string;
};

const preferences = ref<CookiePreferences>({ analytics: false });
const hasDecided = ref(false);
const showBanner = ref(false);
const showSettings = ref(false);
let initialized = false;

function readStoredConsent(): StoredConsent | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as StoredConsent;
        if (parsed.version !== CONSENT_VERSION || typeof parsed.decided !== 'boolean') {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

function persistConsent(state: StoredConsent): void {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
}

function applyPreferences(prefs: CookiePreferences): void {
    preferences.value = { ...prefs };
    setAnalyticsConsent(prefs.analytics);
}

function commitConsent(prefs: CookiePreferences, decided = true): void {
    const state: StoredConsent = {
        ...prefs,
        decided,
        version: CONSENT_VERSION,
        updatedAt: new Date().toISOString(),
    };

    persistConsent(state);
    hasDecided.value = decided;
    applyPreferences(prefs);
    showBanner.value = !decided;
}

function initConsentState(): void {
    if (initialized || typeof window === 'undefined') {
        return;
    }

    initialized = true;

    const stored = readStoredConsent();
    if (stored?.decided) {
        hasDecided.value = true;
        applyPreferences({ analytics: stored.analytics });
        showBanner.value = false;
        return;
    }

    applyPreferences({ analytics: false });
    showBanner.value = true;
}

export function useCookieConsent() {
    const acceptAll = () => {
        showSettings.value = false;
        commitConsent({ analytics: true });
        showBanner.value = false;
    };

    const rejectNonEssential = () => {
        showSettings.value = false;
        commitConsent({ analytics: false });
        showBanner.value = false;
    };

    const openSettings = () => {
        initConsentState();
        showBanner.value = true;
        showSettings.value = true;
    };

    const closeSettings = () => {
        showSettings.value = false;
        if (hasDecided.value) {
            showBanner.value = false;
        }
    };

    const savePreferences = (prefs: CookiePreferences) => {
        showSettings.value = false;
        commitConsent(prefs);
        showBanner.value = false;
    };

    return {
        preferences,
        hasDecided,
        showBanner,
        showSettings,
        acceptAll,
        rejectNonEssential,
        openSettings,
        closeSettings,
        savePreferences,
    };
}

if (typeof window !== 'undefined') {
    initConsentState();
}
