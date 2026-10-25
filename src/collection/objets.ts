// Les trésors de Capy : des objets que l'enfant gagne et fait porter à Capy.
// Chaque coffre ouvert (une unité finie) donne l'objet suivant, et tous les
// 5 défis du jour aussi. Jamais de compétition, jamais d'achat : on voit son
// monde grandir plutôt qu'un chiffre.
//
// Les dessins sont dans composants/CapyHabille.tsx.
import type { ProgressionEnfant } from '@/parcours/progression';

export type Emplacement = 'tete' | 'yeux' | 'cou';

export const EMPLACEMENTS: readonly Emplacement[] = ['tete', 'yeux', 'cou'];
export const LIBELLES_EMPLACEMENTS: Record<Emplacement, string> = {
  tete: 'Sur la tête',
  yeux: 'Sur les yeux',
  cou: 'Autour du cou',
};

export type ObjetId =
  | 'echarpe'
  | 'chapeauPaille'
  | 'lunettesRondes'
  | 'noeudPapillon'
  | 'couronneFleurs'
  | 'lunettesSoleil'
  | 'bonnet'
  | 'medaille';

export interface ObjetCapy {
  id: ObjetId;
  /** Avec son article, pour une phrase : « l’écharpe rouge ». */
  nom: string;
  emplacement: Emplacement;
}

/** Dans l'ordre où on les gagne. */
export const OBJETS: readonly ObjetCapy[] = [
  { id: 'echarpe', nom: 'l’écharpe rouge', emplacement: 'cou' },
  { id: 'chapeauPaille', nom: 'le chapeau de paille', emplacement: 'tete' },
  { id: 'lunettesRondes', nom: 'les lunettes rondes', emplacement: 'yeux' },
  { id: 'noeudPapillon', nom: 'le nœud papillon', emplacement: 'cou' },
  { id: 'couronneFleurs', nom: 'la couronne de fleurs', emplacement: 'tete' },
  { id: 'lunettesSoleil', nom: 'les lunettes de soleil', emplacement: 'yeux' },
  { id: 'bonnet', nom: 'le bonnet à pompon', emplacement: 'tete' },
  { id: 'medaille', nom: 'la médaille d’or', emplacement: 'cou' },
];

/** Nombre de défis du jour pour gagner un objet. */
export const DEFIS_PAR_OBJET = 5;

/** Ce que Capy porte, par emplacement. */
export type Tenue = Partial<Record<Emplacement, ObjetId>>;

export function nombreDeTresors(p: ProgressionEnfant): number {
  const defis = Object.values(p.defis ?? {}).filter((e) => e > 0).length;
  return p.coffresOuverts.length + Math.floor(defis / DEFIS_PAR_OBJET);
}

export function objetsGagnes(p: ProgressionEnfant): ObjetCapy[] {
  return OBJETS.slice(0, nombreDeTresors(p));
}

/** L'objet gagné en passant d'une progression à l'autre (après un coffre, un défi…), ou null. */
export function nouvelObjet(avant: ProgressionEnfant, apres: ProgressionEnfant): ObjetCapy | null {
  const n = nombreDeTresors(avant);
  return nombreDeTresors(apres) > n && n < OBJETS.length ? OBJETS[n] : null;
}

/** La tenue relue : seuls les objets gagnés, chacun à sa place. */
export function tenueValide(tenue: Tenue | undefined, p: ProgressionEnfant): Tenue {
  const gagnes = objetsGagnes(p);
  const valide: Tenue = {};
  for (const e of EMPLACEMENTS) {
    const objet = gagnes.find((o) => o.id === tenue?.[e]);
    if (objet && objet.emplacement === e) valide[e] = objet.id;
  }
  return valide;
}
