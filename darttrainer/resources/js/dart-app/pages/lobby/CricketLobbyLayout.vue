<script setup>
import { inject, computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../../store/index.js';
import { X01_LOBBY_AND_TRAINING_ENABLED } from '../../composables/useCanPlayX01.js';
import HomeStrokeIcon from '../../components/home/HomeStrokeIcon.vue';

const l = inject('lobbyCtx');
if (!l) {
  throw new Error('CricketLobbyLayout: missing lobbyCtx');
}

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const t = l.t;
const isActive = (path) => route.path === path;

function normalizedCricketTypeFromQuery() {
  const raw = route.query.cricket_type;
  if (raw === undefined || raw === null || String(raw).trim() === '') return null;
  const s = String(raw).toLowerCase();
  if (s === 'random') return 'random';
  if (s === 'standard') return 'standard';
  return null;
}

const needCricketTypePick = computed(
  () => normalizedCricketTypeFromQuery() === null && !l.room && !l.blockedRoomForType,
);

function pickCricketType(kind) {
  const ct = kind === 'random' ? 'random' : 'standard';
  router.replace({ path: '/lobby/cricket', query: { ...route.query, cricket_type: ct } });
}

function setWizardCricketType(kind) {
  const ct = kind === 'random' ? 'random' : 'standard';
  l.createForm.cricket_type = ct;
  if (normalizedCricketTypeFromQuery() !== null) {
    router.replace({ path: '/lobby/cricket', query: { ...route.query, cricket_type: ct } });
  }
}

const DIF = {
  easy: { c: '#3ecf8e', w: 25 },
  medium: { c: '#f5a623', w: 50 },
  hard: { c: '#ff5252', w: 75 },
  expert: { c: '#a855f7', w: 95 },
};

const playStyleKeys = ['aggressive', 'defensive', 'balance', 'random'];

const mobileAiLabel = (bot) => {
  const d = (bot?.difficulty || 'medium');
  const s = (bot?.playStyle || 'balance');
  return `${d} · ${s}`;
};

const barGradientExpert = 'linear-gradient(90deg, #a855f7, #f5a623)';

function onBotNameInput(botId, ev) {
  l.setAiBotField(botId, { name: ev.target.value });
}

function onDifficulty(botId, key) {
  l.setAiBotField(botId, { difficulty: key });
}

function onPlayStyle(botId, key) {
  l.setAiBotField(botId, { playStyle: key });
}

const onlineName = computed(() => auth.user?.name || '—');
</script>

<template>
  <div
    class="lobby-v2 lobby-v2--cricket flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden lg:h-full lg:min-h-0 lg:flex-row"
  >
    <!-- Desktop: kreisā 200px navigācija -->
    <aside
      class="hidden w-[200px] flex-shrink-0 flex-col border-r border-[#1e2738] bg-[#0f1520] lg:flex"
    >
      <div class="flex h-12 items-center gap-2.5 pl-3.5 pr-2">
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style="background: linear-gradient(135deg, #f5a623, #f5c842); font-size: 16px; color: #0b0e14"
        >
          🎯
        </div>
        <span class="text-sm font-bold text-[#e8eaf0]">traindart</span>
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto">
        <RouterLink
          to="/"
          class="lobby-v2-nav-item"
          :class="{ 'lobby-v2-nav-item--active': isActive('/') }"
        >
          <span>🏠</span> {{ t('nav.home') }}
        </RouterLink>
        <div class="lobby-v2-section-label">Multiplayer</div>
        <RouterLink
          to="/lobby/cricket"
          class="lobby-v2-nav-item"
          :class="{ 'lobby-v2-nav-item--active': isActive('/lobby/cricket') }"
        >
          <span>🎯</span> {{ t('lobby.title') }}
        </RouterLink>
        <RouterLink
          to="/friends"
          class="lobby-v2-nav-item"
          :class="{ 'lobby-v2-nav-item--active': isActive('/friends') }"
        >
          <span>👥</span> {{ t('nav.friends') }}
        </RouterLink>
        <div v-if="X01_LOBBY_AND_TRAINING_ENABLED" class="lobby-v2-section-label">Treniņš</div>
        <RouterLink
          v-if="X01_LOBBY_AND_TRAINING_ENABLED"
          to="/training/x01"
          class="lobby-v2-nav-item"
          :class="{ 'lobby-v2-nav-item--active': isActive('/training/x01') }"
        >
          <span>⚡</span> {{ t('nav.x01solo') }}
        </RouterLink>
        <div class="lobby-v2-section-label">Progress</div>
        <RouterLink
          to="/stats"
          class="lobby-v2-nav-item"
          :class="{ 'lobby-v2-nav-item--active': isActive('/stats') }"
        >
          <span>📊</span> {{ t('nav.stats') }}
        </RouterLink>
        <div class="lobby-v2-section-label">Spēļu veidi</div>
        <div class="px-3.5 py-2 pl-[14px] text-[13px] font-normal text-[#f5a62380]">
          <span>🎯</span> Cricket
        </div>
        <RouterLink
          v-if="X01_LOBBY_AND_TRAINING_ENABLED"
          to="/lobby/x01"
          class="px-3.5 py-2 pl-[14px] text-[13px] text-[#7b8ba8] hover:text-[#e8eaf0]"
        >
          <span>⭐</span> X01 · 501
        </RouterLink>
      </div>
      <div class="mt-auto border-t border-[#1e2738] p-2">
        <a
          href="https://discord.com/"
          rel="noopener noreferrer"
          target="_blank"
          class="flex items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-medium"
          style="color: #5865f2"
        >
          <span class="text-lg" aria-hidden="true">💬</span> Discord
        </a>
      </div>
    </aside>

    <!-- Galvenā kolonna -->
    <div
      class="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      :class="l.mobileAiComposerOpen ? '' : ''"
    >
      <div
        v-if="needCricketTypePick"
        class="absolute inset-0 z-[40] flex flex-col items-center justify-center gap-3 bg-[#0b0e14]/94 px-4 py-6 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        :aria-label="t('lobby.cricketTypePickTitle')"
      >
        <div class="dth-start-panel">
          <div class="dth-start-h">
            {{ t('lobby.cricketTypePickTitle') }}
          </div>
          <button
            type="button"
            class="dth-start-row dth-start-row--on"
            @click="pickCricketType('standard')"
          >
            <span class="dth-start-row-ico" style="background: #3ecf8e33">
              <HomeStrokeIcon name="target" :size="18" color="#3ecf8e" />
            </span>
            <span class="dth-start-row-meta">
              <span>{{ t('lobby.cricketLabelStandard') }}</span>
              <span class="dth-start-row-d">{{ t('lobby.cricketStandardDesc') }}</span>
            </span>
          </button>
          <button type="button" class="dth-start-row" @click="pickCricketType('random')">
            <span class="dth-start-row-ico" style="background: #a855f733">
              <HomeStrokeIcon name="flame" :size="18" color="#a855f7" />
            </span>
            <span class="dth-start-row-meta">
              <span>{{ t('lobby.cricketLabelRandom') }}</span>
              <span class="dth-start-row-d">{{ t('lobby.cricketRandomDesc') }}</span>
            </span>
          </button>
        </div>
      </div>
      <!-- Augšas josla: mobilais -->
      <header
        class="flex h-12 shrink-0 items-center gap-3 border-b border-[#1e2738] bg-[#0f1520] px-4 lg:hidden"
      >
        <button
          v-if="l.mobileAiComposerOpen"
          type="button"
          class="p-0 text-[#f5a623]"
          @click="l.mobileAiComposerOpen = false"
        >
          <span class="text-xl" aria-hidden="true">←</span>
        </button>
        <h1 class="min-w-0 flex-1 truncate text-sm font-bold text-[#e8eaf0]">
          {{ l.mobileAiComposerOpen ? 'AI Composer' : t('lobby.titleCricket') }}
        </h1>
        <span
          v-if="l.mobileAiComposerOpen"
          class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style="background: #f5a62322; color: #f5a623"
        >BETA</span>
        <button
          v-else
          type="button"
          class="flex items-center gap-1 rounded-lg border border-[#f5a62340] px-2 py-1.5"
          style="background: linear-gradient(135deg, #f5a62320, #a855f715); color: #f5a623; font-size: 11px; font-weight: 700"
          @click="l.mobileAiComposerOpen = true"
        >
          <span aria-hidden="true">🤖</span> AI
        </button>
      </header>

      <!-- Desktop: augšas josla -->
      <div
        class="hidden h-[52px] shrink-0 items-center justify-between border-b border-[#1e2738] px-6 lg:flex"
      >
        <div class="min-w-0">
          <h1 class="text-base font-bold text-[#e8eaf0]">{{ t('lobby.titleCricket') }}</h1>
          <p class="text-[11px] text-[#7b8ba8]">{{ t('lobby.subtitleCricket') }}</p>
        </div>
        <div class="flex items-center gap-2">
          <div
            class="flex items-center gap-2 rounded-lg border border-[#252d3d] bg-[#131720] px-3 py-1.5"
          >
            <span
              class="h-2 w-2 shrink-0 rounded-full"
              style="background: #3ecf8e"
              aria-hidden="true"
            />
            <span class="text-xs font-semibold text-[#e8eaf0]">{{ onlineName }}</span>
          </div>
          <button
            v-if="auth.hydrated && auth.user"
            type="button"
            class="rounded-lg border border-[#3a1515] bg-[#2a1010] px-3.5 py-2 text-[13px] font-semibold"
            style="color: #ff5252"
            @click="auth.logout(); router.push('/login')"
          >
            {{ t('shell.logout') }}
          </button>
        </div>
      </div>

      <!-- Vīzards soļi -->
      <div
        v-if="!l.mobileAiComposerOpen"
        class="flex flex-shrink-0 items-center border-b border-[#1e2738] px-6 py-3.5"
      >
        <div class="flex w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold" :style="l.createWizardStep === 1 ? { width: '28px', height: '28px', background: 'linear-gradient(135deg, #f5a623, #f5c842)', color: '#0b0e14' } : { width: '28px', height: '28px', background: '#252d3d', color: '#7b8ba8' }">1</div>
        <div class="pl-2 pr-1 text-xs font-semibold tracking-wide" :class="l.createWizardStep === 1 ? 'text-[#7b8ba8]' : 'text-[#7b8ba8]'">
          <span :style="l.createWizardStep === 1 ? { letterSpacing: '0.08em' } : {}">SPĒLE</span>
        </div>
        <div class="mx-4 h-px min-w-4 flex-1" style="background: #252d3d" />
        <div class="pl-1 pr-2 text-xs font-semibold" :class="l.createWizardStep === 2 ? 'text-[#f5a623]' : 'text-[#7b8ba8]'">SPĒLĒTĀJI</div>
        <div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold" :style="l.createWizardStep === 2 ? { background: 'linear-gradient(135deg, #f5a623, #f5c842)', color: '#0b0e14' } : { background: '#252d3d', color: '#7b8ba8' }">2</div>
      </div>

      <!-- Saturs: mobilais AI pilnekrāns -->
      <div
        v-if="l.mobileAiComposerOpen"
        class="min-h-0 flex-1 overflow-y-auto p-4"
      >
        <div
          v-for="bot in l.aiBots"
          :key="bot.id"
          class="mb-4 overflow-hidden rounded-xl border border-[#252d3d] bg-[#131720]"
        >
          <div
            class="px-3 py-3"
            :style="bot.id === 1
              ? { borderBottom: '1px solid #1e2738' }
              : { borderBottom: '1px solid #1e2738' }"
          >
            <p class="text-[11px] font-medium uppercase tracking-wider text-[#7b8ba8]">AI</p>
            <input
              :value="bot.name"
              class="mt-0.5 w-full border-0 bg-transparent text-[15px] font-semibold text-[#e8eaf0] outline-none"
              @input="onBotNameInput(bot.id, $event)"
            />
          </div>
          <div class="p-3">
            <p class="text-[11px] font-bold text-[#e8eaf0]">Grūtības pakāpe</p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <button
                v-for="(cfg, key) in DIF"
                :key="key"
                type="button"
                class="rounded border px-2 py-1 text-xs font-semibold"
                :style="bot.difficulty === key
                  ? { border: `1px solid ${cfg.c}`, background: cfg.c + '22', color: cfg.c }
                  : { border: '1px solid #252d3d', color: '#7b8ba8' }"
                @click="onDifficulty(bot.id, key)"
              >{{ key }}</button>
            </div>
            <div class="mt-3 h-1.5 overflow-hidden rounded-full" style="background: #0b0e14">
              <div
                class="h-full rounded-full transition-all duration-300"
                :style="{
                  width: `${DIF[bot.difficulty]?.w ?? 50}%`,
                  background: bot.difficulty === 'expert' ? barGradientExpert : (DIF[bot.difficulty]?.c || '#f5a623'),
                }"
              />
            </div>
            <p class="mt-3 text-[11px] font-bold text-[#7b8ba8]">Stils</p>
            <div class="mt-2 grid grid-cols-2 gap-1.5">
              <button
                v-for="ps in playStyleKeys"
                :key="ps"
                type="button"
                class="rounded-md border py-1.5 text-center text-xs font-semibold"
                :style="bot.playStyle === ps
                  ? { border: '1px solid #f5a62380', background: '#3a2a0a', color: '#f5a623' }
                  : { border: '1px solid #252d3d', background: '#0b0e14', color: '#7b8ba8' }"
                @click="onPlayStyle(bot.id, ps)"
              >{{ ps }}</button>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="w-full py-3.5 text-[15px] font-semibold"
          style="background: linear-gradient(135deg, #f5a623, #f5c842); color: #0b0e14; border-radius: 12px; border: none"
          @click="l.mobileAiComposerOpen = false"
        >
          {{ t('lobby.wizardStartGame') }} ✓
        </button>
      </div>

      <!-- Galvenā cilnes zona (Lokālie / AI) — tikai solis 2 + local, desktop + mobilais -->
      <div
        v-else
        class="min-h-0 flex min-w-0 flex-1 flex-col overflow-hidden"
      >
          <p v-if="l.error && l.createWizardStep === 2" class="shrink-0 px-4 pt-2 text-center text-xs text-red-400 lg:px-6">
            {{ l.error }}
          </p>
          <div
            v-if="l.createWizardStep === 2 && l.createForm.play_mode === 'local'"
            class="flex flex-shrink-0 border-b border-[#1e2738] px-6"
          >
          <button
            type="button"
            class="flex items-center gap-2 border-b-2 border-transparent py-2.5 px-4 text-[13px] font-semibold"
            :class="l.lobbyPlayerMainTab === 'local' ? 'border-[#f5a623] text-[#f5a623]' : 'text-[#7b8ba8]'"
            @click="l.lobbyPlayerMainTab = 'local'"
          >
            {{ t('lobby.localPanelTitle') }}
          </button>
          <button
            type="button"
            class="flex items-center gap-2 border-b-2 border-transparent py-2.5 px-4 text-[13px] font-semibold"
            :class="l.lobbyPlayerMainTab === 'ai' ? 'border-[#f5a623] text-[#f5a623]' : 'text-[#7b8ba8]'"
            @click="l.lobbyPlayerMainTab = 'ai'"
          >
            AI
            <span
              class="rounded-full px-1.5 py-px text-[10px] font-bold"
              style="background: #f5a62322; color: #f5a623"
            >JAUNS</span>
          </button>
        </div>

        <div
          v-if="l.createWizardStep === 1"
          class="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6"
        >
          <div
            v-if="l.auth.user && l.blockedRoomForType"
            class="mb-3 rounded-2xl border border-[#065f46] bg-gradient-to-br from-[#052e16] to-[#064e3b] px-3 py-2.5"
          >
            <p class="text-[10px] leading-snug text-emerald-100/90">{{ t('lobby.wizardStep1ResumeHint') }}</p>
            <div class="mt-2 flex items-center justify-between gap-2">
              <p class="min-w-0 text-[10px] font-semibold text-slate-200">
                <span class="truncate">{{ l.blockedRoomSummaryLine(l.blockedRoomForType) }}</span>
                <span class="font-mono text-amber-400"> {{ l.blockedRoomForType.code }}</span>
              </p>
              <button
                type="button"
                :disabled="l.loading"
                class="shrink-0 rounded-lg bg-[#10b981] px-2.5 py-1.5 text-[11px] font-bold text-white disabled:opacity-40"
                @click="l.continueExistingTypeRoom()"
              >{{ t('lobby.activeForTypeContinue') }}</button>
            </div>
          </div>
          <p
            v-if="l.error && l.createWizardStep === 1"
            class="mb-2 text-center text-xs text-red-400"
          >{{ l.error }}</p>
          <p class="mb-3 text-[9px] font-bold uppercase tracking-widest" style="color: #2e3a50">{{ t('lobby.playModeTitle') }}</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="rounded-xl border-2 p-3 text-left"
              :style="l.createForm.play_mode === 'online' ? { borderColor: 'rgba(74, 158, 255, 0.6)', background: 'rgba(74, 158, 255, 0.1)' } : { borderColor: '#252d3d' }"
              @click="l.createForm.play_mode = 'online'"
            >
              <div class="text-sm font-bold text-[#e8eaf0]">{{ t('lobby.playOnline') }}</div>
              <div class="mt-1 text-[10px] text-[#7b8ba8]">{{ t('lobby.playOnlineDesc') }}</div>
            </button>
            <button
              type="button"
              class="rounded-xl border-2 p-3 text-left"
              :style="l.createForm.play_mode === 'local' ? { borderColor: '#f5a623', background: 'rgba(245, 166, 35, 0.1)' } : { borderColor: '#252d3d' }"
              @click="l.createForm.play_mode = 'local'; l.loadFriendsAndPresets()"
            >
              <div class="text-sm font-bold text-[#e8eaf0]">{{ t('lobby.playLocal') }}</div>
              <div class="mt-1 text-[10px] text-[#7b8ba8]">{{ t('lobby.playLocalDesc') }}</div>
            </button>
          </div>
          <div class="mt-4 rounded-xl border border-[#252d3d] bg-[#131720] p-3">
            <p class="mb-2 text-[9px] font-bold text-[#7b8ba8]">{{ t('lobby.cricketType') }}</p>
            <div class="flex gap-1 rounded-lg bg-[#0b0e14] p-1">
              <button
                type="button"
                class="flex-1 rounded-md py-2 text-xs font-bold"
                :style="l.createForm.cricket_type === 'standard' ? { background: '#3ecf8e', color: '#0b0e14' } : { color: '#7b8ba8' }"
                @click="setWizardCricketType('standard')"
              >{{ t('lobby.cricketLabelStandard') }}</button>
              <button
                type="button"
                class="flex-1 rounded-md py-2 text-xs font-bold"
                :style="l.createForm.cricket_type === 'random' ? { background: '#3ecf8e', color: '#0b0e14' } : { color: '#7b8ba8' }"
                @click="setWizardCricketType('random')"
              >{{ t('lobby.cricketLabelRandom') }}</button>
            </div>
          </div>
        </div>

        <div
          v-else-if="l.createWizardStep === 2"
          class="min-h-0 flex flex-1 flex-col overflow-hidden"
        >
          <div
            v-if="l.createForm.play_mode === 'local' && l.lobbyPlayerMainTab === 'local'"
            class="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6"
          >
            <div
              class="mb-3 rounded-xl border border-[#252d3d] bg-[#131720] p-4"
            >
              <div class="mb-1 flex items-start justify-between">
                <div>
                  <h2 class="text-sm font-bold text-[#e8eaf0]">{{ t('lobby.localRosterHeading') }}</h2>
                  <p class="text-xs text-[#7b8ba8]">{{ t('lobby.localCap') }}</p>
                </div>
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style="background: #3a2a0a; color: #f5a623"
                >{{ 1 + l.localRosterCount }}/4</span>
              </div>
              <div class="mt-2 text-xs font-semibold" style="color: #f5a623">
                ★ {{ (l.auth.user?.name || 'Host') }} – {{ t('lobby.localHostShort') }}
              </div>
            </div>

            <div class="mb-3 flex gap-0.5 rounded-lg border border-[#1e2738] bg-[#0b0e14] p-1">
              <button
                type="button"
                class="flex-1 rounded-md py-2 text-[11px] font-bold"
                :style="l.localPickerTab === 'friends' ? { background: 'linear-gradient(135deg, #f5a623, #f5c842)', color: '#0b0e14' } : { color: '#7b8ba8' }"
                @click="l.localPickerTab = 'friends'"
              >{{ t('lobby.localFriends') }}</button>
              <button
                type="button"
                class="flex-1 rounded-md py-2 text-[11px] font-bold"
                :style="l.localPickerTab === 'presets' ? { background: 'linear-gradient(135deg, #f5a623, #f5c842)', color: '#0b0e14' } : { color: '#7b8ba8' }"
                @click="l.localPickerTab = 'presets'"
              >{{ t('lobby.localPresets') }}</button>
              <button
                type="button"
                class="flex-1 rounded-md py-2 text-[11px] font-bold"
                :style="l.localPickerTab === 'guest' ? { background: 'linear-gradient(135deg, #f5a623, #f5c842)', color: '#0b0e14' } : { color: '#7b8ba8' }"
                @click="l.localPickerTab = 'guest'"
              >{{ t('lobby.localPickerTabGuest') }}</button>
            </div>

            <div v-if="l.localPickerTab === 'friends'" class="min-h-0">
              <input
                v-model="l.friendSearch"
                type="search"
                class="w-full rounded-lg border border-[#252d3d] bg-[#0b0e14] px-3.5 py-2.5 text-sm text-[#e8eaf0] outline-none"
                :placeholder="t('lobby.localSearchFriendsPlaceholder')"
                style="::placeholder: { color: '#7b8ba8' }"
              />
              <div class="mt-2 overflow-hidden rounded-lg border border-[#1e2738]">
                <p v-if="!l.friendList.length" class="p-3 text-xs text-[#7b8ba8]">{{ t('lobby.noFriendsForLocal') }}</p>
                <p v-else-if="!l.filteredFriendList.length" class="p-3 text-xs text-[#7b8ba8]">{{ t('lobby.localSearchNoResults') }}</p>
                <template v-else>
                  <button
                    v-for="fr in l.filteredFriendList"
                    :key="'f'+fr.id"
                    type="button"
                    class="flex w-full items-center justify-between border-b border-[#1e2738] px-3.5 py-2.5 text-left last:border-0"
                    :disabled="l.rosterAtCap() && !l.selectedFriendIds.includes(fr.id)"
                    @click="l.toggleFriendId(fr.id)"
                  >
                    <span
                      class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
                      style="background: #252d3d; color: #7b8ba8"
                    >{{ (fr.name || '?').charAt(0).toUpperCase() }}</span>
                    <span class="min-w-0 flex-1 truncate pl-2 text-[13px] font-semibold text-[#e8eaf0]">{{ fr.name }}</span>
                    <span
                      v-if="l.selectedFriendIds.includes(fr.id)"
                      class="text-xs font-bold"
                      style="color: #f5a623"
                    >✓</span>
                    <span v-else class="text-xs font-bold text-[#7b8ba8]">+ Pievienot</span>
                  </button>
                </template>
              </div>
            </div>
            <div v-else-if="l.localPickerTab === 'presets'" class="p-0">
              <p v-if="!l.presetList.length" class="text-xs text-[#7b8ba8]">{{ t('lobby.localPresetsEmpty') }}</p>
              <div v-else class="overflow-hidden rounded-lg border border-[#1e2738]">
                <div
                  v-for="pr in l.presetList"
                  :key="'p'+pr.id"
                  class="flex items-stretch border-b border-[#1e2738] last:border-0"
                >
                  <button
                    type="button"
                    class="flex min-w-0 flex-1 items-center justify-between px-3 py-2.5 text-left"
                    :disabled="l.rosterAtCap() && !l.selectedPresetIds.includes(pr.id)"
                    @click="l.togglePresetId(pr.id)"
                  >
                    <span class="text-[13px] font-semibold text-[#e8eaf0]">{{ pr.name }}</span>
                    <span v-if="l.selectedPresetIds.includes(pr.id)">✓</span>
                  </button>
                  <button
                    type="button"
                    class="px-2 text-red-400"
                    @click="l.deletePreset(pr.id)"
                  >×</button>
                </div>
              </div>
            </div>
            <div v-else class="space-y-2">
              <input
                v-model="l.newAdHocGuest"
                class="w-full rounded-lg border border-[#252d3d] bg-[#0b0e14] px-3 py-2 text-sm text-white"
                :placeholder="t('lobby.localNewGuest')"
                @keyup.enter="l.submitAddGuestFromPicker"
              />
              <label class="flex gap-2 text-xs text-[#7b8ba8]">
                <input v-model="l.saveGuestToLibrary" type="checkbox" />
                {{ t('lobby.localSaveToLibrary') }}
              </label>
              <button
                type="button"
                class="w-full py-2.5 text-xs font-bold"
                style="background: linear-gradient(135deg, #f5a623, #f5c842); color: #0b0e14; border-radius: 8px; border: none"
                :disabled="l.guestPickerBusy"
                @click="l.submitAddGuestFromPicker"
              >+ {{ t('lobby.localAddToGameOnly') }}</button>
            </div>
          </div>

          <div
            v-else-if="l.createForm.play_mode === 'local' && l.lobbyPlayerMainTab === 'ai'"
            class="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6"
          >
            <div class="flex flex-col gap-3.5 lg:flex-row">
              <div
                v-for="(bot, idx) in l.aiBots"
                :key="bot.id"
                class="min-w-0 flex-1 rounded-[14px] border border-[#252d3d] p-5"
                :style="idx === 0
                  ? { background: 'linear-gradient(180deg, rgba(74, 158, 255, 0.13) 0%, #131720 100%)' }
                  : { background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.13) 0%, #131720 100%)' }"
              >
                <p class="text-[11px] font-medium uppercase tracking-wider text-[#7b8ba8]">AI Spēlētājs {{ idx + 1 }}/2</p>
                <div class="mt-1 flex items-center justify-between gap-2">
                  <input
                    :value="bot.name"
                    class="min-w-0 flex-1 border-0 bg-transparent text-[15px] font-semibold text-[#e8eaf0] outline-none"
                    @input="onBotNameInput(bot.id, $event)"
                  />
                  <span class="shrink-0 rounded-md border border-[#252d3d] bg-[#0b0e14] px-2 py-1 text-[11px] text-[#7b8ba8]">BOT</span>
                </div>
                <p class="mb-1 mt-3 text-[11px] font-bold text-[#e8eaf0]">Grūtības pakāpe</p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="(cfg, key) in DIF"
                    :key="String(key)+bot.id"
                    type="button"
                    class="rounded border px-2 py-1 text-xs font-semibold"
                    :style="bot.difficulty === key
                      ? { border: `1px solid ${cfg.c}`, background: cfg.c + '22', color: cfg.c }
                      : { border: '1px solid #252d3d', color: '#7b8ba8' }"
                    @click="onDifficulty(bot.id, key)"
                  >{{ key }}</button>
                </div>
                <div class="mt-3 h-1.5 overflow-hidden rounded-full" style="background: #0b0e14">
                  <div
                    class="h-full rounded-full transition-all"
                    :style="{
                      width: `${DIF[bot.difficulty]?.w ?? 50}%`,
                      background: bot.difficulty === 'expert' ? barGradientExpert : (DIF[bot.difficulty]?.c || '#f5a623'),
                    }"
                  />
                </div>
                <p class="mb-1 mt-3 text-[11px] font-bold text-[#7b8ba8]">Stils</p>
                <div class="grid grid-cols-2 gap-1.5">
                  <button
                    v-for="ps in playStyleKeys"
                    :key="ps+bot.id"
                    type="button"
                    class="rounded-md border py-1.5 text-center text-xs font-semibold"
                    :style="bot.playStyle === ps
                      ? { border: '1px solid #f5a62380', background: '#3a2a0a', color: '#f5a623' }
                      : { border: '1px solid #252d3d', background: '#0b0e14', color: '#7b8ba8' }"
                    @click="onPlayStyle(bot.id, ps)"
                  >{{ ps }}</button>
                </div>
              </div>
            </div>
          </div>

          <p
            v-else
            class="p-4 text-sm text-[#7b8ba8] lg:px-6"
          >{{ t('lobby.wizardStep2HintOnline') }}</p>
        </div>
      </div>

      <!-- Apakšas darbības -->
      <div
        v-if="!l.mobileAiComposerOpen"
        class="flex shrink-0 items-center gap-2 border-t border-[#1e2738] px-4 py-3 lg:px-6"
        style="padding-bottom: max(12px, env(safe-area-inset-bottom))"
      >
        <button
          v-if="l.createWizardStep === 2"
          type="button"
          class="flex items-center gap-1 rounded-lg border border-[#252d3d] bg-[#1a2030] px-3 py-2 text-sm font-semibold text-[#7b8ba8]"
          @click="l.goWizardBack"
        >←</button>
        <div class="min-w-0 flex-1" />
        <button
          v-if="l.createWizardStep === 1"
          type="button"
          class="rounded-lg py-2.5 px-5 text-sm font-bold"
          :disabled="l.lobbyShellLocked || l.checkingSetupMatch"
          style="background: linear-gradient(135deg, #f5a623, #f5c842); color: #0b0e14; border: none"
          @click="l.goWizardNext"
        >{{ l.checkingSetupMatch ? t('lobby.setupLookupShort') : t('lobby.wizardNext') }} →</button>
        <button
          v-else
          type="button"
          class="flex items-center gap-1 rounded-lg py-2.5 px-8 text-sm font-semibold"
          :disabled="l.loading || !!l.blockedRoomForType || l.lobbyShellLocked"
          style="background: linear-gradient(135deg, #f5a623, #f5c842); color: #0b0e14; border: none"
          @click="l.createRoom"
        >▶ {{ t('lobby.wizardStartGame') }}</button>
      </div>
    </div>

    <!-- Labā reklāmas kolonna (desktop) -->
    <aside
      class="hidden w-20 flex-col items-center gap-4 border-l border-[#1e2738] bg-[#0f1520] py-4 lg:flex"
    >
      <div
        class="flex h-40 w-[60px] items-center justify-center rounded-md border text-[8px] font-semibold"
        style="background: #131720; border-color: #1e2738; color: #7b8ba8"
      >AD</div>
      <div
        class="flex h-40 w-[60px] items-center justify-center rounded-md border text-[8px] font-semibold"
        style="background: #131720; border-color: #1e2738; color: #7b8ba8"
      >AD</div>
    </aside>
  </div>
</template>
