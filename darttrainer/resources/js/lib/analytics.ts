/**
 * Consent-gated third-party analytics. Scripts load only after explicit opt-in.
 */

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}

let analyticsLoaded = false;

function measurementId(): string | null {
    const id = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
    return typeof id === 'string' && id.trim() !== '' ? id.trim() : null;
}

export function hasAnalyticsConfig(): boolean {
    return measurementId() !== null;
}

export function setAnalyticsConsent(granted: boolean): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (window.gtag) {
        window.gtag('consent', 'update', {
            analytics_storage: granted ? 'granted' : 'denied',
        });
    }

    if (granted) {
        loadGoogleAnalytics();
    }
}

export function loadGoogleAnalytics(): void {
    const id = measurementId();

    if (!id || analyticsLoaded || typeof document === 'undefined') {
        return;
    }

    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
    };

    window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('config', id, { anonymize_ip: true });

    analyticsLoaded = true;
}
