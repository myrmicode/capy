// Parcours du CM1 et du CM2 : mêmes thèmes de base, nombres plus grands et axes
// propres à chaque fiche. « Lire à voix haute » reste hors de l'appli ; les
// nombres (écrire, reconnaître, représenter) et « Poser et calculer » arrivent ensuite.
import type { Theme } from './parcours';
import { unite } from './unites';

type ClasseCM = 'CM1' | 'CM2';

const problemes = (c: ClasseCM): Theme => {
  const p = c.toLowerCase();
  return {
    id: `${p}-resoudre-problemes`,
    domaine: 'resoudre-problemes',
    classe: c,
    titre: 'Résoudre des problèmes',
    description: 'Lire un problème et trouver le bon calcul.',
    exemple: 'Un stade, des spectateurs\u00a0: combien\u00a0?',
    unites: [
      unite(`${p}-rp-u1`, 'La grande ville', 'Ajouter, enlever et comparer de grands nombres.', [
        ['Ajouter', ['ajout'], ['bonFil', 'questionPerdue', 'reponses'], 5],
        ['Enlever', ['retrait'], ['bonFil', 'questionPerdue', 'reponses'], 5],
        ['Combien de plus\u00a0?', ['ecart'], ['bonFil', 'questionPerdue', 'reponses'], 5],
        ['Révision', ['ajout', 'retrait', 'ecart'], ['bonFil', 'questionPerdue', 'reponses'], 6],
      ]),
      unite(
        `${p}-rp-u2`,
        c === 'CM1' ? 'Les grands achats' : 'Les grands calculs',
        'Multiplier, partager, chercher en deux étapes.',
        [
          ['Multiplier', ['groupements'], ['bonFil', 'questionPerdue', 'reponses'], 5],
          ['Partager', ['partage'], ['questionPerdue', 'reponses'], 5],
          ['En deux étapes', ['deux-etapes'], ['questionPerdue', 'reponses'], 5],
          ...(c === 'CM1'
            ? ([
                ['Payer', ['payer'], ['bonFil', 'questionPerdue', 'reponses'], 5],
                ['Rendre la monnaie', ['rendre-monnaie'], ['caisse', 'bonFil', 'reponses'], 5],
                ['L’heure qui passe', ['duree'], ['horloge', 'reponses'], 5],
              ] as const)
            : []),
          [
            'Grande révision',
            ['groupements', 'partage', 'deux-etapes', 'ajout', 'retrait'],
            ['bonFil', 'questionPerdue', 'reponses'],
            7,
          ],
        ],
      ),
    ],
  };
};

const calculMental = (c: ClasseCM): Theme => {
  const p = c.toLowerCase();
  return {
    id: `${p}-calcul-mental`,
    domaine: 'calcul-mental',
    classe: c,
    titre: 'Calculer dans sa tête',
    description: 'Calculer vite, sans poser l’opération.',
    exemple: '45\u00a0×\u00a0100\u00a0=\u00a04\u202f500',
    unites: [
      unite(`${p}-cm-u1`, 'Le carnet de calcul', 'Les doubles, multiplier par 10, 100, 1\u202f000, les dizaines.', [
        ['Le double', ['doubles'], ['lucioles', 'reponses'], 5],
        ['Par 10, 100, 1\u202f000', ['fois-dix-cent'], ['lucioles', 'reponses'], 5],
        ['De dizaine en dizaine', ['ajouter-dizaines'], ['lucioles', 'reponses'], 5],
        ['Révision', ['doubles', 'fois-dix-cent', 'ajouter-dizaines'], ['lucioles', 'reponses'], 7],
      ]),
    ],
  };
};

const tablesMultiplication = (c: ClasseCM): Theme => {
  const p = c.toLowerCase();
  return {
    id: `${p}-tables-multiplication`,
    domaine: 'tables-multiplication',
    classe: c,
    titre: 'Les tables de multiplication',
    description: 'Retrouver vite le résultat d’une table.',
    exemple: '7\u00a0×\u00a08\u00a0=\u00a056',
    unites: [
      unite(`${p}-tm-u1`, 'Les lucioles des tables', 'Les tables de 2 à 9, sans hésiter.', [
        ['Les premières tables', ['tables-multiplication'], ['lucioles', 'reponses'], 6],
        ['Toutes les tables', ['tables-multiplication'], ['lucioles', 'reponses'], 6],
        ['Révision', ['tables-multiplication'], ['lucioles', 'reponses'], 7],
      ]),
    ],
  };
};

