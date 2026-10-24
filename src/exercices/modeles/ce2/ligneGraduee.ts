/**
 * Compétence visée : se repérer sur une ligne graduée régulièrement (de 1 en 1,
 * de 2 en 2, de 5 en 5, de 10 en 10, de 100 en 100) : placer un nombre et lire
 * le nombre associé à une graduation. Nombres jusqu'à 1 000.
 * Attendus de fin de cycle 2 (CE2).
 *
 * Le fil compte toujours 10 intervalles : il va de « debut » à debut + 10 × pas.
 */
import type { Alea } from '../../alea';
import { definirModele, nb } from '../../moteur';
import type { ReglesClasse } from '../../types';

export const INTERVALLES_LIGNE = 10;

type DonneesPlacer = { debut: number; pas: number; cible: number };
type DonneesLire = { debut: number; pas: number; rang: number };

/** Tire un départ multiple du pas, pour que le fil reste dans les bornes de la classe. */
function tirerDebut(alea: Alea, pas: number, max: number): number {
  const plusGrandDepart = Math.floor((max - INTERVALLES_LIGNE * pas) / pas);
  return pas * alea.entier(0, Math.max(0, plusGrandDepart));
}

function ordinal(rang: number): string {
  return rang === 1 ? '1re' : `${rang}e`;
}

function placer(id: string, titre: string, pasPossibles: readonly number[]) {
  const pasMin = Math.min(...pasPossibles);
  const pasMax = Math.max(...pasPossibles);
  return definirModele<DonneesPlacer>({
    id,
    titre,
    domaine: 'ligne-graduee',
    competence: `Placer un nombre sur une ligne graduée de ${pasPossibles.join(', ')} en ${pasPossibles.join(', ')}.`,
    operations: ['+'],
    regles: {
      CE2: {
        donnees: {
          debut: { min: 0, max: 1000 - INTERVALLES_LIGNE * pasMin },
          pas: { min: pasMin, max: pasMax },
          cible: { min: pasMin, max: 1000 },
        },
        reponse: { min: pasMin, max: 1000 },
      } satisfies ReglesClasse<DonneesPlacer>,
    },
    tirer: (alea) => {
      const pas = alea.choix(pasPossibles);
      const debut = tirerDebut(alea, pas, 1000);
      // Jamais sur les extrémités : il faut compter les graduations.
      return { debut, pas, cible: debut + pas * alea.entier(1, INTERVALLES_LIGNE - 1) };
    },
    calculer: ({ cible }) => cible,
    erreursTypiques: ({ debut, pas, cible }) => [
      { valeur: debut + (cible - debut) / pas, erreur: 'graduations comptées de 1 en 1' },
      { valeur: cible - debut, erreur: 'départ du fil oublié' },
      { valeur: cible + pas, erreur: 'une graduation de trop' },
      { valeur: cible - pas, erreur: 'une graduation de moins' },
    ],
    histoires: [
      ({ debut, pas, cible }, r) => ({
        enonce: `Le fil commence à ${nb(debut)}. D’une graduation à la suivante, on avance de ${nb(pas)}.`,
        question: `Fais marcher Capy jusqu’à ${nb(cible)}.`,
        indice: `Pars du début du fil et compte de ${nb(pas)} en ${nb(pas)} à chaque graduation.`,
        explication: `En partant de ${nb(debut)} et en avançant de ${nb(pas)} en ${nb(pas)}, on arrive à ${nb(r)} après ${(r - debut) / pas} graduations.`,
      }),
    ],
  });
}

function lire(id: string, titre: string, pasPossibles: readonly number[]) {
  const pasMin = Math.min(...pasPossibles);
  const pasMax = Math.max(...pasPossibles);
  return definirModele<DonneesLire>({
    id,
    titre,
    domaine: 'ligne-graduee',
    competence: `Lire le nombre associé à une graduation, sur une ligne graduée de ${pasPossibles.join(', ')} en ${pasPossibles.join(', ')}.`,
    operations: ['+'],
    regles: {
      CE2: {
        donnees: {
          debut: { min: 0, max: 1000 - INTERVALLES_LIGNE * pasMin },
          pas: { min: pasMin, max: pasMax },
          rang: { min: 2, max: INTERVALLES_LIGNE - 1 },
        },
        reponse: { min: pasMin, max: 1000 },
      } satisfies ReglesClasse<DonneesLire>,
    },
    tirer: (alea) => {
      const pas = alea.choix(pasPossibles);
      return { debut: tirerDebut(alea, pas, 1000), pas, rang: alea.entier(2, INTERVALLES_LIGNE - 1) };
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
      }),
    ],
  });
}

export const placerPetitsPas = placer('placer-petits-pas', 'Placer (petits pas)', [1, 2, 5]);
export const placerGrandsPas = placer('placer-grands-pas', 'Placer (grands pas)', [10, 100]);
export const lirePetitsPas = lire('lire-petits-pas', 'Lire (petits pas)', [1, 2, 5]);
export const lireGrandsPas = lire('lire-grands-pas', 'Lire (grands pas)', [10, 100]);
