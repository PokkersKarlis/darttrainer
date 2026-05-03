<script setup>
import { ref, computed, onMounted } from 'vue';
import { Game } from '../api/client.js';

/**
 * Pēc spēles protokols (GET /games/:id/protocol + report).
 */
const props = defineProps({
  matchId: { type: [String, Number], required: true },
});

const emit = defineEmits(['home']);

const loading = ref(true);
const error   = ref(null);
const payload = ref(null);

const isCricket = computed(() => payload.value?.match?.game_type === 'cricket');
const isX01     = computed(() => payload.value?.match?.game_type === 'x01');
const report    = computed(() => payload.value?.report ?? null);
const meta      = computed(() => report.value?.meta ?? {});
const rows      = computed(() => report.value?.player_rows ?? []);
const agp       = computed(() => report.value?.agp ?? null);
const legRows   = computed(() => report.value?.leg_rows ?? []);

function fmtDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('lv-LV', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function printReport() {
  window.print();
}

function goHome() {
  emit('home');
}

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await Game.protocol(props.matchId);
    payload.value = data;
  } catch (e) {
    error.value = 'Neizdevās ielādēt protokolu.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="match-report flex h-full min-h-0 flex-1 flex-col overflow-hidden w-full bg-[#060d18] text-slate-200 print:bg-white print:text-black">
    <div class="flex-shrink-0 border-b border-[#162540] print:border-slate-300 px-4 py-4 max-w-4xl mx-auto w-full">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 print:text-slate-600 mb-1">Spēles protokols</p>
          <h1 class="text-2xl font-black text-amber-400 print:text-amber-700 font-mono tracking-tight">
            {{ meta.room_code || '—' }}
          </h1>
        </div>
        <div class="flex gap-2 print:hidden">
          <button type="button" @click="printReport"
                  class="px-4 py-2 rounded-xl text-sm font-bold border border-[#1e3050] bg-[#0a1120] text-slate-200 hover:bg-[#162540] transition">
            Drukāt
          </button>
          <button type="button" @click="goHome"
                  class="px-4 py-2 rounded-xl text-sm font-black bg-amber-500 text-black hover:bg-amber-400 transition">
            Uz sākumu
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y px-4 py-6 max-w-4xl mx-auto w-full space-y-8 print:overflow-visible">

      <div v-if="loading" class="flex justify-center py-16">
        <div class="flex gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:150ms"></span>
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:300ms"></span>
        </div>
      </div>

      <div v-else-if="error" class="text-center text-rose-400 py-12 font-bold">{{ error }}</div>

      <template v-else-if="report">

        <!-- Uzvarētājs -->
        <div v-if="payload.match?.winner" class="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-5 py-4 print:border-emerald-700">
          <div class="text-[10px] font-black uppercase tracking-widest text-emerald-400/90 mb-1">Uzvara</div>
          <div class="text-2xl font-black text-emerald-100">{{ payload.match.winner.name }}</div>
        </div>

        <!-- Meta -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div class="rounded-xl border border-[#162540] bg-[#0a1120]/80 p-3 print:bg-slate-50">
            <div class="text-[9px] uppercase tracking-wider text-slate-500 print:text-slate-600 mb-0.5">Sākums</div>
            <div class="font-bold tabular-nums">{{ fmtDateTime(meta.started_at) }}</div>
          </div>
          <div class="rounded-xl border border-[#162540] bg-[#0a1120]/80 p-3 print:bg-slate-50">
            <div class="text-[9px] uppercase tracking-wider text-slate-500 print:text-slate-600 mb-0.5">Beigas</div>
            <div class="font-bold tabular-nums">{{ fmtDateTime(meta.finished_at) }}</div>
          </div>
          <div class="rounded-xl border border-[#162540] bg-[#0a1120]/80 p-3 print:bg-slate-50">
            <div class="text-[9px] uppercase tracking-wider text-slate-500 print:text-slate-600 mb-0.5">Ilgums</div>
            <div class="font-black text-amber-400 print:text-amber-800 tabular-nums">{{ meta.duration_label }}</div>
          </div>
          <div class="rounded-xl border border-[#162540] bg-[#0a1120]/80 p-3 print:bg-slate-50">
            <div class="text-[9px] uppercase tracking-wider text-slate-500 print:text-slate-600 mb-0.5">Tips / legi</div>
            <div class="font-bold">{{ meta.game_type_label }} · {{ meta.legs_played }} leg.</div>
            <div v-if="meta.x01_in_out" class="text-[11px] text-slate-400 print:text-slate-600 mt-1 font-mono">{{ meta.x01_in_out }}</div>
          </div>
        </div>
        <p class="text-xs text-slate-500 print:text-slate-600 font-mono">Match ID: {{ meta.match_id }}</p>
        <p v-if="isX01 && agp" class="text-sm text-slate-300 print:text-slate-800 mt-2">
          <span class="font-bold text-amber-400 print:text-amber-800">Spēles 3DA (AGP):</span>
          <span class="font-mono font-black tabular-nums ml-2">{{ agp.three_da }}</span>
          <span v-if="agp.busts != null" class="text-slate-500 ml-3">· BUST kopā: {{ agp.busts }}</span>
        </p>

        <!-- Cricket: kopsavilkums -->
        <section v-if="isCricket">
          <h2 class="text-xs font-black uppercase tracking-widest text-slate-500 print:text-slate-600 mb-3">Spēlētāji · Cricket</h2>
          <div class="overflow-x-auto rounded-xl border border-[#162540] print:border-slate-300">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="bg-[#0a1120] print:bg-slate-100 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  <th class="p-3 font-bold">Spēlētājs</th>
                  <th class="p-3 font-bold text-center">Seti</th>
                  <th class="p-3 font-bold text-center">Legi</th>
                  <th class="p-3 font-bold text-center">Punkti</th>
                  <th class="p-3 font-bold text-center">Zīmes</th>
                  <th class="p-3 font-bold text-center">Metieni</th>
                  <th class="p-3 font-bold text-center">MPR</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in rows" :key="r.id" class="border-t border-[#162540]/80 print:border-slate-200">
                  <td class="p-3 font-bold">
                    {{ r.name }}
                    <span v-if="r.won_match" class="ml-2 text-[10px] font-black uppercase text-emerald-400">WIN</span>
                  </td>
                  <td class="p-3 text-center tabular-nums">{{ r.sets_won }}</td>
                  <td class="p-3 text-center tabular-nums">{{ r.legs_won }}</td>
                  <td class="p-3 text-center tabular-nums">{{ r.points }}</td>
                  <td class="p-3 text-center tabular-nums">{{ r.marks }}</td>
                  <td class="p-3 text-center tabular-nums">{{ r.darts }}</td>
                  <td class="p-3 text-center font-mono font-black text-amber-400/95 print:text-amber-800 tabular-nums">{{ r.mpr }}</td>
                </tr>
                <tr v-if="agp" class="border-t-2 border-amber-500/30 bg-[#0a1120]/50 print:bg-slate-100 font-bold">
                  <td class="p-3 text-slate-400">Kopā (mačs)</td>
                  <td class="p-3 text-center">—</td>
                  <td class="p-3 text-center tabular-nums">{{ meta.legs_played }}</td>
                  <td class="p-3 text-center tabular-nums">{{ agp.points }}</td>
                  <td class="p-3 text-center tabular-nums">{{ agp.marks }}</td>
                  <td class="p-3 text-center tabular-nums">{{ agp.darts }}</td>
                  <td class="p-3 text-center font-mono text-amber-400 print:text-amber-900 tabular-nums">{{ agp.mpr }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-[10px] text-slate-500 mt-2">MPR = vidējie slēgšanas metieni uz 3 šautnēm (marks ÷ metieni × 3).</p>
        </section>

        <!-- X01 -->
        <section v-if="isX01">
          <h2 class="text-xs font-black uppercase tracking-widest text-slate-500 print:text-slate-600 mb-3">Spēlētāji · {{ meta.game_type_label }}</h2>
          <div class="overflow-x-auto rounded-xl border border-[#162540] print:border-slate-300">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="bg-[#0a1120] print:bg-slate-100 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  <th class="p-3 font-bold">Spēlētājs</th>
                  <th class="p-3 font-bold text-center">Seti</th>
                  <th class="p-3 font-bold text-center">Legi</th>
                  <th class="p-3 font-bold text-center">Punkti</th>
                  <th class="p-3 font-bold text-center">Metieni</th>
                  <th class="p-3 font-bold text-center">3DA</th>
                  <th class="p-3 font-bold text-center">BUST</th>
                  <th class="p-3 font-bold text-center">CO</th>
                  <th class="p-3 font-bold text-center">Max</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in rows" :key="r.id" class="border-t border-[#162540]/80 print:border-slate-200">
                  <td class="p-3 font-bold">
                    {{ r.name }}
                    <span v-if="r.won_match" class="ml-2 text-[10px] font-black uppercase text-emerald-400">WIN</span>
                  </td>
                  <td class="p-3 text-center tabular-nums">{{ r.sets_won }}</td>
                  <td class="p-3 text-center tabular-nums">{{ r.legs_won }}</td>
                  <td class="p-3 text-center tabular-nums">{{ r.points }}</td>
                  <td class="p-3 text-center tabular-nums">{{ r.darts }}</td>
                  <td class="p-3 text-center font-mono font-black text-amber-400/95 print:text-amber-800 tabular-nums">{{ r.three_da }}</td>
                  <td class="p-3 text-center tabular-nums">{{ r.busts ?? 0 }}</td>
                  <td class="p-3 text-center tabular-nums">{{ r.checkouts ?? 0 }}</td>
                  <td class="p-3 text-center tabular-nums font-mono">{{ r.high_turn ?? 0 }}</td>
                </tr>
                <tr v-if="agp" class="border-t-2 border-amber-500/30 bg-[#0a1120]/50 print:bg-slate-100 font-bold">
                  <td class="p-3 text-slate-400">Kopā (mačs)</td>
                  <td class="p-3 text-center">—</td>
                  <td class="p-3 text-center tabular-nums">{{ meta.legs_played }}</td>
                  <td class="p-3 text-center tabular-nums">{{ agp.points }}</td>
                  <td class="p-3 text-center tabular-nums">{{ agp.darts }}</td>
                  <td class="p-3 text-center font-mono text-amber-400 print:text-amber-900 tabular-nums">{{ agp.three_da }}</td>
                  <td class="p-3 text-center tabular-nums">{{ agp.busts ?? '—' }}</td>
                  <td class="p-3 text-center">—</td>
                  <td class="p-3 text-center">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Legu detaļas -->
        <section v-if="legRows.length">
          <h2 class="text-xs font-black uppercase tracking-widest text-slate-500 print:text-slate-600 mb-3">Legi</h2>
          <div class="overflow-x-auto rounded-xl border border-[#162540] print:border-slate-300">
            <table class="w-full text-xs sm:text-sm border-collapse min-w-[32rem]">
              <thead>
                <tr class="bg-[#0a1120] print:bg-slate-100 text-[10px] uppercase tracking-wider text-slate-500">
                  <th class="p-2 text-left font-bold">Leg</th>
                  <th v-if="isCricket" v-for="p in legRows[0].players" :key="'h'+p.id" class="p-2 text-center font-bold">MPR / zīmes<br><span class="normal-case font-semibold text-slate-400">{{ p.name }}</span></th>
                  <th v-if="isX01" v-for="p in legRows[0].players" :key="'xh'+p.id" class="p-2 text-center font-bold">3DA / leg<br><span class="normal-case font-semibold text-slate-400">{{ p.name }}</span></th>
                  <th class="p-2 text-center font-bold">{{ legRows[0].game_label }}</th>
                  <th v-if="isCricket" v-for="p in legRows[0].players" :key="'h2'+p.id" class="p-2 text-center font-bold">Punkti</th>
                  <th v-if="isX01" v-for="p in legRows[0].players" :key="'xh2'+p.id" class="p-2 text-center font-bold">Punkti</th>
                  <th class="p-2 text-center font-bold">Metieni</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="leg in legRows" :key="leg.label" class="border-t border-[#162540]/80 print:border-slate-200">
                  <td class="p-2 font-mono font-black text-amber-400/90">{{ leg.label }}</td>
                  <template v-if="isCricket">
                    <td v-for="p in leg.players" :key="leg.label+'m'+p.id" class="p-2 text-center font-mono tabular-nums leading-tight">
                      <div>{{ p.mpr }}</div>
                      <div class="text-[10px] font-sans text-slate-500 print:text-slate-600">{{ p.marks }} zīmes</div>
                    </td>
                    <td class="p-2 text-center text-slate-500 font-bold">{{ leg.game_label }}</td>
                    <td v-for="p in leg.players" :key="leg.label+'pt'+p.id" class="p-2 text-center tabular-nums">{{ p.points }}</td>
                  </template>
                  <template v-else>
                    <td v-for="p in leg.players" :key="leg.label+'x'+p.id" class="p-2 text-center font-mono tabular-nums leading-tight">
                      <div>{{ p.three_da }}</div>
                      <div class="text-[10px] font-sans text-slate-500 print:text-slate-600">
                        {{ p.darts }} š. · busti {{ p.busts ?? 0 }}<span v-if="(p.high_turn ?? 0) > 0"> · max {{ p.high_turn }}</span>
                      </div>
                    </td>
                    <td class="p-2 text-center text-slate-500 font-bold">{{ leg.game_label }}</td>
                    <td v-for="p in leg.players" :key="leg.label+'xpt'+p.id" class="p-2 text-center tabular-nums">{{ p.points }}</td>
                  </template>
                  <td class="p-2 text-center font-mono tabular-nums">{{ leg.total_darts }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <p class="text-[10px] text-slate-600 print:text-slate-500 pb-8">
          Statistika aprēķināta no saglabātajiem metieniem. Metodes var atšķirties no citām platformām.
        </p>
      </template>
    </div>
  </div>
</template>
