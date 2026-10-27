/**
 * Exercices du CP, à l'oral : Capy dit un mot, une syllabe ou une lettre, et
 * l'enfant, qui ne lit pas encore bien, répond en touchant. Rien n'est jamais
 * enregistré : l'enfant ne parle pas à l'appli.
 * - « Manipuler des syllabes » : compter les syllabes d'un mot, trouver la première ;
 * - « Manipuler des phonèmes » : le premier son d'un mot ;
 * - « Connaître le nom des lettres » : toucher la lettre que Capy nomme ;
 * - « Connaître le son des lettres » : reconnaître la syllabe que Capy dit (m et i : mi).
 *
 * Les découpages viennent de la banque de syllabes (syllabes orales, lettres
 * muettes entre parenthèses). À FAIRE RELIRE PAR UN ENSEIGNANT.
 */
import { SYLLABES } from '@/contenu/syllabes';

import type { Alea } from '../../alea';
import type { NiveauDifficulte } from '../../types';
import { definirModeleTexte } from '../moteur';

/** Mots du quotidien d'un enfant de CP (ceux de la banque de syllabes). */
const MOTS = [
  'chat',
  'lapin',
  'tomate',
  'chapeau',
  'vélo',
  'pomme',
  'banane',
  'girafe',
  'moto',
  'tortue',
  'papillon',
  'ballon',
  'robe',
  'lune',
  'tapis',
  'domino',
  'bateau',
  'gâteau',
  'maison',
  'cheval',
  'poule',
  'vache',
  'fusée',
  'mouton',
  'renard',
  'salade',
  'radis',
  'sapin',
  'soleil',
  'camion',
  'pirate',
  'robot',
  'tulipe',
  'marteau',
  'valise',
  'cabane',
  'canard',
  'poupée',
  'fourmi',
  'fleur',
  'livre',
  'carotte',
  'tambour',
  'pyjama',
  'chocolat',
  'dinosaure',
  'animal',
  'hérisson',
  'nuage',
  'balai',
  'râteau',
  'souris',
  'cartable',
  'crocodile',
  'éléphant',
  'kangourou',
  'locomotive',
  'parapluie',
  'toboggan',
  'pantalon',
  'trottinette',
  'magasin',
  'escargot',
  'ordinateur',
  'coccinelle',
  'hippopotame',
  'télévision',
].filter((m) => SYLLABES[m] !== undefined);

/** Syllabes orales d'un mot, sans les lettres muettes : « cha-peau » → [cha, peau]. */
export function syllabesOrales(mot: string): string[] {
  return SYLLABES[mot].split('-').map((s) => s.replace(/\([^)]*\)/g, ''));
}