const ligneGraduee = (c: ClasseCM): Theme => {
  const p = c.toLowerCase();
  const tous = ['placer-petits-pas', 'placer-grands-pas', 'lire-petits-pas', 'lire-grands-pas'];
  return {
    id: `${p}-ligne-graduee`,
    domaine: 'ligne-graduee',
    classe: c,
    titre: 'Placer des nombres sur une ligne',
    description: 'Trouver où va un grand nombre sur une ligne.',
    exemple: '0, 1\u202f000, 2\u202f000… où va 1\u202f500\u00a0?',
    unites: [
      unite(`${p}-lg-u1`, 'Le fil du funambule', 'Lire et placer de grands nombres sur une ligne.', [
        ['Petits pas', ['placer-petits-pas', 'lire-petits-pas'], ['funambule', 'reponses'], 5],
        ['Grands pas', ['placer-grands-pas', 'lire-grands-pas'], ['funambule', 'reponses'], 5],
        ['Tous les pas', tous, ['funambule', 'reponses'], 6],
        ['Révision', tous, ['funambule', 'reponses'], 7],
      ]),
    ],
  };
};

const accordAdjectif = (c: ClasseCM): Theme => {
  const p = c.toLowerCase();
  return {
    id: `${p}-accord`,
    domaine: 'accord-nom-adjectif',
    classe: c,
    titre: 'Accorder les adjectifs',
    description: 'Mettre la bonne fin à l’adjectif\u00a0: e, s ou es.',
    exemple: 'des chevaux blancs',
    unites: [
      unite(`${p}-acc-u1`, 'Le jardin des accords', 'Accorder en genre et en nombre, même au pluriel en -x.', [
        ['Le bon accord', ['accord-adjectif'], ['lucioles', 'reponses'], 5],
        ['Les pluriels difficiles', ['accord-adjectif'], ['lucioles', 'reponses'], 6],
        ['Révision', ['accord-adjectif'], ['lucioles', 'reponses'], 7],
      ]),
    ],
  };
};

const nature = (c: ClasseCM): Theme => {
  const p = c.toLowerCase();
  return {
    id: `${p}-nature`,
    domaine: 'nature-mots',
    classe: c,
    titre: 'La nature des mots',
    description: 'Reconnaître nom, verbe, adjectif et déterminant.',
    exemple: 'les\u00a0: déterminant · courir\u00a0: verbe',
    unites: [
      unite(`${p}-nat-u1`, 'Les paniers de mots', 'Ranger chaque mot dans son panier.', [
        ['Ranger les mots', ['nature-du-mot'], ['paniers', 'reponses'], 5],
        ['Trouve le mot', ['trouver-le-mot', 'nature-du-mot'], ['wagons', 'paniers', 'reponses'], 6],
        ['Révision', ['nature-du-mot', 'trouver-le-mot'], ['paniers', 'wagons', 'reponses'], 7],
      ]),
    ],
  };
};

const dictee = (c: ClasseCM): Theme => {
  const p = c.toLowerCase();
  return {
    id: `${p}-dictee`,
    domaine: 'ecrire-mots',
    classe: c,
    titre: 'Écrire des mots',
    description: 'Écouter un mot, puis l’écrire sans erreur.',
    exemple: 'aujourd’hui, beaucoup',
    unites: [
      unite(`${p}-dic-u1`, 'La dictée de Capy', 'Les lettres muettes, les consonnes doubles, les mots à connaître.', [
        ['J’écris les mots', ['dictee-mots'], ['dictee', 'reponses'], 5],
        ['Les petits mots', ['mots-outils'], ['dictee', 'reponses'], 5],
        ['Révision', ['dictee-mots', 'mots-outils'], ['dictee', 'reponses'], 6],
      ]),
    ],
  };
};

