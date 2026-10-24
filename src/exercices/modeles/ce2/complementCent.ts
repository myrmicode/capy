/**
 * Compétence visée : trouver mentalement le complément d'un nombre à 100
 * (en passant par la dizaine supérieure). Attendus de fin de cycle 2 (CE2).
 */
import { definirModele, nb } from '../../moteur';

/** Erreur fréquente : compléter chaque chiffre à 10 (37 → 73 au lieu de 63). */
function complementChiffreAChiffre(n: number): number {
  const d = Math.floor(n / 10);
  const u = n % 10;
  return (10 - d) * 10 + (u === 0 ? 0 : 10 - u);
}

export const complementCent = definirModele<{ depart: number }>({
  id: 'complement-cent',
  titre: 'Aller jusqu’à 100',
  domaine: 'calcul-mental',
  competence: 'Trouver le complément d’un nombre à 100.',
  operations: ['−'],
  regles: {
    CE2: {
      donnees: { depart: { min: 11, max: 89 } },
      reponse: { min: 11, max: 89 },
    },
  },
  reglesAccessibles: {
    CE2: {
      1: { donnees: { depart: { min: 20, max: 80 } }, reponse: { min: 20, max: 80 } },
      2: { donnees: { depart: { min: 15, max: 85 } }, reponse: { min: 15, max: 85 } },
    },
  },
  // + : dizaines entières (30 + ? = 100) ; ++ : de 5 en 5 (35 + ? = 100) ; +++ : tout nombre.
  tirer: (alea, regles, niveau) => {
    const pas = niveau === 1 ? 10 : niveau === 2 ? 5 : 1;
    const { min, max } = regles.donnees.depart;
    return { depart: pas * alea.entier(Math.ceil(min / pas), Math.floor(max / pas)) };
  },
  calculer: ({ depart }) => 100 - depart,
  erreursTypiques: ({ depart: n }) => [
    { valeur: complementChiffreAChiffre(n), erreur: 'chaque chiffre complété à 10' },
    { valeur: 100 - n + 10, erreur: 'une dizaine de trop' },
    { valeur: 100 - n - 10, erreur: 'une dizaine de moins' },
    { valeur: 100 - n + 1, erreur: 'erreur d’une unité' },
  ],
  histoires: [
    ({ depart: n }, r) => ({
      enonce: `${nb(n)} + ? = 100`,
      question: 'Quel nombre manque ?',
      indice: 'Avance d’abord jusqu’à la dizaine suivante, puis compte les dizaines jusqu’à cent.',
      explication: `${nb(n)} + ${nb(r)} = 100. On peut vérifier : 100 − ${nb(n)} = ${nb(r)}.`,
    }),
    ({ depart: n }, r) => ({
      enonce: `Capy a déjà ${nb(n)} billes. Il en veut 100.`,
      question: 'Combien lui en manque-t-il ?',
      indice: 'Compte de son nombre de billes jusqu’à cent : d’abord jusqu’à la dizaine suivante, puis de dix en dix.',
      explication: `Il lui manque ${nb(r)} billes, car ${nb(n)} + ${nb(r)} = 100.`,
    }),
  ],
});
