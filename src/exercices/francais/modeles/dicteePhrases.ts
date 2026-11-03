/**
 * Compétence visée : écrire sous la dictée une courte phrase, en mobilisant les
 * accords (pluriel du nom, adjectif, verbe et sujet), les homophones (a / à,
 * et / est, son / sont, on / ont) et les mots invariables. Axe « Écrire des
 * mots », du CE1 au CM2 : c'est là que tout se combine.
 */
import type { Classe } from '@/config/classes';

import type { Alea } from '../../alea';
import type { NiveauDifficulte } from '../../types';
import { PHRASES_DICTEE, phraseFautive, REGLES, type PhraseDictee } from '../phrasesDictees';
import { definirModeleTexte } from '../moteur';

/** Le degré visé : le niveau + du CE1 au degré 1, le niveau +++ du CM au degré 5. */
function degreVise(classe: Classe, niveau: NiveauDifficulte): number {
  const decalage = classe === 'CE1' ? 0 : classe === 'CE2' ? 1 : 2;
  return niveau + decalage;
}

/** Surtout des phrases du degré visé, parfois une plus simple pour se rassurer. */
function choisirPhrase(alea: Alea, degre: number): PhraseDictee {
  const plusSimples = PHRASES_DICTEE.filter((p) => p.degre < degre);
  if (plusSimples.length > 0 && alea.entier(0, 3) === 0) return alea.choix(plusSimples);
  return alea.choix(PHRASES_DICTEE.filter((p) => p.degre === degre));
}

const nombreDeMots = (phrase: string) => phrase.split(/[\s’]+/).length;

export const dicteePhrases = definirModeleTexte({
  id: 'dictee-phrase',
  titre: 'La dictée de phrases',
  domaine: 'ecrire-mots',
  competence:
    'Écrire une courte phrase dictée : accorder le nom, l’adjectif et le verbe, choisir entre a et à, et et est, son et sont.',
  classes: ['CE1', 'CE2', 'CM1', 'CM2'],
  construire: (alea, classe, niveau) => {
    const d = choisirPhrase(alea, degreVise(classe, niveau));
    // Les règles à rappeler, sans doublon (deux pièges de la même règle n'en font qu'un).
    const regles = [...new Set(d.pieges.map((x) => x.regle))];
    const rappels = [...new Set(regles.map((r) => REGLES[r].rappel))].slice(0, 2);
    const explications = d.pieges
      .filter((x, i) => d.pieges.findIndex((y) => y.mot === x.mot) === i)
      .map((x) => REGLES[x.regle].explication(x.mot));
    return {
      enonce: `Capy dit une phrase de ${nombreDeMots(d.phrase)} mots.`,
      question: 'Comment s’écrit la phrase de Capy ?',
      // Comme en classe : la phrase, puis la phrase encore une fois.
      lecture: `${d.phrase} ${d.phrase}`,
      reponse: d.phrase,
      distracteurs: alea.melanger(
        d.pieges.map((x) => ({ valeur: phraseFautive(d.phrase, x), erreur: REGLES[x.regle].erreur })),
      ),
      indice: `Écris mot par mot. ${rappels.join(' ')}`,
      explication: `On écrit « ${d.phrase} » ${explications.join(' ')}`,
      facile: {
        question: 'Comment s’écrit la phrase ?',
        indice: `Écris mot par mot. ${rappels[0]}`,
        explication: `Capy a dit : « ${d.phrase} » ${explications[0]}`,
      },
    };
  },
});
