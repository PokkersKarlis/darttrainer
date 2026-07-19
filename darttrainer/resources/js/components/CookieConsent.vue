<script setup lang="ts">
/**
 * GDPR/ePrivacy cookie banner — blocks non-essential tracking until opt-in.
 * Wire new analytics/tracking integrations through useCookieConsent + lib/analytics.
 */
import { useCookieConsent } from '@/composables/useCookieConsent';
import { useLocale } from '@/composables/useLocale';
import { Link } from '@inertiajs/vue3';
import { ref, watch } from 'vue';

const { t } = useLocale();
const {
    preferences,
    showBanner,
    showSettings,
    acceptAll,
    rejectNonEssential,
    openSettings,
    closeSettings,
    savePreferences,
} = useCookieConsent();

const draftAnalytics = ref(preferences.value.analytics);

watch(showSettings, (open) => {
    if (open) {
        draftAnalytics.value = preferences.value.analytics;
    }
});

const onSave = () => {
    savePreferences({ analytics: draftAnalytics.value });
};
</script>

<template>
    <Teleport to="body">
        <div v-if="showBanner" class="cc" role="dialog" aria-modal="true" :aria-label="t('cookies.banner.title')">
            <div class="cc-panel cc-rise">
                <div v-if="showSettings" class="cc-settings">
                    <div class="cc-settings-head">
                        <h3 class="cc-settings-title">{{ t('cookies.settings.title') }}</h3>
                        <button type="button" class="cc-icon-btn" :aria-label="t('cookies.settings.cancel')" @click="closeSettings">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="cc-category cc-category--locked">
                        <div class="cc-category-copy">
                            <p class="cc-category-title">{{ t('cookies.categories.essential.title') }}</p>
                            <p class="cc-category-desc">{{ t('cookies.categories.essential.desc') }}</p>
                        </div>
                        <span class="cc-badge">{{ t('cookies.settings.alwaysOn') }}</span>
                    </div>

                    <div class="cc-category">
                        <div class="cc-category-copy">
                            <p class="cc-category-title">{{ t('cookies.categories.analytics.title') }}</p>
                            <p class="cc-category-desc">{{ t('cookies.categories.analytics.desc') }}</p>
                        </div>
                        <button
                            type="button"
                            class="cc-toggle"
                            :class="{ 'cc-toggle--on': draftAnalytics }"
                            role="switch"
                            :aria-checked="draftAnalytics"
                            :aria-label="t('cookies.categories.analytics.title')"
                            @click="draftAnalytics = !draftAnalytics"
                        >
                            <span class="cc-toggle-knob" />
                        </button>
                    </div>

                    <div class="cc-settings-actions">
                        <button type="button" class="cc-btn cc-btn--ghost" @click="closeSettings">
                            {{ t('cookies.settings.cancel') }}
                        </button>
                        <button type="button" class="cc-btn cc-btn--primary" @click="onSave">
                            {{ t('cookies.settings.save') }}
                        </button>
                    </div>
                </div>

                <div v-else class="cc-banner">
                    <div class="cc-copy">
                        <p class="cc-kicker">TrainDart</p>
                        <h2 class="cc-title">{{ t('cookies.banner.title') }}</h2>
                        <p class="cc-body">
                            {{ t('cookies.banner.body') }}
                            <Link :href="route('privacy')" class="cc-link">{{ t('cookies.banner.privacyLink') }}</Link>
                        </p>
                    </div>

                    <div class="cc-actions">
                        <button type="button" class="cc-btn cc-btn--primary" @click="acceptAll">
                            {{ t('cookies.banner.accept') }}
                        </button>
                        <button type="button" class="cc-btn cc-btn--ghost" @click="rejectNonEssential">
                            {{ t('cookies.banner.reject') }}
                        </button>
                        <button type="button" class="cc-btn cc-btn--outline" @click="openSettings">
                            {{ t('cookies.banner.settings') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.cc {
    --cc-bg: #0b0f19;
    --cc-panel: #0d1220;
    --cc-line: #1f2937;
    --cc-muted: #64748b;
    --cc-soft: #94a3b8;
    --cc-text: #f4f4f5;
    --cc-green: #39ff14;
    --cc-cyan: #22d3ee;

    position: fixed;
    inset: auto 0 0;
    z-index: 60;
    padding: 12px 12px calc(12px + env(safe-area-inset-bottom, 0px));
    pointer-events: none;
}

.cc-panel {
    pointer-events: auto;
    max-width: 980px;
    margin: 0 auto;
    border: 1px solid var(--cc-line);
    border-radius: 16px;
    background: color-mix(in srgb, var(--cc-panel) 94%, transparent);
    color: var(--cc-text);
    box-shadow:
        0 24px 48px rgba(0, 0, 0, 0.45),
        0 0 0 1px rgba(57, 255, 20, 0.06);
    backdrop-filter: blur(12px);
    overflow: hidden;
}

.cc-banner {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 20px 24px;
    padding: 20px 22px;
    align-items: center;
}

.cc-copy {
    min-width: 0;
}

.cc-kicker {
    margin: 0 0 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--cc-green);
}

.cc-title {
    margin: 0 0 8px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    line-height: 1.05;
    color: var(--cc-text);
}

.cc-body {
    margin: 0;
    color: var(--cc-soft);
    font-size: 14px;
    line-height: 1.6;
}

.cc-link {
    color: var(--cc-green);
    font-weight: 600;
    text-decoration: none;
}
.cc-link:hover {
    text-decoration: underline;
}

.cc-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
}

