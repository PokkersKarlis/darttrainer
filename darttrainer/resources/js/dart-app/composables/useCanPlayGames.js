import { computed } from 'vue';
import { useAuthStore } from '../store/auth.js';

/** Multiplayer / pilnas spēles funkcijas — tikai ielogots, apstiprināts e-pasts, nav ban. */
export function useCanPlayGames() {
  const auth = useAuthStore();
  return computed(
    () =>
      auth.hydrated &&
      !!auth.user &&
      !!auth.user.email_verified_at &&
      !auth.user.is_banned,
  );
}
