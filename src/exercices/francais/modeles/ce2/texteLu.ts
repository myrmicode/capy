/**
 * Compétence visée : comprendre un court texte lu seul — retrouver une information
 * écrite, relier un pronom à son personnage, puis déduire ce qui n'est pas écrit
 * (sentiment, moment, cause). Attendus de fin de cycle 2 (CE2) ;
 * axe « Comprendre un texte lu ».
 */
import type { Alea } from '../../../alea';
import type { DistracteurTexte, NiveauDifficulte } from '../../../types';
import { accorde, il, ils, PRENOMS, tirerDifferents, type Etre } from '../../comprehension';
import { definirModeleTexte, majuscule, NIVEAUX_CE1, NIVEAUX_CM, type ContenuTexte } from '../../moteur';

interface QuestionTexte {
  niveau: NiveauDifficulte;
  question: string;
  reponse: string;
  distracteurs: DistracteurTexte[];
  /** Phrase du texte qui donne (ou laisse deviner) la réponse. */
  preuve: number;
  /** Consigne du jeu « La bonne phrase ». */
  consignePreuve: string;
  /** Version FALC de la consigne, quand la consigne standard est trop longue. */
  consignePreuveFacile?: string;
  indice: string;
  /** La réponse n'est pas écrite telle quelle : il faut la déduire. */
  deduite?: boolean;
}

interface Histoire {
  phrases: string[];
  questions: QuestionTexte[];
}

const autres = (valeurs: readonly string[], reponse: string, erreur: string): DistracteurTexte[] =>
  valeurs.filter((v) => v !== reponse).map((valeur) => ({ valeur, erreur }));

// --- Histoire 1 : l'objet perdu ---

const SORTIES = [
  {
    lieu: 'au parc',
    activite: 'jouent au ballon',
    cachettes: ['sous un banc', 'derrière un arbre', 'près du toboggan'],
  },
  {
    lieu: 'à la plage',
    activite: 'construisent un château de sable',
    cachettes: ['dans le sable', 'sous une serviette', 'près des rochers'],
  },
  {
    lieu: 'à la bibliothèque',
    activite: 'lisent des histoires de pirates',
    cachettes: ['sous une table', 'derrière une étagère', 'près de la porte'],
  },
  {
    lieu: 'au marché',
    activite: 'achètent des pommes',
    cachettes: ['sous un stand', 'près de la fontaine', 'dans un panier vide'],
  },
] as const;

const OBJETS_PERDUS = [
  { son: 'son bonnet', le: 'le bonnet', pronom: 'le' },
  { son: 'sa casquette', le: 'la casquette', pronom: 'la' },
  { son: 'son écharpe', le: 'l’écharpe', pronom: 'la' },
  { son: 'son doudou', le: 'le doudou', pronom: 'le' },
  { son: 'sa gourde', le: 'la gourde', pronom: 'la' },
  { son: 'ses lunettes', le: 'les lunettes', pronom: 'les' },
] as const;

const MOMENTS = ['Mercredi', 'Dimanche', 'Samedi matin', 'Ce matin', 'Mardi soir'];
const SOLEIL = [
  { indice: 'Le soleil se lève à peine', moment: 'le matin' },
  { indice: 'Le soleil se couche déjà', moment: 'le soir' },
] as const;

