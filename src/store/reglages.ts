import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Identifiant d'installation tiré au hasard : il ne dit rien de l'enfant, du parent ni du téléphone. */
function nouvelIdentifiant(): string {
  const morceau = () => Math.random().toString(36).slice(2, 10).padEnd(8, '0');
  return `${morceau()}-${morceau()}-${morceau()}`;
}

/** Réglages de l'appareil (pas des données d'enfant). */
interface Reglages {
  /** Son doux après une bonne réponse. */
  sons: boolean;
  /** Sert uniquement à limiter le nombre d'analyses de photo par appareil. */
  appareil: string;
  activerSons: (actif: boolean) => void;
}

export const useReglages = create<Reglages>()(
  persist(
    (set) => ({
      sons: true,
      appareil: nouvelIdentifiant(),
      activerSons: (sons) => set({ sons }),
    }),
    {
      name: 'capy-reglages',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ sons, appareil }) => ({ sons, appareil }),
      migrate: (ancien) => ({ ...(ancien as object), appareil: nouvelIdentifiant() }),
      // Enregistre tout de suite l'identifiant tiré au premier lancement.
      onRehydrateStorage: () => (etat) => {
        if (etat) useReglages.setState({ appareil: etat.appareil });
      },
    },
  ),
);
