/**
 * X01 metiena ievade: lauki 1…20 pēc kārtas, bull atsevišķi; 1× / 2× / 3×.
 */
const X01ThrowInput = {
  props: {
    darts:        { type: Array, required: true },
    submitting:   { type: Boolean, default: false },
    dartLabel:    { type: Function, required: true },
    dartValue:    { type: Function, required: true },
  },
  emits: ['add', 'miss', 'remove', 'submit', 'undo'],

  setup(props, { emit }) {
    const ORDER_NO_BULL = Array.from({ length: 20 }, (_, i) => i + 1);

    const padSplit = Vue.computed(() => {
      const mid = Math.ceil(ORDER_NO_BULL.length / 2);
      return { left: ORDER_NO_BULL.slice(0, mid), right: ORDER_NO_BULL.slice(mid) };
    });

    function addSegMul(seg, mul) {
      if (props.darts.length >= 3) return;
      if (seg === 25 && mul === 3) return;
      emit('add', seg, mul);
    }

    function onMiss() {
      if (props.darts.length >= 3) return;
      emit('miss');
    }

    return { padSplit, addSegMul, onMiss };
  },

  template: `
    <div class="flex flex-col gap-3 min-h-0">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Šīs kārtas šautnes</span>
        <div class="flex gap-1.5" aria-hidden="true">
          <span v-for="i in 3" :key="i"
                class="h-2 w-2 rounded-full transition-all duration-200"
                :class="i <= darts.length ? 'bg-amber-400 scale-110 shadow-[0_0_8px_rgba(251,191,36,.5)]' : 'bg-[#1e3050]'"></span>
        </div>
      </div>

      <div class="min-h-0 flex flex-col gap-2">
        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">Ātrā ievade · lauki 1–20</p>
        <div class="shrink-0 space-y-2 rounded-lg">
          <div class="grid grid-cols-2 gap-x-2 gap-y-2">
            <div class="flex flex-col gap-2">
              <div v-for="seg in padSplit.left" :key="'xl'+seg"
                   class="rounded-2xl border border-slate-500/25 bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg shadow-black/20 ring-1 ring-white/[0.06]">
                <div class="mb-2 flex items-center justify-between gap-2">
                  <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Lauks</span>
                  <span class="min-w-[2.25rem] rounded-xl bg-gradient-to-br from-amber-400/25 to-amber-700/10 px-2.5 py-1 text-center text-xl font-black tabular-nums text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,.12)] ring-1 ring-amber-400/35">{{ seg }}</span>
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <button type="button" @click="addSegMul(seg, 1)"
                          :disabled="darts.length >= 3"
                          class="relative flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border px-1 py-2 shadow-md transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-25 disabled:pointer-events-none
                                 border-slate-400/35 bg-gradient-to-b from-slate-600/50 to-slate-950/95 text-white ring-1 ring-inset ring-white/10 hover:from-slate-500/55">
                    <span class="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-300/95">Vienkārt</span>
                    <span class="text-2xl font-black leading-none tabular-nums">1×</span>
                  </button>
                  <button type="button" @click="addSegMul(seg, 2)"
                          :disabled="darts.length >= 3"
                          class="relative flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border px-1 py-2 shadow-md transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-25 disabled:pointer-events-none
                                 border-sky-400/40 bg-gradient-to-b from-sky-600/45 to-sky-950/95 text-sky-50 ring-1 ring-inset ring-sky-300/15 hover:from-sky-500/55">
                    <span class="text-[8px] font-bold uppercase tracking-[0.12em] text-sky-200/90">Dubults</span>
                    <span class="text-2xl font-black leading-none tabular-nums">2×</span>
                  </button>
                  <button type="button" @click="addSegMul(seg, 3)"
                          :disabled="darts.length >= 3"
                          class="relative flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border px-1 py-2 shadow-md transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-25 disabled:pointer-events-none
                                 border-amber-400/45 bg-gradient-to-b from-amber-600/40 to-amber-950/95 text-amber-50 ring-1 ring-inset ring-amber-300/15 hover:from-amber-500/50">
                    <span class="text-[8px] font-bold uppercase tracking-[0.12em] text-amber-200/90">Trīskārš</span>
                    <span class="text-2xl font-black leading-none tabular-nums">3×</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div v-for="seg in padSplit.right" :key="'xr'+seg"
                   class="rounded-2xl border border-slate-500/25 bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg shadow-black/20 ring-1 ring-white/[0.06]">
                <div class="mb-2 flex items-center justify-between gap-2">
                  <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Lauks</span>
                  <span class="min-w-[2.25rem] rounded-xl bg-gradient-to-br from-amber-400/25 to-amber-700/10 px-2.5 py-1 text-center text-xl font-black tabular-nums text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,.12)] ring-1 ring-amber-400/35">{{ seg }}</span>
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <button type="button" @click="addSegMul(seg, 1)"
                          :disabled="darts.length >= 3"
                          class="relative flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border px-1 py-2 shadow-md transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-25 disabled:pointer-events-none
                                 border-slate-400/35 bg-gradient-to-b from-slate-600/50 to-slate-950/95 text-white ring-1 ring-inset ring-white/10 hover:from-slate-500/55">
                    <span class="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-300/95">Vienkārt</span>
                    <span class="text-2xl font-black leading-none tabular-nums">1×</span>
                  </button>
                  <button type="button" @click="addSegMul(seg, 2)"
                          :disabled="darts.length >= 3"
                          class="relative flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border px-1 py-2 shadow-md transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-25 disabled:pointer-events-none
                                 border-sky-400/40 bg-gradient-to-b from-sky-600/45 to-sky-950/95 text-sky-50 ring-1 ring-inset ring-sky-300/15 hover:from-sky-500/55">
                    <span class="text-[8px] font-bold uppercase tracking-[0.12em] text-sky-200/90">Dubults</span>
                    <span class="text-2xl font-black leading-none tabular-nums">2×</span>
                  </button>
                  <button type="button" @click="addSegMul(seg, 3)"
                          :disabled="darts.length >= 3"
                          class="relative flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border px-1 py-2 shadow-md transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-25 disabled:pointer-events-none
                                 border-amber-400/45 bg-gradient-to-b from-amber-600/40 to-amber-950/95 text-amber-50 ring-1 ring-inset ring-amber-300/15 hover:from-amber-500/50">
                    <span class="text-[8px] font-bold uppercase tracking-[0.12em] text-amber-200/90">Trīskārš</span>
                    <span class="text-2xl font-black leading-none tabular-nums">3×</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/35 via-[#0a1520] to-[#060d14] p-2 shadow-lg ring-1 ring-emerald-500/15">
            <div class="mb-2 flex items-center justify-between gap-2 px-0.5">
              <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-500/90">Bull</span>
              <span class="rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-900/20 px-3 py-1 text-xl font-black tabular-nums text-emerald-100 ring-1 ring-emerald-400/35">25</span>
            </div>
            <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2">
              <button type="button" @click="addSegMul(25, 1)"
                      :disabled="darts.length >= 3"
                      class="relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border px-2 py-3 shadow-md transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-25 disabled:pointer-events-none
                             border-slate-400/35 bg-gradient-to-b from-slate-600/50 to-slate-950/95 text-white ring-1 ring-inset ring-white/10">
                <span class="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-300">Ārējais</span>
                <span class="text-3xl font-black tabular-nums leading-none">1×</span>
              </button>
              <button type="button" @click="addSegMul(25, 2)"
                      :disabled="darts.length >= 3"
                      class="relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border px-2 py-3 shadow-lg transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-25 disabled:pointer-events-none
                             border-sky-400/50 bg-gradient-to-br from-sky-500/45 via-sky-700/35 to-sky-950/90 text-sky-50 ring-2 ring-sky-400/30 hover:from-sky-400/50">
                <span class="text-[9px] font-bold uppercase tracking-[0.14em] text-sky-200">Iekšējais bull</span>
                <span class="text-3xl sm:text-4xl font-black tabular-nums leading-none">2×</span>
              </button>
            </div>
          </div>
        </div>
        <button type="button"
                @click="onMiss"
                :disabled="darts.length >= 3"
                class="w-full rounded-xl min-h-[2.5rem] font-black text-xs sm:text-sm uppercase tracking-wide flex-shrink-0
                       bg-[#1a0a0f]/80 text-rose-300/90 border border-rose-900/50 hover:bg-[#2a1218]
                       transition active:scale-[0.99] touch-manipulation disabled:opacity-25 disabled:pointer-events-none">
          Miss · garām
        </button>
      </div>

      <div class="rounded-2xl border border-[#162540] bg-[#0a1120]/50 p-2 overflow-hidden min-h-0">
        <p class="text-[10px] font-bold text-slate-500 mb-2 px-1 uppercase tracking-wider">Šķīvis</p>
        <DartboardInput @add-dart="(d) => $emit('add', d.segment, d.multiplier)" />
      </div>

      <div>
        <p class="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Ievadītie punkti</p>
        <div class="space-y-2 min-h-[4rem]">
          <div v-for="(d, i) in darts" :key="i"
               class="flex items-center justify-between gap-2 bg-[#060d18] border border-[#162540] rounded-2xl px-3 py-2.5 touch-manipulation">
            <div class="min-w-0">
              <div class="text-amber-400 font-mono font-black text-base leading-none truncate">{{ dartLabel(d) }}</div>
              <div class="text-slate-500 text-xs tabular-nums mt-0.5">
                {{ dartValue(d) > 0 ? dartValue(d) + ' punkti' : '0' }}
              </div>
            </div>
            <button type="button"
                    @click="$emit('remove', i)"
                    class="flex-shrink-0 w-10 h-10 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 text-base font-black
                           border border-red-900/50 active:scale-95 transition">
              ✕
            </button>
          </div>
          <div v-for="i in (3 - darts.length)" :key="'e'+i"
               class="h-12 rounded-2xl border border-dashed border-[#1e3050] bg-[#060d18]/40 flex items-center justify-center text-[#1e3050] text-xs font-mono">
            {{ darts.length + i }}. šautne
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-0.5">
        <button type="button"
                @click="$emit('undo')"
                class="order-2 sm:order-1 py-3 sm:py-4 rounded-2xl font-bold text-sm bg-[#162540] hover:bg-[#1e3050] text-slate-200
                       border border-[#1e3050] active:scale-[0.98] transition touch-manipulation
                       flex items-center justify-center gap-2">
          <span class="text-lg">↩</span> Atsaukt kārtu
        </button>
        <button type="button"
                @click="$emit('submit')"
                :disabled="darts.length === 0 || submitting"
                class="order-1 sm:order-2 py-3 sm:py-4 rounded-2xl font-black text-base bg-amber-500 hover:bg-amber-400 text-black
                       shadow-xl shadow-amber-950/35 active:scale-[0.98] transition touch-manipulation
                       disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <span v-if="submitting">…</span>
          <template v-else>
            Iesniegt metienu
            <span class="opacity-80 text-sm">↵</span>
          </template>
        </button>
      </div>
    </div>
  `,
};
