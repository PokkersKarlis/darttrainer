import { useLocaleStore, useFriendsStore } from '../../store/index.js';
import DtButton from '../ui/DtButton.js';

/** Global friends request modal — decoupled from index.html layout markup. */
export default {
  name: 'FriendsIncomingModal',
  components: { DtButton },
  setup() {
    const friends = useFriendsStore();
    const locale = useLocaleStore();
    const t = (k) => locale.t(k);
    return { friends, t };
  },
  template: `
    <Teleport to="body">
      <div v-if="friends.modalOpen"
           class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
           style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"
           @click.self="friends.closeModal()">
        <div class="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
          <h3 class="text-lg font-black text-white mb-1">{{ t('friends.incomingModalTitle') }}</h3>
          <p class="text-xs text-slate-500 mb-4">{{ t('friends.incomingModalLead') }}</p>
          <div v-if="!friends.incoming.length" class="text-sm text-slate-500 text-center py-6">{{ t('friends.incomingModalEmpty') }}</div>
          <div v-for="r in friends.incoming" :key="r.id" class="flex items-center justify-between gap-2 py-3 border-b border-slate-700/50 last:border-b-0">
            <div class="min-w-0">
              <div class="text-white font-bold text-sm truncate">{{ r.user.name }}</div>
              <div class="text-[10px] text-slate-500">{{ t('friends.wantsFriend') }}</div>
            </div>
            <div class="flex gap-1.5 shrink-0">
              <dt-button variant="success" size="sm" :disabled="friends.busyId === r.id"
                         @click="friends.acceptRequest(r.id)">
                {{ t('friends.accept') }}
              </dt-button>
              <dt-button variant="secondary" size="sm" :disabled="friends.busyId === r.id"
                         @click="friends.rejectRequest(r.id)">
                {{ t('friends.reject') }}
              </dt-button>
            </div>
          </div>
          <dt-button variant="secondary" block class="mt-4" @click="friends.closeModal()">
            {{ t('friends.incomingModalClose') }}
          </dt-button>
        </div>
      </div>
    </Teleport>
  `,
};
