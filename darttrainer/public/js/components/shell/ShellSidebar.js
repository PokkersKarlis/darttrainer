/** Kreisā sānjosla (desktop) */
const ShellSidebar = {
  name: 'ShellSidebar',
  setup() {
    const auth = useAuthStore();
    const locale = useLocaleStore();
    const needsEmailVerify = Vue.computed(
      () => auth.hydrated && !!auth.user && !auth.user.email_verified_at,
    );
    const t = (k) => locale.t(k);
    return { auth, needsEmailVerify, t };
  },
  template: `
    <aside class="hidden lg:flex"
           style="width:220px;flex-shrink:0;background:#0a1120;border-right:1px solid #162540;flex-direction:column;padding:12px 10px">

      <div v-if="auth.user" style="flex:1;display:flex;flex-direction:column;gap:2px">
        <shell-nav-link href="#/" icon="🏠" :label="t('nav.home')" />

        <shell-sidebar-section-label text="Multiplayer" />
        <shell-nav-link href="#/lobby" icon="🎮" :label="t('nav.lobby')" :disabled="needsEmailVerify" />
        <shell-nav-link href="#/friends" icon="👥" :label="t('nav.friends')" :disabled="needsEmailVerify" />

        <shell-sidebar-section-label text="Treniņš" />
        <shell-nav-link href="#/training/x01" icon="🎯" :label="t('nav.x01solo')" :disabled="needsEmailVerify" />

        <shell-sidebar-section-label text="Progress" />
        <shell-nav-link href="#/stats" icon="📊" :label="t('nav.stats')" :disabled="needsEmailVerify" />
        <shell-sidebar-admin-link v-if="auth.user?.is_admin" :disabled="needsEmailVerify" />
      </div>

      <div v-else-if="auth.hydrated" style="flex:1;display:flex;flex-direction:column;gap:2px">
        <shell-nav-link href="#/login" icon="🔑" :label="t('shell.login')" />
        <shell-nav-link href="#/register" icon="✨" :label="t('shell.register')" />
      </div>
      <div v-else style="flex:1"></div>

      <div v-if="auth.user" style="padding:12px 0 0;margin-top:8px;border-top:1px solid #162540;flex-shrink:0">
        <a href="https://discord.gg/Hjs8wvKPPg" target="_blank" rel="noopener noreferrer"
           class="nav-link" style="margin-bottom:6px">
          <svg viewBox="0 -28.5 256 256" xmlns="http://www.w3.org/2000/svg" width="18" height="18" style="flex-shrink:0" aria-hidden="true">
            <path fill="#5865F2" d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"/>
          </svg>
          {{ t('nav.discord') }}
        </a>
        <form action="https://www.paypal.com/donate" method="post" target="_blank" rel="noopener noreferrer" style="text-align:center;padding:4px 0 0">
          <input type="hidden" name="hosted_button_id" value="A3THH5ND6F4NJ"/>
          <input type="image"
                 src="https://pics.paypal.com/00/s/YTViYjhlMWYtOWZiMC00YTg0LThhYmYtZWFmMDU2NzFmNmE1/file.JPG"
                 name="submit" title="PayPal — ziedojums" alt="Ziedot ar PayPal"
                 style="max-width:100%;height:auto;max-height:36px;border-radius:6px;cursor:pointer"/>
          <img alt="" src="https://www.paypal.com/en_LV/i/scr/pixel.gif" width="1" height="1" style="display:none"/>
        </form>
      </div>

      <div v-if="auth.user" style="padding:8px 0 0">
        <div class="ad-slot" style="height:200px;width:100%">
          <span>AD HERE</span>
          <span style="font-size:9px;opacity:.7">160 × 200</span>
        </div>
      </div>
    </aside>
  `,
};
