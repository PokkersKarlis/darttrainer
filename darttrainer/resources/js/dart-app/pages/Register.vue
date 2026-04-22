<script setup>
import { ref, reactive, watch, toRef } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useLocaleStore } from '../store/index.js';
import DtButton from '../components/ui/DtButton.js';
import { useAuthContentFit } from '../composables/useAuthContentFit.js';

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

const { viewportRef, surfaceRef, contentRef } = useAuthContentFit([accountType, toRef(form, 'error')]);

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
  <div class="dt-auth-page dt-auth-page--register">
    <div class="dt-auth-page-inner">
      <div ref="viewportRef" class="dt-auth-fit-vp">
        <div ref="surfaceRef" class="dt-auth-fit-surface">
          <div ref="contentRef" class="dt-auth-fit-content">
            <div class="dt-auth-stack">
        <div class="dt-auth-brand">
          <span class="dt-auth-emoji" aria-hidden="true">🎯</span>
          <h1>DartTrainer</h1>
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
                  <input
                    v-model="accountType"
                    type="radio"
                    name="account_type"
                    value="player"
                    class="sr-only peer"
                  />
                  <div class="acct-pill" :class="{ 'acct-pill--on': accountType === 'player' }">
                    {{ t('auth.accountTypePlayer') }}
                  </div>
                </label>
                <label class="dt-auth-pill-label">
                  <input
                    v-model="accountType"
                    type="radio"
                    name="account_type"
                    value="club"
                    class="sr-only peer"
                  />
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
                <input
                  id="reg-name"
                  v-model="form.name"
                  class="dt-auth-input"
                  type="text"
                  required
                  maxlength="50"
                />
              </div>

              <div class="dt-auth-field-span">
                <label class="dt-auth-label--block" for="reg-email">{{ t('auth.email') }}</label>
                <input
                  id="reg-email"
                  v-model="form.email"
                  class="dt-auth-input"
                  type="email"
                  required
                />
              </div>

              <div>
                <label class="dt-auth-label--block" for="reg-pw">{{ t('auth.password') }}</label>
                <input
                  id="reg-pw"
                  v-model="form.password"
                  class="dt-auth-input"
                  type="password"
                  required
                  minlength="8"
                />
              </div>

              <div>
                <label class="dt-auth-label--block" for="reg-confirm">{{ t('auth.repeat') }}</label>
                <input
                  id="reg-confirm"
                  v-model="form.confirm"
                  class="dt-auth-input"
                  type="password"
                  required
                />
              </div>
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
                {{ auth.loading ? t('auth.loading') : t('auth.submitRegister') }}
              </dt-button>
            </div>
          </form>
        </div>

        <p class="dt-auth-footer">
          <span>{{ t('auth.hasAccount') }}</span>
          <router-link to="/login" class="dt-auth-link-login dt-auth-foot-link">
            {{ t('auth.goLogin') }}
          </router-link>
        </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./authPage.css"></style>
