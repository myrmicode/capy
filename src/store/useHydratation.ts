import { useSyncExternalStore } from 'react';

import { useProfils } from './profils';

const sAbonner = (prevenir: () => void) => useProfils.persist.onFinishHydration(prevenir);
const estHydrate = () => useProfils.persist.hasHydrated();

/** Vrai une fois les données locales relues depuis le téléphone. */
export function useHydratation(): boolean {
  return useSyncExternalStore(sAbonner, estHydrate, estHydrate);
}
