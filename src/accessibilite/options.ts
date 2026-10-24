// Description des options de l'écran « Réglages de lecture et de jeu » :
// titre, explication d'une ligne en langage simple, et type de réglage.
import type { ReglagesEnfant } from './reglages';
import { LIBELLES_POLICES } from './theme';

export type SectionReglages = 'lecture' | 'calcul' | 'geste' | 'attention';

export const TITRES_SECTIONS: Record<SectionReglages, string> = {
  lecture: 'Lecture et texte',
  calcul: 'Calcul',
  geste: 'Geste',
  attention: 'Attention',
};

interface OptionBase<K extends keyof ReglagesEnfant> {
  cle: K;
  section: SectionReglages;
  titre: string;
  explication: string;
}

export type OptionReglage =
  | (OptionBase<keyof ReglagesEnfant> & { type: 'interrupteur' })
  | (OptionBase<keyof ReglagesEnfant> & {
      type: 'choix';
      valeurs: readonly {
        valeur: ReglagesEnfant[keyof ReglagesEnfant];
        libelle: string;
      }[];
    });

const interrupteur = (
  cle: keyof ReglagesEnfant,
  section: SectionReglages,
  titre: string,
  explication: string,
): OptionReglage => ({
  cle,
  section,
  titre,
  explication,
  type: 'interrupteur',
});

export const OPTIONS: readonly OptionReglage[] = [
  {
    cle: 'police',
    section: 'lecture',
    titre: 'Police',
    explication: 'Des polices à essayer avec votre enfant : gardez celle qui lui est la plus confortable.',
    type: 'choix',
    valeurs: (['nunito', 'andika', 'luciole', 'opendyslexic'] as const).map((p) => ({
      valeur: p,
      libelle: LIBELLES_POLICES[p],
    })),
  },
  {
    cle: 'taille',
    section: 'lecture',
    titre: 'Taille du texte',
    explication: 'Le texte grandit et passe à la ligne, sans jamais être coupé.',
    type: 'choix',
    valeurs: [
      { valeur: 'normale', libelle: 'Normale' },
      { valeur: 'grande', libelle: 'Grande' },
      { valeur: 'tresGrande', libelle: 'Très grande' },
    ],
  },
  interrupteur(
    'espacements',
    'lecture',
    'Espaces plus grands',
    'Plus d’espace entre les lettres, les mots et les lignes.',
  ),
  interrupteur(
    'syllabes',
    'lecture',
    'Syllabes en couleur',
    'Une couleur sur deux par syllabe, les lettres muettes en gris.',
  ),
  {
    cle: 'couleursSyllabes',
    section: 'lecture',
    titre: 'Couleurs des syllabes',
    explication: 'Les deux couleurs qui alternent.',
    type: 'choix',
    valeurs: [
      { valeur: 'sarcelleBrun', libelle: 'Vert et brun' },
      { valeur: 'bleuRouge', libelle: 'Bleu et rouge' },
      { valeur: 'vertViolet', libelle: 'Vert et violet' },
    ],
  },
  interrupteur(
    'alternanceLignes',
    'lecture',
    'Une ligne sur deux teintée',
    'Un fond léger, une ligne sur deux, pour ne pas sauter de ligne.',
  ),
  {
    cle: 'fond',
    section: 'lecture',
    titre: 'Couleur du fond',
    explication: 'Un fond teinté fatigue parfois moins les yeux que le blanc.',
    type: 'choix',
    valeurs: [
      { valeur: 'defaut', libelle: 'Habituel' },
      { valeur: 'creme', libelle: 'Crème' },
      { valeur: 'bleu', libelle: 'Bleu pâle' },
    ],
  },
  interrupteur(
    'lectureAuto',
    'lecture',
    'Lecture automatique',
    'Capy lit chaque consigne et chaque énoncé, en surlignant le mot lu.',
  ),
  interrupteur('lectureLente', 'lecture', 'Voix plus lente', 'Capy lit plus lentement.'),
  interrupteur(
    'falc',
    'lecture',
    'Consignes faciles (FALC)',
    'Des phrases courtes, une idée par phrase, des mots simples.',
  ),
  interrupteur(
    'motsExpliques',
    'lecture',
    'Mots expliqués',
    'En maths, toucher un mot difficile le fait lire et expliquer.',
  ),
  interrupteur(
    'aidesVisuelles',
    'calcul',
    'Cubes et barres',
    'Les nombres sont montrés en centaines, dizaines et unités.',
  ),
  {
    cle: 'nombreChoix',
    section: 'calcul',
    titre: 'Nombre de réponses proposées',
    explication: 'Moins de réponses, c’est moins de choses à comparer.',
    type: 'choix',
    valeurs: [
      { valeur: 4, libelle: '4' },
      { valeur: 3, libelle: '3' },
      { valeur: 2, libelle: '2' },
    ],
  },
  interrupteur(
    'tableConsultable',
    'calcul',
    'Table consultable',
    'Pendant les problèmes, la table d’addition ou de multiplication reste à portée de main.',
  ),
  interrupteur(
    'toucherPuisToucher',
    'geste',
    'Toucher au lieu de glisser',
    'Plus de glisser ni de tracé : on touche, puis on touche la destination.',
  ),
  interrupteur(
    'grandesCibles',
    'geste',
    'Grandes cibles',
    'Des boutons plus grands et plus espacés, rien ne bouge sous le doigt.',
  ),
  interrupteur('modeCalme', 'attention', 'Mode calme', 'Moins d’animations, Capy immobile, aucun son.'),
  interrupteur('sessionsCourtes', 'attention', 'Étapes courtes', '3 questions par étape au lieu de 5 ou plus.'),
  {
    cle: 'pause',
    section: 'attention',
    titre: 'Pause proposée',
    explication: 'Capy propose de faire une pause au bout d’un moment.',
    type: 'choix',
    valeurs: [
      { valeur: 0, libelle: 'Jamais' },
      { valeur: 5, libelle: '5 min' },
      { valeur: 10, libelle: '10 min' },
    ],
  },
  interrupteur(
    'uneChoseALaFois',
    'attention',
    'Une seule chose à la fois',
    'La consigne seule d’abord, puis le jeu, puis le retour.',
  ),
];
