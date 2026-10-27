/**
 * Compétence visée : comprendre une phrase lue seul, y compris quand l'ordre des
 * mots ne suit pas l'ordre des faits (phrase passive, « c'est… que », négation,
 * comparaison, « avant de », position vue depuis l'autre objet).
 * Attendus de fin de cycle 2 (CE2) ; axe « Comprendre des phrases lues ».
 */
import type { Alea } from '../../../alea';
import type { NiveauDifficulte } from '../../../types';
import {
  accorde,
  ACTIONS,
  ACTIVITES,
  actif,
  ANIMAUX,
  cliveeObjet,
  cliveeSujet,
  COMPARAISONS,
  il,
  Le,
  le,
  OBJETS,
  passif,
  position,
  positionInverse,
  POSITIONS,
  PRENOMS,
  REPERES,
  tirerDifferents,
  type Action,
  type Etre,
} from '../../comprehension';
import { definirModeleTexte, majuscule, NIVEAUX_CE1, type ContenuTexte } from '../../moteur';

type Fabrique = (alea: Alea) => ContenuTexte;

/**
 * Surtout des tournures du niveau demandé, parfois une plus simple. L'enfant lit
 * seul : c'est la compétence travaillée, Capy ne lit pas la phrase.
 */
function tirerFabrique(
  alea: Alea,
  niveau: NiveauDifficulte,
  parNiveau: Record<NiveauDifficulte, readonly Fabrique[]>,
): Fabrique {
  const plusSimple = niveau > 1 && alea.entier(0, 3) === 0;
  const fabrique = alea.choix(parNiveau[plusSimple ? (alea.entier(1, niveau - 1) as NiveauDifficulte) : niveau]);
  return (a) => ({ ...fabrique(a), lectureAutonome: true });
}

const INDICE_ACTION = 'Cherche qui fait l’action. Attention : ce n’est pas toujours le premier animal de la phrase.';

// --- Qui fait quoi ? (une phrase, une question) ---

function quiFait(phraseDe: (a: Etre, p: Etre, v: Action) => string, demanderPatient: boolean): Fabrique {
  return (alea) => {
    const [agent, patient, absent] = tirerDifferents(alea, ANIMAUX, 3);
    const v = alea.choix(ACTIONS);
    const texte = phraseDe(agent, patient, v);
    const reponse = demanderPatient ? le(patient) : le(agent);
    return {
      enonce: texte,
      question: demanderPatient ? `Qui est ${v.participe} par l’autre ?` : `Qui ${v.present} l’autre ?`,
      reponse,
      distracteurs: [
        { valeur: demanderPatient ? le(agent) : le(patient), erreur: 'rôles inversés' },
        { valeur: 'les deux', erreur: 'action vue comme réciproque' },
        { valeur: le(absent), erreur: 'animal absent de la phrase' },
      ],
      indice: demanderPatient
        ? 'Cherche à qui on fait l’action. Attention : ce n’est pas toujours le dernier animal de la phrase.'
        : INDICE_ACTION,
      explication: `C’est ${le(agent)} qui ${v.present} ${le(patient)}. La réponse est donc « ${reponse} ».`,
    };
  };
}

function ou(inverse: boolean): Fabrique {
  return (alea) => {
    const objet = alea.choix(OBJETS);
    const repere = alea.choix(REPERES);
    const p = alea.choix(POSITIONS);
    const reponse = `${p} ${le(repere)}`;
    return {
      enonce: inverse ? positionInverse(objet, p, repere) : position(objet, p, repere),
      question: `Où est ${le(objet)} ?`,
      reponse,
      distracteurs: POSITIONS.filter((x) => x !== p).map((x) => ({
        valeur: `${x} ${le(repere)}`,
        erreur: 'position mal comprise',
      })),
      indice: 'Imagine la scène dans ta tête, ou dessine-la sur une feuille.',
      explication: `${position(objet, p, repere)} La réponse est « ${reponse} ».`,
    };
  };
}

