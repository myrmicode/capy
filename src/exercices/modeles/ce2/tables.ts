/**
 * Compétence visée : connaître les tables de multiplication de 2 à 9 et
 * retrouver rapidement un produit. Calcul mental. Attendus de fin de cycle 2 (CE2).
 */
import { definirModele, nb } from '../../moteur';

export const tables = definirModele<{ a: number; b: number }>({
  id: 'tables',
  titre: 'Les tables',
  domaine: 'calcul-mental',
  competence: 'Mémoriser les tables de multiplication de 2 à 9.',
  operations: ['×'],
  regles: {
    CE2: {
      donnees: { a: { min: 2, max: 9 }, b: { min: 2, max: 9 } },
      reponse: { min: 6, max: 81 },
    },
  },
  reglesAccessibles: {
    CE2: {
      // + : tables de 2 à 5.
      1: { donnees: { a: { min: 2, max: 5 }, b: { min: 2, max: 5 } }, reponse: { min: 6, max: 25 } },
      // ++ : toutes les tables, multipliées par 2 à 5.
      2: { donnees: { a: { min: 2, max: 9 }, b: { min: 2, max: 5 } }, reponse: { min: 6, max: 45 } },
    },
  },
  // 2 × 2 = 2 + 2 : on ne distinguerait pas l'addition de la multiplication.
  estValide: ({ a, b }) => a * b !== a + b,
  calculer: ({ a, b }) => a * b,
  erreursTypiques: ({ a, b }) => [
    { valeur: a * b + a, erreur: 'résultat voisin dans la table (une fois de trop)' },
    { valeur: a * b - a, erreur: 'résultat voisin dans la table (une fois de moins)' },
    { valeur: a + b, erreur: 'addition au lieu de multiplication' },
    { valeur: a * b + b, erreur: 'confusion avec la table voisine' },
  ],
  histoires: [
    ({ a, b }, r) => ({
      enonce: `${nb(a)} × ${nb(b)}`,
      question: 'Combien ça fait ?',
      indice: `Récite la table de ${nb(a)} dans ta tête, ou compte ${nb(b)} paquets de ${nb(a)}.`,
      explication: `${nb(a)} × ${nb(b)} = ${nb(r)}. C’est la table de ${nb(a)}.`,
      facile: {
        enonce: `${nb(a)} × ${nb(b)}`,
        question: 'Combien ça fait ?',
        indice: `Dis la table de ${nb(a)} dans ta tête.`,
        explication: `${nb(a)} × ${nb(b)} = ${nb(r)}.`,
      },
    }),
    ({ a, b }, r) => ({
      enonce: `${nb(a)} fois ${nb(b)}`,
      question: 'Combien ça fait ?',
      indice: `${nb(a)} fois ${nb(b)}, c’est la même chose que ${nb(b)} fois ${nb(a)}. Choisis la table que tu connais le mieux.`,
      explication: `${nb(a)} fois ${nb(b)}, c’est ${nb(a)} × ${nb(b)} = ${nb(r)}.`,
      facile: {
        enonce: `${nb(a)} fois ${nb(b)}`,
        question: 'Combien ça fait ?',
        indice: `Tu peux aussi faire ${nb(b)} fois ${nb(a)}. Choisis la table la plus facile.`,
        explication: `${nb(a)} fois ${nb(b)} = ${nb(r)}.`,
      },
    }),
  ],
});
