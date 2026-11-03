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

const HUMAINS = ['garçon', 'fille', 'maîtresse', 'voisin', 'humain'];

/**
 * Qui peut faire quoi, avec quoi : chaque phrase fabriquée a du sens (une
 * fille range son cartable, un lapin cherche une carotte), jamais « une vache
 * cache des gâteaux ». Les sujets sont des noms du lexique au singulier, ou
 * « humain » pour un pronom ou Capy. Verbes réguliers du premier groupe.
 */
export const ACTIONS: readonly { sujets: readonly string[]; verbes: readonly string[]; objets: readonly string[] }[] = [
  {
    sujets: HUMAINS,
    verbes: ['regarder'],
    objets: ['livre', 'fleur', 'bateau', 'voiture', 'maison', 'plante', 'gâteau', 'robe', 'chapeau', 'train'],
  },
  {
    sujets: HUMAINS,
    verbes: ['chercher', 'trouver'],
    objets: ['ballon', 'livre', 'crayon', 'chapeau', 'cartable', 'panier', 'balle', 'manteau', 'boîte', 'pomme'],
  },
  {
    sujets: HUMAINS,
    verbes: ['porter'],
    objets: ['panier', 'cartable', 'livre', 'gâteau', 'boîte', 'chapeau', 'manteau', 'robe', 'plante', 'ballon'],
  },
  { sujets: HUMAINS, verbes: ['cacher'], objets: ['ballon', 'livre', 'crayon', 'gâteau', 'balle', 'boîte', 'pomme'] },
  {
    sujets: HUMAINS,
    verbes: ['dessiner'],
    objets: ['fleur', 'maison', 'bateau', 'voiture', 'pomme', 'chapeau', 'plante', 'ballon', 'train'],
  },
  {
    sujets: HUMAINS,
    verbes: ['ranger'],
    objets: ['livre', 'crayon', 'cartable', 'manteau', 'robe', 'ballon', 'boîte', 'balle', 'chapeau'],
  },
  { sujets: HUMAINS, verbes: ['ramasser'], objets: ['pomme', 'fleur', 'balle', 'ballon', 'crayon', 'livre'] },
  { sujets: HUMAINS, verbes: ['arroser'], objets: ['plante', 'fleur', 'salade'] },
  {
    sujets: HUMAINS,
    verbes: ['laver'],
    objets: ['voiture', 'pomme', 'robe', 'manteau', 'bateau', 'salade', 'carotte'],
  },
  { sujets: ['chat', 'chien'], verbes: ['chercher', 'trouver', 'regarder'], objets: ['balle', 'ballon'] },
  { sujets: ['chien'], verbes: ['porter'], objets: ['balle', 'panier'] },
  { sujets: ['lapin', 'tortue'], verbes: ['chercher', 'trouver', 'regarder'], objets: ['carotte', 'salade', 'fleur'] },
  { sujets: ['souris', 'renard'], verbes: ['chercher', 'trouver', 'cacher'], objets: ['gâteau', 'pomme'] },
  { sujets: ['poule'], verbes: ['chercher', 'trouver'], objets: ['salade'] },
  { sujets: ['cheval', 'vache'], verbes: ['regarder'], objets: ['train', 'voiture', 'maison'] },
  { sujets: ['cheval', 'vache'], verbes: ['chercher', 'trouver'], objets: ['salade', 'pomme', 'carotte'] },
];

/** Un verbe et un objet qui ont du sens avec ce sujet (un nom du lexique au singulier, ou « humain »). */
export function tirerAction(alea: Alea, sujet: string): { infinitif: string; objet: Nom } {
  const action = alea.choix(ACTIONS.filter((a) => a.sujets.includes(sujet)));
  const objet = alea.choix(action.objets);
  return { infinitif: alea.choix(action.verbes), objet: NOMS.find((n) => n.singulier === objet)! };
}

export function tirerNom(alea: Alea, categories: readonly Categorie[]): Nom {
  return alea.choix(NOMS.filter((n) => categories.includes(n.categorie)));
}

export function groupeNominal(
  alea: Alea,
  categories: readonly Categorie[],
  options: { adjectif: boolean; nombre?: Nombre; nom?: Nom },
): GroupeNominal {
  const n = options.nom ?? tirerNom(alea, categories);
  const nombre = options.nombre ?? alea.choix<Nombre>(['singulier', 'pluriel']);
  const a = options.adjectif ? alea.choix(ADJECTIFS.filter((x) => x.pour.includes(n.singulier))) : undefined;
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
  const { infinitif, objet } = tirerAction(alea, sujet.nom.singulier);
  const verbe: Mot = { texte: conjuguer(infinitif, 'present', sujet.nombre === 'singulier' ? 2 : 5), nature: 'Verbe' };
  const complement = groupeNominal(alea, ['objet'], { adjectif: false, nom: objet });
  return { sujet, verbe, infinitif, complement, mots: [...sujet.mots, verbe, ...complement.mots] };
}