function compare(moins: boolean): Fabrique {
  return (alea) => {
    const [x, y, absent] = tirerDifferents(alea, PRENOMS, 3);
    const c = alea.choix(COMPARAISONS);
    const adjX = accorde(x, ...c.adjectif);
    const texte = `${x.nom} est ${moins ? 'moins' : 'plus'} ${adjX} que ${y.nom}.`;
    const demanderContraire = alea.choix([true, false]);
    // Le plus « adjectif » : x avec « plus », y avec « moins ».
    const gagnant = moins !== demanderContraire ? y : x;
    const autre = gagnant === x ? y : x;
    const feminin = x.genre === 'f' && y.genre === 'f';
    const [m, f] = demanderContraire ? c.contraire : c.adjectif;
    const qualite = `${feminin ? 'la' : 'le'} plus ${feminin ? f : m}`;
    return {
      enonce: texte,
      question: `Qui est ${qualite} des deux ?`,
      reponse: gagnant.nom,
      distracteurs: [
        { valeur: autre.nom, erreur: moins ? '« moins » lu comme « plus »' : 'comparaison inversée' },
        { valeur: absent.nom, erreur: 'personne absente de la phrase' },
        { valeur: 'on ne peut pas savoir', erreur: 'comparaison non comprise' },
      ],
      indice: '« Plus » et « moins » ne veulent pas dire la même chose. Imagine les deux enfants côte à côte.',
      explication: `${texte} Donc ${gagnant.nom} est ${gagnant.genre === 'f' ? 'la' : 'le'} plus ${accorde(gagnant, m, f)} : la réponse est « ${gagnant.nom} ».`,
    };
  };
}

function nePas(alea: Alea): ContenuTexte {
  const a = alea.choix(ANIMAUX);
  const [pas, fait, ...autres] = tirerDifferents(alea, ACTIVITES, 4);
  const reponse = `${il(a)} ${fait.present}`;
  return {
    enonce: `${Le(a)} ne ${pas.present} pas, ${il(a)} ${fait.present}.`,
    question: `Que fait ${le(a)} ?`,
    reponse,
    distracteurs: [
      { valeur: `${il(a)} ${pas.present}`, erreur: 'négation non lue' },
      ...autres.map((x) => ({ valeur: `${il(a)} ${x.present}`, erreur: 'action absente de la phrase' })),
    ],
    indice: 'Le petit mot « pas » montre ce que l’animal ne fait pas.',
    explication: `« Ne… pas » veut dire que ${le(a)} ne ${pas.present} pas. La réponse est « ${reponse} ».`,
  };
}

/** Ordre des actions : « puis » (dans l'ordre), « avant de » et « après avoir » (à l'envers). */
function ordre(tournure: 'puis' | 'avant' | 'apres'): Fabrique {
  return (alea) => {
    const a = alea.choix(ANIMAUX);
    const [premier, second, ...autres] = tirerDifferents(alea, ACTIVITES, 4);
    const texte = {
      puis: `${Le(a)} ${premier.present}, puis ${il(a)} ${second.present}.`,
      avant: `Avant de ${second.infinitif}, ${le(a)} ${premier.present}.`,
      apres: `${Le(a)} ${second.present} après avoir ${premier.participe}.`,
    }[tournure];
    const enPremier = tournure !== 'puis' || alea.choix([true, false]);
    const [bonne, mauvaise] = enPremier ? [premier, second] : [second, premier];
    const reponse = `${il(a)} ${bonne.present}`;
    return {
      enonce: texte,
      question: `Que fait ${le(a)} en ${enPremier ? 'premier' : 'dernier'} ?`,
      reponse,
      distracteurs: [
        { valeur: `${il(a)} ${mauvaise.present}`, erreur: 'ordre des actions inversé' },
        ...autres.map((x) => ({ valeur: `${il(a)} ${x.present}`, erreur: 'action absente de la phrase' })),
      ],
      indice: 'Cherche l’action qui se passe avant l’autre. Ce n’est pas forcément celle qui est écrite en premier.',
      explication: `${majuscule(le(a))} ${premier.present} d’abord, puis ${il(a)} ${second.present}. La réponse est « ${reponse} ».`,
    };
  };
}

