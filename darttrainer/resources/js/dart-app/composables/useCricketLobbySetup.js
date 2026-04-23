import { computed } from 'vue';

/**
 * Četras Cricket lobija kombinācijas: tiešsaiste/lokāli × standarts/nejauši.
 * `my-active` API tiek saukts ar abiem parametriem — sk. useLobbyCore `buildMyActiveParams`.
 */
export const CRICKET_LOBBY_SETUPS = Object.freeze([
  {
    id: 'online_standard',
    playMode: 'online',
    cricketType: 'standard',
    titleKey: 'lobby.cricketSetupOnlineStandard',
    segmentKey: 'lobby.cricketStandardSegmentLine',
    variant: 'online',
  },
  {
    id: 'online_random',
    playMode: 'online',
    cricketType: 'random',
    titleKey: 'lobby.cricketSetupOnlineRandom',
    segmentKey: 'lobby.cricketRandomSegmentLine',
    variant: 'online',
  },
  {
    id: 'local_standard',
    playMode: 'local',
    cricketType: 'standard',
    titleKey: 'lobby.cricketSetupLocalStandard',
    segmentKey: 'lobby.cricketStandardSegmentLine',
    variant: 'local',
  },
  {
    id: 'local_random',
    playMode: 'local',
    cricketType: 'random',
    titleKey: 'lobby.cricketSetupLocalRandom',
    segmentKey: 'lobby.cricketRandomSegmentLine',
    variant: 'local',
  },
]);

function normalizeCricketType(ct) {
  return ct === 'random' ? 'random' : 'standard';
}

/**
 * @param {import('vue-router').Router} router
 * @param {import('vue-router').RouteLocationNormalizedLoaded} route
 * @param {Record<string, unknown>} lobbyCtx — inject('lobbyCtx')
 */
export function useCricketLobbySetup(router, route, lobbyCtx) {
  const l = lobbyCtx;

  function isSetupSelected(setup) {
    return (
      l.createForm.play_mode === setup.playMode
      && normalizeCricketType(l.createForm.cricket_type) === setup.cricketType
    );
  }

  function selectSetup(setup) {
    l.createForm.play_mode = setup.playMode;
    l.createForm.cricket_type = normalizeCricketType(setup.cricketType);
    if (setup.playMode === 'local') {
      void l.loadFriendsAndPresets?.();
    }
    router.replace({
      path: '/lobby/cricket',
      query: {
        ...route.query,
        play_mode: setup.playMode,
        cricket_type: setup.cricketType,
      },
    });
  }

  function cardTone(setup) {
    const selected = isSetupSelected(setup);
    if (setup.variant === 'online') {
      return selected
        ? {
          border: '2px solid rgba(74, 158, 255, 0.85)',
          background: 'linear-gradient(165deg, rgba(74, 158, 255, 0.2) 0%, #131720 58%)',
          boxShadow: '0 0 0 1px rgba(74, 158, 255, 0.22), 0 12px 32px rgba(0,0,0,0.35)',
        }
        : {
          border: '2px solid #252d3d',
          background: '#131720',
          boxShadow: 'none',
        };
    }
    return selected
      ? {
        border: '2px solid rgba(245, 166, 35, 0.88)',
        background: 'linear-gradient(165deg, rgba(245, 166, 35, 0.18) 0%, #131720 58%)',
        boxShadow: '0 0 0 1px rgba(245, 166, 35, 0.22), 0 12px 32px rgba(0,0,0,0.35)',
      }
      : {
        border: '2px solid #252d3d',
        background: '#131720',
        boxShadow: 'none',
      };
  }

  const showsActiveRoomForSelection = computed(
    () => !!(l.auth?.user && l.blockedRoomForType) && !l.checkingSetupMatch,
  );

  return {
    setups: CRICKET_LOBBY_SETUPS,
    isSetupSelected,
    selectSetup,
    cardTone,
    showsActiveRoomForSelection,
  };
}
