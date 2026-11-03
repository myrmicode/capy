// Phrases de la dictée (axe « Écrire des mots », du CE1 au CM2). Chaque phrase
// porte ses pièges : le mot, la faute qu'on y fait souvent, et la règle qui
// l'évite. Les mauvaises propositions, l'indice, l'explication et le conseil
// après une erreur viennent de ces pièges.
// À FAIRE RELIRE par un enseignant : choix des phrases et des degrés.
import { conseilSaisie, normaliserSaisie } from './dictee';

export type Regle =
  | 'pluriel'
  | 'singulier'
  | 'x'
  | 'adjectif'
  | 'feminin'
  | 'masculin'
  | 'verbe'
  | 'a'
  | 'à'
  | 'est'
  | 'et'
  | 'sont'
  | 'son'
  | 'ont'
  | 'participe'
  | 'etre'
  | 'infinitif'
  | 'accent'
  | 'double'
  | 'invariable';

export interface Piege {
  mot: string;
  faute: string;
  regle: Regle;
}

export interface PhraseDictee {
  phrase: string;
  /**
   * Degré de difficulté, de 1 à 5 : le CE1 travaille les degrés 1 à 3, le CE2
   * les degrés 2 à 4, le CM les degrés 3 à 5.
   */
  degre: 1 | 2 | 3 | 4 | 5;
  pieges: readonly Piege[];
}

/** Ce que dit la règle pour le mot bien écrit (explication), et la question qui aide à la retrouver. */
export const REGLES: Record<Regle, { explication: (mot: string) => string; rappel: string; erreur: string }> = {
  pluriel: {
    explication: (m) => `« ${m} » prend la marque du pluriel : il y en a plusieurs.`,
    rappel: 'Il y en a plusieurs ?',
    erreur: 'marque du pluriel oubliée',
  },
  singulier: {
    explication: (m) => `« ${m} » est au singulier : il n’y en a qu’un.`,
    rappel: 'Il y en a un seul ?',
    erreur: 'pluriel en trop',
  },
  x: {
    explication: (m) => `« ${m} » prend un x au pluriel.`,
    rappel: 'Au pluriel, certains mots prennent un x.',
    erreur: 'pluriel en s au lieu de x',
  },
  adjectif: {
    explication: (m) => `« ${m} » s’accorde avec le nom qu’il accompagne.`,
    rappel: 'L’adjectif s’accorde avec son nom.',
    erreur: 'adjectif pas accordé',
  },
  feminin: {
    explication: (m) => `« ${m} » prend un e : le nom est féminin.`,
    rappel: 'Le nom est-il féminin ?',
    erreur: 'e du féminin oublié',
  },
  masculin: {
    explication: (m) => `« ${m} » n’a pas de e : le nom est masculin.`,
    rappel: 'Le nom est-il masculin ?',
    erreur: 'e du féminin en trop',
  },
  verbe: {
    explication: (m) => `« ${m} » s’accorde avec son sujet.`,
    rappel: 'Qui fait l’action ? Le verbe s’accorde avec lui.',
    erreur: 'verbe pas accordé avec le sujet',
  },
  a: {
    explication: () => '« a » sans accent, c’est le verbe avoir : on peut dire « avait ».',
    rappel: 'Peux-tu dire « avait » ?',
    erreur: 'à au lieu de a',
  },
  à: {
    explication: () => '« à » prend un accent : on ne peut pas dire « avait ».',
    rappel: 'Peux-tu dire « avait » ?',
    erreur: 'a au lieu de à',
  },
  est: {
    explication: () => '« est », c’est le verbe être : on peut dire « était ».',
    rappel: 'Peux-tu dire « était » ?',
    erreur: 'et au lieu de est',
  },
  et: {
    explication: () => '« et » relie deux mots : on peut dire « et puis ».',
    rappel: 'Peux-tu dire « et puis » ?',
    erreur: 'est au lieu de et',
  },
  sont: {
    explication: () => '« sont », c’est le verbe être : on peut dire « étaient ».',
    rappel: 'Peux-tu dire « étaient » ?',
    erreur: 'son au lieu de sont',
  },
  son: {
    explication: () => '« son » veut dire « le sien » : on peut dire « mon ».',
    rappel: 'Peux-tu dire « mon » ?',
    erreur: 'sont au lieu de son',
  },
  ont: {
    explication: () => '« ont », c’est le verbe avoir : on peut dire « avaient ».',
    rappel: 'Peux-tu dire « avaient » ?',
    erreur: 'on au lieu de ont',
  },
  participe: {
    explication: (m) => `« ${m} » finit par é : on peut dire « vendu ».`,
    rappel: 'Peux-tu dire « vendu » ?',
    erreur: 'infinitif au lieu du participe',
  },
  etre: {
    explication: (m) => `Avec être, « ${m} » s’accorde avec le sujet.`,
    rappel: 'Avec être, on accorde avec le sujet.',
    erreur: 'participe pas accordé avec être',
  },
  infinitif: {
    explication: (m) => `« ${m} » finit par -er : on peut dire « vendre ».`,
    rappel: 'Peux-tu dire « vendre » ?',
    erreur: 'participe au lieu de l’infinitif',
  },
  accent: {
    explication: (m) => `« ${m} » a un accent.`,
    rappel: 'Regarde bien les accents.',
    erreur: 'accent oublié',
  },
  double: {
    explication: (m) => `« ${m} » a deux fois la même consonne.`,
    rappel: 'Une consonne double ?',
    erreur: 'consonne double oubliée',
  },
  invariable: {
    explication: (m) => `« ${m} » ne change jamais.`,
    rappel: 'Ce mot ne change jamais.',
    erreur: 'mot invariable accordé',
  },
};

