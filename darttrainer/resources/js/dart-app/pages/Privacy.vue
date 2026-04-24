<script setup>
import { useLocaleStore } from '../store/index.js';
const locale = useLocaleStore();
const t = (k) => locale.t(k);
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-black mb-3" style="color:#e8eaf0">{{ t('privacy.title') }}</h1>
    <div class="text-sm leading-relaxed space-y-4" style="color:#7b8ba8">
      <p>{{ t('privacy.intro') }}</p>
      <div class="rounded-xl p-4" style="background:#131720;border:1px solid #1e2738">
        <div class="text-xs font-bold uppercase tracking-[0.1em]" style="color:#3a4a63">{{ t('privacy.cookiesTitle') }}</div>
        <ul class="mt-2 text-sm space-y-2">
          <li><b style="color:#e8eaf0">{{ t('privacy.necessary') }}</b> — {{ t('privacy.necessaryBody') }}</li>
          <li><b style="color:#e8eaf0">{{ t('privacy.functional') }}</b> — {{ t('privacy.functionalBody') }}</li>
          <li><b style="color:#e8eaf0">{{ t('privacy.analytics') }}</b> — {{ t('privacy.analyticsBody') }}</li>
          <li><b style="color:#e8eaf0">{{ t('privacy.marketing') }}</b> — {{ t('privacy.marketingBody') }}</li>
        </ul>
      </div>
      <p class="text-xs" style="color:#3a4a63">{{ t('privacy.note') }}</p>
    </div>
  </div>
</template>