export const quiFaitQuoi = definirModeleTexte({
  id: 'qui-fait-quoi',
  titre: 'Lis et réponds',
  domaine: 'comprendre-phrases-lues',
  competence:
    'Comprendre une phrase lue seul : qui agit, où, comment, dans quel ordre, même avec une tournure inhabituelle.',
  classes: ['CE1', 'CE2'],
  niveauxParClasse: { CE1: NIVEAUX_CE1 },
  // + : phrases dans l'ordre des faits ; ++ : passif, négation, « plus que », « puis » ;
  // +++ : « c'est… que », « moins que », « avant de », « après avoir », position vue depuis l'autre objet.
  construire: (alea, _classe, niveau) =>
    tirerFabrique(alea, niveau, {
      1: [quiFait(actif, false), ou(false), quiFait(cliveeSujet, false)],
      2: [quiFait(passif, false), quiFait(actif, true), nePas, compare(false), ordre('puis')],
      3: [quiFait(cliveeObjet, false), quiFait(passif, true), compare(true), ordre('avant'), ordre('apres'), ou(true)],
    })(alea),
});

// --- La phrase qui dit la même chose (jeu « La bonne phrase ») ---

function memeSensAction(niveau: NiveauDifficulte): Fabrique {
  return (alea) => {
    const [a, b] = tirerDifferents(alea, ANIMAUX, 2);
    const [v, w] = tirerDifferents(alea, ACTIONS, 2);
    const candidats: [string, string][] =
      niveau === 1
        ? [
            [actif(a, b, v), ''],
            [actif(b, a, v), 'rôles inversés'],
            [actif(a, b, w), 'autre action'],
            [actif(b, a, w), 'autre action, rôles inversés'],
          ]
        : niveau === 2
          ? [
              [passif(a, b, v), ''],
              [passif(b, a, v), 'passif mal lu'],
              [actif(b, a, v), 'rôles inversés'],
              [passif(a, b, w), 'autre action'],
            ]
          : [
              [cliveeObjet(a, b, v), ''],
              [cliveeSujet(b, a, v), '« qui » et « que » confondus'],
              [passif(b, a, v), 'passif mal lu'],
              [cliveeObjet(b, a, v), 'rôles inversés'],
            ];
    const reponse = candidats[0][0];
    const phrases = alea.melanger(candidats.map(([p]) => p));
    return {
      enonce: phrases.join(' '),
      question: `Touche la phrase où c’est ${le(a)} qui ${v.present} ${le(b)}.`,
      reponse,
      distracteurs: candidats.slice(1).map(([valeur, erreur]) => ({ valeur, erreur })),
      phrases,
      indice: INDICE_ACTION,
      explication: `Dans « ${reponse} », c’est bien ${le(a)} qui ${v.present} ${le(b)}.`,
    };
  };
}

function memeSensPosition(alea: Alea): ContenuTexte {
  const objet = alea.choix(OBJETS);
  const repere = alea.choix(REPERES);
  const [p, ...autres] = tirerDifferents(alea, POSITIONS, 4);
  const reponse = positionInverse(objet, p, repere);
  const phrases = alea.melanger([reponse, ...autres.map((x) => positionInverse(objet, x, repere))]);
  return {
    enonce: phrases.join(' '),
    question: `Touche la phrase qui veut dire : « ${position(objet, p, repere)} »`,
    reponse,
    distracteurs: phrases
      .filter((x) => x !== reponse)
      .map((valeur) => ({ valeur, erreur: 'position vue depuis l’autre objet mal comprise' })),
    phrases,
    indice: 'Imagine la scène, puis regarde-la depuis l’autre objet.',
    explication: `« ${reponse} » décrit la même scène, vue depuis ${le(repere)}.`,
  };
}

export const memeSens = definirModeleTexte({
  id: 'meme-sens',
  titre: 'La phrase qui dit pareil',
  domaine: 'comprendre-phrases-lues',
  competence: 'Reconnaître, parmi des phrases proches, celle qui décrit la situation donnée.',
  classes: ['CE1', 'CE2'],
  niveauxParClasse: { CE1: NIVEAUX_CE1 },
  // + : phrases simples ; ++ : phrases passives ; +++ : « c'est… que » et positions inversées.
  construire: (alea, _classe, niveau) =>
    tirerFabrique(alea, niveau, {
      1: [memeSensAction(1)],
      2: [memeSensAction(2)],
      3: [memeSensAction(3), memeSensPosition],
    })(alea),
});
