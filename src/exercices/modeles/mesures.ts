/**
 * Grandeurs et mesures.
 * - Mesurer un segment avec la règle (axe « Placer un nombre sur une ligne
 *   graduée » : la règle est une ligne graduée), en centimètres puis en
 *   millimètres. Le piège classique : le segment ne commence pas à zéro.
 * - Convertir des mesures (atelier « Les mesures », hors toile) : mètres et
 *   centimètres, kilomètres et mètres, kilogrammes et grammes, litres et
 *   centilitres, heures et minutes.
 *
 * À FAIRE RELIRE PAR UN ENSEIGNANT, comme le reste du contenu.
 */
import type { Classe } from '@/config/classes';

import { definirModele, nb } from '../moteur';
import type { ReglesClasse } from '../types';

type Segment = { debut: number; fin: number };
const regleSegment = (
  debut: [number, number],
  fin: [number, number],
  longueur: [number, number],
): ReglesClasse<Segment> => ({
  donnees: { debut: { min: debut[0], max: debut[1] }, fin: { min: fin[0], max: fin[1] } },
  reponse: { min: longueur[0], max: longueur[1] },
});

/** En CM, on mesure au millimètre ; avant, au centimètre. */
const enMillimetres = (classe: Classe) => classe === 'CM1' || classe === 'CM2';

export const mesurerRegle = definirModele<Segment>({
  id: 'mesurer-regle',
  titre: 'Mesurer avec la règle',
  domaine: 'ligne-graduee',
  competence:
    'Mesurer un segment avec une règle graduée, même quand il ne commence pas à zéro (en cm, puis en mm au CM).',
  operations: ['−'],
  regles: {
    CE1: regleSegment([1, 6], [4, 15], [2, 14]),
    CE2: regleSegment([1, 8], [4, 15], [2, 14]),
    CM1: regleSegment([5, 60], [30, 150], [15, 145]),
    CM2: regleSegment([5, 60], [30, 150], [15, 145]),
  },
  reglesAccessibles: {
    // + : le segment part de zéro ; ++ : il part d'une graduation entière (CE) ou d'un centimètre entier (CM).
    CE1: { 1: regleSegment([0, 0], [2, 10], [2, 10]), 2: regleSegment([1, 2], [3, 12], [2, 10]) },
    CE2: { 1: regleSegment([0, 0], [2, 12], [2, 12]), 2: regleSegment([1, 4], [4, 14], [2, 12]) },
    CM1: { 1: regleSegment([0, 0], [15, 120], [15, 120]), 2: regleSegment([10, 50], [30, 150], [15, 120]) },
    CM2: { 1: regleSegment([0, 0], [15, 120], [15, 120]), 2: regleSegment([10, 50], [30, 150], [15, 120]) },
  },
  tirer: (alea, regles, niveau, classe) => {
    const { debut, fin } = regles.donnees;
    // Au CM, niveau ++ : le segment part d'un centimètre entier.
    const pas = enMillimetres(classe) && niveau === 2 ? 10 : 1;
    return {
      debut: pas * alea.entier(Math.ceil(debut.min / pas), Math.floor(debut.max / pas)),
      fin: alea.entier(fin.min, fin.max),
    };
  },
  estValide: ({ debut, fin }) => fin > debut + 1,
  calculer: ({ debut, fin }) => fin - debut,
  erreursTypiques: ({ debut, fin }) => [
    { valeur: fin, erreur: 'graduation de la fin lue sans enlever le début' },
    { valeur: fin - debut + 1, erreur: 'graduations comptées au lieu des intervalles' },
    { valeur: fin - debut - 1, erreur: 'une graduation oubliée' },
    { valeur: fin + debut, erreur: 'début ajouté au lieu d’être enlevé' },
  ],
  histoires: [
    ({ debut, fin }, r) => ({
      enonce: 'Capy a posé sa règle sous un segment.',
      question: 'Combien mesure le segment\u00a0?',
      illustration: { type: 'regle' as const, debut: debut * 10, fin: fin * 10 },
      indice:
        'Regarde où commence le segment\u00a0: ce n’est pas toujours à zéro. Compte les centimètres entre le début et la fin.',
      explication: `Le segment va de ${debut} à ${fin}\u00a0: ${fin}\u00a0−\u00a0${debut}\u00a0=\u00a0${nb(r)}. Il mesure ${nb(r)}\u00a0cm.`,
      facile: {
        enonce: 'Voici une règle et un segment.',
        question: 'Combien mesure le segment\u00a0?',
        indice: 'Regarde le début du segment. Compte jusqu’à la fin.',
        explication: `${fin}\u00a0−\u00a0${debut}\u00a0=\u00a0${nb(r)}. Le segment mesure ${nb(r)}\u00a0cm.`,
      },
    }),
  ],
  histoiresParClasse: Object.fromEntries(
    (['CM1', 'CM2'] as const).map((c) => [
      c,
      [
        ({ debut, fin }: Segment, r: number) => ({
          enonce: 'Capy a posé sa règle sous un segment. Mesure-le au millimètre près.',
          question: 'Combien de millimètres mesure le segment\u00a0?',
          illustration: { type: 'regle' as const, debut, fin, mm: true },
          indice:
            'Lis le début et la fin en millimètres\u00a0: un centimètre, c’est dix millimètres. Puis calcule l’écart.',
          explication: `Le segment va de ${debut}\u00a0mm à ${fin}\u00a0mm\u00a0: ${fin}\u00a0−\u00a0${debut}\u00a0=\u00a0${nb(r)}. Il mesure ${nb(r)}\u00a0mm.`,
          facile: {
            enonce: 'Voici une règle et un segment.',
            question: 'Combien de millimètres mesure le segment\u00a0?',
            indice: 'Un centimètre, c’est dix millimètres.',
            explication: `${fin}\u00a0−\u00a0${debut}\u00a0=\u00a0${nb(r)}. Le segment mesure ${nb(r)}\u00a0mm.`,
          },
        }),
      ],
    ]),
  ),
});