function objetPerdu(alea: Alea, niveau: NiveauDifficulte): Histoire {
  const [p, q, absent1, absent2] = tirerDifferents(alea, PRENOMS, 4);
  const sortie = alea.choix(SORTIES);
  const objet = alea.choix(OBJETS_PERDUS);
  const cachette = alea.choix(sortie.cachettes);
  const moment = alea.choix(MOMENTS);
  const soleil = alea.choix(SOLEIL);
  const content = accorde(p, 'content', 'contente');
  const deduire = niveau === 3;

  const phrases = [
    deduire
      ? `${soleil.indice} quand ${p.nom} arrive ${sortie.lieu} avec ${q.nom}.`
      : `${moment}, ${p.nom} va ${sortie.lieu} avec ${q.nom}.`,
    `${majuscule(ils(p, q))} ${sortie.activite}.`,
    `Soudain, ${p.nom} ne trouve plus ${objet.son}.`,
    ...(niveau > 1 ? [`${majuscule(il(p))} cherche partout.`] : []),
    niveau === 1
      ? `${q.nom} retrouve ${objet.le} ${cachette}.`
      : `C’est ${q.nom} qui ${objet.pronom} retrouve ${cachette}.`,
    deduire
      ? `${p.nom} saute de joie et fait un gros câlin à ${q.nom}.`
      : `${p.nom} est ${content} et dit merci à ${q.nom}.`,
  ];
  const n = phrases.length;
  const toutesCachettes = SORTIES.flatMap((s) => s.cachettes);
  const pronomP = il(p);

  const questions: QuestionTexte[] = [
    {
      niveau: 1,
      question: `Où vont ${p.nom} et ${q.nom}\u00a0?`,
      reponse: sortie.lieu,
      distracteurs: autres(
        SORTIES.map((s) => s.lieu),
        sortie.lieu,
        'autre lieu',
      ),
      preuve: 0,
      consignePreuve: `Touche la phrase qui dit où vont ${p.nom} et ${q.nom}.`,
      indice: 'Relis le début de l’histoire.',
    },
    {
      niveau: 1,
      question: `Qu’est-ce que ${p.nom} a perdu\u00a0?`,
      reponse: objet.son,
      distracteurs: autres(
        OBJETS_PERDUS.map((o) => o.son),
        objet.son,
        'objet absent du texte',
      ),
      preuve: 2,
      consignePreuve: `Touche la phrase qui dit ce que ${p.nom} a perdu.`,
      indice: 'Cherche le moment où quelque chose ne va plus.',
    },
    {
      niveau: 1,
      question: `Qui retrouve ${objet.le}\u00a0?`,
      reponse: q.nom,
      distracteurs: [
        { valeur: p.nom, erreur: 'personnage principal pris pour celui qui agit' },
        { valeur: absent1.nom, erreur: 'personnage absent du texte' },
        { valeur: absent2.nom, erreur: 'personnage absent du texte' },
      ],
      preuve: n - 2,
      consignePreuve: `Touche la phrase qui dit qui retrouve ${objet.le}.`,
      indice: 'Cherche la phrase où l’objet est retrouvé.',
    },
    {
      niveau: 2,
      question: `Où était ${objet.le}\u00a0?`,
      reponse: cachette,
      distracteurs: autres(toutesCachettes, cachette, 'autre cachette'),
      preuve: n - 2,
      consignePreuve: `Touche la phrase qui dit où était ${objet.le}.`,
      indice: 'Cherche la phrase où l’objet est retrouvé\u00a0: elle dit aussi à quel endroit.',
    },
    {
      niveau: 2,
      question: `Que font ${p.nom} et ${q.nom} ${sortie.lieu}\u00a0?`,
      reponse: `${ils(p, q)} ${sortie.activite}`,
      distracteurs: autres(
        SORTIES.map((s) => `${ils(p, q)} ${s.activite}`),
        `${ils(p, q)} ${sortie.activite}`,
        'activité d’une autre histoire',
      ),
      preuve: 1,
      consignePreuve: `Touche la phrase qui dit ce que font ${p.nom} et ${q.nom}.`,
      indice: 'Relis la phrase qui suit le début de l’histoire.',
    },
  ];
  if (!deduire) {
    questions.push({
      niveau: 2,
      question: 'Quand se passe l’histoire\u00a0?',
      reponse: moment.toLowerCase(),
      distracteurs: autres(
        MOMENTS.map((m) => m.toLowerCase()),
        moment.toLowerCase(),
        'autre moment',
      ),
      preuve: 0,
      consignePreuve: 'Touche la phrase qui dit quand se passe l’histoire.',
      indice: 'Relis le début de la toute première phrase.',
    });
  } else {
    questions.push(
      {
        niveau: 3,
        question: `Comment se sent ${p.nom} à la fin\u00a0?`,
        reponse: content,
        distracteurs: [
          { valeur: accorde(p, 'inquiet', 'inquiète'), erreur: 'sentiment du milieu de l’histoire' },
          { valeur: 'triste', erreur: 'sentiment contraire' },
          { valeur: accorde(p, 'fatigué', 'fatiguée'), erreur: 'sentiment non justifié' },
        ],
        preuve: n - 1,
        consignePreuve: `Touche la phrase qui montre que ${p.nom} est ${content}.`,
        indice: 'Regarde ce que fait le personnage à la fin de l’histoire.',
        deduite: true,
      },
      {
        niveau: 3,
        question: 'À quel moment de la journée se passe l’histoire\u00a0?',
        reponse: soleil.moment,
        distracteurs: autres(['le matin', 'le soir', 'à midi', 'la nuit'], soleil.moment, 'moment non justifié'),
        preuve: 0,
        consignePreuve: 'Touche la phrase qui aide à savoir à quel moment de la journée se passe l’histoire.',
        consignePreuveFacile: 'À quel moment se passe l’histoire\u00a0? Touche la phrase qui aide.',
        indice: 'Regarde ce que fait le soleil.',
        deduite: true,
      },
      {
        niveau: 3,
        question: `Pourquoi ${p.nom} cherche-t-${pronomP} partout\u00a0?`,
        reponse: `parce qu’${pronomP} a perdu ${objet.son}`,
        distracteurs: [
          { valeur: `parce qu’${pronomP} joue à cache-cache`, erreur: 'cause inventée' },
          { valeur: `parce qu’${pronomP} veut rentrer`, erreur: 'cause inventée' },
          { valeur: `parce qu’${pronomP} a faim`, erreur: 'cause inventée' },
        ],
        preuve: 2,
        consignePreuve: `Touche la phrase qui explique pourquoi ${p.nom} cherche partout.`,
        indice: 'Relis la phrase juste avant celle où le personnage cherche.',
        deduite: true,
      },
    );
  }
  return { phrases, questions };
}

