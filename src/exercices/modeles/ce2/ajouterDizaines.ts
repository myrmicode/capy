/**
 * Compétence visée : ajouter mentalement un nombre entier de dizaines à un nombre
 * à trois chiffres (sauter de dizaine en dizaine). Attendus de fin de cycle 2 (CE2).
 */
import { definirModele, nb } from '../../moteur';

export const ajouterDizaines = definirModele<{ nombre: number; dizaines: number }>({
  id: 'ajouter-dizaines',
  titre: 'Sauter de dizaine en dizaine',
  domaine: 'calcul-mental',
  competence: 'Ajouter un nombre entier de dizaines à un nombre inférieur à 1 000.',
  operations: ['+'],
  regles: {
    CE2: {
      donnees: { nombre: { min: 100, max: 899 }, dizaines: { min: 10, max: 90 } },
      reponse: { min: 110, max: 989 },
    },
  },
  // Les dizaines ajoutées sont un multiple de 10.
  tirer: (alea, regles) => ({
    nombre: alea.entier(regles.donnees.nombre.min, regles.donnees.nombre.max),
    dizaines: 10 * alea.entier(regles.donnees.dizaines.min / 10, regles.donnees.dizaines.max / 10),
  }),
  calculer: ({ nombre, dizaines }) => nombre + dizaines,
  erreursTypiques: ({ nombre: n, dizaines: d }) => [
    { valeur: n + d / 10, erreur: 'ajout aux unités au lieu des dizaines' },
    { valeur: n + d * 10, erreur: 'ajout aux centaines au lieu des dizaines' },
    { valeur: n + d - 10, erreur: 'un saut de dizaine oublié' },
    { valeur: n + d + 10, erreur: 'un saut de dizaine en trop' },
  ],
  histoires: [
    ({ nombre: n, dizaines: d }, r) => ({
      enonce: `${nb(n)} + ${nb(d)}`,
      question: 'Combien ça fait ?',
      indice: 'Seul le chiffre des dizaines change (et parfois celui des centaines). Les unités ne bougent pas.',
      explication: `${nb(n)} + ${nb(d)} = ${nb(r)} : on avance de dix en dix à partir de ${nb(n)}.`,
    }),
    ({ nombre: n, dizaines: d }, r) => ({
      enonce: `Capy est sur la case ${nb(n)}. Il avance de ${nb(d)} cases.`,
      question: 'Sur quelle case arrive-t-il ?',
      indice: 'Avance de dix en dix : le chiffre des unités reste le même.',
      explication: `${nb(n)} + ${nb(d)} = ${nb(r)}. Capy arrive sur la case ${nb(r)}.`,
    }),
  ],
});
