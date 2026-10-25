// Les histoires de Capy : de petites histoires illustrées, à lire (ou à
// écouter) page par page, suivies de trois questions. Pour le plaisir de lire
// et pour comprendre un texte. À faire relire par un enseignant.
import type { PoseCapy } from '@/mascotte';

export interface PageHistoire {
  pose: PoseCapy;
  texte: string;
}

export interface QuestionHistoire {
  question: string;
  choix: readonly string[];
  reponse: string;
  /** Numéro de la page (à partir de 1) où se trouve la réponse. */
  page: number;
  /** Pourquoi c'est la bonne réponse, avec les mots du texte. */
  explication: string;
}

export interface Histoire {
  id: string;
  titre: string;
  /** Une phrase pour donner envie, sur la liste des histoires. */
  resume: string;
  pages: readonly PageHistoire[];
  questions: readonly QuestionHistoire[];
}

export const HISTOIRES: readonly Histoire[] = [
  {
    id: 'cerf-volant',
    titre: 'Le cerf-volant rouge',
    resume: 'Capy et Lina fabriquent un cerf-volant. Mais le vent souffle fort…',
    pages: [
      {
        pose: 'apprendre',
        texte:
          'Ce matin, Capy et son amie Lina fabriquent un cerf-volant. Ils prennent du papier rouge, deux baguettes et une longue ficelle.',
      },
      {
        pose: 'exploration',
        texte:
          'Dans le pré, le vent souffle fort. Le cerf-volant monte, monte, plus haut que les arbres. Capy tient bien la ficelle.',
      },
      {
        pose: 'surpris',
        texte:
          'Soudain, la ficelle casse\u00a0! Le cerf-volant tombe au milieu de la mare. Un canard nage vers lui et le pousse jusqu’au bord. Capy dit merci au canard.',
      },
    ],
    questions: [
      {
        question: 'De quelle couleur est le cerf-volant\u00a0?',
        choix: ['rouge', 'bleu', 'vert'],
        reponse: 'rouge',
        page: 1,
        explication: 'Le texte dit\u00a0: « Ils prennent du papier rouge. »',
      },
      {
        question: 'Pourquoi le cerf-volant monte-t-il si haut\u00a0?',
        choix: ['Parce que le vent souffle fort.', 'Parce que Lina le lance.', 'Parce qu’il est léger.'],
        reponse: 'Parce que le vent souffle fort.',
        page: 2,
        explication: 'Page 2\u00a0: « Le vent souffle fort. Le cerf-volant monte, monte. »',
      },
      {
        question: 'Qui ramène le cerf-volant au bord de la mare\u00a0?',
        choix: ['un canard', 'Lina', 'une grenouille'],
        reponse: 'un canard',
        page: 3,
        explication: 'Page 3\u00a0: « Un canard nage vers lui et le pousse jusqu’au bord. »',
      },
    ],
  },
  {
    id: 'soupe',
    titre: 'La soupe du jardin',
    resume: 'Capy prépare une grande soupe pour ses amis.',
    pages: [
      {
        pose: 'exploration',
        texte:
          'Au jardin, Capy ramasse trois carottes, deux poireaux et une grosse courge. Son panier est très lourd\u00a0!',
      },
      {
        pose: 'reflechi',
        texte:
          'Dans la cuisine, il lave les légumes et les coupe en petits morceaux. Puis il les met dans une grande marmite avec de l’eau.',
      },
      {
        pose: 'bravo',
        texte:
          'Le soir, ses amis arrivent. Tout le monde goûte la soupe. « Elle est délicieuse\u00a0! » dit Lina. Capy est très fier.',
      },
    ],
    questions: [
      {
        question: 'Combien de carottes Capy ramasse-t-il\u00a0?',
        choix: ['trois', 'deux', 'une'],
        reponse: 'trois',
        page: 1,
        explication: 'Page 1\u00a0: « Capy ramasse trois carottes. »',
      },
      {
        question: 'Que fait Capy juste après avoir lavé les légumes\u00a0?',
        choix: ['Il les coupe en petits morceaux.', 'Il les mange.', 'Il les plante.'],
        reponse: 'Il les coupe en petits morceaux.',
        page: 2,
        explication: 'Page 2\u00a0: « Il lave les légumes et les coupe en petits morceaux. »',
      },
      {
        question: 'Pourquoi Capy est-il fier\u00a0?',
        choix: ['Ses amis aiment sa soupe.', 'Son panier est lourd.', 'Il a gagné une course.'],
        reponse: 'Ses amis aiment sa soupe.',
        page: 3,
        explication: 'Page 3\u00a0: Lina dit que la soupe est délicieuse. Capy est fier parce que ses amis l’aiment.',
      },
    ],
  },
  {
    id: 'train',
    titre: 'Le train de Mamie',
    resume: 'Capy prend le train tout seul pour aller chez Mamie.',
    pages: [
      {
        pose: 'explorer',
        texte:
          'Aujourd’hui, Capy prend le train pour aller chez Mamie. Il a un sac à dos, un livre et une pomme pour le goûter.',
      },
      {
        pose: 'ralentir',
        texte:
          'Le train passe devant des vaches, une rivière et un grand château. Capy compte les gares\u00a0: une, deux, trois. Il descend à la quatrième.',
      },
      {
        pose: 'heureux',
        texte:
          'Sur le quai, Mamie l’attend avec un grand sourire. Elle a préparé un gâteau au chocolat. Capy la serre très fort dans ses bras.',
      },
    ],
    questions: [
      {
        question: 'Que prend Capy pour le goûter\u00a0?',
        choix: ['une pomme', 'un gâteau', 'une poire'],
        reponse: 'une pomme',
        page: 1,
        explication: 'Page 1\u00a0: « une pomme pour le goûter ».',
      },
      {
        question: 'À quelle gare Capy descend-il\u00a0?',
        choix: ['la quatrième', 'la première', 'la troisième'],
        reponse: 'la quatrième',
        page: 2,
        explication: 'Page 2\u00a0: « Il descend à la quatrième. »',
      },
      {
        question: 'Comment Mamie se sent-elle quand elle voit Capy\u00a0?',
        choix: ['contente', 'fâchée', 'fatiguée'],
        reponse: 'contente',
        page: 3,
        explication: 'Page 3\u00a0: Mamie l’attend « avec un grand sourire »\u00a0: elle est contente.',
      },
    ],
  },
  {
    id: 'bibliotheque',
    titre: 'Le livre perdu',
    resume: 'À la bibliothèque, un livre a disparu. Capy mène l’enquête.',
    pages: [
      {
        pose: 'serieux',
        texte:
          'À la bibliothèque, la dame cherche un livre sur les étoiles. Il n’est plus sur l’étagère. « Je vais t’aider\u00a0! » dit Capy.',
      },
      {
        pose: 'reflechi',
        texte:
          'Capy regarde sous les tables. Il trouve une plume bleue, puis une autre. Les plumes mènent jusqu’à la fenêtre ouverte.',
      },
      {
        pose: 'clinOeil',
        texte:
          'Sur le rebord, un petit oiseau bleu lit le livre des étoiles\u00a0! Capy sourit. « Tu peux le lire ici, mais il faut le rendre après. »',
      },
    ],
    questions: [
      {
        question: 'De quoi parle le livre perdu\u00a0?',
        choix: ['des étoiles', 'des oiseaux', 'des trains'],
        reponse: 'des étoiles',
        page: 1,
        explication: 'Page 1\u00a0: « un livre sur les étoiles ».',
      },
      {
        question: 'Qu’est-ce qui aide Capy à trouver le livre\u00a0?',
        choix: ['des plumes bleues', 'des miettes de pain', 'une carte'],
        reponse: 'des plumes bleues',
        page: 2,
        explication: 'Page 2\u00a0: Capy trouve des plumes bleues qui mènent à la fenêtre.',
      },
      {
        question: 'Qui avait pris le livre\u00a0?',
        choix: ['un petit oiseau', 'la dame', 'Lina'],
        reponse: 'un petit oiseau',
        page: 3,
        explication: 'Page 3\u00a0: « un petit oiseau bleu lit le livre des étoiles ».',
      },
    ],
  },
];

/** Tous les textes affichés d'une histoire (pour la banque de syllabes). */
export function textesDHistoire(h: Histoire): string[] {
  return [
    h.titre,
    h.resume,
    ...h.pages.map((p) => p.texte),
    ...h.questions.flatMap((q) => [q.question, ...q.choix, q.explication]),
  ];
}
