import { computed } from 'vue';

/** Pagaidām X01 lobijs un solo treniņš ir izslēgti (UI + router). */
export const X01_LOBBY_AND_TRAINING_ENABLED = false;

export function useCanPlayX01() {
  return computed(() => X01_LOBBY_AND_TRAINING_ENABLED);
}