// --- Histoire 2 : la surprise d'anniversaire ---

const FETES: readonly Etre[] = [
  { nom: 'maman', genre: 'f' },
  { nom: 'papa', genre: 'm' },
  { nom: 'mamie', genre: 'f' },
  { nom: 'papi', genre: 'm' },
];
const PARFUMS = [
  { gateau: 'au chocolat', ingredient: 'du chocolat' },
  { gateau: 'aux fraises', ingredient: 'des fraises' },
  { gateau: 'aux pommes', ingredient: 'des pommes' },
  { gateau: 'à la vanille', ingredient: 'de la vanille' },
] as const;
const ACHATS = ['au marché', 'à l’épicerie', 'au supermarché', 'à la ferme'];
const CACHETTES_GATEAU = ['dans le placard', 'dans le garage', 'sous le lit', 'derrière le canapé'];

function anniversaire(alea: Alea, niveau: NiveauDifficulte): Histoire {
  const [p, q] = tirerDifferents(alea, PRENOMS, 2);
  const fete = alea.choix(FETES);
  const parfum = alea.choix(PARFUMS);
  const achat = alea.choix(ACHATS);
  const cachette = alea.choix(CACHETTES_GATEAU);
  const jour = alea.choix(['Mercredi', 'Dimanche', 'Samedi']);
  const eux = ils(p, q);
  const heureux = accorde(fete, 'heureux', 'heureuse');
  const deduire = niveau === 3;

  const phrases = [
    `${jour}, ${p.nom} et ${q.nom} préparent une surprise pour l’anniversaire de ${fete.nom}.`,
    `${majuscule(eux)} achètent ${parfum.ingredient} ${achat}.`,
    niveau === 1
      ? `Puis ${eux} font un gâteau ${parfum.gateau}.`
      : `Puis ${eux} font un gâteau ${parfum.gateau} et ${eux} le cachent ${cachette}.`,
    `Le soir, ${fete.nom} découvre le gâteau.`,
    deduire
      ? `${majuscule(fete.nom)} sourit jusqu’aux oreilles et serre les enfants dans ses bras.`
      : `${majuscule(fete.nom)} est très ${heureux}\u00a0!`,
  ];

  const questions: QuestionTexte[] = [
    {
      niveau: 1,
      question: 'Pour qui est la surprise\u00a0?',
      reponse: `pour ${fete.nom}`,
      distracteurs: autres(
        FETES.map((f) => `pour ${f.nom}`),
        `pour ${fete.nom}`,
        'autre personne',
      ),
      preuve: 0,
      consignePreuve: 'Touche la phrase qui dit pour qui est la surprise.',
      indice: 'Relis le début de l’histoire.',
    },
    {
      niveau: 1,
      question: `Quel gâteau font ${p.nom} et ${q.nom}\u00a0?`,
      reponse: `un gâteau ${parfum.gateau}`,
      distracteurs: autres(
        PARFUMS.map((x) => `un gâteau ${x.gateau}`),
        `un gâteau ${parfum.gateau}`,
        'autre gâteau',
      ),
      preuve: 2,
      consignePreuve: `Touche la phrase qui dit quel gâteau font ${p.nom} et ${q.nom}.`,
      indice: 'Cherche la phrase où les enfants cuisinent.',
    },
    {
      niveau: 2,
      question: `Où ${p.nom} et ${q.nom} achètent-${eux} ${parfum.ingredient}\u00a0?`,
      reponse: achat,
      distracteurs: autres(ACHATS, achat, 'autre lieu'),
      preuve: 1,
      consignePreuve: `Touche la phrase qui dit où ${p.nom} et ${q.nom} font les courses.`,
      indice: 'Cherche la phrase où les enfants font les courses.',
    },
    {
      niveau: 2,
      question: `Quand ${fete.nom} découvre-t-${il(fete)} le gâteau\u00a0?`,
      reponse: 'le soir',
      distracteurs: autres(['le matin', 'le soir', 'à midi', 'la nuit'], 'le soir', 'autre moment'),
      preuve: 3,
      consignePreuve: `Touche la phrase qui dit quand ${fete.nom} découvre le gâteau.`,
      indice: 'Cherche la phrase où le gâteau est découvert.',
    },
  ];
  if (niveau > 1) {
    questions.push({
      niveau: 2,
      question: 'Où les enfants cachent-ils le gâteau\u00a0?',
      reponse: cachette,
      distracteurs: autres(CACHETTES_GATEAU, cachette, 'autre cachette'),
      preuve: 2,
      consignePreuve: 'Touche la phrase qui dit où le gâteau est caché.',
      indice: 'Cherche la phrase où les enfants cachent quelque chose.',
    });
  }
  if (deduire) {
    questions.push(
      {
        niveau: 3,
        question: `Comment se sent ${fete.nom} quand ${il(fete)} découvre le gâteau\u00a0?`,
        reponse: heureux,
        distracteurs: [
          { valeur: 'triste', erreur: 'sentiment contraire' },
          { valeur: 'en colère', erreur: 'sentiment non justifié' },
          { valeur: accorde(fete, 'fatigué', 'fatiguée'), erreur: 'sentiment non justifié' },
        ],
        preuve: 4,
        consignePreuve: `Touche la phrase qui montre que ${fete.nom} est ${heureux}.`,
        indice: 'Regarde ce que fait le personnage à la fin de l’histoire.',
        deduite: true,
      },
      {
        niveau: 3,
        question: `Pourquoi ${p.nom} et ${q.nom} achètent-${eux} ${parfum.ingredient}\u00a0?`,
        reponse: 'pour faire un gâteau',
        distracteurs: [
          { valeur: 'pour un pique-nique', erreur: 'cause inventée' },
          { valeur: 'pour le goûter de l’école', erreur: 'cause inventée' },
          { valeur: 'pour nourrir les oiseaux', erreur: 'cause inventée' },
        ],
        preuve: 2,
        consignePreuve: `Touche la phrase qui aide à comprendre pourquoi ${p.nom} et ${q.nom} font des courses.`,
        consignePreuveFacile: 'Pourquoi les enfants font-ils des courses\u00a0? Touche la phrase qui aide.',
        indice: 'Regarde ce que font les enfants juste après les courses.',
        deduite: true,
      },
    );
  }
  return { phrases, questions };
}

