/**
 * Compétence visée : résoudre des problèmes additifs en une étape
 * (transformation négative : « on en enlève », recherche de l'état final).
 * Soustraction posée ou en ligne avec ou sans retenue, nombres jusqu'à 1 000.
 * Attendus de fin de cycle 2 (CE2).
 */
import { soustractionPetitDuGrand } from '../../erreurs';
import { definirModele, nb } from '../../moteur';

export const retrait = definirModele<{ depart: number; retrait: number }>({
  id: 'retrait',
  titre: 'On en enlève',
  domaine: 'resoudre-problemes',
  competence: 'Résoudre un problème de soustraction en une étape (recherche du reste), nombres jusqu’à 1 000.',
  operations: ['−'],
  regles: {
    CE2: {
      donnees: { depart: { min: 100, max: 999 }, retrait: { min: 10, max: 899 } },
      reponse: { min: 10, max: 989 },
    },
  },
  reglesAccessibles: {
    CE2: {
      // + : nombres inférieurs à 100.
      1: { donnees: { depart: { min: 20, max: 99 }, retrait: { min: 5, max: 50 } }, reponse: { min: 5, max: 94 } },
      // ++ : nombres jusqu'à 500.
      2: { donnees: { depart: { min: 100, max: 500 }, retrait: { min: 10, max: 300 } }, reponse: { min: 10, max: 490 } },
    },
  },
  estValide: ({ depart, retrait: b }) => b < depart,
  calculer: ({ depart, retrait: b }) => depart - b,
  erreursTypiques: ({ depart: a, retrait: b }) => [
    { valeur: soustractionPetitDuGrand(a, b), erreur: 'dans chaque colonne, le plus petit chiffre ôté du plus grand' },
    { valeur: a + b, erreur: 'addition au lieu de soustraction' },
    { valeur: a - b + 10, erreur: 'retenue oubliée' },
    { valeur: a - b - 10, erreur: 'erreur de dizaine' },
  ],
  histoires: [
    ({ depart: a, retrait: b }, r) => ({
      enonce: `Dans la bibliothèque, il y a ${nb(a)} livres sur les étagères. Capy en range ${nb(b)} dans des cartons.`,
      question: 'Combien de livres reste-t-il sur les étagères ?',
      autresQuestions: ['Combien de cartons Capy a-t-il remplis ?', 'Combien de pages a chaque livre ?'],
      indice: `Au début, il y a ${nb(a)} livres. Si on en enlève, en reste-t-il plus ou moins ?`,
      explication: `On enlève les livres rangés : ${nb(a)} − ${nb(b)} = ${nb(r)}. Il reste ${nb(r)} livres sur les étagères.`,
    }),
    ({ depart: a, retrait: b }, r) => ({
      enonce: `Capy a ${nb(a)} graines de tournesol. Il en plante ${nb(b)}.`,
      question: 'Combien de graines lui reste-t-il ?',
      autresQuestions: ['Combien de graines Capy plantera-t-il demain ?', 'Combien coûte le sachet de graines ?'],
      indice: 'Les graines plantées ne sont plus dans le sachet. Quelle opération permet de trouver ce qui reste ?',
      explication: `Il reste ${nb(a)} − ${nb(b)} = ${nb(r)} graines. Tu peux vérifier : ${nb(r)} + ${nb(b)} = ${nb(a)}.`,
    }),
    ({ depart: a, retrait: b }, r) => ({
      enonce: `Un train transporte ${nb(a)} voyageurs. À la gare, ${nb(b)} voyageurs descendent.`,
      question: 'Combien de voyageurs reste-t-il dans le train ?',
      autresQuestions: ['Combien de voyageurs montent à la gare ?', 'À quelle heure le train arrive-t-il ?'],
      indice: 'Des voyageurs descendent : le train en transporte moins. Pense à la soustraction.',
      explication: `${nb(a)} − ${nb(b)} = ${nb(r)}. Il reste ${nb(r)} voyageurs dans le train.`,
    }),
  ],
});
