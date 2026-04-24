<script setup>
import { reactive, watchEffect } from 'vue';
import { useLocaleStore } from '../store/index.js';
import { useCookieConsent } from '../composables/useCookieConsent.js';

defineOptions({ name: 'CookieConsent' });

const locale = useLocaleStore();
const t = (k) => locale.t(k);
const consent = useCookieConsent();

const prefs = reactive({
  functional: false,
  analytics: false,
  marketing: false,
});

watchEffect(() => {
  const c = consent.state.consent;
  if (c) {
    prefs.functional = !!c.functional;
    prefs.analytics = !!c.analytics;
    prefs.marketing = !!c.marketing;
  }
});

function save() {
  consent.savePreferences(prefs);
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="consent.state.open"
      class="fixed inset-0 z-[10000] flex items-end justify-center p-3 sm:p-4"
      style="background: rgba(0, 0, 0, 0.55)"
    >
      <div
        class="w-full max-w-2xl rounded-2xl p-4 sm:p-5 shadow-2xl"
        style="background: #0f1520; border: 1px solid #1e2738"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style="background: linear-gradient(135deg, #f5a623, #f5c842); color: #0b0e14; font-weight: 900"
          >
            C
          </div>
          <div class="min-w-0">
            <div class="text-base sm:text-lg font-black" style="color: #e8eaf0">
              {{ t('consent.title') }}
            </div>
            <div class="text-sm mt-1 leading-snug" style="color: #7b8ba8">
              {{ t('consent.body') }}
              <a href="/privacy" class="underline" style="color: #f5a623">{{ t('consent.policyLink') }}</a>
            </div>
          </div>
        </div>

        <div class="mt-4 grid gap-2">
          <div class="flex items-center justify-between rounded-xl px-3 py-2" style="background:#0b0e14;border:1px solid #1e2738">
            <div>
              <div class="text-sm font-black" style="color:#e8eaf0">{{ t('consent.necessary') }}</div>
              <div class="text-xs" style="color:#3a4a63">{{ t('consent.necessaryHint') }}</div>
            </div>
            <div class="text-xs font-bold px-2 py-1 rounded-lg" style="background:#131720;border:1px solid #1e2738;color:#7b8ba8">
              {{ t('consent.alwaysOn') }}
            </div>
          </div>

          <label class="flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer" style="background:#0b0e14;border:1px solid #1e2738">
            <div>
              <div class="text-sm font-black" style="color:#e8eaf0">{{ t('consent.functional') }}</div>
              <div class="text-xs" style="color:#3a4a63">{{ t('consent.functionalHint') }}</div>
            </div>
            <input type="checkbox" v-model="prefs.functional" class="w-5 h-5" />
          </label>

          <label class="flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer" style="background:#0b0e14;border:1px solid #1e2738">
            <div>
              <div class="text-sm font-black" style="color:#e8eaf0">{{ t('consent.analytics') }}</div>
              <div class="text-xs" style="color:#3a4a63">{{ t('consent.analyticsHint') }}</div>
            </div>
            <input type="checkbox" v-model="prefs.analytics" class="w-5 h-5" />
          </label>

          <label class="flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer" style="background:#0b0e14;border:1px solid #1e2738">
            <div>
              <div class="text-sm font-black" style="color:#e8eaf0">{{ t('consent.marketing') }}</div>
              <div class="text-xs" style="color:#3a4a63">{{ t('consent.marketingHint') }}</div>
            </div>
            <input type="checkbox" v-model="prefs.marketing" class="w-5 h-5" />
          </label>
        </div>

        <div class="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            class="flex-1 rounded-xl px-4 py-2.5 text-sm font-black transition"
            style="background:#131720;border:1px solid #1e2738;color:#e8eaf0"
            @click="consent.rejectAll()"
          >
            {{ t('consent.rejectAll') }}
          </button>
          <button
            type="button"
            class="flex-1 rounded-xl px-4 py-2.5 text-sm font-black transition"
            style="background:#0b0e14;border:1px solid #252d3d;color:#7b8ba8"
            @click="save"
          >
            {{ t('consent.save') }}
          </button>
          <button
            type="button"
            class="flex-1 rounded-xl px-4 py-2.5 text-sm font-black transition"
            style="background:linear-gradient(135deg,#f5a623,#f5c842);color:#0b0e14"
            @click="consent.acceptAll()"
          >
            {{ t('consent.acceptAll') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

