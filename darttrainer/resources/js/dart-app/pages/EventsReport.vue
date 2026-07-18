<script setup>
import { ref, computed, onMounted } from 'vue';
import { DartConnect } from '../api/client.js';
import { useLocaleStore } from '../store/index.js';
import { useCanvasBnav } from '../composables/useCanvasBnav.js';
import HomeStrokeIcon from '../components/home/HomeStrokeIcon.vue';

defineOptions({ name: 'EventsReportPage' });

const locale = useLocaleStore();
const t = (k) => locale.t(k);
const { bnav, bnavOn, bnavClick, bnavDisabled } = useCanvasBnav();

/** Zināmas atslēgas DartConnect / līdzīgu API atbildēs (arī camelCase / snake_case). */
const PREFERRED_ARRAY_KEYS = [
  'suggestions',
  'searchSuggestions',
  'search_suggestions',
  'events',
  'results',
  'items',
  'hits',
  'rows',
  'list',
  'records',
  'options',
  'matches',
  'values',
  'data',
  'content',
  'eventList',
  'event_list',
  'Suggestions',
  'Results',
  'Events',
];

/** Preflight: pending | ok | fail */
const preflightStatus = ref('pending');
/** 1 = meklēšana, 2 = turnīra notikumi */
const flowStep = ref(1);
const selectedEventTitle = ref('');

const tournamentName = ref('');
const loading = ref(false);
const errorMessage = ref('');
const lastPayload = ref(null);
let debounceTimer = null;
const DEBOUNCE_MS = 400;

function isLikelySuggestionList(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return false;
  }
  const first = arr[0];
  if (typeof first === 'string') {
    return true;
  }
  if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
    return true;
  }
  return false;
}

function arrayFromPreferredKeys(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return null;
  }
  for (const k of PREFERRED_ARRAY_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(obj, k)) {
      continue;
    }
    const v = obj[k];
    /** Zināmās atslēgas — uzticamies pat tukšam masīvam. */
    if (Array.isArray(v)) {
      return v;
    }
  }
  return null;
}

/**
 * Meklē pirmo līmeni zem tiešām vērtībām (piem. { payload: { items: [...] } }).
 */
function arrayFromNestedPreferred(obj, maxLevels = 3) {
  const queue = [{ node: obj, depth: 0 }];
  while (queue.length) {
    const { node, depth } = queue.shift();
    if (node == null || typeof node !== 'object') {
      continue;
    }
    const direct = arrayFromPreferredKeys(node);
    if (direct) {
      return direct;
    }
    if (depth >= maxLevels) {
      continue;
    }
    for (const v of Object.values(node)) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        queue.push({ node: v, depth: depth + 1 });
      }
    }
  }
  return null;
}

/**
 * Pēdējā iespēja: apstaigāt koku un ņemt visus piemērotos masīvus, izvēlēties garāko.
 */
function arrayFromDeepWalk(node, maxDepth, out) {
  if (node == null || maxDepth < 0) {
    return;
  }
  if (Array.isArray(node)) {
    if (isLikelySuggestionList(node)) {
      out.push(node);
    }
    return;
  }
  if (typeof node !== 'object') {
    return;
  }
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) {
      if (isLikelySuggestionList(v)) {
        out.push(v);
      }
    } else if (v && typeof v === 'object') {
      arrayFromDeepWalk(v, maxDepth - 1, out);
    }
  }
}

function extractArray(payload) {
  if (payload == null) {
    return null;
  }
  if (Array.isArray(payload)) {
    return isLikelySuggestionList(payload) ? payload : null;
  }
  if (typeof payload !== 'object') {
    return null;
  }

  const shallow = arrayFromPreferredKeys(payload);
  if (shallow) {
    return shallow;
  }

  const nested = arrayFromNestedPreferred(payload);
  if (nested) {
    return nested;
  }

  const candidates = [];
  arrayFromDeepWalk(payload, 8, candidates);
  if (candidates.length === 0) {
    return null;
  }
  candidates.sort((a, b) => b.length - a.length);
  return candidates[0];
}

/**
 * DartConnect: { items: [ { group, suggestions: [ {...} ] } ] } — rindas ir iekš suggestions.
 */
