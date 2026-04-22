<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../../../store/index.js';

defineProps({
  /** Mobilā konta izvēlnes poga — rāda mazu bultiņu, ka var atvērt izvēlni */
  showChevron: { type: Boolean, default: false },
});

const auth = useAuthStore();

const initial = computed(() => {
  const n = auth.user?.name;
  return n && n[0] ? String(n[0]).toUpperCase() : '?';
});
const displayName = computed(() => auth.user?.name || '—');
</script>

<template>
  <div style="display: flex; align-items: center; gap: 8px">
    <div
      style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #1e3050;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 13px;
        color: #f59e0b;
        flex-shrink: 0;
      "
    >
      {{ initial }}
    </div>
    <span
      class="hidden sm:inline"
      style="
        font-size: 13px;
        color: #94a3b8;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      "
    >
      {{ displayName }}
    </span>
    <span
      v-if="showChevron"
      class="lg:hidden"
      style="display: flex; align-items: center; flex-shrink: 0; color: #64748b"
      aria-hidden="true"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </div>
</template>
