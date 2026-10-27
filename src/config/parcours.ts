// Parcours par thème : des unités d'étapes, chacune terminée par un coffre.
// Chaque étape choisit les modèles d'exercices travaillés et mélange 2 ou 3 mini-jeux.
import type { JeuId } from '@/jeux/registre';

import type { Classe } from './classes';
import type { DomaineId } from './domaines';
import { THEMES_CE1 } from './parcoursCE1';
import { texteEntendu, THEMES_CM1, THEMES_CM2 } from './parcoursCM';
import { THEMES_NOMBRES } from './parcoursNombres';
import { THEMES_CP } from './parcoursCP';
import { THEMES_ATELIERS, uniteRegle } from './parcoursAteliers';
import { unite } from './unites';

export interface EtapeTheme {
  id: string;
  titre: string;
  modeles: readonly string[];
  jeux: readonly JeuId[];
  nombreQuestions: number;
}

export interface Unite {
  id: string;
  /** Nom imagé de l'unité (« Au marché »). */
  titre: string;
  /** Ce qu'on y apprend, en mots simples : il accompagne toujours le nom imagé. */
  objectif: string;
  etapes: readonly EtapeTheme[];
  /** Identifiant du coffre de fin d'unité. */
  coffre: string;
}

export interface Theme {
  id: string;
  domaine: DomaineId;
  classe: Classe;
  /** Titre dit à l'enfant : ce qu'il fait, pas le nom savant de la compétence. */
  titre: string;
  /** Une phrase qui dit ce qu'on apprend (« Calculer vite, sans poser l'opération. »). */
  description: string;
  /** Un exemple très court, pour reconnaître le thème d'un coup d'œil. */
  exemple: string;
  unites: readonly Unite[];
}