const p = (degre: PhraseDictee['degre'], phrase: string, ...pieges: [string, string, Regle][]): PhraseDictee => ({
  phrase,
  degre,
  pieges: pieges.map(([mot, faute, regle]) => ({ mot, faute, regle })),
});

export const PHRASES_DICTEE: readonly PhraseDictee[] = [
  // Degré 1 : phrases très courtes, un pluriel, a / à, et / est.
  p(
    1,
    'Les chats dorment.',
    ['chats', 'chat', 'pluriel'],
    ['dorment', 'dorme', 'verbe'],
    ['dorment', 'dormes', 'verbe'],
  ),
  p(1, 'Lou a un vélo.', ['a', 'à', 'a'], ['vélo', 'vélos', 'singulier'], ['vélo', 'velo', 'accent']),
  p(1, 'Le chien est petit.', ['est', 'et', 'est'], ['petit', 'petits', 'singulier'], ['chien', 'chiens', 'singulier']),
  p(1, 'Papa et maman lisent.', ['et', 'est', 'et'], ['lisent', 'lise', 'verbe'], ['lisent', 'lises', 'verbe']),
  p(1, 'Mes amis jouent.', ['amis', 'ami', 'pluriel'], ['jouent', 'joue', 'verbe'], ['jouent', 'joues', 'verbe']),
  p(1, 'Tom va à la mer.', ['à', 'a', 'à'], ['va', 'vas', 'verbe'], ['mer', 'mers', 'singulier']),
  p(
    1,
    'Les poules picorent.',
    ['poules', 'poule', 'pluriel'],
    ['picorent', 'picore', 'verbe'],
    ['picorent', 'picores', 'verbe'],
  ),
  p(1, 'Il a deux lapins.', ['a', 'à', 'a'], ['lapins', 'lapin', 'pluriel'], ['deux', 'deu', 'invariable']),
  p(1, 'La lune est ronde.', ['est', 'et', 'est'], ['ronde', 'rond', 'feminin'], ['ronde', 'rondes', 'singulier']),
  p(
    1,
    'Les vaches mangent.',
    ['vaches', 'vache', 'pluriel'],
    ['mangent', 'mange', 'verbe'],
    ['mangent', 'manges', 'verbe'],
  ),
  // Degré 2 : un adjectif à accorder, sont / son, plusieurs pièges.
  p(
    2,
    'Les petits oiseaux chantent.',
    ['petits', 'petit', 'adjectif'],
    ['oiseaux', 'oiseau', 'pluriel'],
    ['chantent', 'chante', 'verbe'],
  ),
  p(2, 'Ma sœur a une robe bleue.', ['a', 'à', 'a'], ['bleue', 'bleu', 'feminin'], ['robe', 'robes', 'singulier']),
  p(
    2,
    'Les enfants sont dans la cour.',
    ['sont', 'son', 'sont'],
    ['enfants', 'enfant', 'pluriel'],
    ['cour', 'cours', 'singulier'],
  ),
  p(2, 'Le chat de Léa est gris.', ['est', 'et', 'est'], ['gris', 'grise', 'masculin'], ['chat', 'chats', 'singulier']),
  p(2, 'Nous allons à la piscine.', ['allons', 'allon', 'verbe'], ['allons', 'allont', 'verbe'], ['à', 'a', 'à']),
  p(
    2,
    'Les fleurs du jardin sont belles.',
    ['fleurs', 'fleur', 'pluriel'],
    ['sont', 'son', 'sont'],
    ['belles', 'belle', 'adjectif'],
  ),
  p(2, 'Lina et Noé courent vite.', ['et', 'est', 'et'], ['courent', 'coure', 'verbe'], ['courent', 'cours', 'verbe']),
  p(2, 'Il y a des billes rouges.', ['billes', 'bille', 'pluriel'], ['rouges', 'rouge', 'adjectif'], ['a', 'à', 'a']),
  p(
    2,
    'Les chiens aboient fort.',
    ['chiens', 'chien', 'pluriel'],
    ['aboient', 'aboie', 'verbe'],
    ['fort', 'forts', 'invariable'],
  ),
  p(
    2,
    'Mon frère a un grand ballon.',
    ['a', 'à', 'a'],
    ['grand', 'grande', 'masculin'],
    ['ballon', 'ballons', 'singulier'],
  ),
  // Degré 3 : plusieurs accords, le participe après « a », le pluriel en x.
  p(
    3,
    'Les grandes maisons sont blanches.',
    ['grandes', 'grande', 'adjectif'],
    ['maisons', 'maison', 'pluriel'],
    ['sont', 'son', 'sont'],
    ['blanches', 'blanche', 'adjectif'],
  ),
  p(
    3,
    'Le boulanger et son fils font du pain.',
    ['et', 'est', 'et'],
    ['son', 'sont', 'son'],
    ['font', 'fonts', 'verbe'],
  ),
  p(
    3,
    'Mes cousines arrivent demain.',
    ['cousines', 'cousine', 'pluriel'],
    ['arrivent', 'arrive', 'verbe'],
    ['arrivent', 'arrives', 'verbe'],
  ),
  p(
    3,
    'Les élèves écoutent la maîtresse.',
    ['élèves', 'élève', 'pluriel'],
    ['écoutent', 'écoute', 'verbe'],
    ['maîtresse', 'maitresse', 'accent'],
  ),
  p(
    3,
    'Ce matin, Lou a mangé une pomme.',
    ['a', 'à', 'a'],
    ['mangé', 'manger', 'participe'],
    ['pomme', 'pome', 'double'],
  ),
  p(
    3,
    'Les chevaux galopent dans le pré.',
    ['chevaux', 'chevals', 'x'],
    ['galopent', 'galope', 'verbe'],
    ['pré', 'prés', 'singulier'],
  ),
  p(3, 'Elle est partie à l’école.', ['est', 'et', 'est'], ['à', 'a', 'à'], ['partie', 'parti', 'etre']),
  p(
    3,
    'Les gâteaux de mamie sont bons.',
    ['gâteaux', 'gâteaus', 'x'],
    ['sont', 'son', 'sont'],
    ['bons', 'bon', 'adjectif'],
  ),
  p(
    3,
    'Tu joues avec tes amis.',
    ['joues', 'joue', 'verbe'],
    ['amis', 'ami', 'pluriel'],
    ['avec', 'avecs', 'invariable'],
  ),
  p(
    3,
    'Nous chantons une chanson.',
    ['chantons', 'chanton', 'verbe'],
    ['chantons', 'chantont', 'verbe'],
    ['chanson', 'chansons', 'singulier'],
  ),
  // Degré 4 : le sujet loin du verbe, être et avoir, l'infinitif.
  p(
    4,
    'Les oiseaux du voisin chantent tôt.',
    ['chantent', 'chante', 'verbe'],
    ['oiseaux', 'oiseau', 'pluriel'],
    ['tôt', 'tot', 'accent'],
  ),
  p(
    4,
    'Mes sœurs sont allées au marché.',
    ['sont', 'son', 'sont'],
    ['allées', 'allé', 'etre'],
    ['allées', 'aller', 'participe'],
  ),
  p(
    4,
    'Il va acheter du pain à la boulangerie.',
    ['acheter', 'acheté', 'infinitif'],
    ['à', 'a', 'à'],
    ['va', 'vas', 'verbe'],
  ),
  p(
    4,
    'Les enfants ont joué toute la journée.',
    ['ont', 'on', 'ont'],
    ['joué', 'jouer', 'participe'],
    ['enfants', 'enfant', 'pluriel'],
  ),
  p(
    4,
    'Ces jolies fleurs sentent bon.',
    ['jolies', 'jolie', 'adjectif'],
    ['fleurs', 'fleur', 'pluriel'],
    ['sentent', 'sente', 'verbe'],
    ['bon', 'bons', 'invariable'],
  ),
  p(4, 'On a vu des bateaux sur la mer.', ['a', 'à', 'a'], ['bateaux', 'bateaus', 'x'], ['mer', 'mers', 'singulier']),
  p(4, 'Le chat et le chien sont amis.', ['et', 'est', 'et'], ['sont', 'son', 'sont'], ['amis', 'ami', 'pluriel']),
  p(
    4,
    'Ma grand-mère prépare de bonnes crêpes.',
    ['bonnes', 'bonne', 'adjectif'],
    ['crêpes', 'crêpe', 'pluriel'],
    ['bonnes', 'bones', 'double'],
  ),
  p(
    4,
    'Les feuilles tombent en automne.',
    ['feuilles', 'feuille', 'pluriel'],
    ['tombent', 'tombe', 'verbe'],
    ['tombent', 'tombes', 'verbe'],
  ),
  p(
    4,
    'Nous avons regardé les étoiles.',
    ['avons', 'avon', 'verbe'],
    ['regardé', 'regarder', 'participe'],
    ['étoiles', 'étoile', 'pluriel'],
  ),
  // Degré 5 : le nom piège avant le verbe, le participe avec être, chaque, beaucoup.
  p(
    5,
    'Les élèves de la classe préparent une fête.',
    ['préparent', 'prépare', 'verbe'],
    ['élèves', 'élève', 'pluriel'],
    ['fête', 'fete', 'accent'],
  ),
  p(
    5,
    'Elles sont arrivées en retard ce matin.',
    ['sont', 'son', 'sont'],
    ['arrivées', 'arrivé', 'etre'],
    ['arrivées', 'arriver', 'participe'],
  ),
  p(
    5,
    'Mon père m’a demandé de ranger ma chambre.',
    ['a', 'à', 'a'],
    ['demandé', 'demander', 'participe'],
    ['ranger', 'rangé', 'infinitif'],
  ),
  p(
    5,
    'Les nuages gris annoncent la pluie.',
    ['nuages', 'nuage', 'pluriel'],
    ['annoncent', 'annonce', 'verbe'],
    ['annoncent', 'annonces', 'verbe'],
  ),
  p(
    5,
    'Ces vieux arbres ont beaucoup de branches.',
    ['ont', 'on', 'ont'],
    ['beaucoup', 'beaucou', 'invariable'],
    ['branches', 'branche', 'pluriel'],
  ),
  p(
    5,
    'Après l’école, nous irons au parc.',
    ['irons', 'iront', 'verbe'],
    ['Après', 'Aprés', 'accent'],
    ['parc', 'parcs', 'singulier'],
  ),
  p(
    5,
    'Les enfants qui jouent dehors sont heureux.',
    ['jouent', 'joue', 'verbe'],
    ['sont', 'son', 'sont'],
    ['enfants', 'enfant', 'pluriel'],
  ),
  p(
    5,
    'Ma tante et mon oncle sont venus hier.',
    ['et', 'est', 'et'],
    ['sont', 'son', 'sont'],
    ['venus', 'venu', 'etre'],
  ),
  p(
    5,
    'Il faut manger des légumes chaque jour.',
    ['manger', 'mangé', 'infinitif'],
    ['légumes', 'légume', 'pluriel'],
    ['chaque', 'chaques', 'invariable'],
  ),
  p(
    5,
    'Les chiens ont aboyé toute la nuit.',
    ['ont', 'on', 'ont'],
    ['aboyé', 'aboyer', 'participe'],
    ['chiens', 'chien', 'pluriel'],
  ),
];

