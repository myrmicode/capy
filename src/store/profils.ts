import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { lireReglages, type ReglagesEnfant } from '@/accessibilite/reglages';
import { tenueValide, type Emplacement, type ObjetId } from '@/collection/objets';
import type { Classe } from '@/config/classes';
import type { DomaineId, Matiere } from '@/config/domaines';
import * as progression from '@/parcours/progression';
import type { ProgressionEnfant } from '@/parcours/progression';
import { noterRevisions, type QuestionRevisee } from '@/parcours/revision';
import {
  appliquerFiche,
  avecPhotoDeJanvier,
  migrerToile,
  toileApresEtape,
  type Niveaux,
  type ToileEnfant,
} from '@/toile/niveaux';

/**
 * Profil d'un enfant. Règle non négociable : on ne stocke que le prénom ou
 * surnom, la classe, les niveaux de la toile, la progression et les réglages de
 * lecture et de jeu (jamais leur raison). Jamais de nom
 * de famille, d'école, de date de naissance, de photo ni de voix.
 * La toile est absente tant que le parent n'a saisi aucune fiche de l'école.
 */
export interface ProfilEnfant {
  id: string;
  prenom: string;
  classe: Classe;
  progression: ProgressionEnfant;
  toile?: ToileEnfant;
  /**
   * Réglages de lecture et de jeu (police, taille, toucher puis toucher…). Jamais
   * de diagnostic ni de raison : seulement les réglages eux-mêmes.
   */
  reglages?: ReglagesEnfant;
  /** Date (ISO) de la dernière modification, pour fusionner entre appareils. */
  modifieLe: string;
  /** Date (ISO) de la dernière synchronisation avec le compte ; propre à l'appareil, jamais envoyée. */
  synchroniseLe?: string;
}

/** Le résultat d'une étape ou d'une série d'entraînement. */
interface ResultatPartie {
  domaine: DomaineId;
  reussiesPremierCoup: number;
  nombreQuestions: number;
  dureeSecondes: number;
  /** Temps de réponse médian des réponses justes du premier coup (absent s'il y en a trop peu). */
  tempsReponse?: number;
}

/** La vitesse de l'étape s'ajoute à celle de la compétence. */
const avecVitesse = (p: progression.ProgressionEnfant, r: ResultatPartie, m: Date) =>
  r.tempsReponse === undefined ? p : progression.noterVitesse(p, r.domaine, r.tempsReponse, m);

