<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        scores?: number[];
        disabled?: boolean;
        sidebar?: boolean;
        isAllowed?: (score: number) => boolean;
    }>(),
    {
        scores: () => [180, 140, 100, 85, 60, 57, 54, 52, 45, 40, 26, 25],
        disabled: false,
        sidebar: false,
        isAllowed: () => true,
    },
);

const emit = defineEmits<{
    select: [score: number];
}>();
</script>

<template>
    <div class="calc-quick" :class="{ 'calc-quick--sidebar': sidebar }">
        <button
            v-for="score in scores"
            :key="score"
            type="button"
            class="calc-quick-btn"
            :disabled="disabled || !isAllowed(score)"
            @click="emit('select', score)"
        >
            {{ score }}
        </button>
    </div>
</template>

<style scoped>
.calc-quick {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(2px, 0.6vh, 5px);
    flex-shrink: 0;
}

.calc-quick-btn {
    min-height: clamp(34px, 5.5vh, 42px);
    padding: 6px 4px;
    border-radius: 9px;
    border: 1px solid rgba(34, 211, 238, 0.25);
    background: rgba(34, 211, 238, 0.08);
    color: #22d3ee;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(14px, 2.8vw, 17px);
    font-weight: 800;
    cursor: pointer;
}

.calc-quick--sidebar {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(4, minmax(0, 1fr));
    gap: 5px;
    padding: 8px;
    width: 100%;
    height: 100%;
    min-height: 0;
    box-sizing: border-box;
    border-radius: var(--game-radius, 12px);
    border: 1px solid #1f2937;
    background: linear-gradient(165deg, rgba(19, 26, 38, 0.92), rgba(13, 18, 32, 0.96));
    overflow: hidden;
}

.calc-quick--sidebar .calc-quick-btn {
    min-height: 0;
    height: 100%;
    padding: 4px 2px;
    font-size: clamp(12px, 1.2vw, 16px);
}

.calc-quick-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}
</style>
