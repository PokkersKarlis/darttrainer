<script setup>
/**
 * E-pasta apstiprināšanas satura Vue komponents (kopā ar MailTrainDartShell).
 * Izmanto priekšskatījumam; produkcijā — mail/verify-email.blade.php + x-mail.*.
 */
import MailTrainDartShell from './MailTrainDartShell.vue';
import { MAIL_THEME } from './mailTheme.js';

defineOptions({ name: 'MailVerifyEmail' });

defineProps({
  appName: { type: String, required: true },
  siteHost: { type: String, required: true },
  verifyUrl: { type: String, required: true },
  heading: { type: String, required: true },
  greeting: { type: String, required: true },
  lead: { type: String, required: true },
  buttonLabel: { type: String, required: true },
  fallbackLabel: { type: String, required: true },
  expiry: { type: String, required: true },
  footerLine: { type: String, required: true },
  siteLine: { type: String, required: true },
});

const t = MAIL_THEME;
</script>

<template>
  <MailTrainDartShell :app-name="appName" :heading="heading">
    <p
      :style="{
        margin: '0 0 14px',
        fontSize: '17px',
        lineHeight: '26px',
        fontWeight: '600',
        color: t.textBody,
      }"
    >
      {{ greeting }}
    </p>
    <p
      :style="{
        margin: '0 0 26px',
        fontSize: '15px',
        lineHeight: '24px',
        color: t.textMuted,
      }"
    >
      {{ lead }}
    </p>

    <div style="text-align: center; margin: 0 auto 26px">
      <a
        :href="verifyUrl"
        :style="{
          display: 'inline-block',
          padding: '15px 36px',
          fontSize: '16px',
          lineHeight: '20px',
          fontWeight: '800',
          color: t.ctaText,
          textDecoration: 'none',
          borderRadius: '10px',
          backgroundColor: t.accent,
          boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
        }"
      >
        {{ buttonLabel }}
      </a>
    </div>

    <p
      :style="{
        margin: '0 0 8px',
        fontSize: '12px',
        lineHeight: '18px',
        color: t.textDim,
      }"
    >
      {{ fallbackLabel }}
    </p>
    <div
      :style="{
        margin: '0 0 22px',
        backgroundColor: t.urlBoxBg,
        border: `1px solid ${t.border}`,
        borderRadius: '10px',
        padding: '12px 14px',
        fontFamily: `'Consolas','Courier New',monospace`,
        fontSize: '11px',
        lineHeight: '17px',
        color: t.urlText,
        wordBreak: 'break-all',
      }"
    >
      {{ verifyUrl }}
    </div>

    <p
      :style="{
        margin: 0,
        fontSize: '12px',
        lineHeight: '18px',
        color: t.textDim,
      }"
    >
      {{ expiry }}
    </p>

    <template #footer>
      <p
        :style="{
          margin: 0,
          fontSize: '11px',
          lineHeight: '17px',
          color: t.textFooter,
        }"
      >
        {{ footerLine }}
      </p>
      <p
        :style="{
          margin: '8px 0 0',
          fontSize: '11px',
          lineHeight: '17px',
          color: t.textFooter,
        }"
      >
        {{ siteLine }}
      </p>
    </template>
  </MailTrainDartShell>
</template>
