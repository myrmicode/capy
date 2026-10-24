// Parcours par thème : des unités d'étapes, chacune terminée par un coffre.
// Chaque étape choisit les modèles d'exercices travaillés et mélange 2 ou 3 mini-jeux.
import type { JeuId } from '@/jeux/registre';

import type { Classe } from './classes';
import type { DomaineId } from './domaines';

export interface EtapeTheme {
  id: string;
  titre: string;
  modeles: readonly string[];
  jeux: readonly JeuId[];
  nombreQuestions: number;
}

export interface Unite {
  id: string;
  titre: string;
  etapes: readonly EtapeTheme[];
  /** Identifiant du coffre de fin d'unité. */
  coffre: string;
}

export interface Theme {
  id: string;
  domaine: DomaineId;
  classe: Classe;
  titre: string;
  unites: readonly Unite[];
}

const RESOUDRE_PROBLEMES_CE2: Theme = {
  id: 'ce2-resoudre-problemes',
  domaine: 'resoudre-problemes',
  classe: 'CE2',
  titre: 'Résoudre des problèmes',
  unites: [
    {
      id: 'ce2-rp-u1',
      titre: 'Au marché',
      coffre: 'ce2-rp-u1-coffre',
      etapes: [
        { id: 'ce2-rp-1', titre: 'Les paquets', modeles: ['groupements'], jeux: ['marche', 'reponses'], nombreQuestions: 5 },
        { id: 'ce2-rp-2', titre: 'On en ajoute', modeles: ['ajout'], jeux: ['bonFil', 'reponses'], nombreQuestions: 5 },
        { id: 'ce2-rp-3', titre: 'On en enlève', modeles: ['retrait'], jeux: ['bonFil', 'reponses'], nombreQuestions: 5 },
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
      coffre: 'ce2-rp-u2-coffre',
      etapes: [
        { id: 'ce2-rp-6', titre: 'Combien de plus ?', modeles: ['ecart'], jeux: ['bonFil', 'reponses'], nombreQuestions: 5 },
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
  ],
};

const CALCUL_MENTAL_CE2: Theme = {
  id: 'ce2-calcul-mental',
  domaine: 'calcul-mental',
  classe: 'CE2',
  titre: 'Calcul mental',
  unites: [
    {
      id: 'ce2-cm-u1',
      titre: 'Le carnet de calcul',
      coffre: 'ce2-cm-u1-coffre',
      etapes: [
        { id: 'ce2-cm-1', titre: 'Les tables', modeles: ['tables'], jeux: ['lucioles', 'reponses'], nombreQuestions: 6 },
        { id: 'ce2-cm-2', titre: 'Le double', modeles: ['doubles'], jeux: ['lucioles', 'reponses'], nombreQuestions: 5 },
        { id: 'ce2-cm-3', titre: 'Aller jusqu’à 100', modeles: ['complement-cent'], jeux: ['lucioles', 'reponses'], nombreQuestions: 5 },
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
  titre: 'Ligne graduée',
  unites: [
    {
      id: 'ce2-lg-u1',
      titre: 'Le fil du funambule',
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

/** Une unité de français : quelques étapes du même modèle, une révision, un coffre. */
function uniteFr(
  id: string,
  titre: string,
  etapes: readonly [titre: string, modeles: readonly string[], jeux: readonly JeuId[], questions: number][],
): Unite {
  return {
    id,
    titre,
    coffre: `${id}-coffre`,
    etapes: etapes.map(([t, modeles, jeux, nombreQuestions], i) => ({
      id: `${id}-${i + 1}`,
      titre: t,
      modeles,
      jeux,
      nombreQuestions,
    })),
  };
}

const ACCORD_CE2: Theme = {
  id: 'ce2-accord',
  domaine: 'accord-nom-adjectif',
  classe: 'CE2',
  titre: 'Accorder le nom et l’adjectif',
  unites: [
    uniteFr('ce2-acc-u1', 'Le jardin des accords', [
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
  titre: 'La nature des mots',
  unites: [
    uniteFr('ce2-nat-u1', 'Les paniers de mots', [
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
  unites: [
    uniteFr('ce2-syn-u1', 'Les mots jumeaux', [
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
  unites: [
    uniteFr('ce2-fam-u1', 'L’arbre des familles', [
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
  unites: [
    uniteFr('ce2-sv-u1', 'Le train des phrases', [
      ['Trouve le verbe', ['sujet-et-verbe'], ['wagons', 'reponses'], 5],
      ['Trouve le sujet', ['sujet-et-verbe'], ['wagons', 'reponses'], 5],
      ['Phrases à l’envers', ['sujet-et-verbe'], ['wagons', 'reponses'], 6],
      ['Révision', ['sujet-et-verbe'], ['wagons', 'reponses'], 7],
    ]),
  ],
};

const CONJUGAISON_CE2: Theme = {
  id: 'ce2-conjugaison',
  domaine: 'conjugaison',
  classe: 'CE2',
  titre: 'Conjuguer',
  unites: [
    uniteFr('ce2-conj-u1', 'Hier, aujourd’hui, demain', [
      ['Le présent', ['conjugaison-present'], ['lucioles', 'reponses'], 5],
      ['L’imparfait', ['conjugaison-imparfait'], ['lucioles', 'reponses'], 5],
      ['Le futur', ['conjugaison-futur'], ['lucioles', 'reponses'], 5],
      ['Les trois temps', ['conjugaison'], ['lucioles', 'reponses'], 7],
    ]),
  ],
};

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
];

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

