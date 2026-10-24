/**
 * Compétence visée : résoudre des problèmes additifs en une étape
 * (réunion de deux quantités ou transformation positive : « on en ajoute »).
 * Addition posée ou en ligne avec ou sans retenue, nombres jusqu'à 1 000.
 * Attendus de fin de cycle 2 (CE2).
 */
import { additionSansRetenue } from '../../erreurs';
import { definirModele, nb } from '../../moteur';

export const ajout = definirModele<{ depart: number; ajout: number }>({
  id: 'ajout',
  titre: 'On en ajoute',
  domaine: 'resoudre-problemes',
  competence: 'Résoudre un problème additif en une étape (réunion ou ajout), nombres jusqu’à 1 000.',
  operations: ['+'],
  regles: {
    CE2: {
      donnees: { depart: { min: 20, max: 600 }, ajout: { min: 10, max: 399 } },
      reponse: { min: 30, max: 999 },
    },
  },
  reglesAccessibles: {
    CE2: {
      // + : nombres inférieurs à 100.
      1: { donnees: { depart: { min: 10, max: 79 }, ajout: { min: 5, max: 20 } }, reponse: { min: 15, max: 99 } },
      // ++ : nombres jusqu'à 600.
      2: { donnees: { depart: { min: 20, max: 400 }, ajout: { min: 10, max: 199 } }, reponse: { min: 30, max: 599 } },
    },
  },
  calculer: ({ depart, ajout: b }) => depart + b,
  erreursTypiques: ({ depart: a, ajout: b }) => [
    { valeur: additionSansRetenue(a, b), erreur: 'retenue oubliée' },
    { valeur: a - b, erreur: 'soustraction au lieu d’addition' },
    { valeur: a + b - 10, erreur: 'erreur de dizaine' },
    { valeur: a + b + 10, erreur: 'retenue comptée deux fois' },
  ],
  histoires: [
    ({ depart: a, ajout: b }, r) => ({
      enonce: `Capy a ${nb(a)} billes. Son amie Lina lui en donne ${nb(b)}.`,
      question: 'Combien de billes Capy a-t-il maintenant ?',
      autresQuestions: ['Combien de billes Lina avait-elle au départ ?', 'De quelle couleur sont les billes ?'],
      indice: 'Capy reçoit des billes : en a-t-il plus ou moins qu’avant ? Faut-il ajouter ou enlever ?',
      explication: `Capy avait ${nb(a)} billes et en reçoit ${nb(b)}. On ajoute : ${nb(a)} + ${nb(b)} = ${nb(r)}. Capy a maintenant ${nb(r)} billes.`,
      facile: {
        enonce: `Capy a ${nb(a)} billes. Lina lui donne ${nb(b)} billes.`,
        question: 'Combien de billes a Capy maintenant ?',
        indice: 'Capy reçoit des billes. Il en a plus. Il faut ajouter.',
        explication: `${nb(a)} + ${nb(b)} = ${nb(r)}. Capy a ${nb(r)} billes.`,
      },
    }),
    ({ depart: a, ajout: b }, r) => ({
      enonce: `La bibliothèque de l’école a ${nb(a)} livres. Ce matin, on lui livre ${nb(b)} livres neufs.`,
      question: 'Combien de livres la bibliothèque a-t-elle maintenant ?',
      autresQuestions: ['Combien de livres sont prêtés aujourd’hui ?', 'Combien de pages a le plus gros livre ?'],
      indice: 'Les livres neufs s’ajoutent à ceux qui étaient déjà là. Quelle opération faut-il faire ?',
      explication: `On réunit les livres : ${nb(a)} + ${nb(b)} = ${nb(r)}. La bibliothèque a ${nb(r)} livres.`,
      facile: {
        enonce: `La bibliothèque a ${nb(a)} livres. On apporte ${nb(b)} livres neufs.`,
        question: 'Combien de livres a la bibliothèque maintenant ?',
        indice: 'Des livres arrivent. Il y en a plus. Il faut ajouter.',
        explication: `${nb(a)} + ${nb(b)} = ${nb(r)}. La bibliothèque a ${nb(r)} livres.`,
      },
    }),
    ({ depart: a, ajout: b }, r) => ({
      enonce: `Capy fait ${nb(a)} pas pour aller au parc, puis ${nb(b)} pas pour aller jusqu’à la rivière.`,
      question: 'Combien de pas Capy a-t-il faits en tout ?',
      autresQuestions: ['Combien de temps Capy a-t-il marché ?', 'Combien de pas fait Capy pour rentrer chez lui ?'],
      indice: 'On cherche le nombre total de pas. Pense à bien aligner les unités, les dizaines et les centaines.',
      explication: `En tout : ${nb(a)} + ${nb(b)} = ${nb(r)}. Capy a fait ${nb(r)} pas.`,
      facile: {
        enonce: `Capy fait ${nb(a)} pas. Puis il fait ${nb(b)} pas.`,
        question: 'Combien de pas fait Capy en tout ?',
        indice: 'En tout veut dire : tous les pas ensemble. Il faut ajouter.',
        explication: `${nb(a)} + ${nb(b)} = ${nb(r)}. Capy fait ${nb(r)} pas.`,
      },
    }),
  ],
});