const LETTRE = '\\p{L}';

/** La phrase où le mot du piège est remplacé par sa faute (le mot est seul, pas dans un autre mot). */
export function phraseFautive(phrase: string, piege: Piege): string {
  return phrase.replace(new RegExp(`(?<!${LETTRE})${piege.mot}(?!${LETTRE})`, 'u'), piege.faute);
}

/** Majuscules, ponctuation et espaces ne comptent pas ; les lettres et les accents, si. */
function motsDe(texte: string): string[] {
  return normaliserSaisie(texte)
    .replace(/[.,!?;:]/g, ' ')
    .split(' ')
    .filter((m) => m !== '');
}

export function phraseJuste(saisie: string, phrase: string): boolean {
  return motsDe(saisie).join(' ') === motsDe(phrase).join(' ');
}

export function phraseDictee(phrase: string): PhraseDictee | undefined {
  return PHRASES_DICTEE.find((p) => p.phrase === phrase);
}

/**
 * Petit conseil bienveillant après une phrase pas encore bien écrite : il montre
 * le premier mot à revoir, tel que l'enfant l'a écrit (sans jamais l'écrire juste).
 */
export function conseilPhrase(saisie: string, phrase: string): string {
  const ecrits = motsDe(saisie);
  const attendus = motsDe(phrase);
  const ecart = attendus.length - ecrits.length;
  if (ecart === 1) return 'Il manque un mot. Réécoute la phrase.';
  if (ecart > 1) return 'Il manque quelques mots. Réécoute la phrase.';
  if (ecart === -1) return 'Il y a un mot en trop.';
  if (ecart < -1) return 'Il y a quelques mots en trop.';
  const i = ecrits.findIndex((m, k) => m !== attendus[k]);
  if (i < 0) return 'Réécoute la phrase, mot par mot.';
  const ecrit = ecrits[i];
  const piege = phraseDictee(phrase)?.pieges.find(
    (x) => normaliserSaisie(x.mot) === attendus[i] && normaliserSaisie(x.faute) === ecrit,
  );
  return `Relis « ${ecrit} » : ${piege ? REGLES[piege.regle].rappel : conseilSaisie(ecrit, attendus[i])}`;
}