function flattenSuggestionGroups(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return arr;
  }
  const first = arr[0];
  if (
    first &&
    typeof first === 'object' &&
    !Array.isArray(first) &&
    Array.isArray(first.suggestions)
  ) {
    return arr.flatMap((g) =>
      g && typeof g === 'object' && Array.isArray(g.suggestions) ? g.suggestions : [],
    );
  }
  return arr;
}

function suggestionRowsFromPayload(payload) {
  const extracted = extractArray(payload);
  if (!extracted) {
    return [];
  }
  return flattenSuggestionGroups(extracted);
}

function rowFromItem(item) {
  if (typeof item === 'string') {
    return { title: item, subtitle: '' };
  }
  if (!item || typeof item !== 'object') {
    return { title: String(item), subtitle: '' };
  }
  const title =
    item.title ??
    item.name ??
    item.event_name ??
    item.eventName ??
    item.EventName ??
    item.label ??
    item.text ??
    item.value ??
    item.displayName ??
    item.display_name ??
    item.searchText ??
    item.search_text ??
    item.description ??
    t('eventsReport.resultFallback');
  const subParts = [
    item.timeline_meta,
    item.timeline_label,
    item.timeline_year,
    item.location,
    item.venue,
    item.city,
    item.date,
    item.start_date,
    item.startDate,
    item.country,
    item.region,
  ].filter(Boolean);
  const subtitle =
    subParts.length > 0
      ? subParts.slice(0, 4).join(' · ')
      : item.id != null
        ? String(item.id)
        : '';
  return { title: String(title), subtitle: subtitle ? String(subtitle) : '' };
}

function matchRowFromItem(item) {
  if (typeof item === 'string') {
    return { title: item, subtitle: '' };
  }
  if (!item || typeof item !== 'object') {
    return { title: String(item), subtitle: '' };
  }
  const p1 = item.player1 ?? item.home ?? item.home_player ?? item.player_a;
  const p2 = item.player2 ?? item.away ?? item.away_player ?? item.player_b;
  const p1s = typeof p1 === 'object' && p1 ? p1.name ?? p1.label : p1;
  const p2s = typeof p2 === 'object' && p2 ? p2.name ?? p2.label : p2;
  const vs =
    p1s || p2s
      ? [p1s, p2s].filter(Boolean).join(' vs ')
      : item.players && Array.isArray(item.players)
        ? item.players.map((x) => (typeof x === 'object' && x ? x.name ?? x.label : x)).filter(Boolean).join(' vs ')
        : '';
  let title =
    item.name ??
    item.title ??
    item.match_name ??
    item.label ??
    item.round_name ??
    null;
  if (!title && vs) {
    title = vs;
  }
  if (!title) {
    title = t('eventsReport.matchFallback');
  }
  const subParts = [
    item.round,
    item.round_name,
    item.stage,
    item.bracket,
    vs && title !== vs ? vs : null,
    item.starts_at,
    item.start_time,
    item.scheduled_at,
    item.status,
    item.timeline_meta,
  ].filter(Boolean);
  const subtitle =
    subParts.length > 0 ? subParts.slice(0, 5).join(' · ') : item.id != null ? String(item.id) : '';
  return { title: String(title), subtitle: subtitle ? String(subtitle) : '' };
}

const suggestionRows = computed(() => suggestionRowsFromPayload(lastPayload.value));

const listItems = computed(() =>
  suggestionRows.value.map((raw) => ({
    ...rowFromItem(raw),
    eventId:
      raw && typeof raw === 'object' && raw.id != null && String(raw.id).trim() !== ''
        ? String(raw.id)
        : '',
  })),
);

const showStructuredEmpty = computed(() => {
  if (extractArray(lastPayload.value) == null) {
    return false;
  }
  return suggestionRows.value.length === 0;
});

const showRawFallback = computed(() => {
  if (lastPayload.value == null) {
    return false;
  }
  return extractArray(lastPayload.value) === null;
});

const rawPreview = computed(() => {
  if (lastPayload.value == null) {
    return '';
  }
  try {
    return JSON.stringify(lastPayload.value, null, 2);
  } catch {
    return String(lastPayload.value);
  }
});

const showResultsSection = computed(() => tournamentName.value.trim().length > 0);

