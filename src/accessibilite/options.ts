// Les options de l'écran « Réglages de lecture et de jeu ». Chaque option a son
// interrupteur, un titre et une explication d'une ligne en langage simple.
// - « interrupteur » : activée ou non ;
// - « choix » : activée ou non, et, une fois activée, une valeur à choisir
//   (désactivée, elle reprend la valeur habituelle) ;
// - « variante » : une précision d'une autre option, visible quand celle-ci est
//   activée (les couleurs des syllabes, par exemple).
import { REGLAGES_PAR_DEFAUT, type ReglagesEnfant } from './reglages';
import { LIBELLES_POLICES } from './theme';

export type SectionReglages = 'lecture' | 'calcul' | 'geste' | 'attention';

export const SECTIONS: readonly { id: SectionReglages; titre: string; description: string }[] = [
  { id: 'lecture', titre: 'Lecture et texte', description: 'Pour lire plus facilement, ou se faire lire les textes.' },
  { id: 'calcul', titre: 'Calcul', description: 'Pour voir les nombres et réfléchir sans se perdre.' },
  { id: 'geste', titre: 'Geste', description: 'Pour jouer sans geste précis.' },
  { id: 'attention', titre: 'Attention', description: 'Pour rester concentré, sans rien qui distrait.' },
];

type Cle = keyof ReglagesEnfant;
type Valeur = ReglagesEnfant[Cle];

interface Base {
  cle: Cle;
  section: SectionReglages;
  titre: string;
  explication: string;
}

export interface OptionInterrupteur extends Base {
  type: 'interrupteur';
}

export interface OptionChoix extends Base {
  type: 'choix';
  /** Valeurs proposées une fois l'option activée ; la première est celle qu'on active d'abord. */
  valeurs: readonly { valeur: Valeur; libelle: string }[];
}

export interface OptionVariante extends Base {
  type: 'variante';
  /** Option dont elle dépend : elle n'apparaît que quand celle-ci est activée. */
  parent: Cle;
  valeurs: readonly { valeur: Valeur; libelle: string }[];
}

export type OptionReglage = OptionInterrupteur | OptionChoix | OptionVariante;

const interrupteur = (cle: Cle, section: SectionReglages, titre: string, explication: string): OptionInterrupteur => ({
  type: 'interrupteur',
  cle,
  section,
  titre,
  explication,
});

