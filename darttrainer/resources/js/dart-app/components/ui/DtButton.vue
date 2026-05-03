<script setup>
import { computed } from 'vue';

/** Reusable button — variants are self-contained; change here, not per-page. */
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'ghost', 'success'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  buttonType: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
});

defineEmits(['click']);

const cls = computed(() => {
  const base =
    'inline-flex items-center justify-center font-bold rounded-lg border transition-colors ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-0 ' +
    'disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none';
  const sz =
    props.size === 'sm'
      ? 'text-xs px-2.5 py-1.5 gap-1'
      : props.size === 'lg'
        ? 'text-[15px] px-4 py-3.5 gap-2'
        : 'text-sm px-3 py-2 gap-1.5';
  const variants = {
    primary: 'bg-amber-500 border-amber-500 text-black hover:bg-amber-400 hover:border-amber-400',
    secondary: 'bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600',
    danger: 'bg-red-600 border-red-600 text-white hover:bg-red-500',
    ghost: 'bg-transparent border-slate-600 text-slate-200 hover:bg-slate-800',
    success: 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-500',
  };
  const blockCls = props.block ? 'w-full' : '';
  return [base, sz, variants[props.variant] || variants.primary, blockCls].filter(Boolean).join(' ');
});
</script>

<template>
  <button :type="buttonType" :disabled="disabled" :class="cls" @click="$emit('click', $event)">
    <slot />
  </button>
</template>
