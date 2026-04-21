import { useAuthStore, useLocaleStore } from '../store/index.js';
/**
 * Ielogošanās — Composition API stilā (setup + ref/reactive), kā Vue 3 dokumentācijā.
 * @see https://vuejs.org/guide/introduction.html
 */
import * as Vue from 'vue';
import { useRouter } from 'vue-router';
import DtButton from '../components/ui/DtButton.js';

export default {
  components: { DtButton },
  setup() {
    const auth = useAuthStore();
    const locale = useLocaleStore();
    const router = useRouter();

    const form = Vue.reactive({
      email: '',
      password: '',
      error: '',
    });

    const t = (key) => locale.t(key);

    async function submit() {
      form.error = '';
      try {
        await auth.login(form.email, form.password);
        await router.push('/');
      } catch (e) {
        form.error = e.response?.data?.message || t('auth.errLogin');
      }
    }

    return {
      auth,
      form,
      submit,
      t,
    };
  },

  template: `
    <div class="dt-auth-page">
      <div class="dt-auth-page-inner">

        <div class="dt-auth-brand" style="text-align:center;margin-bottom:28px">
          <span class="dt-auth-emoji" style="font-size:40px;margin-bottom:8px">🎯</span>
          <h1 style="font-size:24px;font-weight:800;color:#f59e0b;margin:0 0 4px">DartTrainer</h1>
          <p class="dt-auth-sub" style="color:#475569;font-size:14px;margin:0">{{ t('auth.loginTitle') }}</p>
        </div>

        <div class="dt-auth-card" style="background:#0f1c30;border:1px solid #162540;border-radius:16px;padding:28px">
          <form @submit.prevent="submit">
            <div class="dt-auth-field" style="margin-bottom:16px">
              <label class="dt-auth-label" style="display:block;font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;letter-spacing:.05em;text-transform:uppercase">
                {{ t('auth.email') }}
              </label>
              <input v-model="form.email" type="email" required autocomplete="email"
                     style="width:100%;background:#060d18;border:1.5px solid #162540;border-radius:10px;padding:11px 14px;color:#f1f5f9;font-size:15px;outline:none;transition:border .15s;box-sizing:border-box"
                     onfocus="this.style.borderColor='#f59e0b'"
                     onblur="this.style.borderColor='#162540'" />
            </div>

            <div class="dt-auth-field" style="margin-bottom:20px">
              <label class="dt-auth-label" style="display:block;font-size:12px;font-weight:700;color:#64748b;margin-bottom:6px;letter-spacing:.05em;text-transform:uppercase">
                {{ t('auth.password') }}
              </label>
              <input v-model="form.password" type="password" required autocomplete="current-password"
                     style="width:100%;background:#060d18;border:1.5px solid #162540;border-radius:10px;padding:11px 14px;color:#f1f5f9;font-size:15px;outline:none;transition:border .15s;box-sizing:border-box"
                     onfocus="this.style.borderColor='#f59e0b'"
                     onblur="this.style.borderColor='#162540'" />
            </div>

            <div v-if="form.error" class="dt-auth-err"
                 style="background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:10px 14px;font-size:13px;color:#fca5a5;margin-bottom:16px">
              {{ form.error }}
            </div>

            <div class="dt-auth-submit-row">
              <dt-button button-type="submit" variant="primary" size="lg" block :disabled="auth.loading">
                {{ auth.loading ? t('auth.loading') : t('auth.submitLogin') }}
              </dt-button>
            </div>
          </form>
        </div>

        <p class="dt-auth-footer" style="color:#334155;font-size:13px;margin-top:16px">
          <span>{{ t('auth.noAccount') }}</span>
          <a href="/register" style="color:#f59e0b;font-weight:600;text-decoration:none"
             onmouseover="this.style.textDecoration='underline'"
             onmouseout="this.style.textDecoration='none'">{{ t('auth.goRegister') }}</a>
        </p>
      </div>
    </div>
  `,
};
