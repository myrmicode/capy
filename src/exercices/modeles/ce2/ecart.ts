/**
 * Compétence visée : résoudre des problèmes de comparaison en une étape
 * (« combien de plus / de moins », recherche d'un écart par soustraction).
 * Nombres jusqu'à 1 000. Attendus de fin de cycle 2 (CE2).
 */
import { soustractionPetitDuGrand } from '../../erreurs';
import { definirModele, nb } from '../../moteur';

export const ecart = definirModele<{ grand: number; petit: number }>({
  id: 'ecart',
  titre: 'Combien de plus ?',
  domaine: 'resoudre-problemes',
  competence: 'Résoudre un problème de comparaison (« de plus », « de moins »), nombres jusqu’à 1 000.',
  operations: ['−'],
  regles: {
    CE2: {
      donnees: { grand: { min: 30, max: 999 }, petit: { min: 10, max: 989 } },
      reponse: { min: 2, max: 989 },
    },
  },
  reglesAccessibles: {
    CE2: {
      // + : nombres inférieurs à 100.
      1: { donnees: { grand: { min: 15, max: 99 }, petit: { min: 5, max: 90 } }, reponse: { min: 2, max: 94 } },
      // ++ : nombres jusqu'à 500.
      2: { donnees: { grand: { min: 30, max: 500 }, petit: { min: 10, max: 490 } }, reponse: { min: 2, max: 490 } },
    },
  },
  estValide: ({ grand, petit }) => grand > petit,
  calculer: ({ grand, petit }) => grand - petit,
  erreursTypiques: ({ grand: a, petit: b }) => [
    { valeur: a + b, erreur: 'addition des deux quantités au lieu de l’écart' },
    { valeur: soustractionPetitDuGrand(a, b), erreur: 'dans chaque colonne, le plus petit chiffre ôté du plus grand' },
    { valeur: a - b + 10, erreur: 'retenue oubliée' },
    { valeur: a - b - 10, erreur: 'erreur de dizaine' },
  ],
  histoires: [
    ({ grand: a, petit: b }, r) => ({
      enonce: `Capy a cueilli ${nb(a)} pommes. Son ami Noé en a cueilli ${nb(b)}.`,
      question: 'Combien de pommes Capy a-t-il cueillies de plus que Noé ?',
      autresQuestions: ['Combien de pommes reste-t-il sur l’arbre ?', 'Combien pèse une pomme ?'],
      indice: 'Imagine les deux tas de pommes côte à côte. Combien de pommes dépassent dans le tas de Capy ?',
      explication: `L’écart se trouve par une soustraction : ${nb(a)} − ${nb(b)} = ${nb(r)}. Capy a cueilli ${nb(r)} pommes de plus que Noé.`,
      facile: {
        enonce: `Capy a ${nb(a)} pommes. Noé a ${nb(b)} pommes.`,
        question: 'Combien de pommes Capy a-t-il en plus ?',
        indice: 'Mets les deux tas côte à côte. Compte ce qui dépasse.',
        explication: `${nb(a)} − ${nb(b)} = ${nb(r)}. Capy a ${nb(r)} pommes de plus.`,
      },
    }),
    ({ grand: a, petit: b }, r) => ({
      enonce: `Le grand chêne mesure ${nb(a)} cm. Le petit sapin mesure ${nb(b)} cm.`,
      question: 'De combien de centimètres le chêne est-il plus haut que le sapin ?',
      autresQuestions: ['Quel âge a le grand chêne ?', 'Combien de feuilles a le petit sapin ?'],
      indice: 'On ne cherche pas la hauteur des deux arbres empilés, mais la différence entre les deux.',
      explication: `${nb(a)} − ${nb(b)} = ${nb(r)}. Le chêne est plus haut de ${nb(r)} cm.`,
      facile: {
        enonce: `Le chêne mesure ${nb(a)} cm. Le sapin mesure ${nb(b)} cm.`,
        question: 'Le chêne est plus haut de combien de centimètres ?',
        indice: 'Cherche la différence. Il faut soustraire.',
        explication: `${nb(a)} − ${nb(b)} = ${nb(r)}. Le chêne a ${nb(r)} cm de plus.`,
      },
    }),
    ({ grand: a, petit: b }, r) => ({
      enonce: `Lina a ${nb(a)} autocollants. Capy en a ${nb(b)}.`,
      question: 'Combien d’autocollants Capy a-t-il de moins que Lina ?',
      autresQuestions: ['Combien d’autocollants Lina a-t-elle achetés ce matin ?', 'Combien coûte un autocollant ?'],
      indice: 'Combien d’autocollants manque-t-il à Capy pour en avoir autant que Lina ?',
      explication: `Il manque ${nb(a)} − ${nb(b)} = ${nb(r)} autocollants à Capy. Tu peux vérifier : ${nb(b)} + ${nb(r)} = ${nb(a)}.`,
      facile: {
        enonce: `Lina a ${nb(a)} autocollants. Capy a ${nb(b)} autocollants.`,
        question: 'Combien d’autocollants Capy a-t-il en moins ?',
        indice: 'Combien en manque-t-il à Capy pour en avoir autant ?',
        explication: `${nb(a)} − ${nb(b)} = ${nb(r)}. Capy a ${nb(r)} autocollants de moins.`,
      },
    }),
  ],
});