/** Une histoire et une question, surtout du niveau demandé. */
function tirerQuestion(alea: Alea, niveau: NiveauDifficulte): { histoire: Histoire; q: QuestionTexte } {
  const histoire = alea.choix([objetPerdu, anniversaire])(alea, niveau);
  const duNiveau = histoire.questions.filter((q) => q.niveau === niveau);
  const plusSimples = histoire.questions.filter((q) => q.niveau < niveau);
  const q = plusSimples.length > 0 && alea.entier(0, 3) === 0 ? alea.choix(plusSimples) : alea.choix(duNiveau);
  return { histoire, q };
}

export const questionsTexte = definirModeleTexte({
  id: 'questions-texte',
  titre: 'Lis l’histoire',
  domaine: 'comprendre-texte-lu',
  competence:
    'Répondre à une question sur un court texte lu seul\u00a0: information écrite, puis information à déduire.',
  classes: ['CE1', 'CE2', 'CM1', 'CM2'],
  niveauxParClasse: { CE1: NIVEAUX_CE1, CM1: NIVEAUX_CM, CM2: NIVEAUX_CM },
  // + : texte court, réponse écrite telle quelle ; ++ : pronoms, lieux et moments ;
  // +++ : sentiment, moment ou cause à déduire d'indices.
  construire: (alea, _classe, niveau): ContenuTexte => {
    const { histoire, q } = tirerQuestion(alea, niveau);
    const preuve = histoire.phrases[q.preuve];
    return {
      enonce: histoire.phrases.join(' '),
      question: q.question,
      reponse: q.reponse,
      distracteurs: alea.melanger(q.distracteurs),
      lectureAutonome: true,
      indice: q.indice,
      explication: q.deduite
        ? `Le texte ne le dit pas avec ces mots, mais «\u00a0${preuve}\u00a0» le montre. La réponse est «\u00a0${q.reponse}\u00a0».`
        : `Le texte dit\u00a0: «\u00a0${preuve}\u00a0» La réponse est «\u00a0${q.reponse}\u00a0».`,
      ...(q.deduite
        ? {
            facile: {
              explication: `Le texte ne le dit pas. Mais «\u00a0${preuve}\u00a0» le montre. La réponse est «\u00a0${q.reponse}\u00a0».`,
            },
          }
        : {}),
    };
  },
});

