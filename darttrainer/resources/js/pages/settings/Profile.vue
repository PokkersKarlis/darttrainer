<script setup lang="ts">
import SettingsShell from '@/layouts/SettingsShell.vue';
import { Head, Link, useForm, usePage } from '@inertiajs/vue3';
import { ref } from 'vue';
import type { SharedData, User } from '@/types';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}
defineProps<Props>();

const page = usePage<SharedData>();
const user = page.props.auth.user as User;

const form = useForm({
    name: user.name,
    email: user.email,
});

const submit = () => {
    form.patch(route('profile.update'), { preserveScroll: true });
};

// ── Konta dzēšana ──
const confirmingDelete = ref(false);
const deleteForm = useForm({ password: '' });

const deleteAccount = () => {
    deleteForm.delete(route('profile.destroy'), {
        preserveScroll: true,
        onError: () => {
            /* parole nepareiza — kļūda paliek formā */
        },
    });
};
</script>

<template>
    <Head title="Profila iestatījumi" />

    <SettingsShell>
        <section class="tf-section">
            <h2 class="tf-h">Profila informācija</h2>
            <p class="tf-desc">Atjaunini savu vārdu un e-pasta adresi.</p>

            <form class="tf-form" @submit.prevent="submit">
                <div>
                    <label class="tf-label" for="name">Vārds</label>
                    <input id="name" v-model="form.name" type="text" class="tf-input" required autocomplete="name" />
                    <p v-if="form.errors.name" class="tf-error">{{ form.errors.name }}</p>
                </div>

                <div>
                    <label class="tf-label" for="email">E-pasts</label>
                    <input id="email" v-model="form.email" type="email" class="tf-input" required autocomplete="username" />
                    <p v-if="form.errors.email" class="tf-error">{{ form.errors.email }}</p>
                </div>

                <div v-if="mustVerifyEmail && !user.email_verified_at" class="tf-note">
                    E-pasts nav apstiprināts.
                    <Link :href="route('verification.send')" method="post" as="button" class="tf-note-link">
                        Nosūtīt apstiprinājuma saiti vēlreiz
                    </Link>
                    <span v-if="status === 'verification-link-sent'" class="tf-note-ok">Saite nosūtīta.</span>
                </div>

                <div class="tf-actions">
                    <button type="submit" class="tf-btn tf-btn--green" :disabled="form.processing">Saglabāt</button>
                    <span v-if="form.recentlySuccessful" class="tf-saved">Saglabāts.</span>
                </div>
            </form>
        </section>

        <!-- Danger zone -->
        <section class="tf-danger">
            <h2 class="tf-h tf-h--danger">Dzēst kontu</h2>
            <p class="tf-desc">Kad konts izdzēsts, visi dati tiek neatgriezeniski dzēsti.</p>

            <button v-if="!confirmingDelete" type="button" class="tf-btn tf-btn--danger" @click="confirmingDelete = true">
                Dzēst kontu
            </button>

            <form v-else class="tf-form" @submit.prevent="deleteAccount">
                <p class="tf-desc">Apstiprini ar paroli, lai dzēstu kontu.</p>
                <div>
                    <label class="tf-label" for="del-pw">Parole</label>
                    <input id="del-pw" v-model="deleteForm.password" type="password" class="tf-input" autocomplete="current-password" />
                    <p v-if="deleteForm.errors.password" class="tf-error">{{ deleteForm.errors.password }}</p>
                </div>
                <div class="tf-actions">
                    <button type="submit" class="tf-btn tf-btn--danger" :disabled="deleteForm.processing">Dzēst neatgriezeniski</button>
                    <button type="button" class="tf-btn tf-btn--ghost" @click="confirmingDelete = false; deleteForm.reset()">Atcelt</button>
                </div>
            </form>
        </section>
    </SettingsShell>
</template>

<style scoped>
.tf-section {
    margin-bottom: 40px;
}
.tf-h {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 20px;
    margin: 0 0 4px;
}
.tf-h--danger {
    color: #fb2c5f;
}
.tf-desc {
    color: #64748b;
    font-size: 14px;
    margin: 0 0 20px;
}
.tf-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 460px;
}
.tf-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #94a3b8;
    margin-bottom: 8px;
}
.tf-input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 10px;
    background: #131a26;
    border: 1px solid #1f2937;
    color: #f4f4f5;
    font-size: 14px;
    font-family: Inter, sans-serif;
    outline: none;
}
.tf-input:focus {
    border-color: #39ff14;
}
.tf-error {
    margin-top: 6px;
    font-size: 12px;
    color: #fb2c5f;
}
.tf-note {
    font-size: 13px;
    color: #94a3b8;
}
.tf-note-link {
    background: none;
    border: none;
    color: #39ff14;
    cursor: pointer;
    text-decoration: underline;
    font-size: 13px;
    padding: 0;
}
.tf-note-ok {
    display: block;
    margin-top: 6px;
    color: #39ff14;
}
.tf-actions {
    display: flex;
    align-items: center;
    gap: 14px;
}
.tf-saved {
    color: #39ff14;
    font-size: 13px;
}
.tf-btn {
    padding: 11px 20px;
    border-radius: 10px;
    font-weight: 800;
    font-family: 'Barlow Condensed', sans-serif;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
}
.tf-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.tf-btn--green {
    background: #39ff14;
    color: #0b0f19;
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
}
.tf-btn--danger {
    background: #fb2c5f;
    color: #fff;
}
.tf-btn--ghost {
    background: transparent;
    border: 1px solid #334155;
    color: #cbd5e1;
}
.tf-danger {
    border-top: 1px solid #1f2937;
    padding-top: 32px;
}
</style>
