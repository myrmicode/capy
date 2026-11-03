/**
 * Compétence visée (CE1, axe « Écrire des syllabes ») : écrire une syllabe
 * entendue, simple (ma), avec un son à deux lettres (chou, moi, ton), puis avec
 * deux consonnes (bra) ou une consonne finale (par). Comme dans les évaluations,
 * Capy dit la syllabe, l'enfant l'écrit au clavier. À FAIRE RELIRE PAR UN ENSEIGNANT.
 */
import { SYLLABES_DICTEES } from '@/contenu/syllabesDictees';

import type { DistracteurTexte } from '../../types';
import { definirModeleTexte } from '../moteur';

/** Consonnes qu'on confond à l'oreille (sourdes et sonores). */
const SOURDES_SONORES: Record<string, string> = { b: 'p', p: 'b', d: 't', t: 'd', f: 'v', v: 'f', m: 'n', n: 'm' };

/** Fautes qui formeraient un mot qu'on ne dit jamais à un enfant dans Capy. */
const A_EVITER = new Set(['nul']);

/** Fautes typiques d'une syllabe dictée : lettres inversées ou oubliées, son proche. */
export function fautesSyllabe(s: string): DistracteurTexte[] {
  const fautes: DistracteurTexte[] = [];
  const groupe = /^([bcdfgptv])([rl])(.+)$/.exec(s);
  const finale = /^([bdfmpstv])([aiou])([rl])$/.exec(s);
  const digramme = /^(ch|[a-z])(ou|oi|on)$/.exec(s);
  const simple = /^(ch|[a-z])([aioué])$/.exec(s);
  if (groupe) {
    const [, c1, c2, v] = groupe;
    fautes.push({ valeur: c1 + v + c2, erreur: 'lettres inversées' });
    fautes.push({ valeur: c1 + v, erreur: 'consonne oubliée' });
    if (SOURDES_SONORES[c1]) fautes.push({ valeur: SOURDES_SONORES[c1] + c2 + v, erreur: 'son proche' });
    fautes.push({ valeur: c1 + (c2 === 'r' ? 'l' : 'r') + v, erreur: 'r et l confondus' });
  } else if (finale) {
    const [, c, v, f] = finale;
    fautes.push({ valeur: c + f + v, erreur: 'lettres inversées' });
    fautes.push({ valeur: c + v, erreur: 'consonne finale oubliée' });
    if (SOURDES_SONORES[c]) fautes.push({ valeur: SOURDES_SONORES[c] + v + f, erreur: 'son proche' });
  } else if (digramme) {
    const [, c, son] = digramme;
    fautes.push({ valeur: c + son[0], erreur: 'son à deux lettres incomplet' });
    fautes.push({ valeur: c + son[1] + son[0], erreur: 'lettres inversées' });
    if (SOURDES_SONORES[c]) fautes.push({ valeur: SOURDES_SONORES[c] + son, erreur: 'son proche' });
    if (son === 'ou') fautes.push({ valeur: `${c}u`, erreur: 'u au lieu de ou' });
  } else if (simple) {
    const [, c, v] = simple;
    if (c === 'ch') {
      fautes.push({ valeur: `c${v}`, erreur: 'son à deux lettres incomplet' });
      fautes.push({ valeur: `s${v}`, erreur: 'son proche' });
      fautes.push({ valeur: `h${v}`, erreur: 'son à deux lettres incomplet' });
    } else {
      fautes.push({ valeur: v + c, erreur: 'lettres inversées' });
      if (SOURDES_SONORES[c]) fautes.push({ valeur: SOURDES_SONORES[c] + v, erreur: 'son proche' });
      fautes.push({
        valeur: c + (v === 'é' ? 'e' : v === 'u' ? 'ou' : v === 'o' ? 'on' : v === 'i' ? 'é' : 'o'),
        erreur: 'voyelle confondue',
      });
    }
  }
  return fautes.filter((f) => f.valeur !== s && f.valeur.length >= 2 && !A_EVITER.has(f.valeur));
}

/** « c, h, o, u » : les lettres une à une. */
const epeler = (s: string) => [...s].join(', ');

export const dicteeSyllabes = definirModeleTexte({
  id: 'dictee-syllabes',
  titre: 'La dictée de syllabes',
  domaine: 'ecrire-syllabes',
  competence:
    'Écrire une syllabe entendue : consonne et voyelle, sons à deux lettres, puis deux consonnes qui se suivent.',
  classes: ['CE1'],
  // + : ma, ti ; ++ : chou, moi, ton ; +++ : bra, clou, par.
  construire: (alea, _classe, niveau) => {
    // Parfois une syllabe plus simple, pour se rassurer.
    const niveauTire = niveau > 1 && alea.entier(0, 3) === 0 ? ((niveau - 1) as 1 | 2) : niveau;
    const s = alea.choix(SYLLABES_DICTEES[niveauTire]);
    return {
      enonce: 'Touche « Écouter » : Capy dit une syllabe.',
      question: 'Écris la syllabe que dit Capy.',
      // La syllabe, deux fois, comme en classe.
      lecture: `${s}… ${s}.`,
      reponse: s,
      distracteurs: alea.melanger(fautesSyllabe(s)),
      indice: 'Écoute chaque bruit, et écris-les dans l’ordre.',
      explication: `On entend « ${s} » : on écrit ${epeler(s)}.`,
    };
  },
});
