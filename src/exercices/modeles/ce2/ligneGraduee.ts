/**
 * Compétence visée : se repérer sur une ligne graduée régulièrement (de 1 en 1,
 * de 2 en 2, de 5 en 5, de 10 en 10, de 100 en 100) : placer un nombre et lire
 * le nombre associé à une graduation. Nombres jusqu'à 1 000.
 * Attendus de fin de cycle 2 (CE2). En CE1, des nombres jusqu'à 1 000 et des pas
 * plus simples ; en CM, des nombres jusqu'à 100 000 puis 1 000 000.
 *
 * Le fil compte toujours 10 intervalles : il va de « debut » à debut + 10 × pas.
 * La difficulté joue sur le pas et sur la taille des nombres (voir les paliers).
 */
import type { Classe } from '@/config/classes';

import type { Alea } from '../../alea';
import { definirModele, nb } from '../../moteur';
import type { NiveauDifficulte, ReglesClasse } from '../../types';

export const INTERVALLES_LIGNE = 10;

type DonneesPlacer = { debut: number; pas: number; cible: number };
type DonneesLire = { debut: number; pas: number; rang: number };

/** Pas possibles et plus grand nombre du fil, pour un niveau. */
interface Palier {
  pas: readonly number[];
  max: number;
}
type Paliers = Record<NiveauDifficulte, Palier>;
type PaliersParClasse = Partial<Record<Classe, Paliers>>;

/** Règles de chaque classe (niveau visé) et règles accessibles (+ et ++), à partir des paliers. */
function reglesDesClasses<D extends DonneesPlacer | DonneesLire>(
  paliers: PaliersParClasse,
  regles: (p: Palier) => ReglesClasse<D>,
) {
  const classes = Object.entries(paliers) as [Classe, Paliers][];
  return {
    regles: Object.fromEntries(classes.map(([c, p]) => [c, regles(p[3])])),
    reglesAccessibles: Object.fromEntries(classes.map(([c, p]) => [c, { 1: regles(p[1]), 2: regles(p[2]) }])),
  };
}

/** Tire un départ multiple du pas, pour que le fil reste dans les bornes du palier. */
function tirerDebut(alea: Alea, pas: number, max: number): number {
  const plusGrandDepart = Math.floor((max - INTERVALLES_LIGNE * pas) / pas);
  return pas * alea.entier(0, Math.max(0, plusGrandDepart));
}

function ordinal(rang: number): string {
  return rang === 1 ? '1re' : `${rang}e`;
}

function bornes(p: Palier) {
  return { pasMin: Math.min(...p.pas), pasMax: Math.max(...p.pas) };
}

function reglesPlacer(p: Palier): ReglesClasse<DonneesPlacer> {
  const { pasMin, pasMax } = bornes(p);
  return {
    donnees: {
      debut: { min: 0, max: p.max - INTERVALLES_LIGNE * pasMin },
      pas: { min: pasMin, max: pasMax },
      cible: { min: pasMin, max: p.max },
    },
    reponse: { min: pasMin, max: p.max },
  };
}

function reglesLire(p: Palier): ReglesClasse<DonneesLire> {
  const { pasMin, pasMax } = bornes(p);
  return {
    donnees: {
      debut: { min: 0, max: p.max - INTERVALLES_LIGNE * pasMin },
      pas: { min: pasMin, max: pasMax },
      rang: { min: 2, max: INTERVALLES_LIGNE - 1 },
    },
    reponse: { min: pasMin, max: p.max },
  };
}

