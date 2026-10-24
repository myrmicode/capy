/**
 * Compétence visée : différencier et nommer les principales classes de mots
 * (nom, verbe, adjectif, déterminant) dans une phrase simple.
 * Attendus de fin de cycle 2 (CE2) ; axe « Identifier la nature des mots ».
 */
import { definirModeleTexte, majuscule, phrase } from '../../moteur';
import { NATURES, phraseSimple, type Mot, type NatureMot } from '../../phrases';

const INDICE =
  'Un déterminant se place devant le nom. Un adjectif dit comment est le nom. Un verbe change si on dit « hier » ou « demain ».';

function explication(m: Mot, infinitif: string): string {
  switch (m.nature) {
    case 'Nom':
      return `« ${m.texte} » est un nom : on peut mettre « le », « la » ou « un » devant.`;
    case 'Verbe':
      return `« ${m.texte} » est un verbe (${infinitif}) : il change si on dit « hier » ou « demain ».`;
    case 'Adjectif':
      return `« ${m.texte} » est un adjectif : il dit comment est le nom « ${m.nom} » et s’accorde avec lui.`;
    case 'Déterminant':
      return `« ${m.texte} » est un déterminant : il se place devant le nom « ${m.nom} ».`;
  }
}

const ERREUR_CONFUSION = (choisie: NatureMot, vraie: NatureMot) => `${choisie.toLowerCase()} au lieu de ${vraie.toLowerCase()}`;

/** Jeu des paniers : un mot est mis en valeur, l'enfant dit sa nature. */
export const natureDuMot = definirModeleTexte({
  id: 'nature-du-mot',
  titre: 'Quelle nature ?',
  domaine: 'nature-mots',
  competence: 'Donner la nature d’un mot dans une phrase : nom, verbe, adjectif ou déterminant.',
  classes: ['CE2'],
  construire: (alea) => {
    const p = phraseSimple(alea);
    const cible = alea.entier(0, p.mots.length - 1);
    const mot = p.mots[cible];
    const segments = p.mots.map((m, i) => ({ texte: i === 0 ? majuscule(m.texte) : m.texte, ...(i === cible ? { surligne: true } : {}) }));
    return {
      enonce: phrase(segments),
      question: `Quelle est la nature du mot « ${mot.texte} » ?`,
      reponse: mot.nature,
      distracteurs: NATURES.filter((n) => n !== mot.nature).map((n) => ({ valeur: n, erreur: ERREUR_CONFUSION(n, mot.nature) })),
      segments,
      categories: [...NATURES],
      indice: INDICE,
      explication: explication(mot, p.infinitif),
    };
  },
});

/** Wagons de la phrase : l'enfant touche le verbe ou l'adjectif. */
export const trouverLeMot = definirModeleTexte({
  id: 'trouver-le-mot',
  titre: 'Trouve le mot',
  domaine: 'nature-mots',
  competence: 'Repérer dans une phrase le verbe ou l’adjectif.',
  classes: ['CE2'],
  construire: (alea) => {
    const p = phraseSimple(alea);
    const cherchee = alea.choix<NatureMot>(['Verbe', 'Adjectif']);
    const mot = p.mots.find((m) => m.nature === cherchee)!;
    const segments = p.mots.map((m, i) => ({ texte: i === 0 ? majuscule(m.texte) : m.texte }));
    // Le mot cherché doit être unique dans la phrase.
    if (segments.filter((s) => s.texte.toLowerCase() === mot.texte).length !== 1) return null;
    const autres = alea.melanger(p.mots.filter((m) => m !== mot));
    return {
      enonce: phrase(segments),
      question: cherchee === 'Verbe' ? 'Touche le verbe.' : 'Touche l’adjectif.',
      reponse: segments[p.mots.indexOf(mot)].texte,
      distracteurs: autres.map((m) => ({
        valeur: segments[p.mots.indexOf(m)].texte,
        erreur: ERREUR_CONFUSION(m.nature, cherchee),
      })),
      segments,
      indice: INDICE,
      explication: explication(mot, p.infinitif),
    };
  },
});