/**
 * Comprendre un texte entendu : Capy raconte l'histoire, qui n'est pas écrite à
 * l'écran ; l'enfant peut la réécouter autant qu'il veut. Axe « Comprendre un
 * texte » (texte entendu) de la fiche.
 */
export const texteEntendu = definirModeleTexte({
  id: 'texte-entendu',
  titre: 'Écoute l’histoire',
  domaine: 'comprendre-texte-entendu',
  competence:
    'Comprendre un court texte entendu\u00a0: retrouver une information dite, puis déduire ce qui n’est pas dit.',
  classes: ['CP', 'CE2', 'CM1', 'CM2'],
  niveauxParClasse: { CP: { 1: 1, 2: 1, 3: 2 }, CM1: NIVEAUX_CM, CM2: NIVEAUX_CM },
  // Mêmes histoires et mêmes niveaux que « Lis l'histoire », mais entendues.
  construire: (alea, _classe, niveau): ContenuTexte => {
    const { histoire, q } = tirerQuestion(alea, niveau);
    const preuve = histoire.phrases[q.preuve];
    return {
      enonce: 'Touche «\u00a0Écouter\u00a0»\u00a0: Capy te raconte une histoire. Tu peux l’écouter plusieurs fois.',
      question: q.question,
      lecture: `${histoire.phrases.join(' ')} ${q.question}`,
      reponse: q.reponse,
      distracteurs: alea.melanger(q.distracteurs),
      indice:
        'Réécoute l’histoire en pensant à la question\u00a0: la réponse y est dite, ou des indices permettent de la trouver.',
      explication: `Dans l’histoire, Capy disait\u00a0: «\u00a0${preuve}\u00a0» La réponse est «\u00a0${q.reponse}\u00a0».`,
      facile: {
        indice: 'Réécoute l’histoire. Pense à la question.',
        explication: `Capy disait\u00a0: «\u00a0${preuve}\u00a0» La réponse est «\u00a0${q.reponse}\u00a0».`,
      },
    };
  },
});

export const preuveTexte = definirModeleTexte({
  id: 'preuve-texte',
  titre: 'La phrase qui le dit',
  domaine: 'comprendre-texte-lu',
  competence: 'Retrouver dans un texte la phrase qui donne une information ou qui permet de la déduire.',
  classes: ['CE1', 'CE2', 'CM1', 'CM2'],
  niveauxParClasse: { CE1: NIVEAUX_CE1, CM1: NIVEAUX_CM, CM2: NIVEAUX_CM },
  // Mêmes histoires et mêmes niveaux que « Lis l'histoire ».
  construire: (alea, _classe, niveau): ContenuTexte => {
    const { histoire, q } = tirerQuestion(alea, niveau);
    const reponse = histoire.phrases[q.preuve];
    return {
      enonce: histoire.phrases.join(' '),
      question: q.consignePreuve,
      ...(q.consignePreuveFacile ? { facile: { question: q.consignePreuveFacile } } : {}),
      reponse,
      distracteurs: histoire.phrases
        .filter((p) => p !== reponse)
        .map((valeur) => ({ valeur, erreur: 'phrase qui ne répond pas' })),
      phrases: histoire.phrases,
      lectureAutonome: true,
      indice: 'Relis les phrases une par une. Pour chacune, demande-toi si elle répond à la question.',
      explication: `C’est la phrase «\u00a0${reponse}\u00a0» qui le dit.`,
    };
  },
});
