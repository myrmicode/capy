/**
 * Exercices de mathématiques dont la réponse est une écriture, pas un nombre
 * entier : une fraction (« 3/8 ») ou un nombre décimal (« 4,7 »).
 * - Fractions (CE2) : quelle part de la tablette a été mangée ?
 * - Représentations des nombres (CM2) : unités, dixièmes, centièmes, fractions décimales.
 *
 * À FAIRE RELIRE PAR UN ENSEIGNANT, comme le reste du contenu.
 */
import { definirModeleTexte } from '../francais/moteur';

const OBJETS_PARTAGES = [
  { tout: 'une tablette de chocolat', le: 'la tablette', morceaux: 'carrés pareils', verbe: 'mange', fait: 'mangée' },
  { tout: 'une pizza', le: 'la pizza', morceaux: 'parts pareilles', verbe: 'mange', fait: 'mangée' },
  { tout: 'une bande de papier', le: 'la bande', morceaux: 'cases pareilles', verbe: 'colorie', fait: 'coloriée' },
] as const;

export const fractionPartie = definirModeleTexte({
  id: 'fraction-partie',
  titre: 'Quelle part\u00a0?',
  domaine: 'fractions',
  competence: 'Nommer et écrire la fraction qui correspond à une partie d’un tout partagé en parts égales.',
  classes: ['CE2'],
  // + : une seule part, jusqu'en quatre ; ++ : plusieurs parts, jusqu'en huit ; +++ : jusqu'en douze.
  construire: (alea, _classe, niveau) => {
    const parts = alea.entier(2, niveau === 1 ? 4 : niveau === 2 ? 8 : 12);
    const prises = niveau === 1 ? 1 : alea.entier(1, parts - 1);
    const o = alea.choix(OBJETS_PARTAGES);
    const reponse = `${prises}/${parts}`;
    return {
      enonce: `Capy partage ${o.tout} en ${parts} ${o.morceaux}. Il en ${o.verbe} ${prises}.`,
      question: `Quelle partie de ${o.le} a-t-il ${o.fait}\u00a0?`,
      reponse,
      distracteurs: [
        { valeur: `${parts}/${prises}`, erreur: 'fraction écrite à l’envers' },
        { valeur: `${parts - prises}/${parts}`, erreur: 'la partie qui reste' },
        { valeur: `${prises}/${parts - prises}`, erreur: 'parts prises sur parts restantes' },
        { valeur: `${prises}/${parts + 1}`, erreur: 'une part de trop comptée' },
      ].filter((d) => d.valeur !== reponse),
      indice: 'En bas, on écrit en combien de parts égales on a partagé\u00a0; en haut, combien de parts on a prises.',
      explication: `Le tout est partagé en ${parts} parts égales, et Capy en prend ${prises}\u00a0: c’est ${reponse}.`,
      facile: {
        indice: 'En bas\u00a0: le nombre de parts. En haut\u00a0: les parts prises.',
        explication: `${parts} parts. Capy en prend ${prises}. C’est ${reponse}.`,
      },
    };
  },
});

/** Écriture décimale française : 4,07. */
const decimal = (entier: number, centiemes: number) =>
  `${entier},${String(centiemes).padStart(2, '0')}`.replace(/,(\d)0$/, ',$1').replace(/,0$/, '');

export const decimaux = definirModeleTexte({
  id: 'decimaux',
  titre: 'Les nombres à virgule',
  domaine: 'representations-nombres',
  competence:
    'Passer d’une écriture à une autre\u00a0: unités et dixièmes ou centièmes, fraction décimale, écriture à virgule.',
  classes: ['CM2'],
  // + : unités et dixièmes ; ++ : centièmes, avec un zéro aux dixièmes ; +++ : fractions décimales.
  construire: (alea, _classe, niveau) => {
    const u = alea.entier(1, 9);
    if (niveau === 1) {
      const d = alea.entier(1, 9);
      const reponse = `${u},${d}`;
      return {
        enonce: `Capy pense à un nombre\u00a0: ${u} unités et ${d} dixièmes.`,
        question: 'Comment s’écrit ce nombre\u00a0?',
        reponse,
        distracteurs: [
          { valeur: `${u},0${d}`, erreur: 'dixièmes placés aux centièmes' },
          { valeur: `${u}${d}`, erreur: 'virgule oubliée' },
          { valeur: `${d},${u}`, erreur: 'unités et dixièmes inversés' },
        ],
        indice: 'Les unités vont avant la virgule. Le premier chiffre après la virgule, ce sont les dixièmes.',
        explication: `${u} unités avant la virgule, ${d} dixièmes juste après\u00a0: ${reponse}.`,
      };
    }
    if (niveau === 2) {
      const c = alea.entier(1, 9);
      const reponse = `${u},0${c}`;
      return {
        enonce: `Capy pense à un nombre\u00a0: ${u} unités et ${c} centièmes.`,
        question: 'Comment s’écrit ce nombre\u00a0?',
        reponse,
        distracteurs: [
          { valeur: `${u},${c}`, erreur: 'zéro des dixièmes oublié' },
          { valeur: `${u},${c}0`, erreur: 'centièmes placés aux dixièmes' },
          { valeur: `${u}0${c}`, erreur: 'virgule oubliée' },
        ],
        indice:
          'Après la virgule, il y a d’abord les dixièmes, puis les centièmes. S’il n’y a pas de dixièmes, on écrit un zéro.',
        explication: `${u} unités, 0 dixième et ${c} centièmes\u00a0: ${reponse}.`,
      };
    }
    const centiemes = alea.entier(1, 99);
    const surCent = alea.choix([true, false]);
    const total = surCent ? u * 100 + centiemes : u * 10 + (centiemes % 9) + 1;
    const reponse = surCent ? decimal(u, centiemes) : `${u},${(centiemes % 9) + 1}`;
    const base = surCent ? 100 : 10;
    return {
      enonce: `Capy a écrit une fraction\u00a0: ${total}/${base}.`,
      question: 'Quel nombre à virgule est égal à cette fraction\u00a0?',
      reponse,
      distracteurs: [
        {
          valeur: surCent ? `${Math.floor(total / 10)},${total % 10}` : `${total}`,
          erreur: surCent ? 'mauvais rang pour la virgule' : 'virgule oubliée',
        },
        { valeur: `${total},${base}`, erreur: 'numérateur et dénominateur séparés par une virgule' },
        {
          valeur: surCent ? `${Math.floor(total / 1000)},${String(total % 1000).padStart(3, '0')}` : `0,${total}`,
          erreur: 'virgule décalée d’un rang',
        },
      ].filter((d) => d.valeur !== reponse),
      indice: surCent
        ? 'Sur cent, le dernier chiffre est aux centièmes\u00a0: il y a deux chiffres après la virgule.'
        : 'Sur dix, le dernier chiffre est aux dixièmes\u00a0: il y a un chiffre après la virgule.',
      explication: `${total}/${base}, c’est ${total} ${surCent ? 'centièmes' : 'dixièmes'}\u00a0: ${reponse}.`,
    };
  },
});
