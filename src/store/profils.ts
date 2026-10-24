import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Classe } from '@/config/classes';
import type { DomaineId } from '@/config/domaines';
import * as progression from '@/parcours/progression';
import type { ProgressionEnfant } from '@/parcours/progression';
import { nouvelleToile, toileApresEtape, type Niveaux, type ToileEnfant } from '@/toile/niveaux';

/**
 * Profil d'un enfant. Règle non négociable : on ne stocke que le prénom ou
 * surnom, la classe, les niveaux de la toile et la progression. Jamais de nom
 * de famille, d'école, de date de naissance, de photo ni de voix.
 * La toile est absente tant que le parent n'a pas saisi la fiche de l'école.
 */
export interface ProfilEnfant {
  id: string;
  prenom: string;
  classe: Classe;
  progression: ProgressionEnfant;
  toile?: ToileEnfant;
}

interface EtatProfils {
  profils: ProfilEnfant[];
  profilActifId: string | null;
  ajouterProfil: (prenom: string, classe: Classe) => ProfilEnfant;
  modifierProfil: (id: string, modifs: Partial<Pick<ProfilEnfant, 'prenom' | 'classe'>>) => void;
  supprimerProfil: (id: string) => void;
  choisirProfil: (id: string | null) => void;
  enregistrerEtape: (
    id: string,
    etapeId: string,
    resultat: { domaine: DomaineId; reussiesPremierCoup: number; nombreQuestions: number; dureeSecondes: number },
    maintenant?: Date,
  ) => void;
  /** Enregistre une nouvelle fiche de l'école : elle devient la toile de référence. */
  enregistrerToile: (id: string, niveaux: Niveaux, maintenant?: Date) => void;
  ouvrirCoffre: (id: string, coffreId: string) => void;
}

function nouvelId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useProfils = create<EtatProfils>()(
  persist(
    (set) => {
      const majProgression = (id: string, maj: (p: ProgressionEnfant) => ProgressionEnfant) =>
        set((etat) => ({
          profils: etat.profils.map((p) => (p.id === id ? { ...p, progression: maj(p.progression) } : p)),
        }));

      return {
        profils: [],
        profilActifId: null,
        ajouterProfil: (prenom, classe) => {
          const profil: ProfilEnfant = { id: nouvelId(), prenom, classe, progression: progression.progressionVide() };
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
        enregistrerEtape: (id, etapeId, r, maintenant = new Date()) =>
          set((etat) => ({
            profils: etat.profils.map((p) =>
              p.id === id
                ? {
                    ...p,
                    progression: progression.enregistrerEtape(
                      p.progression,
                      etapeId,
                      r.reussiesPremierCoup,
                      r.nombreQuestions,
                      r.dureeSecondes,
                      maintenant,
                    ),
                    toile: p.toile && toileApresEtape(p.toile, r.domaine, r.reussiesPremierCoup, r.nombreQuestions),
                  }
                : p,
            ),
          })),
        enregistrerToile: (id, niveaux, maintenant = new Date()) =>
          set((etat) => ({
            profils: etat.profils.map((p) =>
              p.id === id ? { ...p, toile: nouvelleToile(p.classe, niveaux, progression.dateLocale(maintenant)) } : p,
            ),
          })),
        ouvrirCoffre: (id, coffreId) => majProgression(id, (p) => progression.ouvrirCoffre(p, coffreId)),
      };
    },
    {
      name: 'capy-profils',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ profils, profilActifId }) => ({ profils, profilActifId }),
      // Version 1 (phase 1) : les profils n'avaient pas encore de progression.
      migrate: (ancien, version) => {
        const etat = ancien as { profils: Omit<ProfilEnfant, 'progression'>[]; profilActifId: string | null };
        if (version < 2) {
          return {
            ...etat,
            profils: etat.profils.map((p) => ({ ...p, progression: progression.progressionVide() })),
          };
        }
        return etat;
      },
    },
  ),
);

export function useProfilActif(): ProfilEnfant | undefined {
  return useProfils((etat) => etat.profils.find((p) => p.id === etat.profilActifId));
}
