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
    CE1: { donnees: { nombre: { min: 11, max: 89 }, dizaines: { min: 10, max: 80 } }, reponse: { min: 21, max: 99 } },
    CM1: {
      donnees: { nombre: { min: 1000, max: 8999 }, dizaines: { min: 10, max: 90 } },
      reponse: { min: 1010, max: 9089 },
    },
    CM2: {
      donnees: { nombre: { min: 10000, max: 89999 }, dizaines: { min: 10, max: 90 } },
      reponse: { min: 10010, max: 90089 },
    },
  },
  reglesAccessibles: {
    CE2: {
      // + : nombres à deux chiffres, résultat inférieur à 100.
      1: { donnees: { nombre: { min: 11, max: 59 }, dizaines: { min: 10, max: 40 } }, reponse: { min: 21, max: 99 } },
      // ++ : nombres à trois chiffres, petits sauts.
      2: {
        donnees: { nombre: { min: 100, max: 500 }, dizaines: { min: 10, max: 50 } },
        reponse: { min: 110, max: 550 },
      },
    },
    CE1: {
      1: { donnees: { nombre: { min: 11, max: 49 }, dizaines: { min: 10, max: 30 } }, reponse: { min: 21, max: 79 } },
      2: { donnees: { nombre: { min: 11, max: 59 }, dizaines: { min: 10, max: 40 } }, reponse: { min: 21, max: 99 } },
    },
    CM1: {
      1: {
        donnees: { nombre: { min: 100, max: 899 }, dizaines: { min: 10, max: 90 } },
        reponse: { min: 110, max: 989 },
      },
      2: {
        donnees: { nombre: { min: 100, max: 999 }, dizaines: { min: 10, max: 90 } },
        reponse: { min: 110, max: 1089 },
      },
    },
    CM2: {
      1: {
        donnees: { nombre: { min: 1000, max: 8999 }, dizaines: { min: 10, max: 90 } },
        reponse: { min: 1010, max: 9089 },
      },
      2: {
        donnees: { nombre: { min: 1000, max: 9999 }, dizaines: { min: 10, max: 90 } },
        reponse: { min: 1010, max: 10089 },
      },
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
      facile: {
        enonce: `${nb(n)} + ${nb(d)}`,
        question: 'Combien ça fait ?',
        indice: 'Compte de dix en dix. Le chiffre des unités ne change pas.',
        explication: `${nb(n)} + ${nb(d)} = ${nb(r)}.`,
      },
    }),
    ({ nombre: n, dizaines: d }, r) => ({
      enonce: `Capy est sur la case ${nb(n)}. Il avance de ${nb(d)} cases.`,
      question: 'Sur quelle case arrive-t-il ?',
      indice: 'Avance de dix en dix : le chiffre des unités reste le même.',
      explication: `${nb(n)} + ${nb(d)} = ${nb(r)}. Capy arrive sur la case ${nb(r)}.`,
      facile: {
        enonce: `Capy est sur la case ${nb(n)}. Il avance de ${nb(d)} cases.`,
        question: 'Sur quelle case arrive Capy ?',
        indice: 'Compte de dix en dix. Le chiffre des unités ne change pas.',
        explication: `${nb(n)} + ${nb(d)} = ${nb(r)}. Capy arrive sur la case ${nb(r)}.`,
      },
    }),
  ],
});
