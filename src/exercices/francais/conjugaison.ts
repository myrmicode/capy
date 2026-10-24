// Conjugaison des verbes au programme de la fiche CE2 : présent, imparfait et
// futur de l'indicatif de « être », « avoir » et des verbes du premier groupe.
//
// Les verbes du premier groupe retenus n'ont aucune particularité d'orthographe
// (pas de « mangeons », « commençons », « appelle », « achète ») et commencent
// par une consonne (pas d'élision « j' »).

export type Temps = 'present' | 'imparfait' | 'futur';
export const TEMPS: readonly Temps[] = ['present', 'imparfait', 'futur'];
export const NOMS_TEMPS: Record<Temps, string> = { present: 'présent', imparfait: 'imparfait', futur: 'futur' };
/** Le nom du temps avec son article : « le présent », « l’imparfait », « le futur ». */
export const TEMPS_AVEC_ARTICLE: Record<Temps, string> = { present: 'le présent', imparfait: 'l’imparfait', futur: 'le futur' };

/** 0 : je, 1 : tu, 2 : il / elle, 3 : nous, 4 : vous, 5 : ils / elles. */
export type Personne = 0 | 1 | 2 | 3 | 4 | 5;
export const PERSONNES: readonly Personne[] = [0, 1, 2, 3, 4, 5];

export interface Verbe {
  infinitif: string;
  /** Complément qui rend la phrase naturelle à toutes les personnes. */
  complement: string;
}

export const VERBES_PREMIER_GROUPE: readonly Verbe[] = [
  { infinitif: 'chanter', complement: 'une chanson' },
  { infinitif: 'jouer', complement: 'dans le jardin' },
  { infinitif: 'danser', complement: 'avec Capy' },
  { infinitif: 'marcher', complement: 'jusqu’à la rivière' },
  { infinitif: 'regarder', complement: 'les étoiles' },
  { infinitif: 'porter', complement: 'un gros sac' },
  { infinitif: 'dessiner', complement: 'un bateau' },
  { infinitif: 'cuisiner', complement: 'une soupe' },
  { infinitif: 'ramasser', complement: 'les feuilles' },
  { infinitif: 'sauter', complement: 'dans les flaques' },
];

export const ETRE: Verbe = { infinitif: 'être', complement: 'au parc' };
export const AVOIR: Verbe = { infinitif: 'avoir', complement: 'un chat' };

const TERMINAISONS_PREMIER_GROUPE: Record<Temps, readonly string[]> = {
  present: ['e', 'es', 'e', 'ons', 'ez', 'ent'],
  imparfait: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
  futur: ['ai', 'as', 'a', 'ons', 'ez', 'ont'],
};

const IRREGULIERS: Record<string, Record<Temps, readonly string[]>> = {
  être: {
    present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
    imparfait: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
    futur: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
  },
  avoir: {
    present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
    imparfait: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
    futur: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
  },
};

export function conjuguer(infinitif: string, temps: Temps, personne: Personne): string {
  const irregulier = IRREGULIERS[infinitif];
  if (irregulier) return irregulier[temps][personne];
  if (!infinitif.endsWith('er')) throw new Error(`Verbe hors programme : ${infinitif}`);
  // Le futur se forme sur l'infinitif, le présent et l'imparfait sur le radical.
  const base = temps === 'futur' ? infinitif : infinitif.slice(0, -2);
  return base + TERMINAISONS_PREMIER_GROUPE[temps][personne];
}

/** Pronom sujet ; pour la 3e personne, on choisit il/elle ou ils/elles. */
export function pronom(personne: Personne, feminin: boolean): string {
  return ['je', 'tu', feminin ? 'elle' : 'il', 'nous', 'vous', feminin ? 'elles' : 'ils'][personne];
}

/** Petits mots qui situent l'action dans le temps (indices pour l'enfant). */
export const REPERES_TEMPS: Record<Temps, readonly string[]> = {
  present: ['Aujourd’hui', 'En ce moment', 'Maintenant'],
  imparfait: ['Autrefois', 'Il y a longtemps', 'Chaque été, autrefois'],
  futur: ['Demain', 'Plus tard', 'La semaine prochaine'],
};