const texteLu = (c: ClasseCM): Theme => {
  const p = c.toLowerCase();
  return {
    id: `${p}-texte-lu`,
    domaine: 'comprendre-texte-lu',
    classe: c,
    titre: 'Comprendre un texte',
    description: 'Lire une histoire et répondre, même à demi-mot.',
    exemple: 'Pourquoi Lou sourit-elle\u00a0?',
    unites: [
      unite(`${p}-txt-u1`, 'Les histoires de Capy', 'Trouver ce qui est écrit, et deviner ce qui ne l’est pas.', [
        ['La phrase qui le dit', ['preuve-texte', 'questions-texte'], ['passage', 'reponses'], 4],
        ['Lire entre les lignes', ['questions-texte', 'preuve-texte'], ['reponses', 'passage'], 5],
        ['Révision', ['questions-texte', 'preuve-texte'], ['reponses', 'passage'], 5],
      ]),
    ],
  };
};

export const texteEntendu = (c: 'CE2' | ClasseCM): Theme => {
  const p = c.toLowerCase();
  return {
    id: `${p}-texte-entendu`,
    domaine: 'comprendre-texte-entendu',
    classe: c,
    titre: 'Écouter une histoire',
    description: 'Écouter Capy raconter, puis répondre.',
    exemple: 'Capy raconte\u00a0: où est le chat\u00a0?',
    unites: [
      unite(`${p}-ent-u1`, 'Les histoires à écouter', 'Bien écouter, retenir, et deviner ce qui n’est pas dit.', [
        ['Écoute bien', ['texte-entendu'], ['reponses', 'lucioles'], 4],
        ['Ce qui n’est pas dit', ['texte-entendu'], ['reponses', 'lucioles'], 4],
        ['Révision', ['texte-entendu'], ['reponses', 'lucioles'], 5],
      ]),
    ],
  };
};

const accordSujetVerbe = (c: ClasseCM): Theme => {
  const p = c.toLowerCase();
  return {
    id: `${p}-accord-sujet-verbe`,
    domaine: 'accord-sujet-verbe',
    classe: c,
    titre: 'Accorder le verbe',
    description: 'Accorder le verbe avec son sujet, sans se faire piéger.',
    exemple: 'Les chiens du voisin jouent.',
    unites: [
      unite(`${p}-asv-u1`, 'Le piège du voisin', 'Trouver le sujet, même loin du verbe.', [
        ['Le bon accord', ['accord-sujet-verbe'], ['lucioles', 'reponses'], 5],
        ['Hier et demain', ['accord-sujet-verbe'], ['lucioles', 'reponses'], 5],
        ['Le nom piège', ['accord-sujet-verbe'], ['lucioles', 'reponses'], 6],
        ['Révision', ['accord-sujet-verbe'], ['lucioles', 'reponses'], 7],
      ]),
    ],
  };
};

