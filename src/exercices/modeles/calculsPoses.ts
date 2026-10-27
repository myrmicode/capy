/**
 * Poser et calculer : additions, soustractions et multiplications posées en
 * colonnes. Axe « Poser et calculer » (CE2, CM1, CM2). Les mauvaises réponses
 * reproduisent les erreurs de calcul posé les plus fréquentes : retenue oubliée,
 * plus petit chiffre ôté du plus grand, décalage oublié dans la multiplication.
 *
 * Et les fractions du CE2 : prendre la moitié, le tiers, le quart… d'une quantité.
 */
import { additionSansRetenue, soustractionPetitDuGrand } from '../erreurs';
import { definirModele, nb } from '../moteur';
import type { ReglesClasse } from '../types';

type Deux = { a: number; b: number };
const regle = (a: [number, number], b: [number, number], r: [number, number]): ReglesClasse<Deux> => ({
  donnees: { a: { min: a[0], max: a[1] }, b: { min: b[0], max: b[1] } },
  reponse: { min: r[0], max: r[1] },
});

const INDICE_POSE =
  'Pose l’opération en colonnes\u00a0: les unités sous les unités, les dizaines sous les dizaines. Commence par la droite.';

export const additionPosee = definirModele<Deux>({
  id: 'addition-posee',
  titre: 'L’addition posée',
  domaine: 'poser-calculer',
  competence: 'Poser et calculer une addition en colonnes, avec retenues.',
  operations: ['+'],
  regles: {
    CE2: regle([100, 899], [100, 899], [200, 999]),
    CM1: regle([10_000, 59_999], [1000, 39_999], [11_000, 99_999]),
    CM2: regle([100_000, 599_999], [10_000, 399_999], [110_000, 999_999]),
  },
  reglesAccessibles: {
    // + : deux chiffres ; ++ : trois chiffres, jusqu'à 600.
    CE2: { 1: regle([10, 89], [10, 89], [20, 99]), 2: regle([100, 499], [100, 499], [200, 600]) },
    CM1: { 1: regle([100, 899], [100, 899], [200, 999]), 2: regle([1000, 5999], [1000, 3999], [2000, 9999]) },
    CM2: {
      1: regle([1000, 5999], [1000, 3999], [2000, 9999]),
      2: regle([10_000, 59_999], [1000, 39_999], [11_000, 99_999]),
    },
  },
  calculer: ({ a, b }) => a + b,
  erreursTypiques: ({ a, b }) => [
    { valeur: additionSansRetenue(a, b), erreur: 'retenue oubliée' },
    { valeur: a + b + 10, erreur: 'retenue ajoutée en trop' },
    { valeur: a + b - 10, erreur: 'erreur dans une colonne' },
    { valeur: a + b + 100, erreur: 'retenue ajoutée dans la mauvaise colonne' },
  ],
  histoires: [
    ({ a, b }, r) => ({
      enonce: `${nb(a)}\u00a0+\u00a0${nb(b)}`,
      question: 'Pose l’opération et calcule.',
      indice: INDICE_POSE,
      explication: `En colonnes, de droite à gauche, sans oublier les retenues\u00a0: ${nb(a)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}.`,
      facile: {
        enonce: `${nb(a)}\u00a0+\u00a0${nb(b)}`,
        question: 'Pose et calcule.',
        indice: 'Mets les chiffres en colonnes. Commence à droite.',
        explication: `${nb(a)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}.`,
      },
    }),
  ],
});

export const soustractionPosee = definirModele<Deux>({
  id: 'soustraction-posee',
  titre: 'La soustraction posée',
  domaine: 'poser-calculer',
  competence: 'Poser et calculer une soustraction en colonnes, avec retenues.',
  operations: ['−'],
  regles: {
    CE2: regle([200, 999], [100, 899], [10, 899]),
    CM1: regle([10_000, 99_999], [1000, 89_999], [100, 98_999]),
    CM2: regle([100_000, 999_999], [10_000, 899_999], [1000, 989_999]),
  },
  reglesAccessibles: {
    CE2: { 1: regle([20, 99], [10, 89], [2, 89]), 2: regle([200, 599], [100, 499], [10, 499]) },
    CM1: { 1: regle([200, 999], [100, 899], [10, 899]), 2: regle([1000, 9999], [100, 8999], [100, 9899]) },
    CM2: {
      1: regle([1000, 9999], [100, 8999], [100, 9899]),
      2: regle([10_000, 99_999], [1000, 89_999], [100, 98_999]),
    },
  },
  estValide: ({ a, b }) => b < a,
  calculer: ({ a, b }) => a - b,
  erreursTypiques: ({ a, b }) => [
    { valeur: soustractionPetitDuGrand(a, b), erreur: 'dans chaque colonne, le plus petit chiffre ôté du plus grand' },
    { valeur: a - b + 10, erreur: 'retenue oubliée' },
    { valeur: a - b - 10, erreur: 'retenue comptée deux fois' },
    { valeur: a + b, erreur: 'addition au lieu de soustraction' },
  ],
  histoires: [
    ({ a, b }, r) => ({
      enonce: `${nb(a)}\u00a0−\u00a0${nb(b)}`,
      question: 'Pose l’opération et calcule.',
      indice: `${INDICE_POSE} Si le chiffre du haut est trop petit, pense à la retenue.`,
      explication: `En colonnes, de droite à gauche, avec les retenues\u00a0: ${nb(a)}\u00a0−\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. On peut vérifier\u00a0: ${nb(r)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(a)}.`,
      facile: {
        enonce: `${nb(a)}\u00a0−\u00a0${nb(b)}`,
        question: 'Pose et calcule.',
        indice: 'Mets les chiffres en colonnes. Commence à droite.',
        explication: `${nb(a)}\u00a0−\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}.`,
      },
    }),
  ],
});