const ECOUTER = 'Touche «\u00a0Écouter\u00a0»\u00a0: Capy dit un mot.';
const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`;

export const compterSyllabes = definirModeleTexte({
  id: 'compter-syllabes',
  titre: 'Combien de syllabes\u00a0?',
  domaine: 'manipuler-syllabes',
  competence: 'Segmenter un mot entendu en syllabes orales et les compter.',
  classes: ['CP'],
  // + : mots d'une ou deux syllabes ; ++ : deux ou trois ; +++ : trois ou quatre.
  construire: (alea, _classe, niveau) => {
    const [min, max] = niveau === 1 ? [1, 2] : niveau === 2 ? [2, 3] : [3, 4];
    const mot = alea.choix(MOTS.filter((m) => syllabesOrales(m).length >= min && syllabesOrales(m).length <= max));
    const n = syllabesOrales(mot).length;
    const muette = SYLLABES[mot].endsWith('(e)');
    return {
      enonce: ECOUTER,
      question: 'Combien de syllabes entends-tu\u00a0?',
      lecture: mot,
      reponse: String(n),
      distracteurs: [
        { valeur: String(n + 1), erreur: muette ? 'le e muet de la fin prononcé' : 'une syllabe en trop' },
        ...(n > 1 ? [{ valeur: String(n - 1), erreur: 'une syllabe oubliée' }] : []),
        { valeur: String(n + 2), erreur: 'les lettres comptées au lieu des syllabes' },
        ...(n > 2 ? [{ valeur: String(n - 2), erreur: 'deux syllabes oubliées' }] : []),
      ],
      indice: 'Redis le mot en tapant dans tes mains à chaque syllabe.',
      explication: `Dans «\u00a0${mot}\u00a0», on entend ${pluriel(n, 'syllabe')}\u00a0: on tape ${n} fois dans les mains.`,
      facile: {
        indice: 'Tape dans tes mains à chaque syllabe.',
        explication: `«\u00a0${mot}\u00a0»\u00a0: ${pluriel(n, 'syllabe')}.`,
      },
    };
  },
});

const CONSONNES = ['b', 'd', 'f', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'ch'];
const VOYELLES = ['a', 'i', 'o', 'u', 'é'];
/** Consonnes qui s'entendent presque pareil : les pièges des niveaux plus exigeants. */
const PROCHES: Record<string, string[]> = {
  b: ['p', 'd'],
  p: ['b', 't'],
  d: ['t', 'b'],
  t: ['d', 'p'],
  f: ['v', 's'],
  v: ['f', 'b'],
  m: ['n', 'b'],
  n: ['m', 'd'],
  l: ['r', 'n'],
  r: ['l', 'v'],
  s: ['ch', 'f'],
  ch: ['s', 'f'],
};

/** Une syllabe simple consonne-voyelle au début du mot, et ses deux morceaux. */
function debutSimple(mot: string): { consonne: string; voyelle: string } | null {
  const premiere = syllabesOrales(mot)[0];
  const m = /^(ch|[bdflmnprstv])([aioué])$/.exec(premiere);
  return m ? { consonne: m[1], voyelle: m[2] } : null;
}

const MOTS_SIMPLES = MOTS.filter((m) => debutSimple(m) !== null);

/** Des consonnes différentes de celle-ci : proches au niveau +++, éloignées au niveau +. */
function autresConsonnes(alea: Alea, consonne: string, niveau: NiveauDifficulte): string[] {
  const proches = PROCHES[consonne];
  const loin = alea.melanger(CONSONNES.filter((c) => c !== consonne && !proches.includes(c)));
  return niveau === 1 ? loin.slice(0, 3) : niveau === 2 ? [proches[0], ...loin.slice(0, 2)] : [...proches, loin[0]];
}

export const premiereSyllabe = definirModeleTexte({
  id: 'premiere-syllabe',
  titre: 'La première syllabe',
  domaine: 'manipuler-syllabes',
  competence: 'Repérer la première syllabe d’un mot entendu.',
  classes: ['CP'],
  // + : les autres syllabes changent de consonne et de voyelle ; +++ : seule une lettre proche change.
  construire: (alea, _classe, niveau) => {
    const mot = alea.choix(MOTS_SIMPLES);
    const { consonne, voyelle } = debutSimple(mot)!;
    const reponse = consonne + voyelle;
    const autresVoyelles = alea.melanger(VOYELLES.filter((v) => v !== voyelle));
    const distracteurs = [
      ...autresConsonnes(alea, consonne, niveau).map((c) => ({ valeur: c + voyelle, erreur: 'consonne confondue' })),
      { valeur: consonne + autresVoyelles[0], erreur: 'voyelle confondue' },
      { valeur: voyelle + consonne, erreur: 'lettres inversées' },
    ];
    return {
      enonce: ECOUTER,
      question: 'Quelle syllabe entends-tu au début du mot\u00a0?',
      lecture: mot,
      reponse,
      distracteurs: niveau === 1 ? distracteurs.slice(0, 3) : alea.melanger(distracteurs),
      indice: 'Redis le mot doucement, et arrête-toi après le premier morceau.',
      explication: `«\u00a0${mot}\u00a0» commence par «\u00a0${reponse}\u00a0».`,
    };
  },
});

export const premierSon = definirModeleTexte({
  id: 'premier-son',
  titre: 'Le premier son',
  domaine: 'manipuler-phonemes',
  competence: 'Repérer le premier son (phonème) d’un mot entendu et l’associer à sa lettre.',
  classes: ['CP'],
  // + : sons très différents ; ++ : un son proche parmi les choix ; +++ : deux sons proches (b et p, f et v…).
  construire: (alea, _classe, niveau) => {
    const mot = alea.choix(MOTS_SIMPLES);
    const { consonne } = debutSimple(mot)!;
    return {
      enonce: ECOUTER,
      question: 'Quel son entends-tu au tout début du mot\u00a0?',
      lecture: mot,
      reponse: consonne,
      distracteurs: autresConsonnes(alea, consonne, niveau).map((c) => ({
        valeur: c,
        erreur: PROCHES[consonne].includes(c) ? 'son proche' : 'autre son',
      })),
      indice: 'Redis le mot en faisant durer le tout premier son, avant la voyelle.',
      explication: `«\u00a0${mot}\u00a0» commence par le son de la lettre «\u00a0${consonne}\u00a0».`,
      facile: { indice: 'Fais durer le premier son du mot.' },
    };
  },
});

/** Lettres qui se ressemblent à l'écrit : les pièges du nom des lettres. */
const LETTRES_SEMBLABLES: Record<string, string[]> = {
  b: ['d', 'p', 'q'],
  d: ['b', 'q', 'p'],
  p: ['q', 'b', 'd'],
  q: ['p', 'd', 'b'],
  m: ['n', 'u', 'w'],
  n: ['m', 'u', 'h'],
  u: ['n', 'v', 'w'],
  f: ['t', 'l', 'j'],
  t: ['f', 'l', 'i'],
  a: ['o', 'e', 'd'],
  e: ['a', 'c', 'o'],
  i: ['j', 'l', 't'],
  o: ['a', 'e', 'c'],
  s: ['z', 'c', 'x'],
  r: ['n', 'v', 'f'],
  v: ['u', 'w', 'y'],
};
/** Lettres faciles à distinguer, pour le niveau +. */
const LETTRES_SIMPLES = ['a', 'o', 'i', 's', 'l', 'm', 'r', 'v', 'e', 't'];

export const nomLettre = definirModeleTexte({
  id: 'nom-lettre',
  titre: 'Le nom des lettres',
  domaine: 'nom-lettres',
  competence: 'Associer le nom d’une lettre entendue à sa forme écrite.',
  classes: ['CP'],
  // + : des lettres très différentes ; ++ : une lettre qui ressemble ; +++ : b, d, p, q, m, n…
  construire: (alea, _classe, niveau) => {
    const lettre = alea.choix(niveau === 1 ? LETTRES_SIMPLES : Object.keys(LETTRES_SEMBLABLES));
    const semblables = LETTRES_SEMBLABLES[lettre] ?? [];
    const loin = alea.melanger(LETTRES_SIMPLES.filter((l) => l !== lettre && !semblables.includes(l)));
    const autres = niveau === 1 ? loin.slice(0, 3) : niveau === 2 ? [semblables[0], ...loin.slice(0, 2)] : semblables;
    return {
      enonce: 'Touche «\u00a0Écouter\u00a0»\u00a0: Capy dit le nom d’une lettre.',
      question: 'Quelle lettre Capy a-t-il dite\u00a0?',
      lecture: `La lettre ${lettre}.`,
      reponse: lettre,
      distracteurs: autres.map((l) => ({
        valeur: l,
        erreur: semblables.includes(l) ? 'lettre qui se ressemble à l’écrit' : 'autre lettre',
      })),
      indice:
        'Regarde bien le sens de chaque lettre\u00a0: le rond est-il à gauche ou à droite\u00a0? En haut ou en bas\u00a0?',
      explication: `Capy a dit la lettre «\u00a0${lettre}\u00a0», qui s’écrit aussi «\u00a0${lettre.toUpperCase()}\u00a0» en majuscule.`,
    };
  },
});

export const syllabeEntendue = definirModeleTexte({
  id: 'syllabe-entendue',
  titre: 'La syllabe de Capy',
  domaine: 'son-lettres',
  competence: 'Associer une syllabe entendue à son écriture (son de la consonne et son de la voyelle).',
  classes: ['CP'],
  // + : des sons qui durent (l, m, r, s, f, v) ; ++ : tous les sons ; +++ : aussi les syllabes à l'envers.
  construire: (alea, _classe, niveau) => {
    const consonnes = niveau === 1 ? ['l', 'm', 'r', 's', 'f', 'v'] : CONSONNES;
    const consonne = alea.choix(consonnes);
    const voyelle = alea.choix(VOYELLES.filter((v) => v !== 'é' || niveau > 1));
    // Pas de « as », « is »… à l'envers : on y entendrait parfois un s muet (tu as).
    const envers = niveau === 3 && consonne !== 'ch' && consonne !== 's' && alea.choix([true, false]);
    const reponse = envers ? voyelle + consonne : consonne + voyelle;
    const autresVoyelles = alea.melanger(VOYELLES.filter((v) => v !== voyelle && v !== 'é'));
    const proche = PROCHES[consonne][0];
    const distracteurs = envers
      ? [
          { valeur: consonne + voyelle, erreur: 'lettres inversées' },
          { valeur: autresVoyelles[0] + consonne, erreur: 'voyelle confondue' },
          { valeur: voyelle + proche, erreur: 'consonne confondue' },
        ]
      : [
          { valeur: proche + voyelle, erreur: 'consonne confondue' },
          { valeur: consonne + autresVoyelles[0], erreur: 'voyelle confondue' },
          ...(consonne === 'ch'
            ? [{ valeur: 's' + autresVoyelles[1], erreur: 'autre syllabe' }]
            : [{ valeur: voyelle + consonne, erreur: 'lettres inversées' }]),
        ];
    return {
      enonce: 'Touche «\u00a0Écouter\u00a0»\u00a0: Capy dit une syllabe.',
      question: 'Quelle syllabe Capy a-t-il dite\u00a0?',
      lecture: reponse,
      reponse,
      distracteurs: alea.melanger(distracteurs),
      indice: envers
        ? 'Écoute bien\u00a0: entends-tu d’abord la voyelle ou d’abord la consonne\u00a0?'
        : 'Écoute bien\u00a0: quel son vient en premier, puis en second\u00a0?',
      explication: `Capy a dit «\u00a0${reponse}\u00a0»\u00a0: ${envers ? `d’abord «\u00a0${voyelle}\u00a0», puis «\u00a0${consonne}\u00a0»` : `«\u00a0${consonne}\u00a0» et «\u00a0${voyelle}\u00a0»`}.`,
    };
  },
});
