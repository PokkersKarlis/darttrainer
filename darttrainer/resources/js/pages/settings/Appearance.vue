<script setup lang="ts">
import SettingsShell from '@/layouts/SettingsShell.vue';
import { useAppearance } from '@/composables/useAppearance';
import { Head } from '@inertiajs/vue3';
import { Monitor, Moon, Sun } from 'lucide-vue-next';

const { appearance, updateAppearance } = useAppearance();

const options = [
    { value: 'light', Icon: Sun, label: 'Gaišs' },
    { value: 'dark', Icon: Moon, label: 'Tumšs' },
    { value: 'system', Icon: Monitor, label: 'Sistēma' },
] as const;
</script>

<template>
    <Head title="Izskata iestatījumi" />

    <SettingsShell>
        <section>
            <h2 class="tf-h">Izskats</h2>
            <p class="tf-desc">Izvēlies lietotnes krāsu tēmu.</p>

            <div class="ap-tabs">
                <button
                    v-for="{ value, Icon, label } in options"
                    :key="value"
                    type="button"
                    class="ap-tab"
                    :class="{ 'ap-tab--on': appearance === value }"
                    @click="updateAppearance(value)"
                >
                    <component :is="Icon" class="ap-ico" />
                    <span>{{ label }}</span>
                </button>
            </div>
        </section>
    </SettingsShell>
</template>

<style scoped>
.tf-h {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 20px;
    margin: 0 0 4px;
}
.tf-desc {
    color: #64748b;
    font-size: 14px;
    margin: 0 0 20px;
}
.ap-tabs {
    display: inline-flex;
    gap: 6px;
    padding: 6px;
    border-radius: 12px;
    background: #131a26;
    border: 1px solid #1f2937;
}
.ap-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #94a3b8;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    /* Pārlūka noklusējuma fokusa gredzens (parasti gaiši zils) citādi pēc klikšķa
       nogulstas virs neona zaļā fona un padara aktīvo cilni izbalējušu. */
}
.ap-tab:hover {
    color: #f4f4f5;
}
.ap-tab:focus-visible {
    box-shadow: 0 0 0 2px #0b0f19, 0 0 0 4px #39ff14;
}
.ap-tab--on {
    background: rgba(57, 255, 20, 0.12);
    color: #39ff14;
}
.ap-ico {
    width: 16px;
    height: 16px;
}
</style>
