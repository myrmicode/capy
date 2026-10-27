/**
 * Compétence visée : connaître les tables de multiplication et retrouver
 * rapidement un produit. Calcul mental.
 * - CE1 : tables de 2 à 5 ; CE2 : tables de 2 à 9 (attendus de fin de cycle 2) ;
 * - CM1 et CM2 : axe « Connaître les tables de multiplication », jusqu'à 10 × 10 en CM2.
 */
import type { DomaineId } from '@/config/domaines';

import { definirModele, nb } from '../../moteur';
import type { DefinitionModele } from '../../types';

type DonneesTable = { a: number; b: number };

function table(
  id: string,
  titre: string,
  domaine: DomaineId,
  competence: string,
  regles: Pick<DefinitionModele<DonneesTable>, 'regles' | 'reglesAccessibles'>,
) {
  return definirModele<DonneesTable>({
    id,
    titre,
    domaine,
    competence,
    operations: ['×'],
    ...regles,
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
}

export const tables = table(
  'tables',
  'Les tables',
  'calcul-mental',
  'Mémoriser les tables de multiplication (de 2 à 5 en CE1, de 2 à 9 en CE2).',
  {
    regles: {
      CE2: {
        donnees: { a: { min: 2, max: 9 }, b: { min: 2, max: 9 } },
        reponse: { min: 6, max: 81 },
      },
      CE1: { donnees: { a: { min: 2, max: 5 }, b: { min: 2, max: 9 } }, reponse: { min: 6, max: 45 } },
    },
    reglesAccessibles: {
      CE2: {
        // + : tables de 2 à 5.
        1: { donnees: { a: { min: 2, max: 5 }, b: { min: 2, max: 5 } }, reponse: { min: 6, max: 25 } },
        // ++ : toutes les tables, multipliées par 2 à 5.
        2: { donnees: { a: { min: 2, max: 9 }, b: { min: 2, max: 5 } }, reponse: { min: 6, max: 45 } },
      },
      CE1: {
        // + : la table de 2 ; ++ : de 2 à 5, petits nombres ; +++ : tables de 2 à 5.
        1: { donnees: { a: { min: 2, max: 2 }, b: { min: 2, max: 9 } }, reponse: { min: 6, max: 18 } },
        2: { donnees: { a: { min: 2, max: 5 }, b: { min: 2, max: 5 } }, reponse: { min: 6, max: 25 } },
      },
    },
  },
);

export const tablesMultiplication = table(
  'tables-multiplication',
  'Les tables de multiplication',
  'tables-multiplication',
  'Connaître les tables de multiplication de 2 à 9 (CM1), jusqu’à 10 × 10 (CM2), et retrouver vite un produit.',
  {
    regles: {
      CM1: { donnees: { a: { min: 2, max: 9 }, b: { min: 2, max: 9 } }, reponse: { min: 6, max: 81 } },
      CM2: { donnees: { a: { min: 2, max: 10 }, b: { min: 2, max: 10 } }, reponse: { min: 6, max: 100 } },
    },
    reglesAccessibles: {
      CM1: {
        // + : tables de 2 à 5 ; ++ : toutes les tables, multipliées par 2 à 5.
        1: { donnees: { a: { min: 2, max: 5 }, b: { min: 2, max: 5 } }, reponse: { min: 6, max: 25 } },
        2: { donnees: { a: { min: 2, max: 9 }, b: { min: 2, max: 5 } }, reponse: { min: 6, max: 45 } },
      },
      CM2: {
        // + : toutes les tables, multipliées par 2 à 5 ; ++ : tables de 2 à 9.
        1: { donnees: { a: { min: 2, max: 9 }, b: { min: 2, max: 5 } }, reponse: { min: 6, max: 45 } },
        2: { donnees: { a: { min: 2, max: 9 }, b: { min: 2, max: 9 } }, reponse: { min: 6, max: 81 } },
      },
    },
  },
);
