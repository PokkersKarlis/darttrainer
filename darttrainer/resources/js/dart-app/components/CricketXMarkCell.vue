<script setup>
import { computed } from 'vue';

/**
 * Cricket X-mark cell — tradicionālie //X/O marķieri (1=skripts, 2=X, 3=X+aplis).
 * Aizstāj CricketMarkCell portreta skatā ar vizuāli intuitīvāku apzīmējumu.
 */
const props = defineProps({
  hits:   { type: Number, default: 0 },
  /** Pikseļu izmērs kvadrāta SVG elementam. */
  size:   { type: Number, default: 32 },
  /** Izmanto pelēku piesātinājumu, ja segments aizvērts no visiem. */
  dimmed: { type: Boolean, default: false },
});

const color = computed(() => {
  if (props.dimmed) return '#3a4a63';
  return props.hits >= 3 ? '#3ecf8e' : '#f5a623';
});
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    style="display:block;flex-shrink:0;overflow:visible"
  >
    <!-- pirmais skripts: apakškreisi → augšlabi -->
    <line
      v-if="hits >= 1"
      x1="18" y1="82" x2="82" y2="18"
      :stroke="color"
      stroke-width="12"
      stroke-linecap="round"
    />
    <!-- otrais skripts: augškreisi → apakšlabi -->
    <line
      v-if="hits >= 2"
      x1="18" y1="18" x2="82" y2="82"
      :stroke="color"
      stroke-width="12"
      stroke-linecap="round"
    />
    <!-- aplis = aizvērts -->
    <circle
      v-if="hits >= 3"
      cx="50" cy="50" r="39"
      fill="none"
      :stroke="dimmed ? '#3a4a63' : '#3ecf8e'"
      stroke-width="10"
    />
  </svg>
</template>
