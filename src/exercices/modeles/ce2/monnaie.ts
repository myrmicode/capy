/**
 * Compétence visée : résoudre des problèmes de la vie courante avec la monnaie
 * (euros entiers) : calculer un prix total, calculer la monnaie rendue.
 * Grandeurs et mesures, attendus de fin de cycle 2 (CE2).
 */
import type { Alea } from '../../alea';
import { definirModele, nb } from '../../moteur';
import type { NiveauDifficulte, ReglesClasse } from '../../types';

const ARTICLES = [
  ['un cahier', 'une gomme'],
  ['un livre', 'un crayon'],
  ['une balle', 'un sifflet'],
  ['un pot de miel', 'une baguette'],
  ['un puzzle', 'une règle'],
] as const;

export const payer = definirModele<{ prixA: number; prixB: number }>({
  id: 'payer',
  titre: 'Payer ses achats',
  domaine: 'resoudre-problemes',
  competence: 'Calculer le prix de deux achats en euros (addition), et faire la somme avec des pièces et des billets.',
  operations: ['+'],
  regles: {
    CE2: { donnees: { prixA: { min: 5, max: 60 }, prixB: { min: 5, max: 40 } }, reponse: { min: 12, max: 100 } },
  },
  reglesAccessibles: {
    CE2: {
      // + : petits prix, total jusqu'à 15 €.
      1: { donnees: { prixA: { min: 1, max: 9 }, prixB: { min: 1, max: 6 } }, reponse: { min: 3, max: 15 } },
      // ++ : total jusqu'à 50 €.
      2: { donnees: { prixA: { min: 3, max: 30 }, prixB: { min: 2, max: 20 } }, reponse: { min: 8, max: 50 } },
    },
  },
  estValide: ({ prixA, prixB }) => prixA !== prixB,
  calculer: ({ prixA, prixB }) => prixA + prixB,
  erreursTypiques: ({ prixA: a, prixB: b }) => [
    { valeur: Math.abs(a - b), erreur: 'soustraction au lieu d’addition' },
    { valeur: a, erreur: 'un seul achat compté' },
    { valeur: b, erreur: 'un seul achat compté' },
    { valeur: a + b + 10, erreur: 'retenue ajoutée en trop' },
    { valeur: a + b - 10, erreur: 'retenue oubliée' },
  ],
  histoires: ARTICLES.slice(0, 3).map(
    ([articleA, articleB]) =>
      ({ prixA: a, prixB: b }: { prixA: number; prixB: number }, r: number) => ({
        enonce: `À la boutique, Capy achète ${articleA} à ${nb(a)}\u00a0€ et ${articleB} à ${nb(b)}\u00a0€.`,
        question: 'Combien d’euros doit-il payer en tout ?',
        autresQuestions: [
          'Combien d’euros a-t-il dans sa tirelire ?',
          'Combien d’articles y a-t-il dans la boutique ?',
        ],
        indice: 'Capy paie les deux achats. Faut-il ajouter ou enlever les deux prix ?',
        explication: `On ajoute les deux prix : ${nb(a)} + ${nb(b)} = ${nb(r)}. Capy paie ${nb(r)}\u00a0€.`,
        facile: {
          enonce: `Capy achète ${articleA} à ${nb(a)}\u00a0€. Il achète aussi ${articleB} à ${nb(b)}\u00a0€.`,
          question: 'Combien d’euros paie-t-il en tout ?',
          indice: 'Capy paie les deux. Il faut ajouter.',
          explication: `${nb(a)} + ${nb(b)} = ${nb(r)}. Capy paie ${nb(r)}\u00a0€.`,
        },
      }),
  ),
});

/** Billets avec lesquels on paie, du plus petit au plus grand. */
const BILLETS = [10, 20, 50, 100] as const;

function tirerRendu(alea: Alea, regles: ReglesClasse<{ billet: number; prix: number }>) {
  const billets = BILLETS.filter((b) => b >= regles.donnees.billet.min && b <= regles.donnees.billet.max);
  const billet = alea.choix(billets);
  const prix = alea.entier(regles.donnees.prix.min, Math.min(regles.donnees.prix.max, billet - 1));
  return { billet, prix };
}

