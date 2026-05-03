<script setup>
/**
 * Slēgta segmenta atzīme.
 * - prominent: scoreboard šūna (CricketMarkCell) — ievērojami lielāka par 0/1/2
 * - boosted: pārējās tabulas šūnas — nedaudz lielāka par ciparu
 */
defineProps({
  boosted: { type: Boolean, default: true },
  prominent: { type: Boolean, default: false },
});
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       aria-hidden="true"
       class="inline-block align-middle flex-shrink-0"
       :class="prominent
         ? 'w-[clamp(1.85rem,6vmin,3.15rem)] h-[clamp(1.85rem,6vmin,3.15rem)] min-w-[1.85rem] min-h-[1.85rem] ' +
           'drop-shadow-[0_4px_18px_rgba(16,185,129,.42)]'
         : boosted
           ? 'w-[1.24em] h-[1.24em] min-w-[1.24em] min-h-[1.24em] sm:w-[1.32em] sm:h-[1.32em] sm:min-w-[1.32em] sm:min-h-[1.32em] ' +
             'drop-shadow-[0_2px_10px_rgba(16,185,129,.28)]'
           : 'w-[1em] h-[1em] min-w-[1em] min-h-[1em] drop-shadow-[0_1px_6px_rgba(16,185,129,.2)]'">
    <circle cx="12" cy="12" :r="prominent ? 9.85 : 9.65"
            fill="#10b981" :fill-opacity="prominent ? 0.22 : 0.14"
            :stroke="prominent ? '#6ee7b7' : '#34d399'"
            :stroke-opacity="prominent ? 0.95 : 0.6"
            :stroke-width="prominent ? 1.55 : 1.35"/>
    <path d="M7.05 12.45 10.4 15.6 17.1 7.65"
          stroke="#ecfdf5"
          :stroke-width="prominent ? 2.75 : 2.35"
          stroke-linecap="round" stroke-linejoin="round"
          stroke-opacity="0.97"/>
  </svg>
</template>
