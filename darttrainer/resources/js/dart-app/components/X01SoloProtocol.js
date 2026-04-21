import { useLocaleStore } from '../store/index.js';
/**
 * Solo X01 protokols: izvēršams, ar legu / kārtu tabulu (šobrīd viens leg = visa spēle).
 */
import * as Vue from 'vue';
export default {
  props: {
    state: { type: Object, required: true },
    defaultOpen: { type: Boolean, default: false },
  },

  setup(props) {
    const locale = useLocaleStore();
    const t = (k) => locale.t(k);

    function dartLabel(d) {
      const seg = d.seg ?? d.segment;
      const mul = d.mul ?? d.multiplier;
      if (seg === 0) return t('x01Training.dartMiss');
      if (seg === 25 && mul === 2) return t('x01Training.dartBull');
      if (seg === 25) return t('x01Training.dartOuter');
      const pre = mul === 2 ? 'D' : mul === 3 ? 'T' : '';
      return pre + seg;
    }

    function dartClass(d) {
      const mul = d.mul ?? d.multiplier;
      if ((d.seg ?? d.segment) === 0) return 'text-slate-600';
      if (mul === 3) return 'text-emerald-400';
      if (mul === 2) return 'text-sky-400';
      return 'text-slate-300';
    }

    const legs = Vue.computed(() => [
      {
        key: '1-1',
        label: t('x01Training.protocolSingleMatch'),
        turns: props.state.turns || [],
      },
    ]);

    function turnNotes(turn) {
      if (turn.bust) return t('x01Training.protocolBust');
      if (turn.checkout) return t('x01Training.protocolCheckout');
      if (props.state.in_mode === 'double' && !turn.opened) {
        return t('x01Training.protocolWaitDoubleIn');
      }
      return '—';
    }

    return { t, dartLabel, dartClass, legs, turnNotes };
  },

  template: `
    <div class="bg-slate-800/60 border border-slate-700/40 rounded-2xl overflow-hidden text-left">
      <details :open="defaultOpen" class="x01-solo-protocol-root">
        <summary
          class="px-3 py-2.5 cursor-pointer list-none flex items-center justify-between gap-2
                 border-b border-slate-700/40 hover:bg-slate-800/80
                 [&::-webkit-details-marker]:hidden">
          <span class="text-xs font-bold uppercase tracking-widest text-slate-500 shrink-0">
            {{ t('x01Training.protocolTitle') }}
          </span>
          <span class="text-slate-600 text-[10px] font-semibold truncate text-right">
            {{ (state.turns || []).length }} {{ t('x01Training.protocolTurnsSuffix') }}
            <span class="text-slate-700">·</span>
            {{ state.variant }} · {{ state.in_mode === 'double' ? 'D-in' : 'S-in' }}
            · {{ state.out_mode === 'double' ? 'D-out' : 'S-out' }}
          </span>
        </summary>
        <div class="p-2 space-y-2">
          <details v-for="leg in legs" :key="leg.key" open
                   class="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/20">
            <summary
              class="px-3 py-2 text-xs font-bold text-amber-400/90 bg-slate-900/50 cursor-pointer
                     list-none flex items-center justify-between
                     [&::-webkit-details-marker]:hidden">
              <span>{{ leg.label }}</span>
              <span class="text-[10px] font-semibold text-slate-600">{{ leg.turns.length }} {{ t('x01Training.protocolTurnsSuffix') }}</span>
            </summary>
            <div class="max-h-[min(24rem,50vh)] overflow-y-auto overscroll-y-contain border-t border-slate-800/60">
              <table class="w-full text-xs min-w-[18rem]">
                <thead class="text-slate-500 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-[1] border-b border-slate-800">
                  <tr>
                    <th class="text-left py-2 px-2 font-semibold w-10">{{ t('x01Training.protocolColTurn') }}</th>
                    <th class="text-left py-2 px-2 font-semibold">{{ t('x01Training.protocolColDarts') }}</th>
                    <th class="text-right py-2 px-2 font-semibold w-12">{{ t('x01Training.protocolColScored') }}</th>
                    <th class="text-right py-2 px-2 font-semibold hidden sm:table-cell">{{ t('x01Training.protocolColScore') }}</th>
                    <th class="text-left py-2 px-2 font-semibold hidden md:table-cell">{{ t('x01Training.protocolColNotes') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(turn, idx) in leg.turns" :key="idx"
                      class="border-t border-slate-800/80"
                      :class="turn.bust ? 'opacity-55' : ''">
                    <td class="py-2 px-2 text-slate-600 font-mono tabular-nums align-top">{{ idx + 1 }}</td>
                    <td class="py-2 px-2 align-top">
                      <div class="flex flex-wrap gap-1">
                        <span v-for="(d, di) in turn.darts" :key="di"
                              class="font-mono px-1.5 py-0.5 rounded bg-slate-900/70 text-[11px]"
                              :class="dartClass(d)">
                          {{ dartLabel(d) }}
                        </span>
                      </div>
                    </td>
                    <td class="py-2 px-2 text-right font-bold tabular-nums align-top"
                        :class="turn.bust ? 'text-red-400' : 'text-slate-300'">
                      {{ turn.bust ? '—' : '+' + turn.scored }}
                    </td>
                    <td class="py-2 px-2 text-right text-slate-500 font-mono tabular-nums align-top hidden sm:table-cell">
                      {{ turn.score_before }}→{{ turn.score_after }}
                    </td>
                    <td class="py-2 px-2 text-slate-500 align-top hidden md:table-cell whitespace-nowrap">
                      {{ turnNotes(turn) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </details>
    </div>
  `,
};