// --- Conversions ---

type Quantite = { quantite: number };
const regleQuantite = (min: number, max: number, facteur: number): ReglesClasse<Quantite> => ({
  donnees: { quantite: { min, max } },
  reponse: { min: min * facteur, max: max * facteur },
});

interface Conversion {
  id: string;
  titre: string;
  /** Unité de départ, unité d'arrivée (abrégées), et leur nom en toutes lettres. */
  de: string;
  vers: string;
  versLong: string;
  /** « Un mètre, c'est cent centimètres. » : écrit en lettres, pour ne pas donner de nombre dans l'indice. */
  rappel: string;
  facteur: number;
  regles: Partial<Record<Classe, [cible: [number, number], plus: [number, number], deuxPlus: [number, number]]>>;
  contextes: readonly ((q: string) => string)[];
}

function conversion(c: Conversion) {
  const classes = Object.entries(c.regles) as [Classe, [[number, number], [number, number], [number, number]]][];
  return definirModele<Quantite>({
    id: c.id,
    titre: c.titre,
    domaine: 'grandeurs',
    competence: `Convertir des ${c.de} en ${c.vers}\u00a0: ${c.rappel.toLowerCase()}`,
    operations: ['×'],
    regles: Object.fromEntries(classes.map(([cl, [cible]]) => [cl, regleQuantite(cible[0], cible[1], c.facteur)])),
    reglesAccessibles: Object.fromEntries(
      classes.map(([cl, [, plus, deuxPlus]]) => [
        cl,
        { 1: regleQuantite(plus[0], plus[1], c.facteur), 2: regleQuantite(deuxPlus[0], deuxPlus[1], c.facteur) },
      ]),
    ),
    calculer: ({ quantite }) => quantite * c.facteur,
    erreursTypiques: ({ quantite: q }) => [
      { valeur: (q * c.facteur) / 10, erreur: 'un zéro oublié' },
      { valeur: q * c.facteur * 10, erreur: 'un zéro en trop' },
      { valeur: q + c.facteur, erreur: 'addition au lieu de multiplication' },
      {
        valeur: q * (c.facteur === 60 ? 100 : c.facteur / 100 || 1),
        erreur: 'mauvaise correspondance entre les unités',
      },
    ],
    histoires: c.contextes.map((contexte) => ({ quantite: q }: Quantite, r: number) => ({
      enonce: contexte(`${nb(q)}\u00a0${c.de}`),
      question: `Combien de ${c.versLong} cela fait-il\u00a0?`,
      indice: `${c.rappel} Combien de fois faut-il compter cela\u00a0?`,
      explication: `${c.rappel} ${nb(q)}\u00a0${c.de}, c’est ${nb(q)} fois plus\u00a0: ${nb(r)}\u00a0${c.vers}.`,
      facile: {
        enonce: contexte(`${nb(q)}\u00a0${c.de}`),
        question: `Combien de ${c.versLong}\u00a0?`,
        indice: c.rappel,
        explication: `${nb(q)}\u00a0${c.de}, c’est ${nb(r)}\u00a0${c.vers}.`,
      },
    })),
  });
}

