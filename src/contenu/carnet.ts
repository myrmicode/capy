// Le carnet de Capy : une mini-leçon par compétence, à relire quand on veut.
// Une page s'ajoute au carnet dès que l'enfant a fini une première étape (ou
// une série d'entraînement) du thème. Phrases courtes, exemples concrets, une
// astuce. À faire relire par un enseignant, comme les exercices.
import type { DomaineId } from '@/config/domaines';
import { themesDe, type Theme } from '@/config/parcours';
import type { Classe } from '@/config/classes';
import type { ProgressionEnfant } from '@/parcours/progression';

export interface PageCarnet {
  titre: string;
  /** La règle, en une ou deux phrases. */
  regle: string;
  exemples: readonly string[];
  astuce: string;
}

export const CARNET: Partial<Record<DomaineId, PageCarnet>> = {
  'resoudre-problemes': {
    titre: 'Résoudre un problème',
    regle:
      'Je lis l’histoire deux fois et je cherche ce qu’on me demande. Puis je choisis le calcul\u00a0: on ajoute quand ça augmente, on enlève quand ça diminue, on multiplie quand il y a plusieurs paquets pareils.',
    exemples: [
      'Lou a 5 billes, on lui en donne 3\u00a0: 5\u00a0+\u00a03\u00a0=\u00a08.',
      'Il y a 4 paquets de 6 fraises\u00a0: 4\u00a0×\u00a06\u00a0=\u00a024.',
    ],
    astuce: 'Je peux faire un petit dessin de l’histoire.',
  },
  'calcul-mental': {
    titre: 'Calculer dans sa tête',
    regle: 'Je cherche un chemin facile\u00a0: je passe par 10, j’utilise les doubles, je pense à mes tables.',
    exemples: [
      '8\u00a0+\u00a07, c’est 8\u00a0+\u00a02\u00a0+\u00a05\u00a0=\u00a015.',
      '6\u00a0+\u00a06\u00a0=\u00a012, donc 6\u00a0+\u00a07\u00a0=\u00a013.',
      '5\u00a0×\u00a04, c’est comme 4\u00a0×\u00a05\u00a0=\u00a020.',
    ],
    astuce: 'Dans une addition ou une multiplication, je peux changer l’ordre\u00a0: le résultat ne change pas.',
  },
  'ligne-graduee': {
    titre: 'La ligne graduée',
    regle:
      'Sur une ligne graduée, les nombres vont du plus petit au plus grand, de gauche à droite. Je regarde d’abord de combien on avance à chaque trait.',
    exemples: ['0, 10, 20, 30\u00a0: on avance de 10 à chaque trait.', '15 est au milieu, entre 10 et 20.'],
    astuce: 'Je pars du nombre écrit le plus proche, puis je compte les traits.',
  },
  'accord-nom-adjectif': {
    titre: 'Accorder l’adjectif',
    regle:
      'L’adjectif prend la marque du nom qu’il décrit. Au féminin, on ajoute souvent un e. Au pluriel, on ajoute souvent un s.',
    exemples: ['un petit chien, une petite fille', 'des petits chiens, des petites filles'],
    astuce: 'Je cherche le nom, puis je me demande\u00a0: masculin ou féminin\u00a0? Un seul ou plusieurs\u00a0?',
  },
  'nature-mots': {
    titre: 'Nom, verbe ou adjectif',
    regle:
      'Le nom désigne une personne, un animal ou une chose. Le verbe dit ce que l’on fait. L’adjectif dit comment est le nom.',
    exemples: [
      'un chat\u00a0: chat est un nom.',
      'Il court\u00a0: court est un verbe.',
      'un chat noir\u00a0: noir est un adjectif.',
    ],
    astuce:
      'Je teste\u00a0: si je peux dire « un… » ou « une… » devant, c’est un nom\u00a0; si je peux dire « je… », c’est un verbe.',
  },
  synonymes: {
    titre: 'Les synonymes',
    regle: 'Deux synonymes sont des mots qui veulent dire presque la même chose.',
    exemples: ['content et joyeux', 'commencer et débuter', 'une maison et une habitation'],
    astuce: 'Je remplace le mot dans la phrase\u00a0: si le sens ne change pas, c’est un synonyme.',
  },
  'familles-mots': {
    titre: 'Les familles de mots',
    regle: 'Les mots d’une même famille sont fabriqués à partir d’un même mot. Ils parlent de la même idée.',
    exemples: ['jardin, jardinier, jardiner', 'dent, dentiste, dentifrice'],
    astuce: 'Je cherche le petit mot caché dans le grand.',
  },
  'sujet-verbe': {
    titre: 'Le sujet et le verbe',
    regle:
      'Le verbe dit l’action. Le sujet dit qui fait l’action\u00a0: je le trouve en demandant « Qui est-ce qui…\u00a0? »',
    exemples: ['Le chat dort. Qui est-ce qui dort\u00a0? Le chat\u00a0: c’est le sujet.', 'Dort est le verbe.'],
    astuce: 'Le verbe change quand on dit la phrase hier ou demain\u00a0: le chat dormait, le chat dormira.',
  },
  conjugaison: {
    titre: 'Conjuguer un verbe',
    regle:
      'Le verbe change selon le moment\u00a0: hier, c’est le passé\u00a0; aujourd’hui, le présent\u00a0; demain, le futur. Il change aussi avec je, tu, il, nous, vous, ils.',
    exemples: ['Hier, je chantais.', 'Aujourd’hui, je chante.', 'Demain, je chanterai.'],
    astuce: 'Au futur, on entend souvent un « r » juste avant la fin\u00a0: je chanterai, nous finirons.',
  },
  'ecrire-mots': {
    titre: 'Écrire un mot',
    regle:
      'J’écoute bien le mot, je le coupe en syllabes, puis j’écris chaque syllabe. Un même son peut s’écrire de plusieurs façons\u00a0: je pense à un mot que je connais.',
    exemples: ['mai-son', 'oi-seau\u00a0: « oi » comme dans roi'],
    astuce: 'Je relis le mot en suivant les lettres avec le doigt.',
  },
  'comprendre-phrases-lues': {
    titre: 'Comprendre une phrase',
    regle:
      'Je cherche qui fait l’action, et ce qu’il fait. Attention\u00a0: celui qui fait l’action n’est pas toujours au début de la phrase.',
    exemples: [
      'Le chien suit le chat. Qui suit\u00a0? Le chien.',
      'Le chat est suivi par le chien. Qui suit\u00a0? Encore le chien.',
    ],
    astuce: 'Je relis lentement et j’imagine la scène dans ma tête.',
  },
  'comprendre-texte-lu': {
    titre: 'Comprendre un texte',
    regle: 'La réponse est dans le texte. Je relis le passage qui parle de la question.',
    exemples: ['Lou part à l’école avec son sac. Où va Lou\u00a0? À l’école.'],
    astuce: 'Je cherche dans le texte les mots de la question.',
  },
};

/** Le thème a-t-il été commencé : une étape finie ou une série d’entraînement ? */
function themeCommence(theme: Theme, p: ProgressionEnfant): boolean {
  const etapes = theme.unites.flatMap((u) => u.etapes.map((e) => e.id));
  return etapes.some((id) => id in p.etapes) || (p.entrainement?.[theme.id]?.series ?? 0) > 0;
}

export interface EntreeCarnet {
  theme: Theme;
  page: PageCarnet;
  decouverte: boolean;
}

/** Les pages du carnet pour une classe, dans l'ordre du parcours. */
export function pagesDuCarnet(classe: Classe, p: ProgressionEnfant): EntreeCarnet[] {
  return themesDe(classe).flatMap((theme) => {
    const page = CARNET[theme.domaine];
    return page ? [{ theme, page, decouverte: themeCommence(theme, p) }] : [];
  });
}
