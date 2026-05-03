<script setup>
import { computed } from 'vue';

/** Viena apakšējās navigācijas saite (mobilā) */
const props = defineProps({
  href: { type: String, required: true },
  icon: { type: String, default: '' },
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  emphasis: { type: Boolean, default: false },
  flexFill: { type: Boolean, default: false },
  /** Viesu «Reģistrēt» — zeltaina saite */
  guestAccent: { type: Boolean, default: false },
});

const labelStyle = computed(() => {
  if (props.emphasis) return 'font-weight:800;color:#fbbf24';
  if (props.flexFill) {
    const base = 'text-align:center;line-height:1.2';
    return props.guestAccent ? `${base};font-weight:800` : base;
  }
  return '';
});

const anchorStyle = computed(() => {
  const parts = [];
  if (props.flexFill) parts.push('flex:1;min-width:0');
  if (props.guestAccent || props.emphasis) parts.push('color:#fbbf24');
  return parts.join(';');
});

const anchorClass = computed(() => [
  'bnav-item',
  { 'bnav-item--disabled': props.disabled },
]);
</script>

<template>
  <router-link
    v-if="!disabled"
    :to="href"
    :class="anchorClass"
    :style="anchorStyle || undefined"
    active-class="active"
  >
    <span class="bicon">{{ icon }}</span>
    <span :style="labelStyle || undefined">{{ label }}</span>
  </router-link>
  <span v-else :class="anchorClass" :style="anchorStyle || undefined" aria-disabled="true">
    <span class="bicon">{{ icon }}</span>
    <span :style="labelStyle || undefined">{{ label }}</span>
  </span>
</template>
