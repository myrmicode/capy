import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Réglages de l'appareil (pas des données d'enfant). */
interface Reglages {
  /** Son doux après une bonne réponse. */
  sons: boolean;
  activerSons: (actif: boolean) => void;
}

export const useReglages = create<Reglages>()(
  persist(
    (set) => ({
      sons: true,
      activerSons: (sons) => set({ sons }),
    }),
    {
      name: 'capy-reglages',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ sons }) => ({ sons }),
    },
  ),
);
