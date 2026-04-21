import * as Vue from 'vue';
export default {
  props: {
    hits:   { type: Number, default: 0 },
    closed: { type: Boolean, default: false }, // segment closed by all players
    size:   { type: String, default: 'md' },   // 'sm' | 'md' | 'lg' | 'board' | 'board-sm'
  },

  setup(props) {
    function symbol(h) {
      const n = h ?? 0;
      if (n === 2) return '2';
      if (n === 1) return '1';
      return '0';
    }

    function hitTitle(h) {
      const n = h ?? 0;
      if (n >= 3) return 'Slēgts (3 trāpījumi)';
      if (n === 2) return 'Divi trāpījumi';
      if (n === 1) return 'Viens trāpījums';
      return 'Nav trāpījumu';
    }

    function colorClass(h) {
      if (h >= 3) return 'text-emerald-300';
      if (h === 2) return 'text-amber-200';
      if (h === 1) return 'text-sky-200';
      return 'text-slate-500';
    }

    function pillClass(h) {
      const n = h ?? 0;
      if (n >= 3) return 'bg-emerald-500/20 ring-1 ring-emerald-400/35 shadow-[0_0_20px_rgba(52,211,153,.12)]';
      if (n === 2) return 'bg-amber-500/18 ring-1 ring-amber-400/30';
      if (n === 1) return 'bg-sky-500/18 ring-1 ring-sky-400/28';
      return 'bg-[#0c1528]/90 ring-1 ring-[#1e3050]/80';
    }

    const sizeClass = Vue.computed(() => {
      const map = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-3xl',
        board: 'text-[clamp(1.35rem,4.2vmin,2.75rem)] sm:text-[clamp(1.5rem,3.8vmin,2.5rem)]',
        'board-sm': 'text-[clamp(0.7rem,2.6vmin,1.05rem)]',
      };
      return map[props.size] ?? map.md;
    });

    const isBoard = Vue.computed(() => props.size === 'board' || props.size === 'board-sm');
    const isBoardCompact = Vue.computed(() => props.size === 'board-sm');

    return { symbol, hitTitle, colorClass, pillClass, sizeClass, isBoard, isBoardCompact };
  },

  template: `
    <div class="flex items-center justify-center w-full h-full min-h-0 min-w-0 select-none p-0.5"
         :title="hitTitle(hits)">
      <Transition name="mark" mode="out-in">
        <span
          :key="hits"
          class="font-black leading-none transition-colors duration-200
                 drop-shadow-[0_2px_8px_rgba(0,0,0,.45)]"
        >
          <span
            v-if="hits < 3"
            :class="[
              isBoard ? pillClass(hits) : '',
              isBoard ? (isBoardCompact
                ? 'rounded-lg px-1 py-0.5 flex items-center justify-center min-w-[1.35rem] min-h-[1.35rem]'
                : 'rounded-xl px-2 py-1 flex items-center justify-center min-w-[2.25rem] min-h-[2.25rem] sm:min-w-[2.5rem] sm:min-h-[2.5rem]') : '',
              sizeClass,
              colorClass(hits),
              'font-mono tabular-nums',
            ]"
          >{{ symbol(hits) }}</span>
          <span
            v-else
            :class="[
              isBoard ? pillClass(hits) : '',
              isBoard ? (isBoardCompact
                ? 'rounded-lg px-0.5 py-0.5 flex items-center justify-center min-w-[1.45rem] min-h-[1.45rem]'
                : 'rounded-xl px-1.5 py-0.5 flex items-center justify-center min-w-[2.5rem] min-h-[2.5rem] sm:min-w-[2.85rem] sm:min-h-[2.85rem]') : 'inline-flex items-center justify-center',
              'inline-flex items-center justify-center font-sans',
              'mark-close-anim',
            ]"
          >
            <CricketClosedCheck :prominent="true" />
          </span>
        </span>
      </Transition>
    </div>
  `,
};
