// Parcours du CP. En français, tout passe par l'oreille : Capy dit le mot, la
// phrase, la syllabe ou la lettre, l'enfant touche la réponse (une image pour
// « Comprendre des mots » et « Comprendre des phrases »).
import type { Theme } from './parcours';
import { unite } from './unites';

const JEUX = ['reponses', 'lucioles'] as const;

/** « Comprendre des mots » et « Comprendre des phrases », à l'oral avec des images (CP et CE1). */
export function themesOraux(classe: 'CP' | 'CE1'): Theme[] {
  const p = classe.toLowerCase();
  return [
    {
      id: `${p}-comprendre-mots`,
      domaine: 'comprendre-mots',
      classe,
      titre: 'Écouter des mots',
      description: 'Écouter un mot et trouver son dessin.',
      exemple: 'un hérisson00a0: lequel00a0?',
      unites: [
        unite(`${p}-cmo-u1`, 'L’imagier de Capy', 'Connaître beaucoup de mots, même les plus rares.', [
          ['Les mots de tous les jours', ['comprendre-mot'], ['images', 'ouiNon'], 5],
          ['Des dessins qui se ressemblent', ['comprendre-mot'], ['images', 'ouiNon'], 5],
          ['Révision', ['comprendre-mot'], ['images', 'ouiNon'], 6],
        ]),
      ],
    },
    {
      id: `${p}-comprendre-phrases`,
      domaine: 'comprendre-phrases',
      classe,
      titre: 'Écouter des phrases',
      description: 'Écouter une phrase et trouver la bonne image.',
      exemple: 'Le chat est sous la boîte.',
      unites: [
        unite(`${p}-cph-u1`, 'Les images qui parlent', 'Bien écouter les petits mots00a0: sur, sous, les, pas.', [
          ['Sur ou sous00a0?', ['comprendre-phrase'], ['images', 'ouiNon'], 5],
          ['Un ou plusieurs00a0?', ['comprendre-phrase'], ['images', 'ouiNon'], 5],
          ['Révision', ['comprendre-phrase'], ['images', 'ouiNon'], 6],
        ]),
      ],
    },
  ];
}