/** Multiplication par un nombre à un chiffre en oubliant les retenues : 47 × 3 → 21 (12 → 2, 21 → 1…). */
function multiplicationSansRetenue(a: number, b: number): number {
  return Number(
    String(a)
      .split('')
      .map((c) => (Number(c) * b) % 10)
      .join(''),
  );
}

export const multiplicationPosee = definirModele<Deux>({
  id: 'multiplication-posee',
  titre: 'La multiplication posée',
  domaine: 'poser-calculer',
  competence:
    'Poser et calculer une multiplication\u00a0: par un nombre à un chiffre (CE2), puis à deux chiffres (CM).',
  operations: ['×'],
  regles: {
    CE2: regle([100, 999], [2, 9], [200, 8991]),
    CM1: regle([100, 999], [11, 99], [1100, 98_901]),
    CM2: regle([1000, 9999], [11, 99], [11_000, 989_901]),
  },
  reglesAccessibles: {
    CE2: { 1: regle([10, 49], [2, 5], [20, 245]), 2: regle([10, 99], [2, 9], [20, 891]) },
    CM1: { 1: regle([10, 99], [2, 9], [20, 891]), 2: regle([100, 999], [2, 9], [200, 8991]) },
    CM2: { 1: regle([100, 999], [2, 9], [200, 8991]), 2: regle([100, 999], [11, 99], [1100, 98_901]) },
  },
  // Un multiplicateur à deux chiffres a des dizaines et des unités non nulles : le décalage compte.
  estValide: ({ b }) => b < 10 || b % 10 !== 0,
  calculer: ({ a, b }) => a * b,
  erreursTypiques: ({ a, b }) =>
    b >= 10
      ? [
          { valeur: a * (b % 10) + a * Math.floor(b / 10), erreur: 'décalage oublié pour les dizaines' },
          { valeur: a * (b % 10), erreur: 'seulement les unités du multiplicateur' },
          { valeur: a * b + a * 10, erreur: 'une dizaine de trop dans le multiplicateur' },
          { valeur: a * b - a * 10, erreur: 'une dizaine de moins dans le multiplicateur' },
        ]
      : [
          { valeur: multiplicationSansRetenue(a, b), erreur: 'retenues oubliées' },
          { valeur: a * b + a, erreur: 'une fois de trop' },
          { valeur: a * b - a, erreur: 'une fois de moins' },
          { valeur: a + b, erreur: 'addition au lieu de multiplication' },
        ],
  histoires: [
    ({ a, b }, r) => ({
      enonce: `${nb(a)}\u00a0×\u00a0${nb(b)}`,
      question: 'Pose l’opération et calcule.',
      indice:
        b >= 10
          ? `Multiplie ${nb(a)} par les unités de ${nb(b)}, puis par les dizaines en décalant d’un rang, et ajoute les deux lignes.`
          : `Multiplie chaque chiffre de ${nb(a)} par ${nb(b)}, en commençant par les unités, et n’oublie pas les retenues.`,
      explication:
        b >= 10
          ? `${nb(a)}\u00a0×\u00a0${b % 10}\u00a0=\u00a0${nb(a * (b % 10))} et ${nb(a)}\u00a0×\u00a0${nb(Math.floor(b / 10) * 10)}\u00a0=\u00a0${nb(a * Math.floor(b / 10) * 10)}. ${nb(a * (b % 10))}\u00a0+\u00a0${nb(a * Math.floor(b / 10) * 10)}\u00a0=\u00a0${nb(r)}.`
          : `Chiffre par chiffre, de droite à gauche, avec les retenues\u00a0: ${nb(a)}\u00a0×\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}.`,
      facile: {
        enonce: `${nb(a)}\u00a0×\u00a0${nb(b)}`,
        question: 'Pose et calcule.',
        indice:
          b >= 10
            ? 'Fais une ligne pour les unités. Puis une ligne décalée pour les dizaines.'
            : 'Commence par les unités. Pense aux retenues.',
        explication: `${nb(a)}\u00a0×\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}.`,
      },
    }),
  ],
});

