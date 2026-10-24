// Fabrication de phrases simples à partir du lexique, avec la nature de chaque mot.
import type { Alea } from '../alea';

import { conjuguer } from './conjugaison';
import {
  ADJECTIFS,
  NOMS,
  determinant,
  formeAdjectif,
  formeNom,
  type Adjectif,
  type Categorie,
  type Genre,
  type Nom,
  type Nombre,
} from './lexique';

export type NatureMot = 'Nom' | 'Verbe' | 'Adjectif' | 'Déterminant';
export const NATURES: readonly NatureMot[] = ['Nom', 'Verbe', 'Adjectif', 'Déterminant'];

export interface Mot {
  texte: string;
  nature: NatureMot;
  /** Nom auquel se rapporte un déterminant ou un adjectif. */
  nom?: string;
}

export interface GroupeNominal {
  mots: Mot[];
  nom: Nom;
  genre: Genre;
  nombre: Nombre;
  adjectif?: Adjectif;
}

/** Verbes d'action réguliers du premier groupe, utilisés avec un complément d'objet. */
export const VERBES_ACTION: readonly { infinitif: string; sujets: readonly Categorie[] }[] = [
  { infinitif: 'regarder', sujets: ['animal', 'humain'] },
  { infinitif: 'chercher', sujets: ['animal', 'humain'] },
  { infinitif: 'trouver', sujets: ['animal', 'humain'] },
  { infinitif: 'porter', sujets: ['animal', 'humain'] },
  { infinitif: 'cacher', sujets: ['animal', 'humain'] },
  // Seules les personnes dessinent.
  { infinitif: 'dessiner', sujets: ['humain'] },
];

/** Verbe d'action qui a du sens avec un sujet de cette catégorie. */
export function tirerVerbe(alea: Alea, sujet: Categorie): string {
  return alea.choix(VERBES_ACTION.filter((v) => v.sujets.includes(sujet))).infinitif;
}

export function tirerNom(alea: Alea, categories: readonly Categorie[]): Nom {
  return alea.choix(NOMS.filter((n) => categories.includes(n.categorie)));
}

export function groupeNominal(
  alea: Alea,
  categories: readonly Categorie[],
  options: { adjectif: boolean; nombre?: Nombre },
): GroupeNominal {
  const n = tirerNom(alea, categories);
  const nombre = options.nombre ?? alea.choix<Nombre>(['singulier', 'pluriel']);
  const a = options.adjectif ? alea.choix(ADJECTIFS.filter((x) => x.pour.includes(n.categorie))) : undefined;
  // « des » + adjectif placé avant le nom demanderait « de » : on prend alors « les ».
  const defini = a?.avant && nombre === 'pluriel' ? true : alea.choix([true, false]);
  const texteNom = formeNom(n, nombre);
  const mots: Mot[] = [{ texte: determinant(n.genre, nombre, defini), nature: 'Déterminant', nom: texteNom }];
  const motAdj: Mot | undefined = a && { texte: formeAdjectif(a, n.genre, nombre), nature: 'Adjectif', nom: texteNom };
  if (motAdj && a?.avant) mots.push(motAdj);
  mots.push({ texte: texteNom, nature: 'Nom' });
  if (motAdj && !a?.avant) mots.push(motAdj);
  return { mots, nom: n, genre: n.genre, nombre, adjectif: a };
}

export interface PhraseSimple {
  sujet: GroupeNominal;
  verbe: Mot;
  infinitif: string;
  complement: GroupeNominal;
  mots: Mot[];
}

/** « Le petit chat cherche une balle. » : sujet (avec un adjectif), verbe au présent, complément. */
export function phraseSimple(alea: Alea): PhraseSimple {
  const sujet = groupeNominal(alea, ['animal', 'humain'], { adjectif: true });
  const infinitif = tirerVerbe(alea, sujet.nom.categorie);
  const verbe: Mot = { texte: conjuguer(infinitif, 'present', sujet.nombre === 'singulier' ? 2 : 5), nature: 'Verbe' };
  const complement = groupeNominal(alea, ['objet'], { adjectif: false });
  return { sujet, verbe, infinitif, complement, mots: [...sujet.mots, verbe, ...complement.mots] };
}
