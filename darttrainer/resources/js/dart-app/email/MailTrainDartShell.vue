<script setup>
/**
 * Vue versija TrainDart e-pasta čaulai (priekšskatījums / nākotnes admin UI).
 * Faktisko sūtīšanu veic Blade: resources/views/components/mail/*.blade.php
 */
import { MAIL_THEME } from './mailTheme.js';

defineOptions({ name: 'MailTrainDartShell' });

defineProps({
  appName: { type: String, required: true },
  /** Virsraksts zem zīmola (piem. apstiprinājuma frāze) */
  heading: { type: String, required: true },
});

const t = MAIL_THEME;
</script>

<template>
  <div
    class="mail-traindart-shell"
    :style="{
      backgroundColor: t.bgPage,
      color: t.textBody,
      fontFamily: t.fontStack,
      minHeight: '100%',
      padding: '28px 14px',
      boxSizing: 'border-box',
    }"
  >
    <div :style="{ maxWidth: t.maxWidth, margin: '0 auto' }">
      <div
        :style="{
          height: '4px',
          borderRadius: '14px 14px 0 0',
          backgroundColor: t.accent,
        }"
      />
      <div
        :style="{
          background: `linear-gradient(180deg, ${t.cardTop} 0%, ${t.cardBottom} 100%)`,
          border: `1px solid ${t.border}`,
          borderBottom: 'none',
          padding: '22px 28px 20px',
        }"
      >
        <p style="margin: 0; font-size: 22px; line-height: 1.2">🎯</p>
        <p
          :style="{
            margin: '6px 0 0',
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: t.accent,
          }"
        >
          {{ appName }}
        </p>
        <h1
          :style="{
            margin: '10px 0 0',
            fontSize: '24px',
            lineHeight: '30px',
            fontWeight: '800',
            color: t.textPrimary,
          }"
        >
          {{ heading }}
        </h1>
      </div>
      <div
        :style="{
          backgroundColor: t.cardBottom,
          border: `1px solid ${t.border}`,
          borderRadius: '0 0 14px 14px',
          padding: '26px 28px 30px',
        }"
      >
        <slot />
      </div>
      <div v-if="$slots.footer" style="padding: 22px 16px 8px; text-align: center">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