const selectedEventId = ref(null);
const matchesPayload = ref(null);
const matchesLoading = ref(false);
const matchesError = ref('');

const matchRowsRaw = computed(() => suggestionRowsFromPayload(matchesPayload.value));

const matchListItems = computed(() => matchRowsRaw.value.map((item) => matchRowFromItem(item)));

const matchesStructuredEmpty = computed(() => {
  if (matchesPayload.value == null) {
    return false;
  }
  return matchRowsRaw.value.length === 0;
});

const rawMatchesPreview = computed(() => {
  if (matchesPayload.value == null) {
    return '';
  }
  try {
    return JSON.stringify(matchesPayload.value, null, 2);
  } catch {
    return String(matchesPayload.value);
  }
});

async function runPreflight() {
  preflightStatus.value = 'pending';
  try {
    const { data, status } = await DartConnect.connectivityCheck({ skipErrorToast: true });
    if (status === 200 && data?.data?.ok === true) {
      preflightStatus.value = 'ok';
      return;
    }
    preflightStatus.value = 'fail';
  } catch {
    preflightStatus.value = 'fail';
  }
}

onMounted(() => {
  runPreflight();
});

async function fetchSuggestions(query) {
  const trimmed = query.trim();
  if (!trimmed) {
    lastPayload.value = null;
    errorMessage.value = '';
    flowStep.value = 1;
    selectedEventId.value = null;
    selectedEventTitle.value = '';
    matchesPayload.value = null;
    matchesError.value = '';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  flowStep.value = 1;
  selectedEventId.value = null;
  selectedEventTitle.value = '';
  matchesPayload.value = null;
  matchesError.value = '';
  try {
    const { data } = await DartConnect.eventSearchSuggestions(trimmed, { skipErrorToast: true });
    if (data?.errors) {
      lastPayload.value = null;
      errorMessage.value = data.errors.message ?? t('eventsReport.errorGeneric');
      return;
    }
    lastPayload.value = data?.data ?? null;
    if (import.meta.env.DEV) {
      console.log('[EventsReport] DartConnect:', lastPayload.value);
    }
  } catch (e) {
    lastPayload.value = null;
    errorMessage.value = e?.response?.data?.errors?.message ?? t('eventsReport.errorGeneric');
    if (import.meta.env.DEV) {
      console.error('[EventsReport]', e?.response?.data ?? e);
    }
  } finally {
    loading.value = false;
  }
}

function onSearchInput() {
  clearTimeout(debounceTimer);
  const q = tournamentName.value;
  if (!q.trim()) {
    lastPayload.value = null;
    errorMessage.value = '';
    loading.value = false;
    flowStep.value = 1;
    selectedEventId.value = null;
    selectedEventTitle.value = '';
    matchesPayload.value = null;
    matchesError.value = '';
    return;
  }
  debounceTimer = setTimeout(() => {
    fetchSuggestions(q);
  }, DEBOUNCE_MS);
}

function goBackToStep1() {
  flowStep.value = 1;
  selectedEventId.value = null;
  selectedEventTitle.value = '';
  matchesPayload.value = null;
  matchesError.value = '';
}

async function onSelectSuggestion(eventId, title) {
  if (!eventId || matchesLoading.value) {
    return;
  }
  flowStep.value = 2;
  selectedEventId.value = eventId;
  selectedEventTitle.value = title || eventId;
  matchesLoading.value = true;
  matchesError.value = '';
  matchesPayload.value = null;
  try {
    const { data } = await DartConnect.eventMatches(eventId, { skipErrorToast: true });
    if (data?.errors) {
      matchesPayload.value = null;
      matchesError.value = data.errors.message ?? t('eventsReport.matchesError');
      return;
    }
    matchesPayload.value = data?.data ?? null;
    if (import.meta.env.DEV) {
      console.log('[EventsReport] matches:', eventId, matchesPayload.value);
    }
  } catch (e) {
    matchesPayload.value = null;
    const isTimeout =
      e?.code === 'ECONNABORTED' ||
      (typeof e?.message === 'string' && e.message.toLowerCase().includes('timeout'));
    matchesError.value = isTimeout
      ? t('eventsReport.matchesTimeout')
      : (e?.response?.data?.errors?.message ?? t('eventsReport.matchesError'));
    if (import.meta.env.DEV) {
      console.error('[EventsReport] matches', e?.response?.data ?? e);
    }
  } finally {
    matchesLoading.value = false;
  }
}

</script>

<template>
  <div class="dh-er-view">
    <div class="dh-er-page">
      <!-- Preflight: savienojuma pārbaude -->
      <section v-if="preflightStatus === 'pending'" class="dh-er-preflight" aria-busy="true">
        <div class="dh-er-preflight-card">
          <div class="dh-er-signal dh-er-signal--pending" aria-hidden="true">
            <span class="dh-er-signal__dot dh-er-signal__dot--a" />
            <span class="dh-er-signal__dot dh-er-signal__dot--b" />
            <span class="dh-er-signal__dot dh-er-signal__dot--c" />
          </div>
          <h1 class="dh-er-preflight-h">{{ t('eventsReport.preflightTitle') }}</h1>
          <p class="dh-er-preflight-p">{{ t('eventsReport.preflightSubtitle') }}</p>
          <div class="dh-er-spinner" aria-hidden="true" />
        </div>
      </section>

      <section v-else-if="preflightStatus === 'fail'" class="dh-er-preflight">
        <div class="dh-er-preflight-card dh-er-preflight-card--fail">
          <div class="dh-er-signal dh-er-signal--fail" aria-hidden="true">
            <span class="dh-er-signal__dot dh-er-signal__dot--red" />
          </div>
          <h1 class="dh-er-preflight-h">{{ t('eventsReport.preflightFailTitle') }}</h1>
          <p class="dh-er-preflight-p dh-er-preflight-p--fail">{{ t('eventsReport.preflightFailBody') }}</p>
          <button type="button" class="dh-er-retry" @click="runPreflight">
            {{ t('eventsReport.preflightRetry') }}
          </button>
        </div>
      </section>

      <!-- Solis 1: meklēšana -->
      <template v-else-if="flowStep === 1">
        <header class="dh-er-head">
          <div class="dh-er-step-row">
            <span class="dh-er-step-badge">{{ t('eventsReport.step1Badge') }}</span>
            <div class="dh-er-conn-ok">
              <span class="dh-er-signal dh-er-signal--inline" aria-hidden="true">
                <span class="dh-er-signal__dot dh-er-signal__dot--green" />
              </span>
              <span>{{ t('eventsReport.preflightOk') }}</span>
            </div>
          </div>
          <h1 class="dh-er-title">{{ t('eventsReport.pageTitle') }}</h1>
          <p class="dh-er-intro">{{ t('eventsReport.pageIntro') }}</p>
        </header>

        <section class="dh-er-guide" aria-labelledby="events-guide-title">
          <h2 id="events-guide-title" class="dh-er-guide-h">{{ t('eventsReport.guideTitle') }}</h2>
          <ol class="dh-er-guide-list">
            <li>{{ t('eventsReport.guideStep1') }}</li>
            <li>{{ t('eventsReport.guideStep2') }}</li>
            <li>{{ t('eventsReport.guideStep3') }}</li>
          </ol>
        </section>

        <section class="dh-fr-search" aria-labelledby="events-search-lab">
          <div id="events-search-lab" class="dh-fr-search-lab">{{ t('eventsReport.searchLabel') }}</div>
          <input
            v-model="tournamentName"
            type="search"
            name="tournament-name"
            maxlength="200"
            autocomplete="off"
            class="dh-fr-input"
            :placeholder="t('eventsReport.searchPlaceholder')"
            @input="onSearchInput"
          />
          <p class="dh-er-help">{{ t('eventsReport.searchHelp') }}</p>
        </section>

        <section v-if="showResultsSection" class="dh-fr-search dh-er-results" aria-live="polite">
          <div class="dh-fr-search-lab">{{ t('eventsReport.resultsTitle') }}</div>
          <p v-if="listItems.length && !loading && !errorMessage" class="dh-er-pick-hint">{{ t('eventsReport.suggestionsPickHint') }}</p>

          <div v-if="loading" class="dh-er-state">{{ t('eventsReport.loading') }}</div>
          <div v-else-if="errorMessage" class="dh-er-state dh-er-state--err">{{ errorMessage }}</div>
          <div v-else-if="!lastPayload" class="dh-er-state">{{ t('eventsReport.emptyPrompt') }}</div>
          <div v-else-if="showStructuredEmpty" class="dh-er-state">{{ t('eventsReport.noResults') }}</div>

          <template v-else-if="listItems.length">
            <button
              v-for="(row, idx) in listItems"
              :key="row.eventId || `s-${idx}`"
              type="button"
              class="dh-er-suggestion-btn"
              :class="{ 'dh-er-suggestion-btn--first': idx === 0 }"
              :disabled="!row.eventId || matchesLoading"
              @click="onSelectSuggestion(row.eventId, row.title)"
            >
              <span class="dh-er-suggestion-btn__main">
                <span class="dh-er-suggestion-btn__title">{{ row.title }}</span>
                <span v-if="row.subtitle" class="dh-er-suggestion-btn__sub">{{ row.subtitle }}</span>
              </span>
              <span class="dh-er-suggestion-btn__chev" aria-hidden="true">→</span>
            </button>
          </template>

          <p v-else-if="showRawFallback" class="dh-er-state">{{ t('eventsReport.noStructuredList') }}</p>
        </section>

        <details v-if="lastPayload != null" class="dh-er-details" :open="showRawFallback">
          <summary class="dh-er-details-sum">{{ t('eventsReport.debugTitle') }}</summary>
          <p class="dh-er-details-hint">{{ t('eventsReport.debugHint') }}</p>
          <pre class="dh-er-pre dh-er-pre--detail" tabindex="0">{{ rawPreview }}</pre>
        </details>
      </template>

      <!-- Solis 2: turnīra notikumi -->
      <template v-else>
        <header class="dh-er-head">
          <div class="dh-er-step-row">
            <span class="dh-er-step-badge dh-er-step-badge--2">{{ t('eventsReport.step2Badge') }}</span>
            <button type="button" class="dh-er-back" @click="goBackToStep1">
              ← {{ t('eventsReport.backToSearch') }}
            </button>
          </div>
          <h1 class="dh-er-title">{{ t('eventsReport.step2Title') }}</h1>
          <p v-if="selectedEventTitle" class="dh-er-selected-name">{{ selectedEventTitle }}</p>
          <p class="dh-er-intro">{{ t('eventsReport.step2Intro') }}</p>
          <div v-if="selectedEventId" class="dh-er-muted-id">ID: {{ selectedEventId }}</div>
        </header>

        <section class="dh-fr-search dh-er-matches" aria-live="polite">
          <div class="dh-fr-search-lab">{{ t('eventsReport.matchesTitle') }}</div>

          <div v-if="matchesLoading" class="dh-er-state">{{ t('eventsReport.matchesLoading') }}</div>
          <div v-else-if="matchesError" class="dh-er-state dh-er-state--err">{{ matchesError }}</div>
          <div v-else-if="matchesPayload && matchesStructuredEmpty" class="dh-er-state">{{ t('eventsReport.matchesEmpty') }}</div>

          <template v-else-if="matchListItems.length">
            <div
              v-for="(row, midx) in matchListItems"
              :key="`m-${midx}`"
              class="dh-er-match-row"
              :class="{ 'dh-er-match-row--first': midx === 0 }"
            >
              <div class="dh-er-hit-main">
                <div class="dh-er-hit-title">{{ row.name }}</div>
                <div v-if="row.subtitle" class="dh-er-hit-sub">{{ row.subtitle }}</div>
              </div>
            </div>
          </template>
        </section>

        <details v-if="matchesPayload != null" class="dh-er-details">
          <summary class="dh-er-details-sum">{{ t('eventsReport.matchesDebugTitle') }}</summary>
          <pre class="dh-er-pre dh-er-pre--detail" tabindex="0">{{ rawMatchesPreview }}</pre>
        </details>
      </template>
    </div>

    <div class="dth-bnav dth-bnav--mob-only" role="navigation" :aria-label="t('nav.bnavAria')">
      <button
        v-for="b in bnav"
        :key="b.id"
        type="button"
        :class="['dth-bnav-b', { 'dth-bnav-b--on': bnavOn(b) }]"
        :aria-disabled="bnavDisabled(b)"
        :aria-current="bnavOn(b) ? 'page' : undefined"
        @click="bnavClick(b)"
      >
        <HomeStrokeIcon :name="b.icon" :size="20" color="currentColor" />
        <span class="dh-bn-lb">{{ b.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dh-er-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  box-sizing: border-box;
}
.dh-er-page {
  flex: 1 1 auto;
  min-height: 0;
  max-width: 42rem;
  margin: 0 auto;
  padding: 1.25rem 1rem 5rem;
  box-sizing: border-box;
}
.dh-er-head {
  margin-bottom: 1.25rem;
}
.dh-er-title {
  margin: 0 0 0.5rem;
  font-size: 1.35rem;
  font-weight: 800;
  color: #e8eaf0;
  letter-spacing: -0.02em;
}
.dh-er-intro {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: #7b8ba8;
}
.dh-er-guide {
  margin-bottom: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  background: #131720;
  border: 1px solid #1e2738;
  box-sizing: border-box;
}
.dh-er-guide-h {
  margin: 0 0 0.5rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7a94;
}
.dh-er-guide-list {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: #a8b4c8;
}
.dh-er-guide-list li + li {
  margin-top: 0.35rem;
}
.dh-er-help {
  margin: 0;
  font-size: 0.6875rem;
  line-height: 1.45;
  color: #5c6a82;
}
.dh-er-results {
  margin-top: 0.75rem;
}
.dh-er-state {
  margin: 0;
  padding: 0.25rem 0;
  font-size: 0.8125rem;
  color: #7b8ba8;
}
.dh-er-state--err {
  color: #f59b7a;
}
.dh-er-hit {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid #1e2738;
}
.dh-er-hit--first {
  border-top: none;
  margin-top: 4px;
  padding-top: 4px;
}
.dh-er-hit-main {
  min-width: 0;
  flex: 1 1 auto;
}
.dh-er-hit-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #e8eaf0;
  line-height: 1.35;
}
.dh-er-hit-sub {
  margin-top: 3px;
  font-size: 0.6875rem;
  color: #6b7a94;
  line-height: 1.4;
}
.dh-er-pre {
  margin: 0.5rem 0 0;
  padding: 10px 12px;
  max-height: 240px;
  overflow: auto;
  border-radius: 8px;
  background: #0b0e14;
  border: 1px solid #252d3d;
  font-size: 0.6875rem;
  line-height: 1.45;
  color: #9db0c8;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  white-space: pre-wrap;
  word-break: break-word;
}
.dh-er-pre--detail {
  max-height: 320px;
}
.dh-er-details {
  margin-top: 1rem;
  padding: 0.75rem 0;
  border-top: 1px solid #1e2738;
}
.dh-er-details-sum {
  cursor: pointer;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #6b7a94;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.dh-er-details-hint {
  margin: 0.5rem 0 0;
  font-size: 0.625rem;
  line-height: 1.45;
  color: #5c6a82;
}
.dh-er-pick-hint {
  margin: 0 0 8px;
  font-size: 0.6875rem;
  line-height: 1.45;
  color: #f5a623;
  font-weight: 600;
}
.dh-er-suggestion-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  margin: 0;
  margin-top: 10px;
  padding: 12px 14px;
  box-sizing: border-box;
  text-align: left;
  font-family: 'DM Sans', system-ui, sans-serif;
  cursor: pointer;
  border-radius: 10px;
  border: 1px solid #2a3345;
  background: linear-gradient(180deg, #171d2a 0%, #121722 100%);
  color: #e8eaf0;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    transform 0.1s ease;
}
.dh-er-suggestion-btn--first {
  margin-top: 4px;
}
.dh-er-suggestion-btn:hover:not(:disabled) {
  border-color: #f5a623;
  background: linear-gradient(180deg, #1c2433 0%, #151c28 100%);
}
.dh-er-suggestion-btn:focus-visible {
  outline: none;
  border-color: #f5a623;
  box-shadow: 0 0 0 2px rgba(245, 166, 35, 0.35);
}
.dh-er-suggestion-btn:active:not(:disabled) {
  transform: scale(0.99);
}
.dh-er-suggestion-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.dh-er-suggestion-btn--selected {
  border-color: #3ecf8e;
  background: linear-gradient(180deg, #15221c 0%, #121a18 100%);
}
.dh-er-suggestion-btn__main {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dh-er-suggestion-btn__title {
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.3;
}
.dh-er-suggestion-btn__sub {
  font-size: 0.6875rem;
  color: #8b9bb5;
  line-height: 1.35;
}
.dh-er-suggestion-btn__chev {
  flex-shrink: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #f5a623;
  opacity: 0.85;
}
.dh-er-matches {
  margin-top: 0.75rem;
}
.dh-er-muted-id {
  margin: 0 0 8px;
  font-size: 0.625rem;
  color: #5c6a82;
  font-family: ui-monospace, monospace;
}
.dh-er-match-row {
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid #1e2738;
}
.dh-er-match-row--first {
  border-top: none;
  margin-top: 4px;
  padding-top: 4px;
}

.dh-er-preflight {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42vh;
  padding: 1.5rem 0;
}
.dh-er-preflight-card {
  width: 100%;
  max-width: 22rem;
  padding: 1.5rem 1.25rem;
  border-radius: 12px;
  background: #131720;
  border: 1px solid #1e2738;
  text-align: center;
  box-sizing: border-box;
}
.dh-er-preflight-card--fail {
  border-color: #4a2a2a;
  background: linear-gradient(180deg, #1a1416 0%, #131720 100%);
}
.dh-er-preflight-h {
  margin: 1rem 0 0.35rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: #e8eaf0;
}
.dh-er-preflight-p {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: #8b9bb5;
}
.dh-er-preflight-p--fail {
  color: #e8a598;
  margin-bottom: 1rem;
}
.dh-er-retry {
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid #f5a623;
  background: rgba(245, 166, 35, 0.12);
  color: #f5c842;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.dh-er-retry:hover {
  background: rgba(245, 166, 35, 0.2);
}
.dh-er-spinner {
  width: 28px;
  height: 28px;
  margin: 1rem auto 0;
  border: 2px solid #2a3345;
  border-top-color: #f5a623;
  border-radius: 50%;
  animation: dh-er-spin 0.75s linear infinite;
}
@keyframes dh-er-spin {
  to {
    transform: rotate(360deg);
  }
}
.dh-er-signal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.dh-er-signal--inline {
  justify-content: flex-start;
}
.dh-er-signal__dot {
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #2a3345;
}
.dh-er-signal--pending .dh-er-signal__dot--a {
  animation: dh-er-blink 1s ease-in-out infinite;
}
.dh-er-signal--pending .dh-er-signal__dot--b {
  animation: dh-er-blink 1s ease-in-out 0.2s infinite;
}
.dh-er-signal--pending .dh-er-signal__dot--c {
  animation: dh-er-blink 1s ease-in-out 0.4s infinite;
}
.dh-er-signal__dot--green {
  background: #3ecf8e;
  box-shadow: 0 0 12px rgba(62, 207, 142, 0.55);
}
.dh-er-signal__dot--red {
  width: 18px;
  height: 18px;
  background: #e85d5d;
  box-shadow: 0 0 14px rgba(232, 93, 93, 0.45);
}
@keyframes dh-er-blink {
  0%,
  100% {
    opacity: 0.35;
    background: #3a4a63;
  }
  50% {
    opacity: 1;
    background: #f5a623;
  }
}
.dh-er-step-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 0.5rem;
}
.dh-er-step-badge {
  font-size: 0.625rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #f5a623;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(245, 166, 35, 0.12);
  border: 1px solid rgba(245, 166, 35, 0.35);
}
.dh-er-step-badge--2 {
  color: #3ecf8e;
  background: rgba(62, 207, 142, 0.1);
  border-color: rgba(62, 207, 142, 0.35);
}
.dh-er-conn-ok {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #3ecf8e;
}
.dh-er-back {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #2a3345;
  background: #171d2a;
  color: #e8eaf0;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.dh-er-back:hover {
  border-color: #f5a623;
  color: #f5c842;
}
.dh-er-selected-name {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  font-weight: 700;
  color: #e8eaf0;
}
</style>
