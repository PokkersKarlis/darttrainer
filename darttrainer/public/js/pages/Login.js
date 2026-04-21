const LoginPage = {
  setup() {
    const auth   = useAuthStore();
    const locale = useLocaleStore();
    const t      = (k) => locale.t(k);
    const router = VueRouter.useRouter();
    const form   = Vue.reactive({ email: '', password: '', error: '' });

    async function submit() {
      form.error = '';
      try {
        await auth.login(form.email, form.password);
        router.push('/');
      } catch (e) {
        form.error = e.response?.data?.message || t('auth.errLogin');
      }
    }

    return { auth, form, submit, t };
  },

  template: `
    <div style="flex:1;overflow-y:auto;min-height:0;display:flex;align-items:center;justify-content:center;padding:32px 20px">
      <div style="width:100%;max-width:380px">

        <!-- Logo -->
        <div style="text-align:center;margin-bottom:28px">
          <div style="font-size:40px;margin-bottom:8px">🎯</div>
          <h1 style="font-size:24px;font-weight:800;color:#f59e0b;margin:0 0 4px">DartTrainer</h1>
          <p style="color:#475569;font-size:14px;margin:0">{{ t('auth.loginTitle') }}</p>
        </div>

        <!-- Card -->
        <div style="background:#0f1c30;border:1px solid #162540;border-radius:16px;padding:28px">
          <form @submit.prevent="submit">
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;letter-spacing:.05em;text-transform:uppercase">
                {{ t('auth.email') }}
              </label>
              <input v-model="form.email" type="email" required autocomplete="email"
                     style="width:100%;background:#060d18;border:1.5px solid #162540;border-radius:10px;padding:11px 14px;color:#f1f5f9;font-size:15px;outline:none;transition:border .15s;box-sizing:border-box"
                     onfocus="this.style.borderColor='#f59e0b'"
                     onblur="this.style.borderColor='#162540'" />
            </div>

            <div style="margin-bottom:20px">
              <label style="display:block;font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;letter-spacing:.05em;text-transform:uppercase">
                {{ t('auth.password') }}
              </label>
              <input v-model="form.password" type="password" required autocomplete="current-password"
                     style="width:100%;background:#060d18;border:1.5px solid #162540;border-radius:10px;padding:11px 14px;color:#f1f5f9;font-size:15px;outline:none;transition:border .15s;box-sizing:border-box"
                     onfocus="this.style.borderColor='#f59e0b'"
                     onblur="this.style.borderColor='#162540'" />
            </div>

            <div v-if="form.error"
                 style="background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:10px 14px;font-size:13px;color:#fca5a5;margin-bottom:16px">
              {{ form.error }}
            </div>

            <dt-button button-type="submit" variant="primary" size="lg" block :disabled="auth.loading">
              {{ auth.loading ? 'Ielādē...' : 'Ieiet' }}
            </dt-button>
          </form>
        </div>

        <p style="text-align:center;color:#334155;font-size:13px;margin-top:16px">
          {{ t('auth.noAccount') }}
          <a href="#/register" style="color:#f59e0b;font-weight:600;text-decoration:none"
             onmouseover="this.style.textDecoration='underline'"
             onmouseout="this.style.textDecoration='none'">{{ t('auth.goRegister') }}</a>
        </p>
      </div>
    </div>
  `,
};
