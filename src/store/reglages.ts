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
  /** Après 19 h, couleurs plus douces et message du soir. */
  ambianceSoir: boolean;
  /** Sert uniquement à limiter le nombre d'analyses de photo par appareil. */
  appareil: string;
  activerSons: (actif: boolean) => void;
  activerAmbianceSoir: (actif: boolean) => void;
}

export const useReglages = create<Reglages>()(
  persist(
    (set) => ({
      sons: true,
      ambianceSoir: true,
      appareil: nouvelIdentifiant(),
      activerSons: (sons) => set({ sons }),
      activerAmbianceSoir: (ambianceSoir) => set({ ambianceSoir }),
    }),
    {
      name: 'capy-reglages',
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ sons, ambianceSoir, appareil }) => ({ sons, ambianceSoir, appareil }),
      migrate: (ancien, version) => {
        const etat = ancien as Partial<Reglages>;
        // Version 1 : pas encore d'identifiant d'appareil. Version 2 : pas d'ambiance du soir.
        return {
          ...etat,
          appareil: version < 2 || !etat.appareil ? nouvelIdentifiant() : etat.appareil,
          ambianceSoir: etat.ambianceSoir ?? true,
        };
      },
      // Enregistre tout de suite l'identifiant tiré au premier lancement.
      onRehydrateStorage: () => (etat) => {
        if (etat) useReglages.setState({ appareil: etat.appareil });
      },
    },
  ),
);