export const metresEnCentimetres = conversion({
  id: 'metres-en-cm',
  titre: 'Des mètres aux centimètres',
  de: 'm',
  vers: 'cm',
  versLong: 'centimètres',
  rappel: 'Un mètre, c’est cent centimètres.',
  facteur: 100,
  regles: {
    CE2: [
      [2, 60],
      [1, 9],
      [2, 30],
    ],
    CM1: [
      [2, 99],
      [2, 30],
      [2, 60],
    ],
    CM2: [
      [11, 99],
      [2, 60],
      [2, 99],
    ],
  },
  contextes: [(q) => `La corde à sauter de Lina mesure ${q}.`, (q) => `Le jardin de Capy mesure ${q} de long.`],
});

export const kilometresEnMetres = conversion({
  id: 'km-en-m',
  titre: 'Des kilomètres aux mètres',
  de: 'km',
  vers: 'm',
  versLong: 'mètres',
  rappel: 'Un kilomètre, c’est mille mètres.',
  facteur: 1000,
  regles: {
    CM1: [
      [2, 60],
      [1, 9],
      [2, 30],
    ],
    CM2: [
      [2, 99],
      [2, 30],
      [2, 60],
    ],
  },
  contextes: [(q) => `Pour aller à la mer, la famille de Noé roule ${q}.`, (q) => `La course du village fait ${q}.`],
});

export const kilogrammesEnGrammes = conversion({
  id: 'kg-en-g',
  titre: 'Des kilogrammes aux grammes',
  de: 'kg',
  vers: 'g',
  versLong: 'grammes',
  rappel: 'Un kilogramme, c’est mille grammes.',
  facteur: 1000,
  regles: {
    CE2: [
      [2, 60],
      [1, 9],
      [2, 30],
    ],
    CM1: [
      [2, 99],
      [2, 30],
      [2, 60],
    ],
    CM2: [
      [11, 99],
      [2, 60],
      [2, 99],
    ],
  },
  contextes: [(q) => `Le sac de pommes de terre pèse ${q}.`, (q) => `Le chien de Sam pèse ${q}.`],
});

export const litresEnCentilitres = conversion({
  id: 'litres-en-cl',
  titre: 'Des litres aux centilitres',
  de: 'L',
  vers: 'cL',
  versLong: 'centilitres',
  rappel: 'Un litre, c’est cent centilitres.',
  facteur: 100,
  regles: {
    CM1: [
      [2, 60],
      [1, 9],
      [2, 30],
    ],
    CM2: [
      [2, 99],
      [2, 30],
      [2, 60],
    ],
  },
  contextes: [(q) => `L’arrosoir de Capy contient ${q} d’eau.`, (q) => `Pour la fête, on prépare ${q} de jus.`],
});

type Duree = { heures: number; minutes: number };
const regleDuree = (h: [number, number], m: [number, number]): ReglesClasse<Duree> => ({
  donnees: { heures: { min: h[0], max: h[1] }, minutes: { min: m[0], max: m[1] } },
  reponse: { min: h[0] * 60 + m[0], max: h[1] * 60 + m[1] },
});

