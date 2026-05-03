<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useLocaleStore } from '../store/index.js';
import DtButton from '../components/ui/DtButton.vue';

defineOptions({ name: 'LoginPage' });

const auth = useAuthStore();
const locale = useLocaleStore();
const router = useRouter();

const form = reactive({
  email: '',
  password: '',
  error: '',
});

const t = (key) => locale.t(key);

onMounted(() => {
  requestAnimationFrame(() => {
    const el = document.getElementById('login-email');
    if (el && typeof el.focus === 'function') el.focus({ preventScroll: true });
  });
});

async function submit() {
  form.error = '';
  try {
    await auth.login(form.email, form.password);
    await router.push('/');
  } catch (e) {
    form.error = e.response?.data?.message || t('auth.errLogin');
  }
}
</script>

<template>
  <div class="dt-auth-page dt-auth-page--login">
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
          <h1>{{ t('shell.login') }}</h1>
          <p class="dt-auth-sub">
            {{ t('auth.loginTitle') }}
          </p>
        </div>

        <div class="dt-auth-card">
          <form class="dt-auth-card-form" @submit.prevent="submit">
            <div class="dt-auth-field-email">
              <label class="dt-auth-label--block" for="login-email">{{ t('auth.email') }}</label>
              <input
                id="login-email"
                v-model="form.email"
                class="dt-auth-input"
                type="email"
                required
                autocomplete="email"
              />
            </div>

            <div class="dt-auth-field-pass">
              <label class="dt-auth-label--block" for="login-pw">{{ t('auth.password') }}</label>
              <input
                id="login-pw"
                v-model="form.password"
                class="dt-auth-input"
                type="password"
                required
                autocomplete="current-password"
              />
            </div>

            <div v-if="form.error" class="dt-auth-err">
              {{ form.error }}
            </div>

            <div class="dt-auth-submit-row">
              <dt-button button-type="submit" variant="primary" size="lg" block :disabled="auth.loading">
                {{ auth.loading ? t('auth.loading') : t('auth.submitLogin') }}
              </dt-button>
            </div>
            <div class="dt-auth-under">
              <span class="dt-auth-under-t">{{ t('auth.noAccount') }}</span>
              <router-link to="/register" class="dt-auth-under-a">
                {{ t('auth.goRegister') }}
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./authPage.css"></style>
