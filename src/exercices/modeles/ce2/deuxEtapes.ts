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
  competence: 'Résoudre un problème à deux étapes (deux retraits), avec un résultat intermédiaire, nombres jusqu’à 100.',
  operations: ['+', '−'],
  regles: {
    CE2: {
      donnees: { depart: { min: 20, max: 100 }, premier: { min: 5, max: 50 }, second: { min: 2, max: 20 } },
      reponse: { min: 1, max: 93 },
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
      indice: 'Il y a deux étapes. Commence par chercher combien Capy dépense en tout.',
      explication: `Capy dépense ${nb(b)} + ${nb(c)} = ${nb(b + c)} €. Il lui reste ${nb(a)} − ${nb(b + c)} = ${nb(r)} €.`,
    }),
    ({ depart: a, premier: b, second: c }, r) => ({
      enonce: `Le cinéma du quartier a ${nb(a)} places. D’abord, ${nb(b)} enfants s’installent, puis ${nb(c)} adultes.`,
      question: 'Combien de places reste-t-il libres ?',
      indice: 'Il y a deux étapes. Cherche d’abord combien de personnes sont assises.',
      explication: `${nb(b)} + ${nb(c)} = ${nb(b + c)} personnes sont assises. Il reste ${nb(a)} − ${nb(b + c)} = ${nb(r)} places libres.`,
    }),
    ({ depart: a, premier: b, second: c }, r) => ({
      enonce: `Capy a ${nb(a)} timbres. Il en colle ${nb(b)} sur des lettres et en donne ${nb(c)} à Lina.`,
      question: 'Combien de timbres lui reste-t-il ?',
      indice: 'Capy enlève des timbres deux fois. Tu peux faire une soustraction, puis une autre.',
      explication: `Après les lettres : ${nb(a)} − ${nb(b)} = ${nb(a - b)}. Après le cadeau à Lina : ${nb(a - b)} − ${nb(c)} = ${nb(r)}. Il reste ${nb(r)} timbres.`,
    }),
  ],
});
