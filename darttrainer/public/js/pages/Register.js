/**
 * Reģistrācija — Composition API (setup, reactive, account_type).
 * @see https://vuejs.org/guide/essentials/reactivity-fundamentals
 */
const RegisterPage = {
  setup() {
    const auth = useAuthStore();
    const locale = useLocaleStore();
    const router = VueRouter.useRouter();

    const accountType = Vue.ref('player');

    const form = Vue.reactive({
      name: '',
      clubName: '',
      email: '',
      password: '',
      confirm: '',
      error: '',
    });

    Vue.watch(accountType, (v) => {
      if (v !== 'club') {
        form.clubName = '';
      }
    });

    const t = (key) => locale.t(key);

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

    return {
      auth,
      accountType,
      form,
      submit,
      t,
    };
  },

  template: `
    <div style="flex:1;min-height:0;width:100%;box-sizing:border-box;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;align-items:center;padding:clamp(16px,3vh,28px) 20px max(28px, env(safe-area-inset-bottom, 0px))">
      <div style="width:100%;max-width:380px;flex-shrink:0">

        <div style="text-align:center;margin-bottom:24px">
          <div style="font-size:40px;margin-bottom:8px">🎯</div>
          <h1 style="font-size:24px;font-weight:800;color:#f59e0b;margin:0 0 4px">DartTrainer</h1>
          <p style="color:#475569;font-size:14px;margin:0">{{ t('auth.registerTitle') }}</p>
        </div>

        <div style="background:#0f1c30;border:1px solid #162540;border-radius:16px;padding:28px">
          <form @submit.prevent="submit">

            <div style="margin-bottom:18px">
              <div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:8px;letter-spacing:.05em;text-transform:uppercase">
                {{ t('auth.accountTypeLabel') }}
              </div>
              <div style="display:flex;gap:10px">
                <label style="flex:1;cursor:pointer">
                  <input type="radio" name="account_type" value="player" v-model="accountType" class="sr-only peer" />
                  <div class="acct-pill" :style="accountType === 'player'
                    ? 'border-color:#f59e0b;background:rgba(245,158,11,.12);color:#fbbf24'
                    : 'border-color:#334155;background:#060d18;color:#94a3b8'"
                       style="border:2px solid;border-radius:12px;padding:12px 10px;text-align:center;font-weight:800;font-size:14px;transition:all .15s">
                    {{ t('auth.accountTypePlayer') }}
                  </div>
                </label>
                <label style="flex:1;cursor:pointer">
                  <input type="radio" name="account_type" value="club" v-model="accountType" class="sr-only peer" />
                  <div class="acct-pill" :style="accountType === 'club'
                    ? 'border-color:#f59e0b;background:rgba(245,158,11,.12);color:#fbbf24'
                    : 'border-color:#334155;background:#060d18;color:#94a3b8'"
                       style="border:2px solid;border-radius:12px;padding:12px 10px;text-align:center;font-weight:800;font-size:14px;transition:all .15s">
                    {{ t('auth.accountTypeClub') }}
                  </div>
                </label>
              </div>
            </div>

            <div v-if="accountType === 'club'"
                 style="margin-bottom:16px;padding:12px 14px;border-radius:12px;border:1px solid #334155;background:rgba(245,158,11,.06)">
              <p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:#cbd5e1">
                {{ t('auth.clubFutureHint') }}
              </p>
              <label style="display:block;font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;letter-spacing:.05em;text-transform:uppercase">{{ t('auth.clubName') }}</label>
              <input v-model="form.clubName" type="text" required maxlength="120"
                     style="width:100%;background:#060d18;border:1.5px solid #162540;border-radius:10px;padding:11px 14px;color:#f1f5f9;font-size:15px;outline:none;transition:border .15s;box-sizing:border-box"
                     onfocus="this.style.borderColor='#f59e0b'"
                     onblur="this.style.borderColor='#162540'" />
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
              <div style="grid-column:1/-1">
                <label style="display:block;font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;letter-spacing:.05em;text-transform:uppercase">{{ t('auth.name') }}</label>
                <input v-model="form.name" type="text" required maxlength="50"
                       style="width:100%;background:#060d18;border:1.5px solid #162540;border-radius:10px;padding:11px 14px;color:#f1f5f9;font-size:15px;outline:none;transition:border .15s;box-sizing:border-box"
                       onfocus="this.style.borderColor='#f59e0b'"
                       onblur="this.style.borderColor='#162540'" />
              </div>

              <div style="grid-column:1/-1">
                <label style="display:block;font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;letter-spacing:.05em;text-transform:uppercase">{{ t('auth.email') }}</label>
                <input v-model="form.email" type="email" required
                       style="width:100%;background:#060d18;border:1.5px solid #162540;border-radius:10px;padding:11px 14px;color:#f1f5f9;font-size:15px;outline:none;transition:border .15s;box-sizing:border-box"
                       onfocus="this.style.borderColor='#f59e0b'"
                       onblur="this.style.borderColor='#162540'" />
              </div>

              <div>
                <label style="display:block;font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;letter-spacing:.05em;text-transform:uppercase">{{ t('auth.password') }}</label>
                <input v-model="form.password" type="password" required minlength="8"
                       style="width:100%;background:#060d18;border:1.5px solid #162540;border-radius:10px;padding:11px 14px;color:#f1f5f9;font-size:15px;outline:none;transition:border .15s;box-sizing:border-box"
                       onfocus="this.style.borderColor='#f59e0b'"
                       onblur="this.style.borderColor='#162540'" />
              </div>

              <div>
                <label style="display:block;font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;letter-spacing:.05em;text-transform:uppercase">{{ t('auth.repeat') }}</label>
                <input v-model="form.confirm" type="password" required
                       style="width:100%;background:#060d18;border:1.5px solid #162540;border-radius:10px;padding:11px 14px;color:#f1f5f9;font-size:15px;outline:none;transition:border .15s;box-sizing:border-box"
                       onfocus="this.style.borderColor='#f59e0b'"
                       onblur="this.style.borderColor='#162540'" />
              </div>
            </div>

            <div v-if="form.error"
                 style="background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:10px 14px;font-size:13px;color:#fca5a5;margin-bottom:16px">
              {{ form.error }}
            </div>

            <dt-button button-type="submit" variant="primary" size="lg" block :disabled="auth.loading">
              {{ auth.loading ? t('auth.loading') : t('auth.submitRegister') }}
            </dt-button>
          </form>
        </div>

        <p style="text-align:center;color:#334155;font-size:13px;margin-top:16px">
          {{ t('auth.hasAccount') }}
          <a href="#/login" style="color:#f59e0b;font-weight:600;text-decoration:none"
             onmouseover="this.style.textDecoration='underline'"
             onmouseout="this.style.textDecoration='none'">{{ t('auth.goLogin') }}</a>
        </p>
      </div>
    </div>
  `,
};