.cc-btn {
    border-radius: 10px;
    padding: 11px 16px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    border: 1px solid transparent;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.cc-btn:hover {
    transform: translateY(-1px);
}
.cc-btn--primary {
    background: var(--cc-green);
    color: var(--cc-bg);
    box-shadow: 0 0 18px rgba(57, 255, 20, 0.25);
}
.cc-btn--ghost {
    background: transparent;
    color: var(--cc-soft);
    border-color: var(--cc-line);
}
.cc-btn--ghost:hover {
    color: var(--cc-text);
    border-color: #334155;
}
.cc-btn--outline {
    background: color-mix(in srgb, var(--cc-cyan) 10%, transparent);
    color: var(--cc-cyan);
    border-color: color-mix(in srgb, var(--cc-cyan) 35%, transparent);
}

.cc-settings {
    padding: 18px 22px 20px;
}

.cc-settings-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
}

.cc-settings-title {
    margin: 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: var(--cc-text);
}

.cc-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--cc-line);
    background: transparent;
    color: var(--cc-soft);
    cursor: pointer;
}
.cc-icon-btn:hover {
    color: var(--cc-text);
    border-color: #334155;
}

.cc-category {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 0;
    border-top: 1px solid var(--cc-line);
}
.cc-category--locked {
    opacity: 0.92;
}

.cc-category-copy {
    min-width: 0;
}

.cc-category-title {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 700;
    color: var(--cc-text);
}

.cc-category-desc {
    margin: 0;
    font-size: 13px;
    line-height: 1.55;
    color: var(--cc-soft);
}

.cc-badge {
    flex-shrink: 0;
    margin-top: 2px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--cc-line);
    color: var(--cc-muted);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.cc-toggle {
    position: relative;
    flex-shrink: 0;
    width: 46px;
    height: 28px;
    border-radius: 999px;
    border: 1px solid #334155;
    background: #131a26;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
}
.cc-toggle--on {
    background: color-mix(in srgb, var(--cc-green) 22%, #131a26);
    border-color: color-mix(in srgb, var(--cc-green) 55%, #334155);
}
.cc-toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #64748b;
    transition: transform 0.2s ease, background 0.2s ease;
}
.cc-toggle--on .cc-toggle-knob {
    transform: translateX(18px);
    background: var(--cc-green);
}

.cc-settings-actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--cc-line);
}

.cc-rise {
    animation: cc-rise 0.45s ease both;
}
@keyframes cc-rise {
    from {
        opacity: 0;
        transform: translateY(16px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 760px) {
    .cc-banner {
        grid-template-columns: 1fr;
    }
    .cc-actions {
        justify-content: stretch;
    }
    .cc-btn {
        flex: 1 1 calc(50% - 4px);
        min-width: 0;
    }
    .cc-actions .cc-btn--outline {
        flex-basis: 100%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .cc-rise,
    .cc-btn,
    .cc-toggle,
    .cc-toggle-knob {
        animation: none;
        transition: none;
    }
    .cc-btn:hover {
        transform: none;
    }
}
</style>
