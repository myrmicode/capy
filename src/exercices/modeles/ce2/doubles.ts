/**
 * Compétence visée : calculer mentalement le double d'un nombre à deux chiffres
 * (en doublant les dizaines puis les unités). Attendus de fin de cycle 2 (CE2).
 */
import { additionSansRetenue } from '../../erreurs';
import { definirModele, nb } from '../../moteur';

export const doubles = definirModele<{ nombre: number }>({
  id: 'doubles',
  titre: 'Le double',
  domaine: 'calcul-mental',
  competence: 'Calculer mentalement le double d’un nombre inférieur à 50.',
  operations: ['×'],
  regles: {
    CE2: {
      donnees: { nombre: { min: 11, max: 49 } },
      reponse: { min: 22, max: 98 },
    },
  },
  reglesAccessibles: {
    CE2: {
      // + : doubles jusqu'à 25.
      1: { donnees: { nombre: { min: 5, max: 25 } }, reponse: { min: 10, max: 50 } },
      // ++ : doubles jusqu'à 35.
      2: { donnees: { nombre: { min: 11, max: 35 } }, reponse: { min: 22, max: 70 } },
    },
  },
  calculer: ({ nombre }) => 2 * nombre,
  erreursTypiques: ({ nombre: n }) => [
    { valeur: additionSansRetenue(n, n), erreur: 'retenue oubliée en doublant les unités' },
    { valeur: n + 2, erreur: 'ajout de 2 au lieu de doubler' },
    { valeur: 2 * n + 10, erreur: 'erreur de dizaine' },
    { valeur: 2 * n - 10, erreur: 'erreur de dizaine' },
  ],
  histoires: [
    ({ nombre: n }, r) => ({
      enonce: `Le double de ${nb(n)}`,
      question: 'Combien ça fait ?',
      indice: 'Double d’abord les dizaines, puis les unités, et ajoute les deux.',
      explication: `Le double de ${nb(n)}, c’est ${nb(n)} + ${nb(n)} = ${nb(r)}.`,
    }),
    ({ nombre: n }, r) => ({
      enonce: `${nb(n)} + ${nb(n)}`,
      question: 'Combien ça fait ?',
      indice: 'Ajouter un nombre à lui-même, c’est chercher son double.',
      explication: `${nb(n)} + ${nb(n)} = ${nb(r)} : c’est le double de ${nb(n)}.`,
    }),
  ],
});
