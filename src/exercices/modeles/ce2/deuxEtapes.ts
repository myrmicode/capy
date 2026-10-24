/**
 * Compétence visée : résoudre des problèmes additifs à deux étapes
 * (deux retraits successifs ou un total à retirer). Organiser sa démarche,
 * calculer un résultat intermédiaire. Nombres jusqu'à 100.
 * Attendus de fin de cycle 2 (CE2).
 */
import { definirModele, nb } from '../../moteur';

export const deuxEtapes = definirModele<{ depart: number; premier: number; second: number }>({
  id: 'deux-etapes',
  titre: 'Problème en deux étapes',
  domaine: 'resoudre-problemes',
  competence:
    'Résoudre un problème à deux étapes (deux retraits), avec un résultat intermédiaire, nombres jusqu’à 100.',
  operations: ['+', '−'],
  regles: {
    CE2: {
      donnees: { depart: { min: 20, max: 100 }, premier: { min: 5, max: 50 }, second: { min: 2, max: 20 } },
      reponse: { min: 1, max: 93 },
    },
  },
  reglesAccessibles: {
    CE2: {
      // + : petits nombres, jusqu'à 30.
      1: {
        donnees: { depart: { min: 10, max: 30 }, premier: { min: 2, max: 10 }, second: { min: 2, max: 5 } },
        reponse: { min: 1, max: 26 },
      },
      // ++ : jusqu'à 60.
      2: {
        donnees: { depart: { min: 20, max: 60 }, premier: { min: 5, max: 30 }, second: { min: 2, max: 15 } },
        reponse: { min: 1, max: 53 },
      },
    },
  },
  estValide: ({ depart, premier, second }) => premier !== second && premier + second < depart,
  calculer: ({ depart, premier, second }) => depart - premier - second,
  erreursTypiques: ({ depart: a, premier: b, second: c }) => [
    { valeur: a - b, erreur: 'une seule étape faite (le second retrait oublié)' },
    { valeur: b + c, erreur: 'résultat intermédiaire donné comme réponse' },
    { valeur: a - c, erreur: 'une seule étape faite (le premier retrait oublié)' },
    { valeur: a - b + c, erreur: 'second nombre ajouté au lieu d’être retiré' },
  ],
  histoires: [
    ({ depart: a, premier: b, second: c }, r) => ({
      enonce: `Capy a ${nb(a)} € dans sa tirelire. Il achète un livre à ${nb(b)} € et une boîte de crayons à ${nb(c)} €.`,
      question: 'Combien d’euros reste-t-il à Capy ?',
      autresQuestions: ['Combien coûte un cahier ?', 'Combien d’euros Capy avait-il l’année dernière ?'],
      indice: 'Il y a deux étapes. Commence par chercher combien Capy dépense en tout.',
      explication: `Capy dépense ${nb(b)} + ${nb(c)} = ${nb(b + c)} €. Il lui reste ${nb(a)} − ${nb(b + c)} = ${nb(r)} €.`,
      facile: {
        enonce: `Capy a ${nb(a)} €. Il achète un livre à ${nb(b)} €. Il achète des crayons à ${nb(c)} €.`,
        question: 'Combien d’euros reste-t-il à Capy ?',
        indice: 'Il y a deux étapes. D’abord, ajoute les deux prix.',
        explication: `${nb(b)} + ${nb(c)} = ${nb(b + c)}. Puis ${nb(a)} − ${nb(b + c)} = ${nb(r)}. Il reste ${nb(r)} €.`,
      },
    }),
    ({ depart: a, premier: b, second: c }, r) => ({
      enonce: `Le cinéma du quartier a ${nb(a)} places. D’abord, ${nb(b)} enfants s’installent, puis ${nb(c)} adultes.`,
      question: 'Combien de places reste-t-il libres ?',
      autresQuestions: ['Combien coûte une place de cinéma ?', 'Combien de temps dure le film ?'],
      indice: 'Il y a deux étapes. Cherche d’abord combien de personnes sont assises.',
      explication: `${nb(b)} + ${nb(c)} = ${nb(b + c)} personnes sont assises. Il reste ${nb(a)} − ${nb(b + c)} = ${nb(r)} places libres.`,
      facile: {
        enonce: `Le cinéma a ${nb(a)} places. D’abord, ${nb(b)} enfants s’assoient. Puis ${nb(c)} adultes s’assoient.`,
        question: 'Combien de places restent libres ?',
        indice: 'Il y a deux étapes. D’abord, compte les personnes assises.',
        explication: `${nb(b)} + ${nb(c)} = ${nb(b + c)}. Puis ${nb(a)} − ${nb(b + c)} = ${nb(r)}. Il reste ${nb(r)} places.`,
      },
    }),
    ({ depart: a, premier: b, second: c }, r) => ({
      enonce: `Capy a ${nb(a)} timbres. Il en colle ${nb(b)} sur des lettres et en donne ${nb(c)} à Lina.`,
      question: 'Combien de timbres lui reste-t-il ?',
      autresQuestions: ['Combien de lettres Lina a-t-elle reçues ?', 'Combien coûte un timbre ?'],
      indice: 'Capy enlève des timbres deux fois. Tu peux faire une soustraction, puis une autre.',
      explication: `Après les lettres : ${nb(a)} − ${nb(b)} = ${nb(a - b)}. Après le cadeau à Lina : ${nb(a - b)} − ${nb(c)} = ${nb(r)}. Il reste ${nb(r)} timbres.`,
      facile: {
        enonce: `Capy a ${nb(a)} timbres. Il colle ${nb(b)} timbres. Il donne ${nb(c)} timbres à Lina.`,
        question: 'Combien de timbres reste-t-il à Capy ?',
        indice: 'Capy enlève des timbres deux fois. Fais deux soustractions.',
        explication: `${nb(a)} − ${nb(b)} = ${nb(a - b)}. Puis ${nb(a - b)} − ${nb(c)} = ${nb(r)}. Il reste ${nb(r)} timbres.`,
      },
    }),
  ],
});