// --- Fractions d'une quantité (CE2) ---

const NOMS_PARTS: Record<number, [string, string]> = {
  2: ['la moitié', 'demi'],
  3: ['le tiers', 'tiers'],
  4: ['le quart', 'quarts'],
  5: ['le cinquième', 'cinquièmes'],
  10: ['le dixième', 'dixièmes'],
};

type Fraction = { numerateur: number; denominateur: number; total: number };
const regleFraction = (
  num: [number, number],
  den: [number, number],
  total: [number, number],
): ReglesClasse<Fraction> => ({
  donnees: {
    numerateur: { min: num[0], max: num[1] },
    denominateur: { min: den[0], max: den[1] },
    total: { min: total[0], max: total[1] },
  },
  reponse: { min: 1, max: total[1] },
});

export const fractionDe = definirModele<Fraction>({
  id: 'fraction-de',
  titre: 'Une part d’une quantité',
  domaine: 'fractions',
  competence:
    'Prendre une fraction simple d’une quantité (la moitié, le tiers, le quart…), en partageant en parts égales.',
  operations: ['÷'],
  regles: { CE2: regleFraction([1, 4], [2, 10], [4, 100]) },
  reglesAccessibles: {
    // + : la moitié, le tiers, le quart ; ++ : une part, jusqu'au dixième.
    CE2: { 1: regleFraction([1, 1], [2, 4], [4, 40]), 2: regleFraction([1, 1], [2, 10], [4, 100]) },
  },
  // Les parts aux noms connus, une quantité qui se partage juste, moins de parts prises que de parts.
  tirer: (alea, regles) => {
    const dens = [2, 3, 4, 5, 10].filter(
      (d) => d >= regles.donnees.denominateur.min && d <= regles.donnees.denominateur.max,
    );
    const denominateur = alea.choix(dens);
    const numerateur = alea.entier(
      regles.donnees.numerateur.min,
      Math.min(regles.donnees.numerateur.max, denominateur - 1),
    );
    const kMax = Math.floor(regles.donnees.total.max / denominateur);
    const kMin = Math.max(2, Math.ceil(regles.donnees.total.min / denominateur));
    return { numerateur, denominateur, total: denominateur * alea.entier(kMin, Math.max(kMin, kMax)) };
  },
  estValide: ({ numerateur, denominateur, total }) => numerateur < denominateur && total % denominateur === 0,
  calculer: ({ numerateur, denominateur, total }) => (total / denominateur) * numerateur,
  erreursTypiques: ({ numerateur: n, denominateur: d, total: t }) => [
    { valeur: t - (t / d) * n, erreur: 'la part qui reste au lieu de la part prise' },
    { valeur: t / d, erreur: 'une seule part au lieu de plusieurs' },
    { valeur: t - d, erreur: 'soustraction au lieu d’un partage' },
    { valeur: t * d, erreur: 'multiplication au lieu d’un partage' },
  ],
  histoires: [
    ({ numerateur: n, denominateur: d, total: t }, r) => {
      const part = n === 1 ? NOMS_PARTS[d][0] : `${n} ${NOMS_PARTS[d][1]}`;
      return {
        enonce: `Capy a ${t} fraises. Il en donne ${part} (${n}/${d}) à Lina.`,
        question: 'Combien de fraises Capy donne-t-il à Lina\u00a0?',
        indice: `Partage les ${t} fraises en ${d} parts égales${n > 1 ? `, puis prends ${n} parts` : ''}.`,
        explication: `${t} partagé en ${d} parts égales\u00a0: ${t}\u00a0÷\u00a0${d}\u00a0=\u00a0${t / d}.${n > 1 ? ` ${n} parts\u00a0: ${n}\u00a0×\u00a0${t / d}\u00a0=\u00a0${nb(r)}.` : ''} Capy donne ${nb(r)} fraises.`,
        facile: {
          enonce: `Capy a ${t} fraises. Il donne ${part} (${n}/${d}) à Lina.`,
          question: 'Combien de fraises pour Lina\u00a0?',
          indice: `Fais ${d} parts égales.${n > 1 ? ` Prends ${n} parts.` : ''}`,
          explication: `${t}\u00a0÷\u00a0${d}\u00a0=\u00a0${t / d}.${n > 1 ? ` ${n}\u00a0×\u00a0${t / d}\u00a0=\u00a0${nb(r)}.` : ''} Lina a ${nb(r)} fraises.`,
        },
      };
    },
  ],
});
