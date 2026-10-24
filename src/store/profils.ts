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
  /** Date (ISO) de la dernière modification, pour fusionner entre appareils. */
  modifieLe: string;
  /** Date (ISO) de la dernière synchronisation avec le compte ; propre à l'appareil, jamais envoyée. */
  synchroniseLe?: string;
}

interface EtatProfils {
  profils: ProfilEnfant[];
  profilActifId: string | null;
  /** Profils supprimés sur cet appareil, à effacer aussi du serveur à la prochaine synchronisation. */
  suppressionsEnAttente: string[];
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
  /** Résultat d'une synchronisation : nouvelle liste de profils, suppressions envoyées au serveur. */
  appliquerSynchro: (profils: ProfilEnfant[], suppressionsTraitees: string[]) => void;
  /** Après une déconnexion : les profils ne sont plus liés à un compte. */
  oublierSynchro: () => void;
}

function nouvelId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useProfils = create<EtatProfils>()(
  persist(
    (set) => {
      /** Modifie un profil et note la date de modification. */
      const modifier = (id: string, maj: (p: ProfilEnfant, maintenant: Date) => Partial<ProfilEnfant>, maintenant = new Date()) =>
        set((etat) => ({
          profils: etat.profils.map((p) =>
            p.id === id ? { ...p, ...maj(p, maintenant), modifieLe: maintenant.toISOString() } : p,
          ),
        }));

      return {
        profils: [],
        profilActifId: null,
        suppressionsEnAttente: [],
        ajouterProfil: (prenom, classe) => {
          const profil: ProfilEnfant = {
            id: nouvelId(),
            prenom,
            classe,
            progression: progression.progressionVide(),
            modifieLe: new Date().toISOString(),
          };
          set((etat) => ({ profils: [...etat.profils, profil] }));
          return profil;
        },
        modifierProfil: (id, modifs) => modifier(id, () => modifs),
        supprimerProfil: (id) =>
          set((etat) => {
            const profil = etat.profils.find((p) => p.id === id);
            return {
              profils: etat.profils.filter((p) => p.id !== id),
              profilActifId: etat.profilActifId === id ? null : etat.profilActifId,
              suppressionsEnAttente: profil?.synchroniseLe
                ? [...etat.suppressionsEnAttente, id]
                : etat.suppressionsEnAttente,
            };
          }),
        choisirProfil: (id) => set({ profilActifId: id }),
        enregistrerEtape: (id, etapeId, r, maintenant = new Date()) =>
          modifier(
            id,
            (p, m) => ({
              progression: progression.enregistrerEtape(
                p.progression,
                etapeId,
                r.reussiesPremierCoup,
                r.nombreQuestions,
                r.dureeSecondes,
                m,
              ),
              toile: p.toile && toileApresEtape(p.toile, r.domaine, r.reussiesPremierCoup, r.nombreQuestions),
            }),
            maintenant,
          ),
        enregistrerToile: (id, niveaux, maintenant = new Date()) =>
          modifier(id, (p, m) => ({ toile: nouvelleToile(p.classe, niveaux, progression.dateLocale(m)) }), maintenant),
        ouvrirCoffre: (id, coffreId) =>
          modifier(id, (p) => ({ progression: progression.ouvrirCoffre(p.progression, coffreId) })),
        appliquerSynchro: (profils, suppressionsTraitees) =>
          set((etat) => ({
            profils,
            profilActifId: profils.some((p) => p.id === etat.profilActifId) ? etat.profilActifId : null,
            suppressionsEnAttente: etat.suppressionsEnAttente.filter((id) => !suppressionsTraitees.includes(id)),
          })),
        oublierSynchro: () =>
          set((etat) => ({
            profils: etat.profils.map(({ synchroniseLe: _ignore, ...p }) => p),
            suppressionsEnAttente: [],
          })),
      };
    },
    {
      name: 'capy-profils',
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ profils, profilActifId, suppressionsEnAttente }) => ({ profils, profilActifId, suppressionsEnAttente }),
      migrate: (ancien, version) => {
        const etat = ancien as { profils: Partial<ProfilEnfant>[]; profilActifId: string | null };
        let profils = etat.profils;
        // Version 1 (phase 1) : pas encore de progression.
        if (version < 2) profils = profils.map((p) => ({ ...p, progression: progression.progressionVide() }));
        // Version 2 (phases 4 à 6) : pas encore de date de modification.
        if (version < 3) profils = profils.map((p) => ({ ...p, modifieLe: p.modifieLe ?? new Date().toISOString() }));
        return { ...etat, profils: profils as ProfilEnfant[], suppressionsEnAttente: [] };
      },
    },
  ),
);

export function useProfilActif(): ProfilEnfant | undefined {
  return useProfils((etat) => etat.profils.find((p) => p.id === etat.profilActifId));
}
