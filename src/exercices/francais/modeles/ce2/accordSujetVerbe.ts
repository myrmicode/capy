/**
 * Compétence visée : accorder le verbe avec son sujet, y compris quand le sujet
 * est un groupe nominal long et que le nom le plus proche du verbe n'est pas le
 * sujet (« Les chiens du voisin aboient »). Présent, imparfait et futur des
 * verbes du 1er groupe. Axe « Accorder le sujet et le verbe » (CM1, CM2).
 */
import { conjuguer, pronom, REPERES_TEMPS, TEMPS, VERBES_PREMIER_GROUPE, type Temps } from '../../conjugaison';
import { definirModeleTexte, majuscule } from '../../moteur';
import { groupeNominal } from '../../phrases';

/** Ce que les animaux du lexique peuvent faire (les personnes peuvent tout faire). */
const VERBES_ANIMAUX = ['jouer', 'marcher', 'regarder', 'sauter', 'danser'];

/** Compléments du nom, au singulier et au pluriel : ils éloignent le sujet du verbe. */
const COMPLEMENTS: readonly (readonly [string, string])[] = [
  ['du voisin', 'des voisins'],
  ['de ma cousine', 'de mes cousines'],
  ['de la maîtresse', 'des maîtresses'],
];

export const accordSujetVerbe = definirModeleTexte({
  id: 'accord-sujet-verbe',
  titre: 'Accorder le verbe',
  domaine: 'accord-sujet-verbe',
  competence: 'Accorder le verbe avec son sujet, même quand un autre nom se trouve entre le sujet et le verbe.',
  classes: ['CM1', 'CM2'],
  // + : présent, sujet court ; ++ : aussi l'imparfait et le futur, un adjectif dans le sujet ;
  // +++ : aussi un complément du nom entre le sujet et le verbe, au nombre opposé (le piège).
  construire: (alea, _classe, niveau) => {
    const temps: Temps = niveau === 1 ? 'present' : alea.choix(TEMPS);
    const gn = groupeNominal(alea, ['humain', 'animal'], { adjectif: niveau > 1 && alea.choix([true, false]) });
    const verbes =
      gn.nom.categorie === 'animal'
        ? VERBES_PREMIER_GROUPE.filter((v) => VERBES_ANIMAUX.includes(v.infinitif))
        : VERBES_PREMIER_GROUPE;
    const verbe = alea.choix(verbes);
    const pluriel = gn.nombre === 'pluriel';
    const remplacant = pronom(pluriel ? 5 : 2, gn.genre === 'f');
    const nomTexte = gn.mots.find((m) => m.nature === 'Nom')!.texte;

    const eloigne = niveau === 3 && alea.choix([true, false]);
    const complement = eloigne ? alea.choix(COMPLEMENTS)[pluriel ? 0 : 1] : undefined;
    const sujet = [...gn.mots.map((m) => m.texte), ...(complement ? [complement] : [])].join(' ');

    const forme = conjuguer(verbe.infinitif, temps, pluriel ? 5 : 2);
    const repere = temps === 'present' ? undefined : alea.choix(REPERES_TEMPS[temps]);
    const enonce = `${repere ? `${repere}, ${sujet}` : majuscule(sujet)} ___ ${verbe.complement}.`;

    return {
      enonce,
      question: `Complète avec le verbe «\u00a0${verbe.infinitif}\u00a0».`,
      reponse: forme,
      distracteurs: [
        {
          valeur: conjuguer(verbe.infinitif, temps, pluriel ? 2 : 5),
          erreur: pluriel
            ? 'verbe au singulier avec un sujet au pluriel'
            : 'verbe au pluriel avec un sujet au singulier',
        },
        {
          valeur: conjuguer(verbe.infinitif, temps, 1),
          erreur: 'le «\u00a0s\u00a0» du pluriel mis au verbe (terminaison de «\u00a0tu\u00a0»)',
        },
        { valeur: conjuguer(verbe.infinitif, temps, 3), erreur: 'terminaison de «\u00a0nous\u00a0»' },
        { valeur: conjuguer(verbe.infinitif, temps, 4), erreur: 'terminaison de «\u00a0vous\u00a0»' },
      ],
      indice: `Qui fait l’action\u00a0? Trouve le sujet, puis demande-toi s’il est au singulier ou au pluriel.${
        complement ? ' Attention\u00a0: le nom juste avant le verbe n’est pas forcément le sujet.' : ''
      }`,
      explication: `Le sujet est «\u00a0${sujet}\u00a0»${
        complement ? `\u00a0: le nom principal est «\u00a0${nomTexte}\u00a0», pas «\u00a0${complement}\u00a0»` : ''
      }. On peut le remplacer par «\u00a0${remplacant}\u00a0»\u00a0: il est au ${pluriel ? 'pluriel' : 'singulier'}. Le verbe s’accorde avec lui\u00a0: «\u00a0${forme}\u00a0».`,
      facile: {
        question: `Complète avec «\u00a0${verbe.infinitif}\u00a0».`,
        indice: 'Cherche qui fait l’action. Un seul ou plusieurs\u00a0?',
        explication: `Le sujet est «\u00a0${sujet}\u00a0». On peut dire «\u00a0${remplacant}\u00a0». On écrit «\u00a0${forme}\u00a0».`,
      },
    };
  },
});
