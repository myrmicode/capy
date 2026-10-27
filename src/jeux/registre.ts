import type { ExerciceQuelconque } from '@/exercices';

export type JeuId =
  | 'marche'
  | 'bonFil'
  | 'lucioles'
  | 'questionPerdue'
  | 'funambule'
  | 'wagons'
  | 'paniers'
  | 'dictee'
  | 'passage'
  | 'reponses'
  | 'ordre'
  | 'caisse'
  | 'horloge';

export interface DefinitionJeu {
  id: JeuId;
  titre: string;
  /** Consigne courte affichée au-dessus du jeu (et lue par « Écouter »). */
  consigne: string;
  /** La même consigne en FALC : phrases courtes, une idée par phrase. */
  consigneFacile: string;
  /** Consigne avec « toucher puis toucher », pour les jeux où l'on glisse ou trace. */
  consigneToucher?: string;
  /** Indice propre au jeu, à la place de celui de l'exercice. */
  indice?: string;
  indiceFacile?: string;
  /** Modèles d'exercices que ce jeu sait illustrer (tous si absent). */
  modeles?: readonly string[];
  /** Variante d'histoire imposée, pour que le décor colle au jeu. */
  histoire?: number;
  /** L'exercice convient-il à ce jeu (taille des nombres, opération, longueur des mots) ? */
  accepte: (ex: ExerciceQuelconque) => boolean;
}

/** Opérations proposées dans « Le bon fil ». */
export const OPERATIONS_BON_FIL = ['+', '−', '×'] as const;

const MODELES_PLACER = ['placer-petits-pas', 'placer-grands-pas'] as const;
/** Au-delà, trop de pièces à poser une par une. */
const SOMME_CAISSE_MAX = 100;
/** Longueur maximale d'un mot porté par une luciole. */
const MOT_LUCIOLE_MAX = 12;

