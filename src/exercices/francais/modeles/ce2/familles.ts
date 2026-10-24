/**
 * Compétence visée : trier et apparier des mots de la même famille (même radical,
 * sens lié), sans se laisser piéger par un mot qui ressemble seulement.
 * Attendus de fin de cycle 2 (CE2) ; axe « Reconnaître des mots de la même famille ».
 */
import { FAMILLES } from '../../lexique';
import { definirModeleTexte } from '../../moteur';

const INDICE = 'Des mots de la même famille se ressemblent ET parlent de la même chose.';

export const memeFamille = definirModeleTexte({
  id: 'meme-famille',
  titre: 'Les mots de la même famille',
  domaine: 'familles-mots',
  competence: 'Trouver un mot de la même famille qu’un mot donné.',
  classes: ['CE2'],
  // + : sans mot-piège parmi les propositions ; ++ et +++ : avec le mot qui ressemble.
  construire: (alea, _classe, niveau) => {
    const famille = alea.choix(FAMILLES);
    const avecPiege = niveau > 1 && famille.piege !== undefined;
    const reponse = alea.choix(famille.membres);
    const autres = alea.melanger(FAMILLES.filter((f) => f !== famille)).map((f) => alea.choix(f.membres));
    return {
      enonce: `« ${famille.mot} »`,
      question: 'Quel mot est de la même famille ?',
      reponse,
      distracteurs: [
        ...(avecPiege ? [{ valeur: famille.piege!, erreur: 'mot qui ressemble mais d’une autre famille' }] : []),
        ...autres.map((m) => ({ valeur: m, erreur: 'mot d’une autre famille' })),
      ],
      indice: INDICE,
      explication:
        `« ${reponse} » est de la même famille que « ${famille.mot} » : ils ont une partie commune et parlent de la même chose.` +
        (avecPiege ? ` « ${famille.piege} » lui ressemble, mais son sens n’a rien à voir.` : ''),
    };
  },
});

export const intrus = definirModeleTexte({
  id: 'intrus-famille',
  titre: 'L’intrus',
  domaine: 'familles-mots',
  competence: 'Repérer, dans une liste, le mot qui n’appartient pas à la famille.',
  classes: ['CE2'],
  construire: (alea) => {
    const famille = alea.choix(FAMILLES.filter((f) => f.piege));
    const piege = famille.piege!;
    const mots = alea.melanger([famille.mot, ...famille.membres.slice(0, 2), piege]);
    return {
      enonce: mots.join(', '),
      question: 'Quel mot n’est pas de la même famille que les autres ?',
      reponse: piege,
      distracteurs: mots.filter((m) => m !== piege).map((m) => ({ valeur: m, erreur: 'mot de la famille pris pour l’intrus' })),
      indice: INDICE,
      explication: `« ${piege} » ressemble à « ${famille.mot} », mais il ne parle pas de la même chose : c’est l’intrus.`,
    };
  },
});
