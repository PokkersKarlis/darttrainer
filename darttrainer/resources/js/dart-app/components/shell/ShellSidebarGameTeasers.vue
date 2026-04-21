<script setup>
import { useRouter } from 'vue-router';
import { useLocaleStore } from '../../store/index.js';
import { useCanPlayGames } from '../../composables/useCanPlayGames.js';
import { useCanPlayX01 } from '../../composables/useCanPlayX01.js';

defineOptions({ name: 'ShellSidebarGameTeasers' });

const locale = useLocaleStore();
const router = useRouter();
const canPlay = useCanPlayGames();
const canPlayX01 = useCanPlayX01();
const t = (k) => locale.t(k);

function x01TeaserTitle() {
  if (!canPlay.value) return t('nav.gamesTeaserHint');
  if (!canPlayX01.value) return t('nav.x01UnavailableHint');
  return '';
}

function goCricket(query = {}) {
  if (!canPlay.value) return;
  router.push({ path: '/lobby/cricket', query });
}

function goX01(variant) {
  if (!canPlay.value || !canPlayX01.value) return;
  router.push({ path: '/lobby/x01', query: { variant: String(variant) } });
}
</script>

<template>
  <div style="margin-top: 8px; padding-top: 10px; border-top: 1px solid #162540">
    <div
      style="
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #64748b;
        margin-bottom: 8px;
        line-height: 1.3;
      "
    >
      {{ t('nav.gamesOffered') }}
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px">
      <button
        type="button"
        :disabled="!canPlay"
        :title="!canPlay ? t('nav.gamesTeaserHint') : ''"
        style="
          width: 100%;
          text-align: left;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #1e3050;
          background: #0f1c30;
          color: #e2e8f0;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        "
        :style="
          !canPlay
            ? { opacity: 0.45, cursor: 'not-allowed' }
            : {}
        "
        @click="goCricket()"
      >
        🏏 {{ t('nav.gameCricket') }}
      </button>
      <button
        type="button"
        :disabled="!canPlay || !canPlayX01"
        :title="x01TeaserTitle()"
        style="
          width: 100%;
          text-align: left;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #1e3050;
          background: #0f1c30;
          color: #e2e8f0;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        "
        :style="
          !canPlay || !canPlayX01
            ? { opacity: 0.45, cursor: 'not-allowed' }
            : {}
        "
        @click="goX01(501)"
      >
        🎯 {{ t('nav.gameX01501') }}
      </button>
      <button
        type="button"
        :disabled="!canPlay || !canPlayX01"
        :title="x01TeaserTitle()"
        style="
          width: 100%;
          text-align: left;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #1e3050;
          background: #0f1c30;
          color: #e2e8f0;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        "
        :style="
          !canPlay || !canPlayX01
            ? { opacity: 0.45, cursor: 'not-allowed' }
            : {}
        "
        @click="goX01(301)"
      >
        🎯 {{ t('nav.gameX01301') }}
      </button>
    </div>
  </div>
</template>
