/**
 * Compétence visée : résoudre des problèmes de durée en heures entières (heure
 * de fin connaissant l'heure de début et la durée), et lire l'heure sur une
 * horloge à aiguilles. Grandeurs et mesures, attendus de fin de cycle 2 (CE2).
 * Les heures restent entre 1 h et 12 h, comme sur le cadran.
 */
import { definirModele, nb } from '../../moteur';

const heures = (n: number) => `${nb(n)}\u00a0heure${n > 1 ? 's' : ''}`;

export const duree = definirModele<{ debut: number; duree: number }>({
  id: 'duree',
  titre: 'L’heure qui passe',
  domaine: 'resoudre-problemes',
  competence: 'Trouver l’heure de fin à partir de l’heure de début et d’une durée en heures, sur une horloge.',
  operations: ['+'],
  regles: {
    CE2: { donnees: { debut: { min: 1, max: 10 }, duree: { min: 2, max: 9 } }, reponse: { min: 3, max: 12 } },
  },
  reglesAccessibles: {
    CE2: {
      // + : une ou deux heures, on finit avant 8 h.
      1: { donnees: { debut: { min: 1, max: 6 }, duree: { min: 1, max: 2 } }, reponse: { min: 2, max: 8 } },
      // ++ : jusqu'à cinq heures.
      2: { donnees: { debut: { min: 1, max: 9 }, duree: { min: 1, max: 5 } }, reponse: { min: 2, max: 11 } },
    },
  },
  calculer: ({ debut, duree: d }) => debut + d,
  erreursTypiques: ({ debut, duree: d }) => [
    { valeur: debut + d + 1, erreur: 'l’heure de départ comptée comme une heure passée' },
    { valeur: debut + d - 1, erreur: 'une heure oubliée en comptant' },
    { valeur: debut - d, erreur: 'soustraction au lieu d’addition' },
    { valeur: d, erreur: 'durée donnée au lieu de l’heure' },
    { valeur: debut, erreur: 'heure de début donnée' },
  ],
  histoires: [
    ({ debut, duree: d }, r) => ({
      enonce: `Le film commence à ${nb(debut)}\u00a0h. Il dure ${heures(d)}.`,
      question: 'À quelle heure finit-il ?',
      autresQuestions: ['Combien de spectateurs regardent le film ?', 'Combien coûte une place de cinéma ?'],
      indice: `Mets l’aiguille sur ${nb(debut)}\u00a0h, puis avance d’une heure à la fois, ${heures(d)} en tout.`,
      explication: `${nb(debut)}\u00a0h + ${heures(d)} : ${nb(debut)} + ${nb(d)} = ${nb(r)}. Le film finit à ${nb(r)}\u00a0h.`,
      facile: {
        enonce: `Le film commence à ${nb(debut)}\u00a0h. Il dure ${heures(d)}.`,
        question: 'À quelle heure finit le film ?',
        indice: 'Pars du début. Avance d’une heure à la fois.',
        explication: `${nb(debut)} + ${nb(d)} = ${nb(r)}. Le film finit à ${nb(r)}\u00a0h.`,
      },
    }),
    ({ debut, duree: d }, r) => ({
      enonce: `Capy part en promenade à ${nb(debut)}\u00a0h. Il marche pendant ${heures(d)}.`,
      question: 'À quelle heure rentre-t-il ?',
      autresQuestions: ['Combien de kilomètres Capy a-t-il marché ?', 'Combien d’oiseaux Capy a-t-il vus ?'],
      indice: `La promenade commence à ${nb(debut)}\u00a0h. Compte les heures qui passent sur l’horloge.`,
      explication: `On ajoute la durée à l’heure du départ : ${nb(debut)} + ${nb(d)} = ${nb(r)}. Capy rentre à ${nb(r)}\u00a0h.`,
      facile: {
        enonce: `Capy part à ${nb(debut)}\u00a0h. Il marche ${heures(d)}.`,
        question: 'À quelle heure rentre-t-il ?',
        indice: 'Pars de l’heure du départ. Avance d’une heure à la fois.',
        explication: `${nb(debut)} + ${nb(d)} = ${nb(r)}. Capy rentre à ${nb(r)}\u00a0h.`,
      },
    }),
  ],
});
