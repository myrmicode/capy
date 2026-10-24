import type { Exercice } from '@/exercices';

export type JeuId = 'marche' | 'bonFil' | 'lucioles' | 'questionPerdue' | 'funambule' | 'reponses';

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
  /** L'exercice convient-il à ce jeu (taille des nombres, opération) ? */
  accepte: (ex: Exercice) => boolean;
}

/** Opérations proposées dans « Le bon fil ». */
export const OPERATIONS_BON_FIL = ['+', '−', '×'] as const;

const MODELES_PLACER = ['placer-petits-pas', 'placer-grands-pas'] as const;

export const JEUX: Record<JeuId, DefinitionJeu> = {
  marche: {
    id: 'marche',
    titre: 'Le marché',
    consigne: 'Glisse les fraises dans les paniers, puis valide.',
    modeles: ['groupements'],
    histoire: 0,
    // Assez peu de fraises pour que les glisser une par une reste un plaisir.
    accepte: (ex) => ex.reponse <= 30 && ex.donnees.groupes <= 5,
  },
  bonFil: {
    id: 'bonFil',
    titre: 'Le bon fil',
    consigne: 'Trace un fil entre l’histoire et la bonne opération.',
    modeles: ['groupements', 'ajout', 'retrait', 'ecart'],
    accepte: (ex) =>
      ex.operations.length === 1 && (OPERATIONS_BON_FIL as readonly string[]).includes(ex.operations[0]),
  },
  lucioles: {
    id: 'lucioles',
    titre: 'Attrape-lucioles',
    consigne: 'Touche la luciole qui porte la bonne réponse.',
    modeles: ['tables', 'doubles', 'complement-cent', 'ajouter-dizaines'],
    accepte: () => true,
  },
  questionPerdue: {
    id: 'questionPerdue',
    titre: 'La question perdue',
    consigne: 'Choisis la question qui va avec l’histoire.',
    indice: 'Cherche la question à laquelle on peut répondre avec les nombres de l’histoire.',
    accepte: (ex) => ex.questionsAuChoix !== undefined,
  },
  funambule: {
    id: 'funambule',
    titre: 'Le funambule',
    consigne: 'Fais glisser Capy sur le fil jusqu’au bon nombre, puis valide.',
    modeles: MODELES_PLACER,
    accepte: () => true,
  },
  reponses: {
    id: 'reponses',
    titre: 'La bonne réponse',
    consigne: 'Choisis la bonne réponse.',
    // Placer un nombre n'a de sens qu'avec le fil : la réponse est dans la question.
    accepte: (ex) => !(MODELES_PLACER as readonly string[]).includes(ex.modeleId),
  },
};
