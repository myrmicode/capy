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
  | 'reponses';

export interface DefinitionJeu {
  id: JeuId;
  titre: string;
  /** Consigne courte affichée au-dessus du jeu (et lue par « Écouter »). */
  consigne: string;
  /** Indice propre au jeu, à la place de celui de l'exercice. */
  indice?: string;
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
/** Longueur maximale d'un mot porté par une luciole. */
const MOT_LUCIOLE_MAX = 12;

export const JEUX: Record<JeuId, DefinitionJeu> = {
  marche: {
    id: 'marche',
    titre: 'Le marché',
    consigne: 'Glisse les fraises dans les paniers, puis valide.',
    modeles: ['groupements'],
    histoire: 0,
    // Assez peu de fraises pour que les glisser une par une reste un plaisir.
    accepte: (ex) => ex.nature === 'nombre' && ex.reponse <= 30 && ex.donnees.groupes <= 5,
  },
  bonFil: {
    id: 'bonFil',
    titre: 'Le bon fil',
    consigne: 'Trace un fil entre l’histoire et la bonne opération.',
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
    ],
    accepte: (ex) => ex.nature === 'nombre' || ex.choix.every((m) => m.length <= MOT_LUCIOLE_MAX),
  },
  questionPerdue: {
    id: 'questionPerdue',
    titre: 'La question perdue',
    consigne: 'Choisis la question qui va avec l’histoire.',
    indice: 'Cherche la question à laquelle on peut répondre avec les nombres de l’histoire.',
    accepte: (ex) => ex.nature === 'nombre' && ex.questionsAuChoix !== undefined,
  },
  funambule: {
    id: 'funambule',
    titre: 'Le funambule',
    consigne: 'Fais glisser Capy sur le fil jusqu’au bon nombre, puis valide.',
    modeles: MODELES_PLACER,
    accepte: (ex) => ex.nature === 'nombre',
  },
  wagons: {
    id: 'wagons',
    titre: 'Les wagons de la phrase',
    consigne: 'Touche le bon wagon de la phrase.',
    modeles: ['trouver-le-mot', 'sujet-et-verbe'],
    accepte: (ex) => ex.nature === 'texte' && ex.segments !== undefined,
  },
  paniers: {
    id: 'paniers',
    titre: 'Les paniers',
    consigne: 'Range le mot en couleur dans le bon panier.',
    modeles: ['nature-du-mot'],
    accepte: (ex) => ex.nature === 'texte' && ex.categories !== undefined,
  },
  dictee: {
    id: 'dictee',
    titre: 'La dictée de Capy',
    consigne: 'Écoute le mot, écris-le, puis valide.',
    modeles: ['dictee-mots', 'mots-outils'],
    accepte: (ex) => ex.nature === 'texte' && ex.lecture !== undefined,
  },
  reponses: {
    id: 'reponses',
    titre: 'La bonne réponse',
    consigne: 'Choisis la bonne réponse.',
    // Placer un nombre n'a de sens qu'avec le fil : la réponse est dans la question.
    accepte: (ex) => !(MODELES_PLACER as readonly string[]).includes(ex.modeleId),
  },
};
