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

function onInputFocus(e) {
  e.currentTarget.style.borderColor = '#f59e0b';
}
function onInputBlur(e) {
  e.currentTarget.style.borderColor = '#162540';
}

function pillStyle(active) {
  return active
    ? 'border-color:#f59e0b;background:rgba(245,158,11,.12);color:#fbbf24'
    : 'border-color:#334155;background:#060d18;color:#94a3b8';
}

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
  <div class="dt-auth-page">
    <div class="dt-auth-page-inner">
      <div ref="viewportRef" class="dt-auth-fit-vp">
        <div ref="surfaceRef" class="dt-auth-fit-surface">
          <div ref="contentRef" class="dt-auth-fit-content">
            <div class="dt-auth-brand" style="text-align: center; margin-bottom: 24px">
        <span class="dt-auth-emoji" style="font-size: 40px; margin-bottom: 8px">🎯</span>
        <h1 style="font-size: 24px; font-weight: 800; color: #f59e0b; margin: 0 0 4px">DartTrainer</h1>
        <p class="dt-auth-sub" style="color: #475569; font-size: 14px; margin: 0">
          {{ t('auth.registerTitle') }}
        </p>
      </div>

      <div
        class="dt-auth-card"
        style="background: #0f1c30; border: 1px solid #162540; border-radius: 16px; padding: 28px"
      >
        <form @submit.prevent="submit">
          <div class="dt-auth-account-row" style="margin-bottom: 18px">
            <div
              class="dt-auth-label"
              style="
                font-size: 12px;
                font-weight: 700;
                color: #64748b;
                margin-bottom: 8px;
                letter-spacing: 0.05em;
                text-transform: uppercase;
              "
            >
              {{ t('auth.accountTypeLabel') }}
            </div>
            <div style="display: flex; gap: 10px">
              <label style="flex: 1; cursor: pointer">
                <input
                  v-model="accountType"
                  type="radio"
                  name="account_type"
                  value="player"
                  class="sr-only peer"
                />
                <div
                  class="acct-pill"
                  :style="pillStyle(accountType === 'player')"
                  style="
                    border: 2px solid;
                    border-radius: 12px;
                    padding: 12px 10px;
                    text-align: center;
                    font-weight: 800;
                    font-size: 14px;
                    transition: all 0.15s;
                  "
                >
                  {{ t('auth.accountTypePlayer') }}
                </div>
              </label>
              <label style="flex: 1; cursor: pointer">
                <input
                  v-model="accountType"
                  type="radio"
                  name="account_type"
                  value="club"
                  class="sr-only peer"
                />
                <div
                  class="acct-pill"
                  :style="pillStyle(accountType === 'club')"
                  style="
                    border: 2px solid;
                    border-radius: 12px;
                    padding: 12px 10px;
                    text-align: center;
                    font-weight: 800;
                    font-size: 14px;
                    transition: all 0.15s;
                  "
                >
                  {{ t('auth.accountTypeClub') }}
                </div>
              </label>
            </div>
          </div>

          <div
            v-if="accountType === 'club'"
            class="dt-auth-club-box"
            style="
              margin-bottom: 16px;
              padding: 12px 14px;
              border-radius: 12px;
              border: 1px solid #334155;
              background: rgba(245, 158, 11, 0.06);
            "
          >
            <p
              class="dt-auth-club-hint"
              style="margin: 0 0 12px; font-size: 13px; line-height: 1.5; color: #cbd5e1"
            >
              {{ t('auth.clubFutureHint') }}
            </p>
            <label
              class="dt-auth-label"
              style="
                display: block;
                font-size: 12px;
                font-weight: 700;
                color: #64748b;
                margin-bottom: 6px;
                letter-spacing: 0.05em;
                text-transform: uppercase;
              "
              >{{ t('auth.clubName') }}</label
            >
            <input
              v-model="form.clubName"
              type="text"
              required
              maxlength="120"
              style="
                width: 100%;
                background: #060d18;
                border: 1.5px solid #162540;
                border-radius: 10px;
                padding: 11px 14px;
                color: #f1f5f9;
                font-size: 15px;
                outline: none;
                transition: border 0.15s;
                box-sizing: border-box;
              "
              @focus="onInputFocus"
              @blur="onInputBlur"
            />
          </div>

          <div
            class="dt-auth-fields"
            style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px"
          >
            <div style="grid-column: 1 / -1">
              <label
                class="dt-auth-label"
                style="
                  display: block;
                  font-size: 12px;
                  font-weight: 700;
                  color: #64748b;
                  margin-bottom: 6px;
                  letter-spacing: 0.05em;
                  text-transform: uppercase;
                "
                >{{ t('auth.name') }}</label
              >
              <input
                v-model="form.name"
                type="text"
                required
                maxlength="50"
                style="
                  width: 100%;
                  background: #060d18;
                  border: 1.5px solid #162540;
                  border-radius: 10px;
                  padding: 11px 14px;
                  color: #f1f5f9;
                  font-size: 15px;
                  outline: none;
                  transition: border 0.15s;
                  box-sizing: border-box;
                "
                @focus="onInputFocus"
                @blur="onInputBlur"
              />
            </div>

            <div style="grid-column: 1 / -1">
              <label
                class="dt-auth-label"
                style="
                  display: block;
                  font-size: 12px;
                  font-weight: 700;
                  color: #64748b;
                  margin-bottom: 6px;
                  letter-spacing: 0.05em;
                  text-transform: uppercase;
                "
                >{{ t('auth.email') }}</label
              >
              <input
                v-model="form.email"
                type="email"
                required
                style="
                  width: 100%;
                  background: #060d18;
                  border: 1.5px solid #162540;
                  border-radius: 10px;
                  padding: 11px 14px;
                  color: #f1f5f9;
                  font-size: 15px;
                  outline: none;
                  transition: border 0.15s;
                  box-sizing: border-box;
                "
                @focus="onInputFocus"
                @blur="onInputBlur"
              />
            </div>

            <div>
              <label
                class="dt-auth-label"
                style="
                  display: block;
                  font-size: 12px;
                  font-weight: 700;
                  color: #64748b;
                  margin-bottom: 6px;
                  letter-spacing: 0.05em;
                  text-transform: uppercase;
                "
                >{{ t('auth.password') }}</label
              >
              <input
                v-model="form.password"
                type="password"
                required
                minlength="8"
                style="
                  width: 100%;
                  background: #060d18;
                  border: 1.5px solid #162540;
                  border-radius: 10px;
                  padding: 11px 14px;
                  color: #f1f5f9;
                  font-size: 15px;
                  outline: none;
                  transition: border 0.15s;
                  box-sizing: border-box;
                "
                @focus="onInputFocus"
                @blur="onInputBlur"
              />
            </div>

            <div>
              <label
                class="dt-auth-label"
                style="
                  display: block;
                  font-size: 12px;
                  font-weight: 700;
                  color: #64748b;
                  margin-bottom: 6px;
                  letter-spacing: 0.05em;
                  text-transform: uppercase;
                "
                >{{ t('auth.repeat') }}</label
              >
              <input
                v-model="form.confirm"
                type="password"
                required
                style="
                  width: 100%;
                  background: #060d18;
                  border: 1.5px solid #162540;
                  border-radius: 10px;
                  padding: 11px 14px;
                  color: #f1f5f9;
                  font-size: 15px;
                  outline: none;
                  transition: border 0.15s;
                  box-sizing: border-box;
                "
                @focus="onInputFocus"
                @blur="onInputBlur"
              />
            </div>
          </div>

          <div
            v-if="form.error"
            class="dt-auth-err"
            style="
              background: rgba(239, 68, 68, 0.12);
              border: 1px solid rgba(239, 68, 68, 0.3);
              border-radius: 8px;
              padding: 10px 14px;
              font-size: 13px;
              color: #fca5a5;
              margin-bottom: 16px;
            "
          >
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

            <p class="dt-auth-footer" style="color: #334155; font-size: 13px; margin-top: 16px">
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
</template>