function placer(id: string, titre: string, paliersParClasse: PaliersParClasse) {
  const cible = paliersParClasse.CE2![3].pas;
  return definirModele<DonneesPlacer>({
    id,
    titre,
    domaine: 'ligne-graduee',
    competence: `Placer un nombre sur une ligne graduée de ${cible.join(', ')} en ${cible.join(', ')}.`,
    operations: ['+'],
    ...reglesDesClasses(paliersParClasse, reglesPlacer),
    tirer: (alea, _regles, niveau, classe) => {
      const palier = paliersParClasse[classe]![niveau];
      const pas = alea.choix(palier.pas);
      const debut = tirerDebut(alea, pas, palier.max);
      // Jamais sur les extrémités : il faut compter les graduations.
      return { debut, pas, cible: debut + pas * alea.entier(1, INTERVALLES_LIGNE - 1) };
    },
    calculer: ({ cible: c }) => c,
    erreursTypiques: ({ debut, pas, cible: c }) => [
      { valeur: debut + (c - debut) / pas, erreur: 'graduations comptées de 1 en 1' },
      { valeur: c - debut, erreur: 'départ du fil oublié' },
      { valeur: c + pas, erreur: 'une graduation de trop' },
      { valeur: c - pas, erreur: 'une graduation de moins' },
    ],
    histoires: [
      ({ debut, pas, cible: c }, r) => ({
        enonce: `Le fil commence à ${nb(debut)}. D’une graduation à la suivante, on avance de ${nb(pas)}.`,
        question: `Fais marcher Capy jusqu’à ${nb(c)}.`,
        indice: `Pars du début du fil et compte de ${nb(pas)} en ${nb(pas)} à chaque graduation.`,
        explication: `En partant de ${nb(debut)} et en avançant de ${nb(pas)} en ${nb(pas)}, on arrive à ${nb(r)} après ${(r - debut) / pas} graduations.`,
        facile: {
          enonce: `Le fil commence à ${nb(debut)}. À chaque trait, on avance de ${nb(pas)}.`,
          question: `Fais marcher Capy jusqu’à ${nb(c)}.`,
          indice: `Pars du début. Compte de ${nb(pas)} en ${nb(pas)}.`,
          explication: `On compte de ${nb(pas)} en ${nb(pas)}. On arrive à ${nb(r)}.`,
        },
      }),
    ],
  });
}

function lire(id: string, titre: string, paliersParClasse: PaliersParClasse) {
  const cible = paliersParClasse.CE2![3].pas;
  return definirModele<DonneesLire>({
    id,
    titre,
    domaine: 'ligne-graduee',
    competence: `Lire le nombre associé à une graduation, sur une ligne graduée de ${cible.join(', ')} en ${cible.join(', ')}.`,
    operations: ['+'],
    ...reglesDesClasses(paliersParClasse, reglesLire),
    tirer: (alea, _regles, niveau, classe) => {
      const palier = paliersParClasse[classe]![niveau];
      const pas = alea.choix(palier.pas);
      return { debut: tirerDebut(alea, pas, palier.max), pas, rang: alea.entier(2, INTERVALLES_LIGNE - 1) };
    },
    calculer: ({ debut, pas, rang }) => debut + rang * pas,
    erreursTypiques: ({ debut, pas, rang }) => [
      { valeur: debut + rang, erreur: 'graduations comptées de 1 en 1' },
      { valeur: rang * pas, erreur: 'départ du fil oublié' },
      { valeur: debut + (rang + 1) * pas, erreur: 'une graduation de trop' },
      { valeur: debut + (rang - 1) * pas, erreur: 'une graduation de moins' },
    ],
    histoires: [
      ({ debut, pas, rang }, r) => ({
        enonce: `Le fil commence à ${nb(debut)} et avance de ${nb(pas)} à chaque graduation. Capy s’arrête sur la ${ordinal(rang)} graduation après le départ.`,
        question: 'Sur quel nombre Capy est-il arrêté ?',
        indice: `Compte de ${nb(pas)} en ${nb(pas)} à partir de ${nb(debut)}, une fois par graduation.`,
        explication: `${nb(debut)} + ${rang} × ${nb(pas)} = ${nb(r)}. Capy est arrêté sur ${nb(r)}.`,
        facile: {
          enonce: `Le fil commence à ${nb(debut)}. À chaque trait, on avance de ${nb(pas)}. Capy est sur le trait numéro ${rang}.`,
          question: 'Sur quel nombre est Capy ?',
          indice: `Pars de ${nb(debut)}. Compte de ${nb(pas)} en ${nb(pas)}, un trait à la fois.`,
          explication: `On compte ${rang} fois ${nb(pas)} après ${nb(debut)}. Capy est sur ${nb(r)}.`,
        },
      }),
    ],
  });
}

