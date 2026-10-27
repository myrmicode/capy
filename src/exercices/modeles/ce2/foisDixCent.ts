/**
 * Compétence visée : multiplier un nombre entier par 10, 100 ou 1 000 en
 * comprenant le changement de rang des chiffres (les unités deviennent des
 * dizaines, des centaines, des milliers). Calcul mental, CM1 et CM2.
 */
import { definirModele, nb } from '../../moteur';

const MULTIPLICATEURS = [10, 100, 1000] as const;
const RANGS: Record<number, string> = { 10: 'dizaines', 100: 'centaines', 1000: 'milliers' };

export const foisDixCent = definirModele<{ nombre: number; multiplicateur: number }>({
  id: 'fois-dix-cent',
  titre: 'Multiplier par 10, 100, 1\u202f000',
  domaine: 'calcul-mental',
  competence: 'Multiplier un nombre entier par 10, 100 ou 1\u202f000 en sachant que chaque chiffre change de rang.',
  operations: ['×'],
  regles: {
    CM1: {
      donnees: { nombre: { min: 2, max: 999 }, multiplicateur: { min: 10, max: 1000 } },
      reponse: { min: 20, max: 999000 },
    },
    CM2: {
      donnees: { nombre: { min: 11, max: 9999 }, multiplicateur: { min: 10, max: 1000 } },
      reponse: { min: 110, max: 9999000 },
    },
  },
  reglesAccessibles: {
    CM1: {
      // + : par 10, petits nombres ; ++ : par 10 ou 100.
      1: {
        donnees: { nombre: { min: 2, max: 99 }, multiplicateur: { min: 10, max: 10 } },
        reponse: { min: 20, max: 990 },
      },
      2: {
        donnees: { nombre: { min: 2, max: 999 }, multiplicateur: { min: 10, max: 100 } },
        reponse: { min: 20, max: 99900 },
      },
    },
    CM2: {
      // + : par 10 ou 100 ; ++ : aussi par 1 000.
      1: {
        donnees: { nombre: { min: 2, max: 999 }, multiplicateur: { min: 10, max: 100 } },
        reponse: { min: 20, max: 99900 },
      },
      2: {
        donnees: { nombre: { min: 2, max: 999 }, multiplicateur: { min: 10, max: 1000 } },
        reponse: { min: 20, max: 999000 },
      },
    },
  },
  // Le multiplicateur est 10, 100 ou 1 000, dans les bornes du niveau.
  tirer: (alea, regles) => {
    const { min, max } = regles.donnees.multiplicateur;
    return {
      nombre: alea.entier(regles.donnees.nombre.min, regles.donnees.nombre.max),
      multiplicateur: alea.choix(MULTIPLICATEURS.filter((m) => m >= min && m <= max)),
    };
  },
  calculer: ({ nombre, multiplicateur }) => nombre * multiplicateur,
  erreursTypiques: ({ nombre: n, multiplicateur: m }) => [
    { valeur: n * m * 10, erreur: 'un rang de trop (un zéro en trop)' },
    { valeur: (n * m) / 10, erreur: 'un rang de moins (un zéro oublié)' },
    { valeur: n + m, erreur: 'addition au lieu de multiplication' },
    { valeur: n * m * 100, erreur: 'deux rangs de trop' },
  ],
  histoires: [
    ({ nombre: n, multiplicateur: m }, r) => ({
      enonce: `${nb(n)}\u00a0×\u00a0${nb(m)}`,
      question: 'Combien ça fait\u00a0?',
      indice: `Multiplier par ${nb(m)}, c’est rendre chaque chiffre ${nb(m)} fois plus grand\u00a0: les unités deviennent des ${RANGS[m]}.`,
      explication: `${nb(n)}\u00a0×\u00a0${nb(m)}\u00a0=\u00a0${nb(r)}. Chaque chiffre de ${nb(n)} a pris une valeur ${nb(m)} fois plus grande\u00a0: ${nb(n)} unités, c’est ${nb(n)} ${RANGS[m]}.`,
      facile: {
        enonce: `${nb(n)}\u00a0×\u00a0${nb(m)}`,
        question: 'Combien ça fait\u00a0?',
        indice: `Les unités deviennent des ${RANGS[m]}.`,
        explication: `${nb(n)}\u00a0×\u00a0${nb(m)}\u00a0=\u00a0${nb(r)}.`,
      },
    }),
  ],
});
