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
    astuce:
      'Je dessine l’histoire en barres : le tout en haut, les morceaux dedans, et un point d’interrogation pour ce que je cherche.',
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
      'Je teste\u00a0: si je peux dire «\u00a0un…\u00a0» ou «\u00a0une…\u00a0» devant, c’est un nom\u00a0; si je peux dire «\u00a0je…\u00a0», c’est un verbe.',
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
      'Le verbe dit l’action. Le sujet dit qui fait l’action\u00a0: je le trouve en demandant «\u00a0Qui est-ce qui…\u00a0?\u00a0»',
    exemples: ['Le chat dort. Qui est-ce qui dort\u00a0? Le chat\u00a0: c’est le sujet.', 'Dort est le verbe.'],
    astuce: 'Le verbe change quand on dit la phrase hier ou demain\u00a0: le chat dormait, le chat dormira.',
  },
  conjugaison: {
    titre: 'Conjuguer un verbe',
    regle:
      'Le verbe change selon le moment\u00a0: hier, c’est le passé\u00a0; aujourd’hui, le présent\u00a0; demain, le futur. Il change aussi avec je, tu, il, nous, vous, ils.',
    exemples: ['Hier, je chantais.', 'Aujourd’hui, je chante.', 'Demain, je chanterai.'],
    astuce: 'Au futur, on entend souvent un «\u00a0r\u00a0» juste avant la fin\u00a0: je chanterai, nous finirons.',
  },
  'ecrire-mots': {
    titre: 'Écrire un mot',
    regle:
      'J’écoute bien le mot, je le coupe en syllabes, puis j’écris chaque syllabe. Un même son peut s’écrire de plusieurs façons\u00a0: je pense à un mot que je connais.',
    exemples: ['mai-son', 'oi-seau\u00a0: «\u00a0oi\u00a0» comme dans roi'],
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
  'comprendre-mots': {
    titre: 'Comprendre des mots',
    regle:
      'Plus je connais de mots, mieux je comprends les histoires. Un mot nouveau, je le redis et je cherche à quoi il ressemble.',
    exemples: ['Un hérisson : un petit animal couvert de piquants.', 'Une boussole : elle montre le nord.'],
    astuce: 'Quand j’entends un mot que je ne connais pas, je demande ce qu’il veut dire.',
  },
  'comprendre-phrases': {
    titre: 'Comprendre une phrase',
    regle: 'Les petits mots changent tout : sur ou sous, le ou les, et « pas » qui dit le contraire.',
    exemples: ['Le chat est sur la boîte. Le chat est sous la boîte.', 'Il y a un chien, mais pas de chat.'],
    astuce: 'J’écoute la phrase jusqu’au bout avant de choisir.',
  },
  'ecrire-syllabes': {
    titre: 'Écrire une syllabe',
    regle: 'J’écoute chaque son, dans l’ordre, et j’écris la lettre (ou les deux lettres) de chaque son.',
    exemples: ['bra : b, r, a.', 'chou : « ch » puis « ou ».', 'moi : m, puis « oi ».'],
    astuce: 'Je dis la syllabe tout doucement, en étirant les sons.',
  },
  'comprendre-texte-entendu': {
    titre: 'Écouter une histoire',
    regle: 'Quand on me lit une histoire, j’écoute qui sont les personnages, où ils sont et ce qu’ils font.',
    exemples: ['Lou cherche son chat sous le lit. Où cherche Lou\u00a0? Sous le lit.'],
    astuce: 'Pendant que j’écoute, j’imagine l’histoire comme un petit film dans ma tête.',
  },
  'tables-addition': {
    titre: 'Les tables d’addition',
    regle: 'Pour aller vite, je passe par 10\u00a0: je complète d’abord jusqu’à 10, puis j’ajoute ce qui reste.',
    exemples: [
      '8\u00a0+\u00a05, c’est 8\u00a0+\u00a02\u00a0=\u00a010, puis 10\u00a0+\u00a03\u00a0=\u00a013.',
      '7\u00a0+\u00a07\u00a0=\u00a014, c’est un double.',
    ],
    astuce: 'Je commence toujours par le plus grand nombre.',
  },
  'tables-multiplication': {
    titre: 'Les tables de multiplication',
    regle:
      'Multiplier, c’est ajouter plusieurs fois le même nombre. 4\u00a0×\u00a03, c’est 3\u00a0+\u00a03\u00a0+\u00a03\u00a0+\u00a03.',
    exemples: ['7\u00a0×\u00a08\u00a0=\u00a056', '9\u00a0×\u00a06\u00a0=\u00a054, c’est 10\u00a0×\u00a06 moins 6.'],
    astuce: '7\u00a0×\u00a08, c’est comme 8\u00a0×\u00a07\u00a0: je choisis la table que je connais le mieux.',
  },
  'accord-sujet-verbe': {
    titre: 'Accorder le verbe',
    regle: 'Le verbe s’accorde avec son sujet. Si le sujet est au pluriel, le verbe se termine souvent par -nt.',
    exemples: [
      'Le chien joue. Les chiens jouent.',
      'Les chats du voisin dorment\u00a0: le sujet est «\u00a0les chats\u00a0».',
    ],
    astuce: 'Je remplace le sujet par il ou ils\u00a0: je sais tout de suite s’il est au pluriel.',
  },
  'synonymes-familles': {
    titre: 'Synonymes et familles de mots',
    regle: 'Des synonymes veulent dire presque la même chose. Les mots d’une même famille viennent du même mot.',
    exemples: ['content, joyeux\u00a0: des synonymes.', 'dent, dentiste, dentier\u00a0: une famille de mots.'],
    astuce: 'Pour la famille, je cherche le petit mot caché dans les grands.',
  },
  geometrie: {
    titre: 'Les formes',
    regle: 'Pour reconnaître une figure, je compte ses côtés et je regarde ses coins\u00a0: sont-ils droits\u00a0?',
    exemples: ['Le carré\u00a0: 4 côtés pareils et 4 angles droits.', 'Le triangle\u00a0: 3 côtés.'],
    astuce: 'Pour un axe de symétrie, j’imagine que je plie la figure\u00a0: les deux moitiés se superposent.',
  },
  grandeurs: {
    titre: 'Les mesures',
    regle: 'Pour changer d’unité, je me souviens de combien de petites unités font une grande.',
    exemples: [
      '1\u00a0m\u00a0=\u00a0100\u00a0cm',
      '1\u00a0kg\u00a0=\u00a01\u202f000\u00a0g',
      '1\u00a0h\u00a0=\u00a060\u00a0min',
    ],
    astuce: 'Avec la règle, je regarde toujours où commence le segment.',
  },
  'compter-objets': {
    titre: 'Compter des objets',
    regle: 'Je touche chaque objet une seule fois en disant un nombre. Le dernier nombre dit combien il y en a.',
    exemples: ['un, deux, trois, quatre\u00a0: il y a 4 pommes.'],
    astuce: 'Pour aller plus vite, je fais des paquets de cinq ou de dix.',
  },
  'manipuler-syllabes': {
    titre: 'Les syllabes',
    regle: 'Une syllabe, c’est un morceau de mot qu’on dit d’un seul coup de voix.',
    exemples: ['cha-peau\u00a0: 2 syllabes', 'pa-pi-llon\u00a0: 3 syllabes'],
    astuce: 'Je tape dans mes mains à chaque syllabe.',
  },
  'manipuler-phonemes': {
    titre: 'Les sons',
    regle: 'Un mot est fait de petits sons. Je peux entendre le tout premier.',
    exemples: ['lapin commence par le son l.', 'moto commence par le son m.'],
    astuce: 'Je fais durer le premier son\u00a0: mmmoto.',
  },
  'nom-lettres': {
    titre: 'Le nom des lettres',
    regle: 'Chaque lettre a un nom. Certaines se ressemblent\u00a0: b, d, p et q.',
    exemples: ['b a le ventre à droite, d a le ventre à gauche.'],
    astuce: 'Je regarde où est le rond, et si la barre monte ou descend.',
  },
  'son-lettres': {
    titre: 'Le son des lettres',
    regle: 'Les lettres font un son. Le son de la consonne et celui de la voyelle se collent pour faire une syllabe.',
    exemples: ['m et a\u00a0: ma', 'l et i\u00a0: li'],
    astuce: 'Je fais glisser le premier son vers le second\u00a0: mmmaaa.',
  },
  'lire-nombres': {
    titre: 'Lire un nombre',
    regle: 'Je lis le nombre morceau par morceau, et chaque morceau va à sa place\u00a0: centaines, dizaines, unités.',
    exemples: ['trois cent quarante-deux\u00a0: 342', 'soixante-quatorze, c’est soixante et quatorze\u00a0: 74'],
    astuce: 'Soixante-dix, c’est soixante et dix. Quatre-vingts, c’est quatre fois vingt.',
  },
  'ecrire-nombres': {
    titre: 'Écrire un nombre',
    regle: 'J’écris un chiffre par rang. Quand on ne dit rien pour un rang, j’écris un zéro.',
    exemples: ['trois cent cinq\u00a0: 305, il n’y a pas de dizaine.', 'deux mille huit\u00a0: 2\u202f008'],
    astuce: 'Je compte les rangs\u00a0: après «\u00a0mille\u00a0», il y a toujours trois chiffres.',
  },
  'comparer-nombres': {
    titre: 'Comparer des nombres',
    regle: 'Je regarde d’abord le chiffre le plus à gauche. S’il est pareil, je regarde le suivant.',
    exemples: ['74 est plus grand que 47\u00a0: 7 dizaines, c’est plus que 4 dizaines.'],
    astuce: 'Un nombre qui a plus de chiffres est plus grand.',
  },
  denombrer: {
    titre: 'Dénombrer',
    regle: 'Je compte les paquets de cent, les paquets de dix, puis les objets seuls.',
    exemples: ['3 boîtes de 100, 4 paquets de 10 et 2 seuls\u00a0: 342', '14 paquets de 10, c’est 140.'],
    astuce: '10 paquets de dix, c’est une centaine.',
  },
  'reconnaitre-nombres': {
    titre: 'Le rang vide',
    regle: 'Je range dans l’ordre\u00a0: milliers, centaines, dizaines, unités. Un rang vide, c’est un zéro.',
    exemples: ['4 milliers, 3 centaines et 7 unités\u00a0: 4\u202f307'],
    astuce: 'Je dessine un tableau avec une case par rang.',
  },
  'poser-calculer': {
    titre: 'Poser une opération',
    regle:
      'Les unités sous les unités, les dizaines sous les dizaines. Je commence à droite et je n’oublie pas les retenues.',
    exemples: ['47\u00a0+\u00a038\u00a0: 7\u00a0+\u00a08\u00a0=\u00a015, j’écris 5 et je retiens 1.'],
    astuce: 'Je vérifie\u00a0: le résultat d’une addition est plus grand que chaque nombre.',
  },
  fractions: {
    titre: 'Les fractions',
    regle: 'Je partage en parts égales. En bas, le nombre de parts\u00a0; en haut, les parts prises.',
    exemples: [
      'Une pizza en 4 parts, j’en prends 3\u00a0: 3/4.',
      'Le quart de 20\u00a0: 20\u00a0÷\u00a04\u00a0=\u00a05.',
    ],
    astuce: 'La moitié, c’est 2 parts égales\u00a0; le tiers, 3\u00a0; le quart, 4.',
  },
  'representations-nombres': {
    titre: 'Les nombres à virgule',
    regle: 'Avant la virgule, les unités. Juste après, les dixièmes, puis les centièmes.',
    exemples: ['4 unités et 7 dixièmes\u00a0: 4,7', '47/10\u00a0=\u00a04,7 et 47/100\u00a0=\u00a00,47'],
    astuce: 'S’il n’y a pas de dixièmes, j’écris un zéro\u00a0: 3 unités et 5 centièmes, c’est 3,05.',
  },
  'sujet-verbe-complement': {
    titre: 'Le sujet et le verbe',
    regle: 'Le verbe dit ce que l’on fait. Le sujet dit qui fait l’action. Le reste de la phrase complète.',
    exemples: ['Ce matin, le chat boit du lait\u00a0: qui boit\u00a0? Le chat.'],
    astuce: 'Je peux encadrer le sujet avec «\u00a0c’est… qui\u00a0»\u00a0: c’est le chat qui boit.',
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