interface EtatProfils {
  profils: ProfilEnfant[];
  profilActifId: string | null;
  /** Profils supprimés sur cet appareil, à effacer aussi du serveur à la prochaine synchronisation. */
  suppressionsEnAttente: string[];
  ajouterProfil: (prenom: string, classe: Classe) => ProfilEnfant;
  modifierProfil: (id: string, modifs: Partial<Pick<ProfilEnfant, 'prenom' | 'classe'>>) => void;
  supprimerProfil: (id: string) => void;
  choisirProfil: (id: string | null) => void;
  enregistrerEtape: (id: string, etapeId: string, resultat: ResultatPartie, maintenant?: Date) => void;
  /** Série d'entraînement libre terminée : étoiles, jour, temps, et la toile du jour évolue comme pour une étape. */
  enregistrerEntrainement: (id: string, themeId: string, resultat: ResultatPartie, maintenant?: Date) => void;
  /** Enregistre la fiche d'une matière : elle devient la référence de cette matière. */
  enregistrerToile: (id: string, matiere: Matiere, niveaux: Niveaux, maintenant?: Date) => void;
  ouvrirCoffre: (id: string, coffreId: string) => void;
  /** Histoire lue et questions faites : étoiles, jour et temps. */
  enregistrerHistoire: (
    id: string,
    histoireId: string,
    resultat: { reussiesPremierCoup: number; nombreQuestions: number; dureeSecondes: number },
    maintenant?: Date,
  ) => void;
  /** Fait porter un objet gagné à Capy, ou l'enlève (null). */
  porterObjet: (id: string, emplacement: Emplacement, objet: ObjetId | null) => void;
  /** Défi du jour terminé : étoiles, jour et temps. La toile ne bouge pas : 3 questions ne disent pas grand-chose. */
  enregistrerDefi: (
    id: string,
    resultat: { reussiesPremierCoup: number; nombreQuestions: number; dureeSecondes: number },
    maintenant?: Date,
  ) => void;
  /** Une série du chrono de Capy : le record du thème, le jour et le temps. */
  enregistrerChrono: (id: string, themeId: string, justes: number, dureeSecondes: number, maintenant?: Date) => void;
  /** Une lecture à deux : mots bien lus en une minute (comptés par l'adulte). */
  enregistrerLecture: (
    id: string,
    texteId: string,
    mesure: { motsParMinute: number; erreurs: number },
    dureeSecondes: number,
    maintenant?: Date,
  ) => void;
  /** Questions d'une étape terminée : celles qui ont demandé plusieurs essais reviendront plus tard. */
  noterRevisions: (id: string, questions: readonly QuestionRevisee[], maintenant?: Date) => void;
  modifierReglages: (id: string, reglages: ReglagesEnfant) => void;
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
      const modifier = (
        id: string,
        maj: (p: ProfilEnfant, maintenant: Date) => Partial<ProfilEnfant>,
        maintenant = new Date(),
      ) =>
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
              progression: avecVitesse(
                progression.enregistrerEtape(
                  p.progression,
                  etapeId,
                  r.reussiesPremierCoup,
                  r.nombreQuestions,
                  r.dureeSecondes,
                  m,
                ),
                r,
                m,
              ),
              toile:
                p.toile &&
                toileApresEtape(
                  avecPhotoDeJanvier(p.toile, p.classe, progression.dateLocale(m)),
                  r.domaine,
                  r.reussiesPremierCoup,
                  r.nombreQuestions,
                ),
            }),
            maintenant,
          ),
        enregistrerEntrainement: (id, themeId, r, maintenant = new Date()) =>
          modifier(
            id,
            (p, m) => ({
              progression: avecVitesse(
                progression.enregistrerEntrainement(
                  p.progression,
                  themeId,
                  r.reussiesPremierCoup,
                  r.nombreQuestions,
                  r.dureeSecondes,
                  m,
                ),
                r,
                m,
              ),
              // Même règle que le parcours ; la fiche de septembre ne change jamais.
              toile:
                p.toile &&
                toileApresEtape(
                  avecPhotoDeJanvier(p.toile, p.classe, progression.dateLocale(m)),
                  r.domaine,
                  r.reussiesPremierCoup,
                  r.nombreQuestions,
                ),
            }),
            maintenant,
          ),
        enregistrerToile: (id, matiere, niveaux, maintenant = new Date()) =>
          modifier(
            id,
            (p, m) => ({ toile: appliquerFiche(p.toile, p.classe, matiere, niveaux, progression.dateLocale(m)) }),
            maintenant,
          ),
        noterRevisions: (id, questions, maintenant = new Date()) =>
          modifier(
            id,
            (p, m) => ({
              progression: {
                ...p.progression,
                aRevoir: noterRevisions(p.progression.aRevoir, questions, progression.dateLocale(m)),
              },
            }),
            maintenant,
          ),
        enregistrerDefi: (id, r, maintenant = new Date()) =>
          modifier(
            id,
            (p, m) => ({
              progression: progression.enregistrerDefi(
                p.progression,
                r.reussiesPremierCoup,
                r.nombreQuestions,
                r.dureeSecondes,
                m,
              ),
            }),
            maintenant,
          ),
        enregistrerHistoire: (id, histoireId, r, maintenant = new Date()) =>
          modifier(
            id,
            (p, m) => ({
              progression: progression.enregistrerHistoire(
                p.progression,
                histoireId,
                r.reussiesPremierCoup,
                r.nombreQuestions,
                r.dureeSecondes,
                m,
              ),
            }),
            maintenant,
          ),
        enregistrerChrono: (id, themeId, justes, dureeSecondes, maintenant = new Date()) =>
          modifier(
            id,
            (p, m) => ({
              progression: progression.enregistrerChrono(p.progression, themeId, justes, dureeSecondes, m),
            }),
            maintenant,
          ),
        enregistrerLecture: (id, texteId, mesure, dureeSecondes, maintenant = new Date()) =>
          modifier(
            id,
            (p, m) => ({
              progression: progression.enregistrerLecture(p.progression, texteId, mesure, dureeSecondes, m),
            }),
            maintenant,
          ),
        porterObjet: (id, emplacement, objet) =>
          modifier(id, (p) => ({
            progression: {
              ...p.progression,
              tenue: tenueValide({ ...p.progression.tenue, [emplacement]: objet ?? undefined }, p.progression),
            },
          })),
        ouvrirCoffre: (id, coffreId) =>
          modifier(id, (p) => ({ progression: progression.ouvrirCoffre(p.progression, coffreId) })),
        modifierReglages: (id, reglages) => modifier(id, () => ({ reglages: lireReglages(reglages) })),
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
      version: 5,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ profils, profilActifId, suppressionsEnAttente }) => ({
        profils,
        profilActifId,
        suppressionsEnAttente,
      }),
      migrate: (ancien, version) => {
        const etat = ancien as { profils: Partial<ProfilEnfant>[]; profilActifId: string | null };
        let profils = etat.profils;
        // Version 1 (phase 1) : pas encore de progression.
        if (version < 2) profils = profils.map((p) => ({ ...p, progression: progression.progressionVide() }));
        // Version 2 (phases 4 à 6) : pas encore de date de modification.
        if (version < 3) profils = profils.map((p) => ({ ...p, modifieLe: p.modifieLe ?? new Date().toISOString() }));
        // Version 3 (jusqu'à la phase 8) : une seule toile, aux axes provisoires.
        if (version < 4)
          profils = profils.map((p) => ({ ...p, toile: p.classe ? migrerToile(p.toile, p.classe) : undefined }));
        // Version 4 (jusqu.à la dictée et la lecture) : pas encore de réglages de lecture et de jeu.
        if (version < 5) profils = profils.map((p) => ({ ...p, reglages: lireReglages(p.reglages) }));
        return { ...etat, profils: profils as ProfilEnfant[], suppressionsEnAttente: [] };
      },
    },
  ),
);

export function useProfilActif(): ProfilEnfant | undefined {
  return useProfils((etat) => etat.profils.find((p) => p.id === etat.profilActifId));
}