export const OPTIONS: readonly OptionReglage[] = [
  {
    type: 'choix',
    cle: 'police',
    section: 'lecture',
    titre: 'Police adaptée',
    explication: 'Des polices à essayer avec votre enfant : gardez la plus confortable.',
    valeurs: (['andika', 'luciole', 'opendyslexic'] as const).map((p) => ({ valeur: p, libelle: LIBELLES_POLICES[p] })),
  },
  {
    type: 'choix',
    cle: 'taille',
    section: 'lecture',
    titre: 'Texte plus grand',
    explication: 'Le texte grandit et passe à la ligne, sans jamais être coupé.',
    valeurs: [
      { valeur: 'grande', libelle: 'Grand' },
      { valeur: 'tresGrande', libelle: 'Très grand' },
    ],
  },
  interrupteur('espacements', 'lecture', 'Espaces plus grands', 'Plus d’espace entre les lettres, les mots et les lignes.'),
  interrupteur('syllabes', 'lecture', 'Syllabes en couleur', 'Une couleur sur deux par syllabe, les lettres muettes en gris.'),
  {
    type: 'variante',
    cle: 'couleursSyllabes',
    parent: 'syllabes',
    section: 'lecture',
    titre: 'Couleurs des syllabes',
    explication: 'Les deux couleurs qui alternent.',
    valeurs: [
      { valeur: 'sarcelleBrun', libelle: 'Vert et brun' },
      { valeur: 'bleuRouge', libelle: 'Bleu et rouge' },
      { valeur: 'vertViolet', libelle: 'Vert et violet' },
    ],
  },
  interrupteur('alternanceLignes', 'lecture', 'Une ligne sur deux teintée', 'Un fond léger une ligne sur deux, pour ne pas sauter de ligne.'),
  {
    type: 'choix',
    cle: 'fond',
    section: 'lecture',
    titre: 'Fond teinté',
    explication: 'Un fond coloré fatigue parfois moins les yeux que le blanc.',
    valeurs: [
      { valeur: 'creme', libelle: 'Crème' },
      { valeur: 'bleu', libelle: 'Bleu pâle' },
    ],
  },
  interrupteur('lectureAuto', 'lecture', 'Lecture automatique', 'Capy lit chaque consigne et chaque énoncé, en surlignant le mot lu.'),
  interrupteur('lectureLente', 'lecture', 'Voix plus lente', 'Capy lit plus lentement.'),
  interrupteur('falc', 'lecture', 'Consignes faciles (FALC)', 'Des phrases courtes, une idée par phrase, des mots simples.'),
  interrupteur('motsExpliques', 'lecture', 'Mots expliqués', 'En maths, toucher un mot difficile le fait lire et expliquer.'),
  interrupteur('aidesVisuelles', 'calcul', 'Cubes et barres', 'Les nombres sont montrés en centaines, dizaines et unités.'),
  {
    type: 'choix',
    cle: 'nombreChoix',
    section: 'calcul',
    titre: 'Moins de réponses',
    explication: 'Moins de réponses proposées, c’est moins de choses à comparer.',
    valeurs: [
      { valeur: 3, libelle: '3 réponses' },
      { valeur: 2, libelle: '2 réponses' },
    ],
  },
  interrupteur(
    'tableConsultable',
    'calcul',
    'Table consultable',
    'Pendant les problèmes, la table d’addition ou de multiplication reste à portée de main.',
  ),
  interrupteur('toucherPuisToucher', 'geste', 'Toucher au lieu de glisser', 'Plus de glisser ni de tracé : on touche, puis on touche la destination.'),
  interrupteur('grandesCibles', 'geste', 'Grandes cibles', 'Des boutons plus grands et plus espacés, rien ne bouge sous le doigt.'),
  interrupteur('modeCalme', 'attention', 'Mode calme', 'Moins d’animations, Capy immobile, aucun son.'),
  interrupteur('sessionsCourtes', 'attention', 'Étapes courtes', '3 questions par étape au lieu de 5 ou plus.'),
  {
    type: 'choix',
    cle: 'pause',
    section: 'attention',
    titre: 'Pause proposée',
    explication: 'Capy propose de faire une pause au bout d’un moment.',
    valeurs: [
      { valeur: 10, libelle: 'Toutes les 10 min' },
      { valeur: 5, libelle: 'Toutes les 5 min' },
    ],
  },
  interrupteur('uneChoseALaFois', 'attention', 'Une seule chose à la fois', 'La consigne seule d’abord, puis le jeu, puis le retour.'),
];

/** L'option est-elle activée ? (une variante suit l'option dont elle dépend) */
export function optionActive(o: OptionReglage, r: ReglagesEnfant): boolean {
  if (o.type === 'variante') return r[o.parent] !== REGLAGES_PAR_DEFAUT[o.parent];
  return r[o.cle] !== REGLAGES_PAR_DEFAUT[o.cle];
}

/** Active ou désactive une option ; désactivée, elle reprend sa valeur habituelle. */
export function basculerOption(o: OptionInterrupteur | OptionChoix, r: ReglagesEnfant, activer: boolean): ReglagesEnfant {
  if (!activer) return { ...r, [o.cle]: REGLAGES_PAR_DEFAUT[o.cle] };
  return { ...r, [o.cle]: o.type === 'choix' ? o.valeurs[0].valeur : true };
}

/** Les options activées (sans les variantes), pour le résumé de l'espace parent. */
export function optionsActives(r: ReglagesEnfant): OptionReglage[] {
  return OPTIONS.filter((o) => o.type !== 'variante' && optionActive(o, r));
}
