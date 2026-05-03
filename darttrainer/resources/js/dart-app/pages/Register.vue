<script setup>
import { ref, reactive, watch, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useLocaleStore } from '../store/index.js';
import DtButton from '../components/ui/DtButton.vue';

defineOptions({ name: 'RegisterPage' });

const auth = useAuthStore();
const locale = useLocaleStore();
const router = useRouter();

const accountType = ref('player');

const form = reactive({
  name: '',
  clubName: '',
  email: '',
  password: '',
  confirm: '',
  error: '',
});

watch(accountType, (v) => {
  if (v !== 'club') {
    form.clubName = '';
  }
});

const t = (key) => locale.t(key);

async function focusAndKeepInView(id) {
  await nextTick();
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      el.focus?.({ preventScroll: true });
    } catch (_) {}
  });
}

onMounted(() => {
  void focusAndKeepInView('reg-name');
});

watch(accountType, async (v) => {
  if (v === 'club') {
    // Kluba lauks parādās – fokusējam to un pabīdam, lai poga būtu sasniedzama (ar scroll, ja vajag).
    await focusAndKeepInView('reg-club-name');
  }
});

async function submit() {
  form.error = '';
  if (form.password !== form.confirm) {
    form.error = t('auth.errMismatch');
    return;
  }
  if (accountType.value === 'club' && !String(form.clubName || '').trim()) {
    form.error = t('auth.errClubName');
    return;
  }
  try {
    await auth.register({
      name: form.name,
      email: form.email,
      password: form.password,
      passwordConfirmation: form.confirm,
      accountType: accountType.value,
      clubName: String(form.clubName || '').trim(),
    });
    await router.push('/');
    window._dartToast?.(t('auth.registerCheckEmail'), 'success');
  } catch (e) {
    const errs = e.response?.data?.errors;
    form.error = errs ? Object.values(errs).flat().join(' ') : t('auth.errRegister');
  }
}
</script>

<template>
  <div class="dt-auth-page dt-auth-page--register" :class="{ 'dt-auth-page--club': accountType === 'club' }">
    <div class="dt-auth-page-inner">
      <div class="dt-auth-stack">
        <div class="dt-auth-brand">
          <router-link to="/" class="dt-auth-logo-link" aria-label="DartTrainer">
            <img class="dt-auth-logo" src="/images/logo.png" alt="DartTrainer" width="160" height="52" />
          </router-link>
          <div class="dt-auth-wordline" aria-hidden="true">
            <span class="dt-auth-wordmark">{{ t('home.brandWordmark') }}</span>
            <span class="dt-auth-beta">{{ t('home.betaBadge') }}</span>
          </div>
          <h1>{{ t('shell.register') }}</h1>
          <p class="dt-auth-sub">
            {{ t('auth.registerTitle') }}
          </p>
        </div>

        <div class="dt-auth-card">
          <form class="dt-auth-card-form" @submit.prevent="submit">
                  <div class="dt-auth-account-row">
                    <div class="dt-auth-label--row">
                      {{ t('auth.accountTypeLabel') }}
                    </div>
                    <div class="dt-auth-pills">
                      <label class="dt-auth-pill-label">
                        <input v-model="accountType" type="radio" name="account_type" value="player" class="sr-only peer" />
                        <div class="acct-pill" :class="{ 'acct-pill--on': accountType === 'player' }">
                          {{ t('auth.accountTypePlayer') }}
                        </div>
                      </label>
                      <label class="dt-auth-pill-label">
                        <input v-model="accountType" type="radio" name="account_type" value="club" class="sr-only peer" />
                        <div class="acct-pill" :class="{ 'acct-pill--on': accountType === 'club' }">
                          {{ t('auth.accountTypeClub') }}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div v-if="accountType === 'club'" class="dt-auth-club-box">
                    <p class="dt-auth-club-hint">
                      {{ t('auth.clubFutureHint') }}
                    </p>
                    <label class="dt-auth-label--block" for="reg-club-name">{{ t('auth.clubName') }}</label>
                    <input
                      id="reg-club-name"
                      v-model="form.clubName"
                      class="dt-auth-input"
                      type="text"
                      required
                      maxlength="120"
                    />
                  </div>

                  <div class="dt-auth-fields">
                    <div class="dt-auth-field-span">
                      <label class="dt-auth-label--block" for="reg-name">{{ t('auth.name') }}</label>
                      <input id="reg-name" v-model="form.name" class="dt-auth-input" type="text" required maxlength="50" />
                    </div>

                    <div class="dt-auth-field-span">
                      <label class="dt-auth-label--block" for="reg-email">{{ t('auth.email') }}</label>
                      <input id="reg-email" v-model="form.email" class="dt-auth-input" type="email" required />
                    </div>

                    <div>
                      <label class="dt-auth-label--block" for="reg-pw">{{ t('auth.password') }}</label>
                      <input id="reg-pw" v-model="form.password" class="dt-auth-input" type="password" required minlength="8" />
                    </div>

                    <div>
                      <label class="dt-auth-label--block" for="reg-confirm">{{ t('auth.repeat') }}</label>
                      <input id="reg-confirm" v-model="form.confirm" class="dt-auth-input" type="password" required />
                    </div>
                  </div>

                  <div v-if="form.error" class="dt-auth-err">
                    {{ form.error }}
                  </div>

            <div class="dt-auth-submit-row">
              <dt-button id="reg-submit" button-type="submit" variant="primary" size="lg" block :disabled="auth.loading">
                {{ auth.loading ? t('auth.loading') : t('auth.submitRegister') }}
              </dt-button>
            </div>
            <div class="dt-auth-under">
              <span class="dt-auth-under-t">{{ t('auth.hasAccount') }}</span>
              <router-link to="/login" class="dt-auth-under-a">
                {{ t('auth.goLogin') }}
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./authPage.css"></style>
