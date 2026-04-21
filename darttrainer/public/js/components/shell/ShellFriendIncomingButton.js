/** Draugu uzaicinājumu poga (!) headerī */
const ShellFriendIncomingButton = {
  name: 'ShellFriendIncomingButton',
  setup() {
    const auth = useAuthStore();
    const friends = useFriendsStore();
    const locale = useLocaleStore();
    const needsEmailVerify = Vue.computed(
      () => auth.hydrated && !!auth.user && !auth.user.email_verified_at,
    );
    const t = (k) => locale.t(k);
    return { auth, friends, needsEmailVerify, t };
  },
  template: `
    <button v-if="auth.hydrated && auth.user" type="button" @click="friends.openModal()"
            :disabled="needsEmailVerify"
            style="position:relative;flex-shrink:0;width:36px;height:36px;border-radius:10px;border:1px solid #334155;background:#0f1c30;color:#f59e0b;font-weight:900;font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center"
            :style="needsEmailVerify ? 'opacity:0.45;cursor:not-allowed' : ''"
            :title="t('friends.incomingModalTitle')">
      !
      <span v-if="friends.incomingCount"
            style="position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;padding:0 4px;border-radius:9999px;background:#ef4444;color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;line-height:1">
        {{ friends.incomingCount }}
      </span>
    </button>
  `,
};
