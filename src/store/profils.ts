import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Classe } from '@/config/classes';

/**
 * Profil d'un enfant. Règle non négociable : on ne stocke que le prénom ou
 * surnom, la classe, les niveaux de la toile et la progression. Jamais de nom
 * de famille, d'école, de date de naissance, de photo ni de voix.
 * Les niveaux de la toile et la progression arrivent aux phases 4 et 5.
 */
export interface ProfilEnfant {
  id: string;
  prenom: string;
  classe: Classe;
}

interface EtatProfils {
  profils: ProfilEnfant[];
  profilActifId: string | null;
  ajouterProfil: (prenom: string, classe: Classe) => ProfilEnfant;
  modifierProfil: (id: string, modifs: Partial<Omit<ProfilEnfant, 'id'>>) => void;
  supprimerProfil: (id: string) => void;
  choisirProfil: (id: string | null) => void;
}

function nouvelId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useProfils = create<EtatProfils>()(
  persist(
    (set) => ({
      profils: [],
      profilActifId: null,
      ajouterProfil: (prenom, classe) => {
        const profil: ProfilEnfant = { id: nouvelId(), prenom, classe };
        set((etat) => ({ profils: [...etat.profils, profil] }));
        return profil;
      },
      modifierProfil: (id, modifs) =>
        set((etat) => ({
          profils: etat.profils.map((p) => (p.id === id ? { ...p, ...modifs } : p)),
        })),
      supprimerProfil: (id) =>
        set((etat) => ({
          profils: etat.profils.filter((p) => p.id !== id),
          profilActifId: etat.profilActifId === id ? null : etat.profilActifId,
        })),
      choisirProfil: (id) => set({ profilActifId: id }),
    }),
    {
      name: 'capy-profils',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ profils, profilActifId }) => ({ profils, profilActifId }),
    },
  ),
);

export function useProfilActif(): ProfilEnfant | undefined {
  return useProfils((etat) => etat.profils.find((p) => p.id === etat.profilActifId));
}
