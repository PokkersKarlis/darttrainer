<script setup lang="ts">
/**
 * TrainDart auth apvalks — divu kolonnu izkārtojums: kreisais brand panelis
 * (paslēpts zem 960px) + labais formas laukums. Formu ievieto default slotā.
 */
import BrandLogo from '@/components/BrandLogo.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import { useLocale } from '@/composables/useLocale';

const { t } = useLocale();

withDefaults(
    defineProps<{
        headingLine1: string;
        headingLine2: string;
        lead: string;
    }>(),
    {},
);
</script>

<template>
    <div class="td-auth">
        <!-- Brand panelis (desktop) -->
        <aside class="td-brand">
            <div class="td-brand-top">
                <BrandLogo :width="180" class="td-brand-logo" />
                <LanguageSwitcher />
            </div>

            <div class="td-brand-body">
                <h1 class="td-brand-h">{{ headingLine1 }}<br />{{ headingLine2 }}</h1>
                <p class="td-brand-lead">{{ lead }}</p>

                <div class="td-features">
                    <div class="td-feature">
                        <span class="td-feature-ico" style="background: rgba(57, 255, 20, 0.1)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2" stroke-linecap="round">
                                <rect x="4" y="12" width="4" height="8" /><rect x="10" y="6" width="4" height="14" /><rect x="16" y="9" width="4" height="11" />
                            </svg>
                        </span>
                        <span class="td-feature-txt">{{ t('auth.brand.feature1') }}</span>
                    </div>
                    <div class="td-feature">
                        <span class="td-feature-ico" style="background: rgba(34, 211, 238, 0.1)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linecap="round">
                                <circle cx="12" cy="12" r="2" fill="#22d3ee" /><path d="M8.5 15.5a5 5 0 010-7M15.5 15.5a5 5 0 000-7" />
                            </svg>
                        </span>
                        <span class="td-feature-txt">{{ t('auth.brand.feature2') }}</span>
                    </div>
                    <div class="td-feature">
                        <span class="td-feature-ico" style="background: rgba(251, 44, 95, 0.1)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb2c5f" stroke-width="2" stroke-linecap="round">
                                <circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0" /><circle cx="17" cy="8" r="2.5" />
                            </svg>
                        </span>
                        <span class="td-feature-txt">{{ t('auth.brand.feature3') }}</span>
                    </div>
                </div>
            </div>

            <div class="td-brand-foot">{{ t('auth.brand.copyright') }}</div>
        </aside>

        <!-- Formas laukums -->
        <main class="td-form-wrap">
            <div class="td-form">
                <div class="td-mobile-top">
                    <BrandLogo :width="140" class="td-mobile-logo" />
                    <LanguageSwitcher class="td-mobile-lang" />
                </div>
                <slot />
            </div>
        </main>
    </div>
</template>

<style scoped>
.td-auth {
    min-height: 100vh;
    display: flex;
    font-family: Inter, sans-serif;
    background: #0b0f19;
    color: #f4f4f5;
}

.td-brand {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 480px;
    flex-shrink: 0;
    padding: 56px;
    background: #0d1220;
    border-right: 1px solid #1f2937;
    background-image: radial-gradient(circle at 20% 20%, rgba(57, 255, 20, 0.06), transparent 45%);
}
.td-brand-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 48px;
}
.td-brand-body {
    max-width: 420px;
}
.td-brand-h {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 44px;
    line-height: 1.05;
    margin: 0 0 20px;
}
.td-brand-lead {
    color: #94a3b8;
    font-size: 15px;
    line-height: 1.6;
    margin: 0 0 36px;
}
.td-features {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.td-feature {
    display: flex;
    align-items: center;
    gap: 14px;
}
.td-feature-ico {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.td-feature-txt {
    font-size: 14px;
    color: #cbd5e1;
}
.td-brand-foot {
    color: #475569;
    font-size: 12px;
}

.td-form-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
}
.td-form {
    width: 100%;
    max-width: 420px;
}
.td-mobile-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
}
.td-mobile-logo {
    display: block;
}

@media (min-width: 960px) {
    .td-brand {
        display: flex;
    }
    .td-mobile-top {
        display: none;
    }
}
</style>
