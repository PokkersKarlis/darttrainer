const X01TrainingPage = {
  setup() {
    const route  = VueRouter.useRoute();
    const router = VueRouter.useRouter();
    const locale = useLocaleStore();
    const auth   = useAuthStore();
    const t      = (k) => locale.t(k);

    const state            = Vue.ref(null);
    const loading          = Vue.ref(false);
    const submitting       = Vue.ref(false);
    const showSetup        = Vue.ref(true);
    const activeMultiplier = Vue.ref(1); // 1=S 2=D 3=T

    const form      = Vue.reactive({ variant: 501, in_mode: 'straight', out_mode: 'double' });
    const dartInput = Vue.reactive({ darts: [] });
    const feedback  = Vue.ref(null); // { bust, checkout, scored }

    const protocolOnlyState = Vue.ref(null);
    const protocolLoading   = Vue.ref(false);
    const protocolError     = Vue.ref(false);

    const showProtocolQuery = Vue.computed(() => {
      const q = route.query.protocol;
      return q !== undefined && q !== null && String(q).trim() !== '';
    });

    async function syncProtocolQuery() {
      if (!showProtocolQuery.value) {
        protocolOnlyState.value = null;
        protocolError.value     = false;
        protocolLoading.value   = false;
        return;
      }
      const id = Number(route.query.protocol);
      if (!Number.isFinite(id) || id < 1) {
        protocolError.value   = true;
        protocolLoading.value = false;
        return;
      }
      protocolLoading.value = true;
      protocolError.value   = false;
      protocolOnlyState.value = null;
      try {
        const { data } = await Training.x01Protocol(id);
        protocolOnlyState.value = data.state;
      } catch (_) {
        protocolError.value = true;
      } finally {
        protocolLoading.value = false;
      }
    }

    function clearProtocolQuery() {
      router.replace({ path: '/training/x01' });
    }

    Vue.watch(() => route.query.protocol, syncProtocolQuery);

    Vue.onMounted(async () => {
      await syncProtocolQuery();
      if (protocolOnlyState.value) {
        return;
      }
      try {
        const { data } = await Training.x01State();
        if (data.state) {
          state.value     = data.state;
          showSetup.value = false;
        }
      } catch (_) {}
    });

    // ── Game lifecycle ─────────────────────────────────────────────────────────

    async function startGame() {
      if (auth.needsEmailVerification) {
        window._dartToast?.(t('auth.verifyEmailToContinue'), 'error');
        return;
      }
      loading.value = true;
      try {
        const { data } = await Training.x01Start({
          variant:  form.variant,
          in_mode:  form.in_mode,
          out_mode: form.out_mode,
        });
        state.value            = data.state;
        showSetup.value        = false;
        dartInput.darts        = [];
        activeMultiplier.value = 1;
      } finally { loading.value = false; }
    }

    async function abandon() {
      if (auth.needsEmailVerification) return;
      await Training.x01Abandon();
      state.value            = null;
      showSetup.value        = true;
      dartInput.darts        = [];
      feedback.value         = null;
      activeMultiplier.value = 1;
    }

    // ── Dart input ─────────────────────────────────────────────────────────────

    function addSegment(seg) {
      if (dartInput.darts.length >= 3) return;
      let mul = activeMultiplier.value;
      if (seg === 25 && mul === 3) mul = 1; // T25 invalid → S25
      dartInput.darts.push({ segment: seg, multiplier: mul });
    }

    function addMiss() {
      if (dartInput.darts.length >= 3) return;
      dartInput.darts.push({ segment: 0, multiplier: 0 });
    }

    function addOuter() {
      if (dartInput.darts.length >= 3) return;
      dartInput.darts.push({ segment: 25, multiplier: 1 });
    }

    function addBull() {
      if (dartInput.darts.length >= 3) return;
      dartInput.darts.push({ segment: 25, multiplier: 2 });
    }

    function removeDart(i) { dartInput.darts.splice(i, 1); }

    function dartLabel(d) {
      if (d.segment === 0) return 'Miss';
      if (d.segment === 25 && d.multiplier === 2) return 'Bull';
      if (d.segment === 25) return 'Outer';
      const pre = d.multiplier === 2 ? 'D' : d.multiplier === 3 ? 'T' : '';
      return pre + d.segment;
    }

    function dartValue(d) {
      if (d.segment === 0) return 0;
      return d.segment * d.multiplier;
    }

    function dartColor(d) {
      if (d.segment === 0) return 'text-slate-600';
      if (d.multiplier === 3) return 'text-emerald-400';
      if (d.multiplier === 2) return 'text-sky-400';
      return 'text-white';
    }

    // ── Submit ─────────────────────────────────────────────────────────────────

    async function submitThrow() {
      if (auth.needsEmailVerification) return;
      if (dartInput.darts.length === 0 || submitting.value) return;
      submitting.value = true;
      const darts = dartInput.darts.map(d => ({
        segment:    d.segment,
        multiplier: d.multiplier,
      }));
      try {
        const { data } = await Training.x01Throw({ darts });
        state.value            = data.state;
        feedback.value         = data.result;
        dartInput.darts        = [];
        activeMultiplier.value = 1;
        setTimeout(() => { feedback.value = null; }, 2200);
      } finally { submitting.value = false; }
    }

    async function undo() {
      if (auth.needsEmailVerification) return;
      const { data } = await Training.x01Undo();
      state.value     = data.state;
      dartInput.darts = [];
      feedback.value  = null;
    }

    // ── Computed ───────────────────────────────────────────────────────────────

    const turnTotal = Vue.computed(() =>
      dartInput.darts.reduce((s, d) => s + dartValue(d), 0)
    );

    const projectedRemaining = Vue.computed(() => {
      if (!state.value) return null;
      return state.value.current_score - turnTotal.value;
    });

    const projectedBust = Vue.computed(() => {
      if (state.value?.in_mode === 'double' && !state.value?.opened) return false;
      const rem = projectedRemaining.value;
      if (rem === null) return false;
      return rem < 0 || rem === 1;
    });

    // Button tint class based on active multiplier
    const mulTint = Vue.computed(() => {
      if (activeMultiplier.value === 2) return 'text-sky-300';
      if (activeMultiplier.value === 3) return 'text-emerald-300';
      return 'text-white';
    });

    return {
      route,
      auth,
      t,
      state, loading, submitting, showSetup, form,
      activeMultiplier, dartInput, feedback,
      turnTotal, projectedRemaining, projectedBust, mulTint,
      startGame, abandon,
      addSegment, addMiss, addOuter, addBull, removeDart,
      dartLabel, dartValue, dartColor, submitThrow, undo,
      showProtocolQuery,
      protocolOnlyState,
      protocolLoading,
      protocolError,
      clearProtocolQuery,
    };
  },

  template: `
    <div style="flex:1;overflow-y:auto;min-height:0">
    <div class="max-w-5xl mx-auto px-3 py-4">

      <template v-if="showProtocolQuery">
        <div v-if="protocolLoading" class="text-center py-16 text-slate-400">{{ t('stats.loading') }}</div>
        <div v-else-if="protocolError" class="max-w-md mx-auto text-center py-12 space-y-4">
          <p class="text-red-400">{{ t('x01Training.protocolLoadError') }}</p>
          <button type="button" @click="clearProtocolQuery"
                  class="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-2.5 rounded-xl transition">
            {{ t('x01Training.protocolBack') }}
          </button>
        </div>
        <div v-else-if="protocolOnlyState" class="max-w-3xl mx-auto space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <button type="button" @click="clearProtocolQuery"
                    class="text-sm font-black text-amber-400 hover:text-amber-300 transition">
              ← {{ t('x01Training.protocolBack') }}
            </button>
            <a href="#/stats" class="text-xs font-semibold text-slate-500 hover:text-slate-300">{{ t('x01Training.protocolBackStats') }}</a>
          </div>
          <p class="text-xs text-slate-500">{{ t('x01Training.protocolReadOnlyHint') }}</p>
          <X01SoloProtocol :state="protocolOnlyState" :default-open="true" />
        </div>
      </template>

      <template v-else>

      <div v-if="auth.needsEmailVerification"
           class="mb-4 rounded-xl border border-amber-800/80 bg-amber-950/35 px-4 py-3 text-amber-100 text-sm leading-relaxed">
        {{ t('auth.verifyEmailToContinue') }}
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-black text-white">🎯 X01 Solo</h1>
        <button v-if="!showSetup && state" @click="abandon"
                class="text-slate-600 hover:text-red-400 text-xs font-semibold transition-colors">
          Beigt treniņu
        </button>
      </div>

      <!-- ══════════════════ SETUP ══════════════════ -->
      <div v-if="showSetup" class="max-w-sm mx-auto">
        <div class="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 space-y-5">

          <!-- Variant -->
          <div>
            <label class="text-xs text-slate-500 uppercase tracking-widest font-bold block mb-2">Variants</label>
            <div class="flex gap-2 bg-slate-900/60 rounded-xl p-1">
              <button v-for="v in [501, 301]" :key="v" @click="form.variant = v"
                      class="flex-1 py-3 rounded-lg font-black text-lg transition"
                      :class="form.variant === v ? 'bg-amber-500 text-black shadow' : 'text-slate-500 hover:text-white'">
                {{ v }}
              </button>
            </div>
          </div>

          <!-- In mode -->
          <div>
            <label class="text-xs text-slate-500 uppercase tracking-widest font-bold block mb-2">In</label>
            <div class="flex gap-2 bg-slate-900/60 rounded-xl p-1">
              <button @click="form.in_mode = 'straight'"
                      class="flex-1 py-2.5 rounded-lg text-sm font-black transition"
                      :class="form.in_mode === 'straight' ? 'bg-emerald-500 text-black shadow' : 'text-slate-500 hover:text-white'">
                Straight in
              </button>
              <button @click="form.in_mode = 'double'"
                      class="flex-1 py-2.5 rounded-lg text-sm font-black transition"
                      :class="form.in_mode === 'double' ? 'bg-emerald-500 text-black shadow' : 'text-slate-500 hover:text-white'">
                Double in
              </button>
            </div>
          </div>

          <!-- Out mode -->
          <div>
            <label class="text-xs text-slate-500 uppercase tracking-widest font-bold block mb-2">Out</label>
            <div class="flex gap-2 bg-slate-900/60 rounded-xl p-1">
              <button @click="form.out_mode = 'double'"
                      class="flex-1 py-2.5 rounded-lg text-sm font-black transition"
                      :class="form.out_mode === 'double' ? 'bg-sky-400 text-slate-900 shadow' : 'text-slate-500 hover:text-white'">
                Double out
              </button>
              <button @click="form.out_mode = 'straight'"
                      class="flex-1 py-2.5 rounded-lg text-sm font-black transition"
                      :class="form.out_mode === 'straight' ? 'bg-sky-400 text-slate-900 shadow' : 'text-slate-500 hover:text-white'">
                Straight out
              </button>
            </div>
          </div>

          <button @click="startGame" :disabled="loading || auth.needsEmailVerification"
                  class="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl
                         transition disabled:opacity-50 text-lg shadow-xl shadow-amber-950/40 active:scale-[0.98]">
            {{ auth.needsEmailVerification ? t('auth.verifyEmailShort') : (loading ? 'Sāk...' : 'Sākt treniņu →') }}
          </button>
        </div>
      </div>

      <!-- ══════════════════ ACTIVE GAME ══════════════════ -->
      <template v-if="!showSetup && state">

        <!-- ── Finished screen ── -->
        <div v-if="state.finished" class="max-w-md mx-auto text-center py-12">
          <div class="text-6xl mb-4">🏆</div>
          <h2 class="text-3xl font-black text-amber-400 mb-1">Checkout!</h2>
          <p class="text-slate-400 mb-6 text-sm">
            {{ state.variant }} — {{ state.stats.turns }} kārtas · {{ state.stats.darts }} šautriņas
          </p>
          <div class="grid grid-cols-3 gap-3 mb-8">
            <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
              <div class="text-xs text-slate-500 uppercase tracking-widest mb-1">3-dart avg</div>
              <div class="text-2xl font-black text-amber-400">{{ state.stats.average }}</div>
            </div>
            <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
              <div class="text-xs text-slate-500 uppercase tracking-widest mb-1">High turn</div>
              <div class="text-2xl font-black text-emerald-400">{{ state.stats.high_turn }}</div>
            </div>
            <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
              <div class="text-xs text-slate-500 uppercase tracking-widest mb-1">Busts</div>
              <div class="text-2xl font-black text-red-400">{{ state.stats.busts }}</div>
            </div>
          </div>
          <div class="flex gap-3 justify-center">
            <button @click="startGame"
                    class="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded-2xl
                           transition shadow-lg shadow-amber-950/40 active:scale-[0.97]">
              Vēlreiz →
            </button>
            <button @click="abandon"
                    class="bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-3 rounded-2xl transition">
              Beigt
            </button>
          </div>
          <div v-if="state.turns && state.turns.length" class="max-w-xl mx-auto w-full mt-8 text-left">
            <X01SoloProtocol :state="state" :default-open="true" />
          </div>
        </div>

        <!-- ── Active layout ── -->
        <div v-else class="flex flex-col lg:flex-row gap-4 items-start">

          <!-- ─────── LEFT: score + stats + history ─────── -->
          <div class="w-full lg:w-56 xl:w-64 flex-shrink-0 space-y-3">

            <!-- Score card -->
            <div class="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 text-center relative overflow-hidden">
              <!-- Feedback flash overlay -->
              <Transition name="fade">
                <div v-if="feedback"
                     class="absolute inset-0 flex items-center justify-center rounded-2xl z-10 backdrop-blur-sm"
                     :class="feedback.bust ? 'bg-red-950/90' : 'bg-emerald-950/90'">
                  <div>
                    <div class="text-4xl font-black"
                         :class="feedback.bust ? 'text-red-400' : 'text-emerald-400'">
                      {{ feedback.bust ? '💥 Bust' : '+' + feedback.scored }}
                    </div>
                    <div v-if="!feedback.bust" class="text-slate-400 text-sm mt-1">
                      → {{ feedback.score_after }}
                    </div>
                  </div>
                </div>
              </Transition>

              <!-- Double-in badge -->
              <div v-if="state.in_mode === 'double' && !state.opened"
                   class="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                ⬡ Double in
              </div>

              <!-- Turn number -->
              <div class="text-xs text-slate-600 uppercase tracking-widest font-bold mb-1">
                Kārta {{ state.turn_number }}
              </div>

              <!-- Remaining -->
              <Transition name="fade" mode="out-in">
                <div :key="state.current_score"
                     class="font-black tabular-nums leading-none"
                     :class="[state.current_score <= 170 && (state.in_mode === 'straight' || state.opened) ? 'text-amber-400' : 'text-white',
                              state.current_score >= 100 ? 'text-7xl' : 'text-8xl']">
                  {{ state.current_score }}
                </div>
              </Transition>

              <!-- Projected while staging -->
              <div v-if="dartInput.darts.length > 0 && projectedRemaining !== null"
                   class="text-base font-bold tabular-nums mt-1.5"
                   :class="projectedBust ? 'text-red-400' : 'text-slate-400'">
                {{ projectedBust ? '💥 Bust' : '→ ' + projectedRemaining }}
              </div>

              <!-- Checkout suggestion -->
              <div v-if="state.checkout?.length && dartInput.darts.length === 0"
                   class="flex items-center justify-center flex-wrap gap-1.5 mt-2">
                <span class="text-slate-600 text-xs">out:</span>
                <span v-for="c in state.checkout" :key="c"
                      class="text-xs font-mono font-bold bg-emerald-950 text-emerald-400
                             border border-emerald-900/60 px-2 py-0.5 rounded-lg">
                  {{ c }}
                </span>
              </div>

              <!-- Game mode badges -->
              <div class="flex justify-center gap-2 mt-3 flex-wrap">
                <span class="text-xs text-slate-700 font-semibold">{{ state.variant }}</span>
                <span class="text-slate-800">·</span>
                <span class="text-xs text-slate-700 font-semibold">
                  {{ state.in_mode === 'double' ? 'D-in' : 'S-in' }}
                </span>
                <span class="text-slate-800">·</span>
                <span class="text-xs text-slate-700 font-semibold">
                  {{ state.out_mode === 'double' ? 'D-out' : 'S-out' }}
                </span>
              </div>
            </div>

            <!-- Stats bar -->
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2.5 text-center">
                <div class="text-xs text-slate-600 uppercase tracking-widest">3-dart avg</div>
                <div class="text-xl font-black tabular-nums mt-0.5"
                     :class="state.stats.average >= 60 ? 'text-amber-400' : state.stats.average > 0 ? 'text-white' : 'text-slate-700'">
                  {{ state.stats.average || '—' }}
                </div>
              </div>
              <div class="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2.5 text-center">
                <div class="text-xs text-slate-600 uppercase tracking-widest">First 9</div>
                <div class="text-xl font-black tabular-nums mt-0.5 text-white">
                  {{ state.stats.first9_avg || '—' }}
                </div>
              </div>
              <div class="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2.5 text-center">
                <div class="text-xs text-slate-600 uppercase tracking-widest">High</div>
                <div class="text-xl font-black tabular-nums mt-0.5 text-emerald-400">
                  {{ state.stats.high_turn || '—' }}
                </div>
              </div>
              <div class="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2.5 text-center">
                <div class="text-xs text-slate-600 uppercase tracking-widest">Busts</div>
                <div class="text-xl font-black tabular-nums mt-0.5"
                     :class="state.stats.busts > 0 ? 'text-red-400' : 'text-slate-700'">
                  {{ state.stats.busts }}
                </div>
              </div>
            </div>

            <X01SoloProtocol v-if="state.turns.length > 0" :state="state" :default-open="false" />

          </div>

          <!-- ─────── RIGHT: input keypad ─────── -->
          <div class="flex-1 min-w-0">
            <div class="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 space-y-3">

              <!-- ── Dart slots ── -->
              <div class="flex gap-2">
                <div v-for="i in 3" :key="i"
                     class="flex-1 relative rounded-xl border-2 flex flex-col items-center justify-center py-2.5 transition-all"
                     :class="dartInput.darts[i-1]
                       ? (dartInput.darts[i-1].segment === 0
                           ? 'border-slate-700 bg-slate-900/40'
                           : dartInput.darts[i-1].multiplier === 3
                             ? 'border-emerald-800 bg-emerald-950/30'
                             : dartInput.darts[i-1].multiplier === 2
                               ? 'border-sky-800 bg-sky-950/30'
                               : 'border-slate-600 bg-slate-900/60')
                       : 'border-dashed border-slate-800 bg-slate-900/20'">
                  <template v-if="dartInput.darts[i-1]">
                    <button @click="removeDart(i-1)"
                            class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-400
                                   rounded-full text-white text-xs font-black flex items-center justify-center
                                   leading-none z-10 shadow transition-colors">
                      ×
                    </button>
                    <span class="font-black text-base leading-none"
                          :class="dartColor(dartInput.darts[i-1])">
                      {{ dartLabel(dartInput.darts[i-1]) }}
                    </span>
                    <span class="text-xs tabular-nums mt-0.5"
                          :class="dartValue(dartInput.darts[i-1]) > 0 ? 'text-slate-500' : 'text-slate-700'">
                      {{ dartValue(dartInput.darts[i-1]) > 0 ? dartValue(dartInput.darts[i-1]) : '—' }}
                    </span>
                  </template>
                  <span v-else class="text-slate-800 font-black text-lg">{{ i }}</span>
                </div>
              </div>

              <!-- Turn total / projected -->
              <div class="flex items-center justify-between px-1 min-h-[24px]">
                <span class="text-xs text-slate-700 font-bold uppercase tracking-wider">
                  Kārtas summa
                </span>
                <span v-if="dartInput.darts.length > 0"
                      class="font-black tabular-nums text-base transition-colors"
                      :class="projectedBust ? 'text-red-400' : 'text-white'">
                  {{ turnTotal }}
                  <span class="text-slate-500 font-normal text-sm ml-1">
                    {{ projectedBust ? '— Bust!' : projectedRemaining !== null ? '→ ' + projectedRemaining : '' }}
                  </span>
                </span>
                <span v-else class="text-slate-800 font-bold">—</span>
              </div>

              <!-- ── Multiplier buttons ── -->
              <div class="flex gap-2">
                <button v-for="[val, lbl, cls] in [[1,'S','bg-slate-700 text-white'],[2,'D','bg-sky-500 text-white'],[3,'T','bg-emerald-500 text-black']]"
                        :key="val"
                        @click="activeMultiplier = val"
                        class="flex-1 py-2.5 rounded-xl font-black text-sm transition-all"
                        :class="activeMultiplier === val
                          ? cls + ' shadow-lg scale-[1.04]'
                          : 'bg-slate-900/60 text-slate-500 hover:text-white border border-slate-800'">
                  {{ lbl }}
                </button>
              </div>

              <!-- ── Number grid 1–20 ── -->
              <div class="grid grid-cols-5 gap-1.5">
                <button v-for="n in 20" :key="n"
                        @click="addSegment(n)"
                        :disabled="dartInput.darts.length >= 3"
                        class="py-3 rounded-xl font-black text-sm transition-all active:scale-90 select-none"
                        :class="dartInput.darts.length >= 3
                          ? 'opacity-25 cursor-not-allowed bg-slate-900/30 text-slate-700'
                          : activeMultiplier === 3
                            ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-900/40'
                            : activeMultiplier === 2
                              ? 'bg-sky-950/60 text-sky-300 hover:bg-sky-900/60 border border-sky-900/40'
                              : 'bg-slate-700/60 text-white hover:bg-slate-600/80'">
                  {{ n }}
                </button>
              </div>

              <!-- ── Special buttons ── -->
              <div class="grid grid-cols-3 gap-1.5">
                <button @click="addOuter"
                        :disabled="dartInput.darts.length >= 3"
                        class="py-3 rounded-xl text-xs font-black transition-all active:scale-90 select-none
                               bg-amber-950/40 text-amber-500 hover:bg-amber-900/40 border border-amber-900/30
                               disabled:opacity-25 disabled:cursor-not-allowed">
                  Outer<br><span class="font-normal opacity-70">25</span>
                </button>
                <button @click="addBull"
                        :disabled="dartInput.darts.length >= 3"
                        class="py-3 rounded-xl text-xs font-black transition-all active:scale-90 select-none
                               bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-900/30
                               disabled:opacity-25 disabled:cursor-not-allowed">
                  Bull<br><span class="font-normal opacity-70">50</span>
                </button>
                <button @click="addMiss"
                        :disabled="dartInput.darts.length >= 3"
                        class="py-3 rounded-xl text-xs font-black transition-all active:scale-90 select-none
                               bg-slate-900/40 text-slate-600 hover:text-slate-400 hover:bg-slate-800/40
                               border border-slate-800/60
                               disabled:opacity-25 disabled:cursor-not-allowed">
                  Miss<br><span class="font-normal opacity-70">0</span>
                </button>
              </div>

              <!-- ── Submit / Undo ── -->
              <div class="flex gap-2 pt-1">
                <button @click="submitThrow"
                        :disabled="dartInput.darts.length === 0 || submitting"
                        class="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl
                               transition-all disabled:opacity-40 shadow-lg shadow-amber-950/40
                               active:scale-[0.97] text-base">
                  {{ submitting ? '...' : '✓ Iesniegt' }}
                </button>
                <button @click="undo"
                        class="bg-slate-700 hover:bg-slate-600 text-white px-5 py-4 rounded-2xl
                               transition-all font-bold active:scale-[0.97]">
                  ↩
                </button>
              </div>

            </div>
          </div>
        </div>

      </template>

      </template>

    </div>
    </div>
  `,
};
