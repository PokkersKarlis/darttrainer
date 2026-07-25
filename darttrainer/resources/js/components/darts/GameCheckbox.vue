<script setup lang="ts">
defineProps<{
    modelValue: boolean;
    label?: string;
}>();

defineEmits<{
    'update:modelValue': [value: boolean];
}>();
</script>

<template>
    <label class="gc-row">
        <span class="gc-box" :class="{ 'gc-box--on': modelValue }">
            <svg
                v-if="modelValue"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0b0f19"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path d="M20 6L9 17l-5-5" />
            </svg>
        </span>
        <input
            type="checkbox"
            class="sr-only"
            :checked="modelValue"
            @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        />
        <span v-if="label || $slots.default" class="gc-label">
            <slot>{{ label }}</slot>
        </span>
    </label>
</template>

<style scoped>
.gc-row {
    display: inline-flex;
    align-items: flex-start;
    gap: 10px;
    cursor: pointer;
    user-select: none;
}

.gc-box {
    display: inline-flex;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-top: 1px;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: 1px solid #334155;
    background: rgba(255, 255, 255, 0.04);
    transition:
        border-color 0.15s ease,
        background 0.15s ease,
        box-shadow 0.15s ease;
}

.gc-row:hover .gc-box {
    border-color: rgba(57, 255, 20, 0.35);
}

.gc-box--on {
    border-color: #39ff14;
    background: #39ff14;
    box-shadow: 0 0 12px rgba(57, 255, 20, 0.35);
}

.gc-label {
    color: #94a3b8;
    font-size: 13px;
    line-height: 1.45;
}

.gc-row:hover .gc-label {
    color: #cbd5e1;
}
</style>