export const THEMES_CP: readonly Theme[] = [
  {
    id: 'cp-compter-objets',
    domaine: 'compter-objets',
    classe: 'CP',
    titre: 'Compter des objets',
    description: 'Compter des fraises, des pommes, des étoiles.',
    exemple: 'Combien de fraises\u00a0?',
    unites: [
      unite('cp-co-u1', 'Le panier de Capy', 'Compter un objet à la fois, puis par rangées de dix.', [
        ['Jusqu’à 10', ['compter-objets'], JEUX, 5],
        ['Jusqu’à 20', ['compter-objets'], JEUX, 5],
        ['Révision', ['compter-objets'], JEUX, 6],
      ]),
    ],
  },
  {
    id: 'cp-lire-nombres',
    domaine: 'lire-nombres',
    classe: 'CP',
    titre: 'Lire des nombres',
    description: 'Lire un nombre écrit en lettres.',
    exemple: 'douze\u00a0: 12',
    unites: [
      unite('cp-ln-u1', 'Les étiquettes de Capy', 'Lire un nombre en lettres et l’écrire en chiffres.', [
        ['Jusqu’à 20', ['lire-nombre'], JEUX, 5],
        ['Jusqu’à 69', ['lire-nombre'], JEUX, 5],
        ['Révision', ['lire-nombre'], JEUX, 6],
      ]),
    ],
  },
  {
    id: 'cp-ecrire-nombres',
    domaine: 'ecrire-nombres',
    classe: 'CP',
    titre: 'Écrire des nombres',
    description: 'Écouter un nombre et l’écrire en chiffres.',
    exemple: 'soixante-dix\u00a0: 70',
    unites: [
      unite('cp-en-u1', 'La dictée de nombres', 'Écouter un nombre et trouver comment il s’écrit.', [
        ['J’écoute, j’écris', ['ecrire-nombre'], JEUX, 5],
        ['Les grands nombres', ['ecrire-nombre'], JEUX, 5],
        ['Révision', ['ecrire-nombre'], JEUX, 6],
      ]),
    ],
  },
  {
    id: 'cp-comparer-nombres',
    domaine: 'comparer-nombres',
    classe: 'CP',
    titre: 'Comparer des nombres',
    description: 'Trouver le plus grand ou le plus petit nombre.',
    exemple: '17 ou 71\u00a0?',
    unites: [
      unite('cp-cn-u1', 'La course des nombres', 'Comparer en regardant d’abord les dizaines.', [
        ['Le plus grand', ['plus-grand'], JEUX, 5],
        ['Le plus petit', ['plus-petit'], JEUX, 5],
        ['Révision', ['plus-grand', 'plus-petit'], JEUX, 6],
      ]),
    ],
  },
  {
    id: 'cp-ligne-graduee',
    domaine: 'ligne-graduee',
    classe: 'CP',
    titre: 'Placer des nombres sur une ligne',
    description: 'Trouver où va un nombre sur une ligne graduée.',
    exemple: '0, 1, 2… où va 7\u00a0?',
    unites: [
      unite('cp-lg-u1', 'Le fil du funambule', 'Avancer de 1 en 1, puis de 2 en 2 ou de 5 en 5.', [
        ['Petits pas', ['placer-petits-pas', 'lire-petits-pas'], ['funambule', 'reponses'], 5],
        ['Grands pas', ['placer-grands-pas', 'lire-grands-pas'], ['funambule', 'reponses'], 5],
        [
          'Révision',
          ['placer-petits-pas', 'placer-grands-pas', 'lire-petits-pas', 'lire-grands-pas'],
          ['funambule', 'reponses'],
          6,
        ],
      ]),
    ],
  },
  {
    id: 'cp-resoudre-problemes',
    domaine: 'resoudre-problemes',
    classe: 'CP',
    titre: 'Résoudre des problèmes',
    description: 'Écouter une petite histoire et trouver combien.',
    exemple: '3 billes, puis 2 de plus\u00a0: combien\u00a0?',
    unites: [
      unite('cp-rp-u1', 'Au marché', 'Ajouter, enlever, faire des paquets.', [
        ['Les paquets', ['groupements'], ['marche', 'reponses'], 5],
        ['On en ajoute', ['ajout'], ['bonFil', 'reponses'], 5],
        ['On en enlève', ['retrait'], ['bonFil', 'reponses'], 5],
        ['Révision', ['groupements', 'ajout', 'retrait'], ['marche', 'bonFil', 'reponses'], 6],
      ]),
    ],
  },
  {
    id: 'cp-syllabes',
    domaine: 'manipuler-syllabes',
    classe: 'CP',
    titre: 'Les syllabes',
    description: 'Taper les syllabes d’un mot dans ses mains.',
    exemple: 'cha-peau\u00a0: 2 syllabes',
    unites: [
      unite('cp-syl-u1', 'Les mains qui tapent', 'Compter les syllabes, trouver la première.', [
        ['Combien de syllabes\u00a0?', ['compter-syllabes'], JEUX, 5],
        ['La première syllabe', ['premiere-syllabe'], JEUX, 5],
        ['Révision', ['compter-syllabes', 'premiere-syllabe'], JEUX, 6],
      ]),
    ],
  },
  {
    id: 'cp-phonemes',
    domaine: 'manipuler-phonemes',
    classe: 'CP',
    titre: 'Les sons',
    description: 'Entendre le premier son d’un mot.',
    exemple: 'lapin commence par l',
    unites: [
      unite('cp-son-u1', 'L’oreille de Capy', 'Trouver le tout premier son d’un mot.', [
        ['Le premier son', ['premier-son'], JEUX, 5],
        ['Des sons qui se ressemblent', ['premier-son'], JEUX, 5],
        ['Révision', ['premier-son'], JEUX, 6],
      ]),
    ],
  },
  {
    id: 'cp-nom-lettres',
    domaine: 'nom-lettres',
    classe: 'CP',
    titre: 'Le nom des lettres',
    description: 'Reconnaître la lettre que Capy nomme.',
    exemple: 'b, d, p ou q\u00a0?',
    unites: [
      unite('cp-nl-u1', 'L’alphabet de Capy', 'Reconnaître les lettres, même celles qui se ressemblent.', [
        ['Les lettres', ['nom-lettre'], JEUX, 5],
        ['Les lettres jumelles', ['nom-lettre'], JEUX, 5],
        ['Révision', ['nom-lettre'], JEUX, 6],
      ]),
    ],
  },
  {
    id: 'cp-son-lettres',
    domaine: 'son-lettres',
    classe: 'CP',
    titre: 'Le son des lettres',
    description: 'Reconnaître la syllabe que Capy dit.',
    exemple: 'm et a\u00a0: ma',
    unites: [
      unite('cp-sl-u1', 'Les syllabes de Capy', 'Associer le son des lettres pour lire une syllabe.', [
        ['Les sons qui durent', ['syllabe-entendue'], JEUX, 5],
        ['Tous les sons', ['syllabe-entendue'], JEUX, 5],
        ['Révision', ['syllabe-entendue'], JEUX, 6],
      ]),
    ],
  },
  {
    id: 'cp-texte-entendu',
    domaine: 'comprendre-texte-entendu',
    classe: 'CP',
    titre: 'Écouter une histoire',
    description: 'Écouter Capy raconter, puis répondre.',
    exemple: 'Capy raconte\u00a0: où est le chat\u00a0?',
    unites: [
      unite('cp-ent-u1', 'Les histoires à écouter', 'Bien écouter, et retenir qui, où et quand.', [
        ['Écoute bien', ['texte-entendu'], ['reponses', 'lucioles'], 4],
        ['Qui, où, quand\u00a0?', ['texte-entendu'], ['reponses', 'lucioles'], 4],
        ['Révision', ['texte-entendu'], ['reponses', 'lucioles'], 5],
      ]),
    ],
  },
  ...themesOraux('CP'),
];