export const heuresEnMinutes = definirModele<Duree>({
  id: 'heures-en-minutes',
  titre: 'Des heures aux minutes',
  domaine: 'grandeurs',
  competence: 'Convertir une durée en heures et minutes en minutes\u00a0: une heure, c’est soixante minutes.',
  operations: ['×', '+'],
  regles: { CE2: regleDuree([1, 3], [5, 55]), CM1: regleDuree([1, 5], [5, 55]), CM2: regleDuree([1, 9], [1, 59]) },
  reglesAccessibles: {
    // + : une heure et quelques minutes ; ++ : deux heures.
    CE2: { 1: regleDuree([1, 1], [5, 55]), 2: regleDuree([1, 2], [5, 55]) },
    CM1: { 1: regleDuree([1, 2], [5, 55]), 2: regleDuree([1, 3], [5, 55]) },
    CM2: { 1: regleDuree([1, 3], [5, 55]), 2: regleDuree([1, 5], [5, 55]) },
  },
  tirer: (alea, regles) => ({
    heures: alea.entier(regles.donnees.heures.min, regles.donnees.heures.max),
    // De 5 en 5 minutes, comme sur une horloge (au CM2, toutes les minutes).
    minutes:
      regles.donnees.minutes.min === 1
        ? alea.entier(1, 59)
        : 5 * alea.entier(regles.donnees.minutes.min / 5, regles.donnees.minutes.max / 5),
  }),
  calculer: ({ heures, minutes }) => heures * 60 + minutes,
  erreursTypiques: ({ heures: h, minutes: m }) => [
    { valeur: h * 100 + m, erreur: 'une heure comptée comme cent minutes' },
    { valeur: h * 60, erreur: 'minutes oubliées' },
    { valeur: h + m, erreur: 'heures ajoutées comme des minutes' },
    { valeur: (h - 1) * 60 + m, erreur: 'une heure oubliée' },
  ],
  histoires: [
    ({ heures: h, minutes: m }, r) => ({
      enonce: `Le film du dimanche dure ${h}\u00a0h ${m}\u00a0min.`,
      question: 'Combien de minutes dure le film\u00a0?',
      indice: 'Une heure, c’est soixante minutes. Convertis d’abord les heures, puis ajoute les minutes.',
      explication: `${h}\u00a0h, c’est ${h}\u00a0×\u00a060\u00a0=\u00a0${h * 60}\u00a0min. ${h * 60}\u00a0+\u00a0${m}\u00a0=\u00a0${nb(r)}\u00a0min.`,
      facile: {
        enonce: `Le film dure ${h}\u00a0h ${m}\u00a0min.`,
        question: 'Combien de minutes en tout\u00a0?',
        indice: 'Une heure, c’est soixante minutes.',
        explication: `${h * 60}\u00a0+\u00a0${m}\u00a0=\u00a0${nb(r)}\u00a0min.`,
      },
    }),
    ({ heures: h, minutes: m }, r) => ({
      enonce: `La randonnée de Capy a duré ${h}\u00a0h ${m}\u00a0min.`,
      question: 'Combien de minutes a duré la randonnée\u00a0?',
      indice: 'Une heure, c’est soixante minutes. Compte les minutes de chaque heure, puis ajoute le reste.',
      explication: `${h}\u00a0×\u00a060\u00a0=\u00a0${h * 60}\u00a0min, et ${h * 60}\u00a0+\u00a0${m}\u00a0=\u00a0${nb(r)}\u00a0min.`,
      facile: {
        enonce: `La randonnée a duré ${h}\u00a0h ${m}\u00a0min.`,
        question: 'Combien de minutes en tout\u00a0?',
        indice: 'Une heure, c’est soixante minutes.',
        explication: `${h * 60}\u00a0+\u00a0${m}\u00a0=\u00a0${nb(r)}\u00a0min.`,
      },
    }),
  ],
});