export const JEUX: Record<JeuId, DefinitionJeu> = {
  marche: {
    id: 'marche',
    titre: 'Le marché',
    consigne: 'Glisse les fraises dans les paniers, puis valide.',
    consigneFacile: 'Mets les fraises dans les paniers. Puis valide.',
    consigneToucher: 'Touche la fraise, puis touche un panier. Puis valide.',
    modeles: ['groupements'],
    histoire: 0,
    // Assez peu de fraises pour que les glisser une par une reste un plaisir.
    accepte: (ex) => ex.nature === 'nombre' && ex.reponse <= 30 && ex.donnees.groupes <= 5,
  },
  bonFil: {
    id: 'bonFil',
    titre: 'Le bon fil',
    consigne: 'Trace un fil entre l’histoire et la bonne opération.',
    consigneFacile: 'Relie l’histoire à la bonne opération.',
    consigneToucher: 'Touche la bonne opération.',
    modeles: ['groupements', 'ajout', 'retrait', 'ecart'],
    accepte: (ex) =>
      ex.nature === 'nombre' &&
      ex.operations.length === 1 &&
      (OPERATIONS_BON_FIL as readonly string[]).includes(ex.operations[0]),
  },
  lucioles: {
    id: 'lucioles',
    titre: 'Attrape-lucioles',
    consigne: 'Touche la luciole qui porte la bonne réponse.',
    consigneFacile: 'Touche la luciole de la bonne réponse.',
    modeles: [
      'tables',
      'doubles',
      'complement-cent',
      'ajouter-dizaines',
      'synonymes',
      'meme-famille',
      'intrus-famille',
      'conjugaison',
      'conjugaison-present',
      'conjugaison-imparfait',
      'conjugaison-futur',
      'accord-adjectif',
      // CE1, CM1 et CM2
      'tables-addition',
      'tables-multiplication',
      'fois-dix-cent',
      'synonymes-cm2',
      'meme-famille-cm2',
      'intrus-famille-cm2',
      'accord-sujet-verbe',
      'texte-entendu',
      // Numération, calcul posé, fractions, nombres à virgule
      'lire-nombre',
      'ecrire-nombre',
      'plus-grand',
      'plus-petit',
      'denombrer',
      'decomposer',
      'addition-posee',
      'soustraction-posee',
      'multiplication-posee',
      'fraction-de',
      'fraction-partie',
      'decimaux',
      // CP
      'compter-objets',
      'compter-syllabes',
      'premiere-syllabe',
      'premier-son',
      'nom-lettre',
      'syllabe-entendue',
      // Mesures et formes
      'mesurer-regle',
      'metres-en-cm',
      'km-en-m',
      'kg-en-g',
      'litres-en-cl',
      'heures-en-minutes',
      'reconnaitre-figure',
      'compter-cotes',
      'axes-symetrie',
    ],
    accepte: (ex) => ex.nature === 'nombre' || ex.choix.every((m) => m.length <= MOT_LUCIOLE_MAX),
  },
  questionPerdue: {
    id: 'questionPerdue',
    titre: 'La question perdue',
    consigne: 'Choisis la question qui va avec l’histoire.',
    indice: 'Cherche la question à laquelle on peut répondre avec les nombres de l’histoire.',
    consigneFacile: 'Choisis la question qui va avec l’histoire.',
    indiceFacile: 'Cherche la question qui va avec les nombres.',
    accepte: (ex) => ex.nature === 'nombre' && ex.questionsAuChoix !== undefined,
  },
  funambule: {
    id: 'funambule',
    titre: 'Le funambule',
    consigne: 'Fais glisser Capy sur le fil jusqu’au bon nombre, puis valide.',
    consigneFacile: 'Fais avancer Capy jusqu’au bon nombre. Puis valide.',
    consigneToucher: 'Fais avancer Capy avec les flèches. Puis valide.',
    modeles: MODELES_PLACER,
    accepte: (ex) => ex.nature === 'nombre',
  },
  wagons: {
    id: 'wagons',
    titre: 'Les wagons de la phrase',
    consigne: 'Touche le bon wagon de la phrase.',
    consigneFacile: 'Touche le bon wagon.',
    modeles: ['trouver-le-mot', 'sujet-et-verbe', 'sujet-et-verbe-cm2'],
    accepte: (ex) => ex.nature === 'texte' && ex.segments !== undefined,
  },
  paniers: {
    id: 'paniers',
    titre: 'Les paniers',
    consigne: 'Range le mot en couleur dans le bon panier.',
    consigneFacile: 'Mets le mot en couleur dans le bon panier.',
    modeles: ['nature-du-mot'],
    accepte: (ex) => ex.nature === 'texte' && ex.categories !== undefined,
  },
  dictee: {
    id: 'dictee',
    titre: 'La dictée de Capy',
    consigne: 'Écoute le mot, écris-le, puis valide.',
    consigneFacile: 'Écoute le mot. Écris-le. Puis valide.',
    modeles: ['dictee-mots', 'mots-outils'],
    accepte: (ex) => ex.nature === 'texte' && ex.lecture !== undefined,
  },
  passage: {
    id: 'passage',
    titre: 'La bonne phrase',
    consigne: 'Lis bien chaque phrase, puis touche la bonne.',
    consigneFacile: 'Lis chaque phrase. Touche la bonne.',
    modeles: ['meme-sens', 'preuve-texte'],
    accepte: (ex) => ex.nature === 'texte' && ex.phrases !== undefined && ex.phrases.includes(ex.reponse),
  },
  ordre: {
    id: 'ordre',
    titre: 'La phrase en désordre',
    consigne: 'Touche les mots dans l’ordre pour faire une phrase, puis valide.',
    consigneFacile: 'Touche les mots dans l’ordre. Puis valide.',
    modeles: ['phrase-en-ordre', 'phrase-en-ordre-cm2'],
    accepte: (ex) => ex.nature === 'texte' && ex.motsEnDesordre !== undefined,
  },
  caisse: {
    id: 'caisse',
    titre: 'La caisse',
    consigne: 'Pose les pièces et les billets pour faire la somme, puis valide.',
    consigneFacile: 'Pose les pièces et les billets. Puis valide.',
    indice: 'Commence par les plus gros billets, puis complète avec les pièces.',
    indiceFacile: 'Pose d’abord les gros billets. Puis les pièces.',
    modeles: ['payer', 'rendre-monnaie'],
    accepte: (ex) => ex.nature === 'nombre' && ex.reponse <= SOMME_CAISSE_MAX,
  },
  horloge: {
    id: 'horloge',
    titre: 'L’horloge',
    consigne: 'Avance l’aiguille jusqu’à la bonne heure, puis valide.',
    consigneFacile: 'Avance l’aiguille. Puis valide.',
    modeles: ['duree'],
    accepte: (ex) => ex.nature === 'nombre' && ex.reponse >= 1 && ex.reponse <= 12,
  },
  reponses: {
    id: 'reponses',
    titre: 'La bonne réponse',
    consigne: 'Choisis la bonne réponse.',
    consigneFacile: 'Choisis la bonne réponse.',
    // Placer un nombre n'a de sens qu'avec le fil : la réponse est dans la question.
    // Les phrases à toucher n'ont de sens que dans « La bonne phrase ».
    accepte: (ex) =>
      !(MODELES_PLACER as readonly string[]).includes(ex.modeleId) &&
      !(ex.nature === 'texte' && ex.phrases !== undefined) &&
      // Une phrase à remettre en ordre se construit mot à mot, jamais en choisissant parmi des phrases cassées.
      !(ex.nature === 'texte' && ex.motsEnDesordre !== undefined),
  },
};

/** La consigne à afficher et à lire, selon les réglages de l'enfant. */
export function consigneDe(jeu: DefinitionJeu, reglages: { falc: boolean; toucherPuisToucher: boolean }): string {
  if (reglages.toucherPuisToucher && jeu.consigneToucher) return jeu.consigneToucher;
  return reglages.falc ? jeu.consigneFacile : jeu.consigne;
}