export const rendreMonnaie = definirModele<{ billet: number; prix: number }>({
  id: 'rendre-monnaie',
  titre: 'Rendre la monnaie',
  domaine: 'resoudre-problemes',
  competence: 'Calculer la monnaie rendue quand on paie avec un billet (soustraction), en euros entiers.',
  operations: ['−'],
  regles: {
    CE2: { donnees: { billet: { min: 20, max: 100 }, prix: { min: 5, max: 95 } }, reponse: { min: 2, max: 95 } },
  },
  reglesAccessibles: {
    CE2: {
      // + : un billet de 10 €.
      1: { donnees: { billet: { min: 10, max: 10 }, prix: { min: 1, max: 9 } }, reponse: { min: 1, max: 9 } },
      // ++ : un billet de 10 € ou de 20 €.
      2: { donnees: { billet: { min: 10, max: 20 }, prix: { min: 2, max: 19 } }, reponse: { min: 1, max: 18 } },
    },
  },
  tirer: (alea: Alea, regles: ReglesClasse<{ billet: number; prix: number }>, _niveau: NiveauDifficulte) =>
    tirerRendu(alea, regles),
  estValide: ({ billet, prix }) => prix < billet,
  calculer: ({ billet, prix }) => billet - prix,
  erreursTypiques: ({ billet, prix }) => [
    { valeur: prix, erreur: 'prix donné au lieu de la monnaie' },
    { valeur: billet + prix, erreur: 'addition au lieu de soustraction' },
    { valeur: billet - prix + 10, erreur: 'retenue oubliée' },
    { valeur: billet - prix - 1, erreur: 'erreur de comptage en avançant' },
  ],
  histoires: [
    ({ billet, prix }, r) => ({
      enonce: `Capy achète un livre à ${nb(prix)}\u00a0€. Il paie avec un billet de ${nb(billet)}\u00a0€.`,
      question: 'Combien d’euros la marchande doit-elle lui rendre ?',
      autresQuestions: ['Combien de livres Capy a-t-il achetés cette année ?', 'Combien de pages a le livre ?'],
      indice: `Capy donne plus que le prix. De combien ${nb(billet)}\u00a0€ dépasse-t-il le prix ?`,
      explication: `On enlève le prix du billet : ${nb(billet)} − ${nb(prix)} = ${nb(r)}. La marchande rend ${nb(r)}\u00a0€.`,
      facile: {
        enonce: `Le livre coûte ${nb(prix)}\u00a0€. Capy donne un billet de ${nb(billet)}\u00a0€.`,
        question: 'Combien d’euros la marchande lui rend-elle ?',
        indice: 'Capy donne trop. On cherche ce qui dépasse. Il faut soustraire.',
        explication: `${nb(billet)} − ${nb(prix)} = ${nb(r)}. La marchande rend ${nb(r)}\u00a0€.`,
      },
    }),
    ({ billet, prix }, r) => ({
      enonce: `Au marché, un melon coûte ${nb(prix)}\u00a0€. Capy donne un billet de ${nb(billet)}\u00a0€.`,
      question: 'Combien d’euros le marchand lui rend-il ?',
      autresQuestions: ['Combien de melons y a-t-il sur l’étal ?', 'Combien pèse le melon ?'],
      indice: 'Pour trouver la monnaie, compare le billet donné et le prix du melon.',
      explication: `${nb(billet)} − ${nb(prix)} = ${nb(r)}. Tu peux vérifier : ${nb(prix)} + ${nb(r)} = ${nb(billet)}. Le marchand rend ${nb(r)}\u00a0€.`,
      facile: {
        enonce: `Le melon coûte ${nb(prix)}\u00a0€. Capy donne un billet de ${nb(billet)}\u00a0€.`,
        question: 'Combien d’euros le marchand rend-il ?',
        indice: 'Capy donne trop. Il faut soustraire.',
        explication: `${nb(billet)} − ${nb(prix)} = ${nb(r)}. Le marchand rend ${nb(r)}\u00a0€.`,
      },
    }),
  ],
});
