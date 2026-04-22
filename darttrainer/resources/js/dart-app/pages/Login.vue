<script setup>
import { reactive, toRef } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useLocaleStore } from '../store/index.js';
import DtButton from '../components/ui/DtButton.js';
import { useAuthContentFit } from '../composables/useAuthContentFit.js';

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

const { viewportRef, surfaceRef, contentRef } = useAuthContentFit([toRef(form, 'error')]);

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
      <div ref="viewportRef" class="dt-auth-fit-vp">
        <div ref="surfaceRef" class="dt-auth-fit-surface">
          <div ref="contentRef" class="dt-auth-fit-content">
            <div class="dt-auth-stack">
        <div class="dt-auth-brand">
          <span class="dt-auth-emoji" aria-hidden="true">🎯</span>
          <h1>DartTrainer</h1>
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
              <dt-button
                button-type="submit"
                variant="primary"
                size="lg"
                block
                :disabled="auth.loading"
              >
                {{ auth.loading ? t('auth.loading') : t('auth.submitLogin') }}
              </dt-button>
            </div>
          </form>
        </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./authPage.css"></style>
