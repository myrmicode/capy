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
  {
    id: 'feuilles',
    titre: 'La cabane de feuilles',
    resume: 'En automne, Capy et Noé construisent une cabane avec des feuilles.',
    pages: [
      {
        pose: 'exploration',
        texte:
          'C’est l’automne. Dans le parc, les feuilles tombent des arbres. Elles sont rouges, jaunes et orange. Capy et Noé en ramassent des brassées.',
      },
      {
        pose: 'apprendre',
        texte:
          'Avec des branches, ils font les murs d’une petite cabane. Puis ils couvrent le toit avec les feuilles. Il faut beaucoup de feuilles\u00a0!',
      },
      {
        pose: 'surpris',
        texte:
          'Le soir, un hérisson entre dans la cabane et s’endort. «\u00a0Il a trouvé une maison pour l’hiver\u00a0», dit Noé. Capy est content.',
      },
    ],
    questions: [
      {
        question: 'Avec quoi font-ils les murs de la cabane\u00a0?',
        choix: ['avec des branches', 'avec des feuilles', 'avec des cailloux'],
        reponse: 'avec des branches',
        page: 2,
        explication: 'Page 2\u00a0: «\u00a0Avec des branches, ils font les murs d’une petite cabane.\u00a0»',
      },
      {
        question: 'Qui entre dans la cabane le soir\u00a0?',
        choix: ['un hérisson', 'un écureuil', 'Lina'],
        reponse: 'un hérisson',
        page: 3,
        explication: 'Page 3\u00a0: «\u00a0un hérisson entre dans la cabane et s’endort.\u00a0»',
      },
      {
        question: 'Pourquoi Capy est-il content\u00a0?',
        choix: ['Le hérisson a une maison pour l’hiver.', 'Il a gagné une course.', 'Il fait très chaud.'],
        reponse: 'Le hérisson a une maison pour l’hiver.',
        page: 3,
        explication:
          'Page 3\u00a0: Noé dit que le hérisson a trouvé une maison pour l’hiver. Capy est content pour lui.',
      },
    ],
  },
  {
    id: 'neige',
    titre: 'Le bonhomme de neige',
    resume: 'Il a neigé toute la nuit. Capy et Lina sortent jouer.',
    pages: [
      {
        pose: 'surpris',
        texte:
          'Ce matin, tout est blanc. Il a neigé toute la nuit\u00a0! Capy met son bonnet et ses bottes, puis il court chercher Lina.',
      },
      {
        pose: 'heureux',
        texte:
          'Ils roulent une grosse boule pour le ventre et une petite boule pour la tête. Lina ajoute une carotte pour le nez.',
      },
      {
        pose: 'reflechi',
        texte:
          'L’après-midi, le soleil revient. Le bonhomme de neige devient de plus en plus petit. «\u00a0Demain, il n’y aura plus que la carotte\u00a0», dit Capy.',
      },
    ],
    questions: [
      {
        question: 'Que met Capy avant de sortir\u00a0?',
        choix: ['son bonnet et ses bottes', 'son maillot de bain', 'son chapeau de paille'],
        reponse: 'son bonnet et ses bottes',
        page: 1,
        explication: 'Page 1\u00a0: «\u00a0Capy met son bonnet et ses bottes.\u00a0»',
      },
      {
        question: 'Que met Lina pour faire le nez\u00a0?',
        choix: ['une carotte', 'un caillou', 'une pomme'],
        reponse: 'une carotte',
        page: 2,
        explication: 'Page 2\u00a0: «\u00a0Lina ajoute une carotte pour le nez.\u00a0»',
      },
      {
        question: 'Pourquoi le bonhomme devient-il plus petit\u00a0?',
        choix: ['Le soleil le fait fondre.', 'Un chien le mange.', 'Lina le casse.'],
        reponse: 'Le soleil le fait fondre.',
        page: 3,
        explication: 'Page 3\u00a0: le soleil revient, alors la neige fond et le bonhomme rapetisse.',
      },
    ],
  },
  {
    id: 'potager',
    titre: 'Les graines de Capy',
    resume: 'Au printemps, Capy sème des graines. Que vont-elles devenir\u00a0?',
    pages: [
      {
        pose: 'apprendre',
        texte: 'Au printemps, Capy plante cinq graines de tournesol dans un pot. Il les arrose un peu tous les jours.',
      },
      {
        pose: 'ralentir',
        texte:
          'Les jours passent. D’abord, rien ne se passe. Capy est un peu triste. Puis une petite pousse verte sort de la terre\u00a0!',
      },
      {
        pose: 'fier',
        texte:
          'En été, les tournesols sont plus grands que Capy. Leurs grosses fleurs jaunes se tournent toujours vers le soleil.',
      },
    ],
    questions: [
      {
        question: 'Combien de graines Capy plante-t-il\u00a0?',
        choix: ['cinq', 'trois', 'dix'],
        reponse: 'cinq',
        page: 1,
        explication: 'Page 1\u00a0: «\u00a0Capy plante cinq graines de tournesol.\u00a0»',
      },
      {
        question: 'Que se passe-t-il juste après que Capy est triste\u00a0?',
        choix: ['Une pousse sort de la terre.', 'Il pleut très fort.', 'Le pot se casse.'],
        reponse: 'Une pousse sort de la terre.',
        page: 2,
        explication: 'Page 2\u00a0: «\u00a0Puis une petite pousse verte sort de la terre\u00a0!\u00a0»',
      },
      {
        question: 'Vers quoi se tournent les fleurs\u00a0?',
        choix: ['vers le soleil', 'vers la maison', 'vers la lune'],
        reponse: 'vers le soleil',
        page: 3,
        explication: 'Page 3\u00a0: les fleurs «\u00a0se tournent toujours vers le soleil\u00a0».',
      },
    ],
  },
  {
    id: 'plage',
    titre: 'Le trésor de la plage',
    resume: 'En vacances, Capy trouve une bouteille dans le sable.',
    pages: [
      {
        pose: 'explorer',
        texte:
          'C’est l’été. Capy creuse un trou dans le sable avec sa pelle. Tout à coup, il touche quelque chose de dur\u00a0: une vieille bouteille\u00a0!',
      },
      {
        pose: 'surpris',
        texte:
          'Dans la bouteille, il y a un papier roulé. Capy le lit\u00a0: «\u00a0Le trésor est sous le grand rocher, près des mouettes.\u00a0»',
      },
      {
        pose: 'bravo',
        texte:
          'Sous le grand rocher, Capy trouve une boîte pleine de coquillages. Il en fait un collier pour chacun de ses amis.',
      },
    ],
    questions: [
      {
        question: 'Avec quoi Capy creuse-t-il le sable\u00a0?',
        choix: ['avec sa pelle', 'avec ses pattes', 'avec un seau'],
        reponse: 'avec sa pelle',
        page: 1,
        explication: 'Page 1\u00a0: «\u00a0Capy creuse un trou dans le sable avec sa pelle.\u00a0»',
      },
      {
        question: 'Où est caché le trésor\u00a0?',
        choix: ['sous le grand rocher', 'dans la mer', 'sous le parasol'],
        reponse: 'sous le grand rocher',
        page: 2,
        explication: 'Page 2\u00a0: le papier dit «\u00a0Le trésor est sous le grand rocher\u00a0».',
      },
      {
        question: 'Que fait Capy avec les coquillages\u00a0?',
        choix: ['des colliers pour ses amis', 'une soupe', 'un château'],
        reponse: 'des colliers pour ses amis',
        page: 3,
        explication: 'Page 3\u00a0: «\u00a0Il en fait un collier pour chacun de ses amis.\u00a0»',
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