const PETITS_PAS: PaliersParClasse = {
  // + de 1 en 1 jusqu'à 20 ; ++ jusqu'à 50 ; +++ de 1 ou 2 jusqu'à 100.
  CP: { 1: { pas: [1], max: 20 }, 2: { pas: [1], max: 50 }, 3: { pas: [1, 2], max: 100 } },
  // + de 1 en 1 jusqu'à 30 ; ++ jusqu'à 100 ; +++ de 1, 2 ou 5 jusqu'à 500.
  CE1: { 1: { pas: [1], max: 30 }, 2: { pas: [1], max: 100 }, 3: { pas: [1, 2, 5], max: 500 } },
  // + de 1 en 1 jusqu'à 50 ; ++ de 1, 2 ou 5 jusqu'à 200 ; +++ jusqu'à 1 000.
  CE2: { 1: { pas: [1], max: 50 }, 2: { pas: [1, 2, 5], max: 200 }, 3: { pas: [1, 2, 5], max: 1000 } },
  // + comme en CE2 ; ++ de 10, 20 ou 50 jusqu'à 10 000 ; +++ jusqu'à 100 000.
  CM1: {
    1: { pas: [1, 2, 5], max: 1000 },
    2: { pas: [10, 20, 50], max: 10000 },
    3: { pas: [10, 50, 100], max: 100000 },
  },
  // + jusqu'à 100 000 ; ++ de 100, 200 ou 500 jusqu'à 1 000 000 ; +++ aussi de 1 000 en 1 000.
  CM2: {
    1: { pas: [10, 50, 100], max: 100000 },
    2: { pas: [100, 200, 500], max: 1000000 },
    3: { pas: [100, 500, 1000], max: 1000000 },
  },
};
const GRANDS_PAS: PaliersParClasse = {
  // + de 2 en 2 jusqu'à 40 ; ++ de 5 en 5 jusqu'à 100 ; +++ aussi de 10 en 10.
  CP: { 1: { pas: [2], max: 40 }, 2: { pas: [5], max: 100 }, 3: { pas: [5, 10], max: 100 } },
  // + de 10 en 10 jusqu'à 200 ; ++ jusqu'à 500 ; +++ aussi de 100 en 100, jusqu'à 1 000.
  CE1: { 1: { pas: [10], max: 200 }, 2: { pas: [10], max: 500 }, 3: { pas: [10, 100], max: 1000 } },
  // + de 10 en 10 jusqu'à 200 ; ++ jusqu'à 1 000 ; +++ aussi de 100 en 100.
  CE2: { 1: { pas: [10], max: 200 }, 2: { pas: [10], max: 1000 }, 3: { pas: [10, 100], max: 1000 } },
  // + de 100 en 100 jusqu'à 10 000 ; ++ aussi de 1 000 en 1 000 ; +++ jusqu'à 1 000 000.
  CM1: { 1: { pas: [100], max: 10000 }, 2: { pas: [100, 1000], max: 100000 }, 3: { pas: [1000, 10000], max: 1000000 } },
  // + de 1 000 en 1 000 jusqu'à 100 000 ; ++ aussi de 10 000 en 10 000 ; +++ de 10 000 ou 50 000.
  CM2: {
    1: { pas: [1000], max: 100000 },
    2: { pas: [1000, 10000], max: 1000000 },
    3: { pas: [10000, 50000], max: 1000000 },
  },
};

export const placerPetitsPas = placer('placer-petits-pas', 'Placer (petits pas)', PETITS_PAS);
export const placerGrandsPas = placer('placer-grands-pas', 'Placer (grands pas)', GRANDS_PAS);
export const lirePetitsPas = lire('lire-petits-pas', 'Lire (petits pas)', PETITS_PAS);
export const lireGrandsPas = lire('lire-grands-pas', 'Lire (grands pas)', GRANDS_PAS);