export const THEMES_CM1: readonly Theme[] = [
  problemes('CM1'),
  calculMental('CM1'),
  tablesMultiplication('CM1'),
  ligneGraduee('CM1'),
  accordAdjectif('CM1'),
  accordSujetVerbe('CM1'),
  nature('CM1'),
  {
    id: 'cm1-synonymes',
    domaine: 'synonymes',
    classe: 'CM1',
    titre: 'Les synonymes',
    description: 'Trouver un mot qui veut dire presque la même chose.',
    exemple: 'content\u00a0=\u00a0joyeux',
    unites: [
      unite('cm1-syn-u1', 'Les mots jumeaux', 'Des mots qui veulent dire presque pareil.', [
        ['Presque pareil', ['synonymes'], ['lucioles', 'reponses'], 5],
        ['Attention aux contraires', ['synonymes'], ['lucioles', 'reponses'], 6],
        ['Révision', ['synonymes'], ['lucioles', 'reponses'], 7],
      ]),
    ],
  },
  {
    id: 'cm1-familles',
    domaine: 'familles-mots',
    classe: 'CM1',
    titre: 'Les familles de mots',
    description: 'Trouver les mots qui viennent du même mot.',
    exemple: 'jardin, jardinier, jardiner',
    unites: [
      unite('cm1-fam-u1', 'L’arbre des familles', 'Des mots qui viennent du même mot.', [
        ['La même famille', ['meme-famille'], ['lucioles', 'reponses'], 5],
        ['L’intrus', ['intrus-famille', 'meme-famille'], ['lucioles', 'reponses'], 6],
        ['Révision', ['meme-famille', 'intrus-famille'], ['lucioles', 'reponses'], 7],
      ]),
    ],
  },
  {
    id: 'cm1-sujet-verbe',
    domaine: 'sujet-verbe',
    classe: 'CM1',
    titre: 'Le sujet et le verbe',
    description: 'Trouver qui fait l’action, et l’action.',
    exemple: 'Ce matin, le chat dort\u00a0: qui dort\u00a0?',
    unites: [
      unite('cm1-sv-u1', 'Le train des phrases', 'Le sujet et le verbe, même quand la phrase commence autrement.', [
        ['Trouve le sujet et le verbe', ['sujet-et-verbe'], ['wagons', 'reponses'], 5],
        ['Les phrases en désordre', ['phrase-en-ordre', 'sujet-et-verbe'], ['ordre', 'wagons'], 6],
        ['Révision', ['sujet-et-verbe', 'phrase-en-ordre'], ['wagons', 'ordre', 'reponses'], 7],
      ]),
    ],
  },
  {
    id: 'cm1-conjugaison',
    domaine: 'conjugaison',
    classe: 'CM1',
    titre: 'Conjuguer les verbes',
    description: 'Écrire le verbe pour hier, aujourd’hui ou demain.',
    exemple: 'nous chantions, vous chanterez',
    unites: [
      unite('cm1-conj-u1', 'Hier, aujourd’hui, demain', 'Le présent, l’imparfait et le futur, avec être et avoir.', [
        ['Le présent', ['conjugaison-present'], ['lucioles', 'reponses'], 5],
        ['L’imparfait', ['conjugaison-imparfait'], ['lucioles', 'reponses'], 5],
        ['Le futur', ['conjugaison-futur'], ['lucioles', 'reponses'], 5],
        ['Les trois temps', ['conjugaison'], ['lucioles', 'reponses'], 7],
      ]),
    ],
  },
  dictee('CM1'),
  texteLu('CM1'),
  texteEntendu('CM1'),
];

export const THEMES_CM2: readonly Theme[] = [
  problemes('CM2'),
  calculMental('CM2'),
  tablesMultiplication('CM2'),
  ligneGraduee('CM2'),
  accordAdjectif('CM2'),
  accordSujetVerbe('CM2'),
  nature('CM2'),
  {
    id: 'cm2-synonymes-familles',
    domaine: 'synonymes-familles',
    classe: 'CM2',
    titre: 'Synonymes et familles de mots',
    description: 'Des mots qui se ressemblent par le sens ou la forme.',
    exemple: 'content\u00a0=\u00a0joyeux · jardin, jardinier',
    unites: [
      unite('cm2-sf-u1', 'Les mots cousins', 'Les synonymes, puis les familles de mots.', [
        ['Presque pareil', ['synonymes-cm2'], ['lucioles', 'reponses'], 5],
        ['La même famille', ['meme-famille-cm2', 'intrus-famille-cm2'], ['lucioles', 'reponses'], 6],
        ['Révision', ['synonymes-cm2', 'meme-famille-cm2', 'intrus-famille-cm2'], ['lucioles', 'reponses'], 7],
      ]),
    ],
  },
  {
    id: 'cm2-sujet-verbe-complement',
    domaine: 'sujet-verbe-complement',
    classe: 'CM2',
    titre: 'Le sujet et le verbe',
    description: 'Trouver qui fait l’action, et l’action.',
    exemple: 'Ce matin, le chat dort\u00a0: qui dort\u00a0?',
    unites: [
      unite('cm2-svc-u1', 'Le train des phrases', 'Le sujet et le verbe, même quand la phrase commence autrement.', [
        ['Trouve le sujet et le verbe', ['sujet-et-verbe-cm2'], ['wagons', 'reponses'], 5],
        ['Les phrases en désordre', ['phrase-en-ordre-cm2', 'sujet-et-verbe-cm2'], ['ordre', 'wagons'], 6],
        ['Révision', ['sujet-et-verbe-cm2', 'phrase-en-ordre-cm2'], ['wagons', 'ordre', 'reponses'], 7],
      ]),
    ],
  },
  dictee('CM2'),
  texteLu('CM2'),
  texteEntendu('CM2'),
];
