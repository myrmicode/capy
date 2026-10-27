/**
 * Compétence visée : connaître les tables d'addition (sommes de deux nombres
 * de 1 à 9) et retrouver vite une somme, en passant par 10 quand on dépasse la
 * dizaine. Axe « Connaître les tables d'addition » (CE1, CE2).
 */
import { definirModele, nb } from '../../moteur';

export const tablesAddition = definirModele<{ a: number; b: number }>({
  id: 'tables-addition',
  titre: 'Les tables d’addition',
  domaine: 'tables-addition',
  competence: 'Connaître les tables d’addition (deux nombres de 1 à 9)\u00a0; passer par 10 au-delà de la dizaine.',
  operations: ['+'],
  regles: {
    CE1: { donnees: { a: { min: 2, max: 9 }, b: { min: 2, max: 9 } }, reponse: { min: 4, max: 18 } },
    CE2: { donnees: { a: { min: 2, max: 9 }, b: { min: 2, max: 9 } }, reponse: { min: 11, max: 18 } },
  },
  reglesAccessibles: {
    CE1: {
      // + : sommes jusqu'à 10 ; ++ : jusqu'à 10, avec des nombres jusqu'à 9.
      1: { donnees: { a: { min: 1, max: 5 }, b: { min: 1, max: 5 } }, reponse: { min: 2, max: 10 } },
      2: { donnees: { a: { min: 1, max: 9 }, b: { min: 1, max: 9 } }, reponse: { min: 2, max: 10 } },
    },
    CE2: {
      // + : sommes jusqu'à 10 ; ++ : toutes les sommes ; +++ : celles qui passent la dizaine.
      1: { donnees: { a: { min: 1, max: 9 }, b: { min: 1, max: 9 } }, reponse: { min: 2, max: 10 } },
      2: { donnees: { a: { min: 2, max: 9 }, b: { min: 2, max: 9 } }, reponse: { min: 4, max: 18 } },
    },
  },
  calculer: ({ a, b }) => a + b,
  erreursTypiques: ({ a, b }) => [
    { valeur: a + b - 1, erreur: 'erreur de comptage (le nombre de départ compté deux fois)' },
    { valeur: a + b + 1, erreur: 'erreur de comptage (un pas de trop)' },
    { valeur: a * b, erreur: 'multiplication au lieu d’addition' },
    { valeur: a + b - 10, erreur: 'dizaine oubliée' },
  ],
  histoires: [
    ({ a, b }, r) => {
      const grand = Math.max(a, b);
      const petit = Math.min(a, b);
      const versDix = 10 - grand;
      const passeDix = r > 10;
      return {
        enonce: `${nb(a)}\u00a0+\u00a0${nb(b)}`,
        question: 'Combien ça fait\u00a0?',
        indice: passeDix
          ? `Passe par la dizaine\u00a0: combien faut-il ajouter à ${nb(grand)} pour arriver à la dizaine\u00a0? Ajoute ensuite ce qui reste.`
          : `Pars du plus grand nombre, ${nb(grand)}, et avance de ${nb(petit)}.`,
        explication: passeDix
          ? `${nb(grand)}\u00a0+\u00a0${nb(versDix)}\u00a0=\u00a010, puis 10\u00a0+\u00a0${nb(petit - versDix)}\u00a0=\u00a0${nb(r)}. Donc ${nb(a)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}.`
          : `${nb(a)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}.`,
        facile: {
          enonce: `${nb(a)}\u00a0+\u00a0${nb(b)}`,
          question: 'Combien ça fait\u00a0?',
          indice: passeDix
            ? `Va d’abord jusqu’à la dizaine. Puis ajoute le reste.`
            : `Pars de ${nb(grand)}. Avance de ${nb(petit)}.`,
          explication: passeDix
            ? `${nb(grand)}\u00a0+\u00a0${nb(versDix)}\u00a0=\u00a010. 10\u00a0+\u00a0${nb(petit - versDix)}\u00a0=\u00a0${nb(r)}.`
            : `${nb(a)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}.`,
        },
      };
    },
    ({ a, b }, r) => ({
      enonce: `${nb(a)} plus ${nb(b)}`,
      question: 'Combien ça fait\u00a0?',
      indice: `${nb(a)} plus ${nb(b)}, c’est pareil que ${nb(b)} plus ${nb(a)}. Commence par le plus grand.`,
      explication: `${nb(a)} plus ${nb(b)}, c’est ${nb(a)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}.`,
      facile: {
        enonce: `${nb(a)} plus ${nb(b)}`,
        question: 'Combien ça fait\u00a0?',
        indice: 'Commence par le plus grand nombre.',
        explication: `${nb(a)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}.`,
      },
    }),
  ],
});
