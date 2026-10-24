/**
 * Compétence visée : résoudre des problèmes multiplicatifs en une étape
 * (groupements réguliers : « a paquets de b »). Sens de la multiplication,
 * tables de 2 à 9. Attendus de fin de cycle 2 (CE2).
 */
import { definirModele, nb } from '../../moteur';

export const groupements = definirModele<{ groupes: number; parGroupe: number }>({
  id: 'groupements',
  titre: 'Paquets et groupes',
  domaine: 'resoudre-problemes',
  competence: 'Résoudre un problème multiplicatif en une étape (groupements réguliers), tables de 2 à 9.',
  operations: ['×'],
  regles: {
    CE2: {
      donnees: { groupes: { min: 2, max: 9 }, parGroupe: { min: 2, max: 9 } },
      reponse: { min: 6, max: 81 },
    },
  },
  // 2 × 2 = 2 + 2 : l'exercice ne distinguerait pas l'addition de la multiplication.
  estValide: ({ groupes, parGroupe }) => groupes * parGroupe !== groupes + parGroupe,
  calculer: ({ groupes, parGroupe }) => groupes * parGroupe,
  erreursTypiques: ({ groupes: a, parGroupe: b }) => [
    { valeur: a + b, erreur: 'addition au lieu de multiplication' },
    { valeur: a * b - b, erreur: 'un groupe oublié' },
    { valeur: a * b + b, erreur: 'un groupe en trop' },
    { valeur: a * b + a, erreur: 'erreur dans la table (résultat voisin)' },
  ],
  histoires: [
    ({ groupes: a, parGroupe: b }, r) => ({
      enonce: `Au marché, Capy achète ${nb(a)} paquets de ${nb(b)} fraises.`,
      question: 'Combien de fraises Capy a-t-il en tout ?',
      autresQuestions: ['Combien coûte un paquet de fraises ?', 'Combien de fraises Capy a-t-il mangées hier ?'],
      indice: `Chaque paquet contient ${nb(b)} fraises. Combien de fois dois-tu compter ${nb(b)} fraises ?`,
      explication: `${nb(a)} paquets de ${nb(b)} fraises, c’est ${nb(b)} pris ${nb(a)} fois : ${nb(a)} × ${nb(b)} = ${nb(r)}. Capy a ${nb(r)} fraises.`,
    }),
    ({ groupes: a, parGroupe: b }, r) => ({
      enonce: `Pour le goûter, Capy prépare ${nb(a)} assiettes. Sur chaque assiette, il pose ${nb(b)} biscuits.`,
      question: 'Combien de biscuits Capy a-t-il posés en tout ?',
      autresQuestions: ['Combien d’amis viennent au goûter ?', 'Quel est le parfum des biscuits ?'],
      indice: `Il y a ${nb(b)} biscuits sur chaque assiette. Combien d’assiettes faut-il compter ?`,
      explication: `${nb(a)} assiettes de ${nb(b)} biscuits : ${nb(a)} × ${nb(b)} = ${nb(r)}. Capy a posé ${nb(r)} biscuits.`,
    }),
    ({ groupes: a, parGroupe: b }, r) => ({
      enonce: `Dans le potager, il y a ${nb(a)} rangées. Dans chaque rangée, il y a ${nb(b)} salades.`,
      question: 'Combien de salades y a-t-il dans le potager ?',
      autresQuestions: ['Combien de tomates y a-t-il dans le potager ?', 'Combien de temps faut-il pour arroser le potager ?'],
      indice: `Chaque rangée a le même nombre de salades. Tu peux ajouter ${nb(b)} pour chaque rangée.`,
      explication: `${nb(a)} rangées de ${nb(b)} salades : ${nb(a)} × ${nb(b)} = ${nb(r)}. Il y a ${nb(r)} salades.`,
    }),
  ],
});
