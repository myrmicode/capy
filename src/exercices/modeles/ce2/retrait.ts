/**
 * Compétence visée : résoudre des problèmes additifs en une étape
 * (transformation négative : « on en enlève », recherche de l'état final).
 * Soustraction posée ou en ligne avec ou sans retenue, nombres jusqu'à 1 000.
 * Attendus de fin de cycle 2 (CE2).
 */
import { soustractionPetitDuGrand } from '../../erreurs';
import { definirModele, nb } from '../../moteur';
import { HISTOIRES_RETRAIT_CM } from '../histoiresCM';

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
    CE1: { donnees: { depart: { min: 50, max: 500 }, retrait: { min: 10, max: 299 } }, reponse: { min: 10, max: 490 } },
    CM1: {
      donnees: { depart: { min: 1000, max: 9999 }, retrait: { min: 100, max: 7999 } },
      reponse: { min: 100, max: 9899 },
    },
    CM2: {
      donnees: { depart: { min: 10000, max: 99999 }, retrait: { min: 1000, max: 79999 } },
      reponse: { min: 1000, max: 98999 },
    },
    CP: { donnees: { depart: { min: 20, max: 90 }, retrait: { min: 5, max: 40 } }, reponse: { min: 5, max: 85 } },
  },
  reglesAccessibles: {
    CE2: {
      // + : nombres inférieurs à 100.
      1: { donnees: { depart: { min: 20, max: 99 }, retrait: { min: 5, max: 50 } }, reponse: { min: 5, max: 94 } },
      // ++ : nombres jusqu'à 500.
      2: {
        donnees: { depart: { min: 100, max: 500 }, retrait: { min: 10, max: 300 } },
        reponse: { min: 10, max: 490 },
      },
    },
    CE1: {
      1: { donnees: { depart: { min: 10, max: 39 }, retrait: { min: 2, max: 9 } }, reponse: { min: 3, max: 37 } },
      2: { donnees: { depart: { min: 20, max: 99 }, retrait: { min: 5, max: 50 } }, reponse: { min: 5, max: 94 } },
    },
    CM1: {
      1: {
        donnees: { depart: { min: 100, max: 999 }, retrait: { min: 10, max: 899 } },
        reponse: { min: 10, max: 989 },
      },
      2: {
        donnees: { depart: { min: 1000, max: 5000 }, retrait: { min: 100, max: 3000 } },
        reponse: { min: 100, max: 4900 },
      },
    },
    CM2: {
      1: {
        donnees: { depart: { min: 1000, max: 9999 }, retrait: { min: 100, max: 7999 } },
        reponse: { min: 100, max: 9899 },
      },
      2: {
        donnees: { depart: { min: 10000, max: 50000 }, retrait: { min: 1000, max: 30000 } },
        reponse: { min: 1000, max: 49000 },
      },
    },
    CP: {
      1: { donnees: { depart: { min: 5, max: 10 }, retrait: { min: 1, max: 4 } }, reponse: { min: 1, max: 9 } },
      2: { donnees: { depart: { min: 10, max: 20 }, retrait: { min: 2, max: 9 } }, reponse: { min: 2, max: 18 } },
    },
  },
  estValide: ({ depart, retrait: b }) => b < depart,
  calculer: ({ depart, retrait: b }) => depart - b,
  histoiresParClasse: { CM1: HISTOIRES_RETRAIT_CM, CM2: HISTOIRES_RETRAIT_CM },
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
      facile: {
        enonce: `Il y a ${nb(a)} livres sur les étagères. Capy enlève ${nb(b)} livres.`,
        question: 'Combien de livres restent sur les étagères ?',
        indice: 'Capy enlève des livres. Il en reste moins. Il faut soustraire.',
        explication: `${nb(a)} − ${nb(b)} = ${nb(r)}. Il reste ${nb(r)} livres.`,
      },
    }),
    ({ depart: a, retrait: b }, r) => ({
      enonce: `Capy a ${nb(a)} graines de tournesol. Il en plante ${nb(b)}.`,
      question: 'Combien de graines lui reste-t-il ?',
      autresQuestions: ['Combien de graines Capy plantera-t-il demain ?', 'Combien coûte le sachet de graines ?'],
      indice: 'Les graines plantées ne sont plus dans le sachet. Quelle opération permet de trouver ce qui reste ?',
      explication: `Il reste ${nb(a)} − ${nb(b)} = ${nb(r)} graines. Tu peux vérifier : ${nb(r)} + ${nb(b)} = ${nb(a)}.`,
      facile: {
        enonce: `Capy a ${nb(a)} graines. Il plante ${nb(b)} graines.`,
        question: 'Combien de graines lui reste-t-il ?',
        indice: 'Les graines plantées partent. Il en reste moins. Il faut soustraire.',
        explication: `${nb(a)} − ${nb(b)} = ${nb(r)}. Il reste ${nb(r)} graines.`,
      },
    }),
    ({ depart: a, retrait: b }, r) => ({
      enonce: `Un train transporte ${nb(a)} voyageurs. À la gare, ${nb(b)} voyageurs descendent.`,
      question: 'Combien de voyageurs reste-t-il dans le train ?',
      autresQuestions: ['Combien de voyageurs montent à la gare ?', 'À quelle heure le train arrive-t-il ?'],
      indice: 'Des voyageurs descendent : le train en transporte moins. Pense à la soustraction.',
      explication: `${nb(a)} − ${nb(b)} = ${nb(r)}. Il reste ${nb(r)} voyageurs dans le train.`,
      facile: {
        enonce: `Il y a ${nb(a)} voyageurs dans le train. À la gare, ${nb(b)} voyageurs descendent.`,
        question: 'Combien de voyageurs restent dans le train ?',
        indice: 'Des voyageurs descendent. Il en reste moins. Il faut soustraire.',
        explication: `${nb(a)} − ${nb(b)} = ${nb(r)}. Il reste ${nb(r)} voyageurs.`,
      },
    }),
  ],
});
