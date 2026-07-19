<script setup lang="ts">
/**
 * Kopīgs paroles ievades lauks: rāda/slēpj paroli un (pēc izvēles) stipruma
 * indikatoru. Izmanto reģistrācijā, paroles atjaunošanā un iestatījumos, lai
 * neduplicētu vienu un to pašu markup/loģiku vairākās vietās (DRY).
 *
 * @prop {string} modelValue - v-model vērtība
 * @prop {string} id - input elementa id/for
 * @prop {string} label - lauka uzraksts
 * @prop {string} [placeholder]
 * @prop {string} [autocomplete]
 * @prop {boolean} [required]
 * @prop {boolean} [autofocus]
 * @prop {boolean} [readonly]
 * @prop {string} [error] - servera (422) validācijas kļūdas ziņojums
 * @prop {boolean} [showStrength=false] - vai rādīt paroles stipruma joslu
 */
import { useLocale } from '@/composables/useLocale';
import { usePasswordStrength } from '@/composables/usePasswordStrength';
import { computed, ref } from 'vue';

const props = withDefaults(
    defineProps<{
        modelValue: string;
        id: string;
        label: string;
        placeholder?: string;
        autocomplete?: string;
        required?: boolean;
        autofocus?: boolean;
        readonly?: boolean;
        error?: string;
        showStrength?: boolean;
    }>(),
    { showStrength: false },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const { t } = useLocale();
const showPassword = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const value = computed({
    get: () => props.modelValue,
    set: (v: string) => emit('update:modelValue', v),
});

const strengthMeta = usePasswordStrength(
    computed(() => props.modelValue),
    t,
);

/** Ļauj vecāka komponentei fokusēt šo lauku (piem. pēc 422 kļūdas). */
function focus() {
    inputRef.value?.focus();
}
defineExpose({ focus });
</script>

<template>
    <div>
        <label v-if="label" class="pf-label" :for="id">{{ label }}</label>
        <div class="pf-wrap">
            <input
                :id="id"
                ref="inputRef"
                v-model="value"
                :type="showPassword ? 'text' : 'password'"
                class="pf-input"
                :placeholder="placeholder"
                :required="required"
                :autofocus="autofocus"
                :readonly="readonly"
                :autocomplete="autocomplete"
            />
            <button type="button" class="pf-eye" :aria-label="showPassword ? t('pwd.hide') : t('pwd.show')" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a21.6 21.6 0 015.06-6.06M9.9 4.24A10.4 10.4 0 0112 4c7 0 11 7 11 7a21.6 21.6 0 01-2.16 3.19M14.12 14.12a3 3 0 11-4.24-4.24" />
                    <path d="M1 1l22 22" />
                </svg>
            </button>
        </div>

        <template v-if="showStrength">
            <div class="pf-strength-track">
                <div class="pf-strength-fill" :style="{ width: strengthMeta.width, background: strengthMeta.color }" />
            </div>
            <div v-if="strengthMeta.label" class="pf-strength-lbl">{{ strengthMeta.label }}</div>
        </template>

        <p v-if="error" class="pf-error">{{ error }}</p>
    </div>
</template>

<style scoped>
.pf-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #94a3b8;
    margin-bottom: 8px;
}
.pf-wrap {
    position: relative;
}
.pf-input {
    width: 100%;
    padding: 13px 44px 13px 16px;
    border-radius: 10px;
    background: #131a26;
    border: 1px solid #1f2937;
    color: #f4f4f5;
    font-size: 14px;
    font-family: Inter, sans-serif;
    outline: none;
}
.pf-input:focus {
    border-color: #39ff14;
}
.pf-input::placeholder {
    color: #64748b;
}
.pf-eye {
    position: absolute;
    top: 0;
    right: 14px;
    bottom: 0;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}
.pf-strength-track {
    margin-top: 10px;
    height: 4px;
    border-radius: 4px;
    background: #1f2937;
    overflow: hidden;
}
.pf-strength-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.2s;
}
.pf-strength-lbl {
    margin-top: 6px;
    font-size: 12px;
    color: #64748b;
}
.pf-error {
    margin-top: 6px;
    font-size: 12px;
    color: #fb2c5f;
}
</style>