const RESOUDRE_PROBLEMES_CE2: Theme = {
  id: 'ce2-resoudre-problemes',
  domaine: 'resoudre-problemes',
  classe: 'CE2',
  titre: 'Résoudre des problèmes',
  description: 'Lire une petite histoire et trouver le bon calcul.',
  exemple: '5 pommes, puis 3 de plus : combien ?',
  unites: [
    {
      id: 'ce2-rp-u1',
      titre: 'Au marché',
      objectif: 'Ajouter, enlever, faire des paquets.',
      coffre: 'ce2-rp-u1-coffre',
      etapes: [
        {
          id: 'ce2-rp-1',
          titre: 'Les paquets',
          modeles: ['groupements'],
          jeux: ['marche', 'reponses'],
          nombreQuestions: 5,
        },
        { id: 'ce2-rp-2', titre: 'On en ajoute', modeles: ['ajout'], jeux: ['bonFil', 'reponses'], nombreQuestions: 5 },
        {
          id: 'ce2-rp-3',
          titre: 'On en enlève',
          modeles: ['retrait'],
          jeux: ['bonFil', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-rp-4',
          titre: 'Ajouter ou enlever ?',
          modeles: ['ajout', 'retrait'],
          jeux: ['bonFil', 'questionPerdue', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-rp-5',
          titre: 'Petite révision',
          modeles: ['groupements', 'ajout', 'retrait'],
          jeux: ['marche', 'bonFil', 'reponses'],
          nombreQuestions: 6,
        },
      ],
    },
    {
      id: 'ce2-rp-u2',
      titre: 'À la ferme',
      objectif: 'Comparer, partager, calculer en deux fois.',
      coffre: 'ce2-rp-u2-coffre',
      etapes: [
        {
          id: 'ce2-rp-6',
          titre: 'Combien de plus ?',
          modeles: ['ecart'],
          jeux: ['bonFil', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-rp-7',
          titre: 'Multiplier et partager',
          modeles: ['groupements', 'partage'],
          jeux: ['marche', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-rp-8',
          titre: 'En deux étapes',
          modeles: ['deux-etapes', 'ajout'],
          jeux: ['bonFil', 'questionPerdue', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-rp-9',
          titre: 'Le bon calcul',
          modeles: ['ecart', 'retrait', 'groupements'],
          jeux: ['bonFil', 'reponses'],
          nombreQuestions: 6,
        },
        {
          id: 'ce2-rp-10',
          titre: 'Grande révision',
          modeles: ['groupements', 'ajout', 'retrait', 'ecart', 'partage', 'deux-etapes'],
          jeux: ['marche', 'bonFil', 'questionPerdue', 'reponses'],
          nombreQuestions: 7,
        },
      ],
    },
    // Ajoutée après les autres : la progression des enfants qui ont déjà commencé ne bouge pas.
    {
      id: 'ce2-rp-u3',
      titre: 'À la boutique',
      objectif: 'Payer, rendre la monnaie, compter les heures.',
      coffre: 'ce2-rp-u3-coffre',
      etapes: [
        {
          id: 'ce2-rp-u3-1',
          titre: 'Payer ses achats',
          modeles: ['payer'],
          jeux: ['caisse', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-rp-u3-2',
          titre: 'Rendre la monnaie',
          modeles: ['rendre-monnaie'],
          jeux: ['caisse', 'bonFil', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-rp-u3-3',
          titre: 'L’heure qui passe',
          modeles: ['duree'],
          jeux: ['horloge', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-rp-u3-4',
          titre: 'Révision',
          modeles: ['payer', 'rendre-monnaie', 'duree'],
          jeux: ['caisse', 'horloge', 'questionPerdue'],
          nombreQuestions: 6,
        },
      ],
    },
  ],
};

const CALCUL_MENTAL_CE2: Theme = {
  id: 'ce2-calcul-mental',
  domaine: 'calcul-mental',
  classe: 'CE2',
  titre: 'Calculer dans sa tête',
  description: 'Calculer vite, sans poser l’opération.',
  exemple: '8 + 7 = 15',
  unites: [
    {
      id: 'ce2-cm-u1',
      titre: 'Le carnet de calcul',
      objectif: 'Les tables, les doubles, aller jusqu’à 100.',
      coffre: 'ce2-cm-u1-coffre',
      etapes: [
        {
          id: 'ce2-cm-1',
          titre: 'Les tables',
          modeles: ['tables'],
          jeux: ['lucioles', 'reponses'],
          nombreQuestions: 6,
        },
        {
          id: 'ce2-cm-2',
          titre: 'Le double',
          modeles: ['doubles'],
          jeux: ['lucioles', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-cm-3',
          titre: 'Aller jusqu’à 100',
          modeles: ['complement-cent'],
          jeux: ['lucioles', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-cm-4',
          titre: 'De dizaine en dizaine',
          modeles: ['ajouter-dizaines'],
          jeux: ['lucioles', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-cm-5',
          titre: 'Révision',
          modeles: ['tables', 'doubles', 'complement-cent', 'ajouter-dizaines'],
          jeux: ['lucioles', 'reponses'],
          nombreQuestions: 7,
        },
      ],
    },
  ],
};

const LIGNE_GRADUEE_CE2: Theme = {
  id: 'ce2-ligne-graduee',
  domaine: 'ligne-graduee',
  classe: 'CE2',
  titre: 'Placer des nombres sur une ligne',
  description: 'Trouver où va un nombre sur une ligne graduée.',
  exemple: '0, 10, 20… où va 15 ?',
  unites: [
    {
      id: 'ce2-lg-u1',
      titre: 'Le fil du funambule',
      objectif: 'Lire et placer des nombres sur une ligne.',
      coffre: 'ce2-lg-u1-coffre',
      etapes: [
        {
          id: 'ce2-lg-1',
          titre: 'Petits pas',
          modeles: ['placer-petits-pas', 'lire-petits-pas'],
          jeux: ['funambule', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-lg-2',
          titre: 'Grands pas',
          modeles: ['placer-grands-pas', 'lire-grands-pas'],
          jeux: ['funambule', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-lg-3',
          titre: 'Tous les pas',
          modeles: ['placer-petits-pas', 'placer-grands-pas', 'lire-petits-pas', 'lire-grands-pas'],
          jeux: ['funambule', 'reponses'],
          nombreQuestions: 6,
        },
        {
          id: 'ce2-lg-4',
          titre: 'Révision',
          modeles: ['placer-petits-pas', 'placer-grands-pas', 'lire-petits-pas', 'lire-grands-pas'],
          jeux: ['funambule', 'reponses'],
          nombreQuestions: 7,
        },
      ],
    },
  ],
};

// --- Français CE2 ---

const ACCORD_CE2: Theme = {
  id: 'ce2-accord',
  domaine: 'accord-nom-adjectif',
  classe: 'CE2',
  titre: 'Accorder les adjectifs',
  description: 'Mettre la bonne fin à l’adjectif : e, s ou es.',
  exemple: 'des fleurs bleues',
  unites: [
    unite('ce2-acc-u1', 'Le jardin des accords', 'Choisir la bonne fin : e, s ou es.', [
      ['Le bon accord', ['accord-adjectif'], ['lucioles', 'reponses'], 5],
      ['Masculin ou féminin ?', ['accord-adjectif'], ['lucioles', 'reponses'], 5],
      ['Singulier ou pluriel ?', ['accord-adjectif'], ['lucioles', 'reponses'], 6],
      ['Révision', ['accord-adjectif'], ['lucioles', 'reponses'], 7],
    ]),
  ],
};

const NATURE_CE2: Theme = {
  id: 'ce2-nature',
  domaine: 'nature-mots',
  classe: 'CE2',
  // Espace insécable : le point d'interrogation ne passe jamais seul à la ligne.
  titre: 'Nom, verbe ou adjectif\u00a0?',
  description: 'Reconnaître la sorte de chaque mot.',
  exemple: 'chat : nom · courir : verbe',
  unites: [
    unite('ce2-nat-u1', 'Les paniers de mots', 'Ranger les mots : nom, verbe, adjectif.', [
      ['Nom ou verbe ?', ['nature-du-mot', 'trouver-le-mot'], ['paniers', 'wagons'], 5],
      ['Trouve le mot', ['trouver-le-mot', 'nature-du-mot'], ['wagons', 'paniers', 'reponses'], 5],
      ['Ranger les mots', ['nature-du-mot'], ['paniers', 'reponses'], 6],
      ['Révision', ['nature-du-mot', 'trouver-le-mot'], ['paniers', 'wagons', 'reponses'], 7],
    ]),
  ],
};

const SYNONYMES_CE2: Theme = {
  id: 'ce2-synonymes',
  domaine: 'synonymes',
  classe: 'CE2',
  titre: 'Les synonymes',
  description: 'Trouver un mot qui veut dire presque la même chose.',
  exemple: 'content = joyeux',
  unites: [
    unite('ce2-syn-u1', 'Les mots jumeaux', 'Des mots qui veulent dire presque pareil.', [
      ['Presque pareil', ['synonymes'], ['lucioles', 'reponses'], 5],
      ['Attention aux contraires', ['synonymes'], ['lucioles', 'reponses'], 5],
      ['Révision', ['synonymes'], ['lucioles', 'reponses'], 7],
    ]),
  ],
};

const FAMILLES_CE2: Theme = {
  id: 'ce2-familles',
  domaine: 'familles-mots',
  classe: 'CE2',
  titre: 'Les familles de mots',
  description: 'Trouver les mots qui viennent du même mot.',
  exemple: 'jardin, jardinier, jardiner',
  unites: [
    unite('ce2-fam-u1', 'L’arbre des familles', 'Des mots qui viennent du même mot.', [
      ['La même famille', ['meme-famille'], ['lucioles', 'reponses'], 5],
      ['L’intrus', ['intrus-famille', 'meme-famille'], ['lucioles', 'reponses'], 5],
      ['Révision', ['meme-famille', 'intrus-famille'], ['lucioles', 'reponses'], 7],
    ]),
  ],
};

const SUJET_VERBE_CE2: Theme = {
  id: 'ce2-sujet-verbe',
  domaine: 'sujet-verbe',
  classe: 'CE2',
  titre: 'Le sujet et le verbe',
  description: 'Trouver qui fait l’action, et l’action.',
  exemple: 'Le chat dort : qui dort ?',
  unites: [
    unite('ce2-sv-u1', 'Le train des phrases', 'Qui fait l’action, et quelle est l’action.', [
      ['Trouve le verbe', ['sujet-et-verbe'], ['wagons', 'reponses'], 5],
      ['Trouve le sujet', ['sujet-et-verbe'], ['wagons', 'reponses'], 5],
      ['Phrases à l’envers', ['sujet-et-verbe'], ['wagons', 'reponses'], 6],
      ['Révision', ['sujet-et-verbe'], ['wagons', 'reponses'], 7],
    ]),
    // Ajoutée après les autres : la progression des enfants qui ont déjà commencé ne bouge pas.
    unite('ce2-sv-u2', 'Les phrases en désordre', 'Remettre les mots dans l’ordre.', [
      ['Petites phrases', ['phrase-en-ordre', 'sujet-et-verbe'], ['ordre', 'wagons'], 5],
      ['Phrases plus longues', ['phrase-en-ordre', 'sujet-et-verbe'], ['ordre', 'wagons'], 6],
      ['Révision', ['phrase-en-ordre', 'sujet-et-verbe'], ['ordre', 'wagons'], 6],
    ]),
  ],
};

const CONJUGAISON_CE2: Theme = {
  id: 'ce2-conjugaison',
  domaine: 'conjugaison',
  classe: 'CE2',
  titre: 'Conjuguer les verbes',
  description: 'Écrire le verbe pour hier, aujourd’hui ou demain.',
  exemple: 'je chantais, je chante, je chanterai',
  unites: [
    unite('ce2-conj-u1', 'Hier, aujourd’hui, demain', 'Le présent, l’imparfait et le futur.', [
      ['Le présent', ['conjugaison-present'], ['lucioles', 'reponses'], 5],
      ['L’imparfait', ['conjugaison-imparfait'], ['lucioles', 'reponses'], 5],
      ['Le futur', ['conjugaison-futur'], ['lucioles', 'reponses'], 5],
      ['Les trois temps', ['conjugaison'], ['lucioles', 'reponses'], 7],
    ]),
  ],
};

const DICTEE_CE2: Theme = {
  id: 'ce2-dictee',
  domaine: 'ecrire-mots',
  classe: 'CE2',
  titre: 'Écrire des mots',
  description: 'Écouter un mot, puis l’écrire lettre par lettre.',
  exemple: 'une maison, un oiseau',
  unites: [
    unite('ce2-dic-u1', 'La dictée de Capy', 'Écouter un mot, puis bien l’écrire.', [
      ['Le mot bien écrit', ['dictee-mots'], ['reponses', 'dictee'], 5],
      ['J’écris les mots', ['dictee-mots'], ['dictee', 'reponses'], 5],
      ['Les petits mots', ['mots-outils'], ['dictee', 'reponses'], 5],
      ['Révision', ['dictee-mots', 'mots-outils'], ['dictee', 'reponses'], 6],
    ]),
  ],
};

const PHRASES_LUES_CE2: Theme = {
  id: 'ce2-phrases-lues',
  domaine: 'comprendre-phrases-lues',
  classe: 'CE2',
  titre: 'Comprendre des phrases',
  description: 'Lire une phrase et dire qui fait quoi.',
  exemple: 'Le chien suit le chat : qui suit ?',
  unites: [
    unite('ce2-phr-u1', 'Les phrases de Capy', 'Lire une phrase et dire qui fait quoi.', [
      ['Qui fait quoi ?', ['qui-fait-quoi', 'meme-sens'], ['reponses', 'passage'], 5],
      ['La phrase qui dit pareil', ['meme-sens', 'qui-fait-quoi'], ['passage', 'reponses'], 5],
      ['Phrases pièges', ['qui-fait-quoi', 'meme-sens'], ['reponses', 'passage'], 6],
      ['Révision', ['qui-fait-quoi', 'meme-sens'], ['reponses', 'passage'], 7],
    ]),
  ],
};

const TEXTE_LU_CE2: Theme = {
  id: 'ce2-texte-lu',
  domaine: 'comprendre-texte-lu',
  classe: 'CE2',
  titre: 'Comprendre un texte',
  description: 'Lire une petite histoire et répondre aux questions.',
  exemple: 'Où va Lou ? La réponse est dans l’histoire.',
  unites: [
    unite('ce2-txt-u1', 'Les histoires de Capy', 'Lire une histoire et répondre aux questions.', [
      ['Petites histoires', ['questions-texte', 'preuve-texte'], ['reponses', 'passage'], 4],
      ['La phrase qui le dit', ['preuve-texte', 'questions-texte'], ['passage', 'reponses'], 4],
      ['Histoires à lire', ['questions-texte', 'preuve-texte'], ['reponses', 'passage'], 5],
      ['Révision', ['questions-texte', 'preuve-texte'], ['reponses', 'passage'], 5],
    ]),
  ],
};

// Ajoutés après les autres thèmes du CE2 : axes de la fiche qui n'avaient pas encore d'exercices.
const TABLES_ADDITION_CE2: Theme = {
  id: 'ce2-tables-addition',
  domaine: 'tables-addition',
  classe: 'CE2',
  titre: 'Les tables d’addition',
  description: 'Trouver vite la somme de deux petits nombres.',
  exemple: '7\u00a0+\u00a08\u00a0=\u00a015',
  unites: [
    unite('ce2-ta-u1', 'Les lucioles des sommes', 'Passer la dizaine sans compter sur ses doigts.', [
      ['Passer la dizaine', ['tables-addition'], ['lucioles', 'reponses'], 6],
      ['Vite et juste', ['tables-addition'], ['lucioles', 'reponses'], 6],
      ['Révision', ['tables-addition'], ['lucioles', 'reponses'], 7],
    ]),
  ],
};

/** La règle s'ajoute, après les autres unités, aux thèmes de la ligne graduée (pas au CP). */
const avecRegle = (t: Theme): Theme =>
  t.domaine === 'ligne-graduee' && t.classe !== 'CP'
    ? { ...t, unites: [...t.unites, uniteRegle(t.classe.toLowerCase())] }
    : t;

export const THEMES: readonly Theme[] = [
  RESOUDRE_PROBLEMES_CE2,
  CALCUL_MENTAL_CE2,
  LIGNE_GRADUEE_CE2,
  ACCORD_CE2,
  NATURE_CE2,
  SYNONYMES_CE2,
  FAMILLES_CE2,
  SUJET_VERBE_CE2,
  CONJUGAISON_CE2,
  DICTEE_CE2,
  PHRASES_LUES_CE2,
  TEXTE_LU_CE2,
  TABLES_ADDITION_CE2,
  texteEntendu('CE2'),
  ...THEMES_CE1,
  ...THEMES_CM1,
  ...THEMES_CM2,
  ...THEMES_NOMBRES,
  ...THEMES_CP,
  ...THEMES_ATELIERS,
].map(avecRegle);

export function themesDe(classe: Classe): Theme[] {
  return THEMES.filter((t) => t.classe === classe);
}

export function trouverEtape(etapeId: string): { theme: Theme; unite: Unite; etape: EtapeTheme } | undefined {
  for (const theme of THEMES) {
    for (const unite of theme.unites) {
      const etape = unite.etapes.find((e) => e.id === etapeId);
      if (etape) return { theme, unite, etape };
    }
  }
  return undefined;
}

export function trouverCoffre(coffreId: string): { theme: Theme; unite: Unite } | undefined {
  for (const theme of THEMES) {
    const unite = theme.unites.find((u) => u.coffre === coffreId);
    if (unite) return { theme, unite };
  }
  return undefined;
}
