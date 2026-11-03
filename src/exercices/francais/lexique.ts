// Lexique des exercices de français (CE2).
//
// À FAIRE RELIRE PAR UN ENSEIGNANT : ces listes alimentent tous les exercices
// générés. Choix volontaires pour éviter les pièges hors programme :
// - noms commençant par une consonne (pas d'élision « l' ») ;
// - adjectifs aux quatre formes toutes différentes (petit, petite, petits, petites) ;
// - adjectifs placés avant le nom seulement avec « le / la / les / un / une »
//   (on évite « des » + adjectif, qui demanderait « de jolies fleurs »).

export type Genre = 'm' | 'f';
export type Categorie = 'animal' | 'humain' | 'objet';

export interface Nom {
  singulier: string;
  pluriel: string;
  genre: Genre;
  categorie: Categorie;
}

const nom = (singulier: string, genre: Genre, categorie: Categorie, pluriel = `${singulier}s`): Nom => ({
  singulier,
  pluriel,
  genre,
  categorie,
});

export const NOMS: readonly Nom[] = [
  // Êtres vivants (sujets des phrases)
  nom('chat', 'm', 'animal'),
  nom('chien', 'm', 'animal'),
  nom('lapin', 'm', 'animal'),
  nom('cheval', 'm', 'animal', 'chevaux'),
  nom('renard', 'm', 'animal'),
  nom('tortue', 'f', 'animal'),
  nom('poule', 'f', 'animal'),
  nom('souris', 'f', 'animal', 'souris'),
  nom('vache', 'f', 'animal'),
  nom('garçon', 'm', 'humain'),
  nom('fille', 'f', 'humain'),
  nom('maîtresse', 'f', 'humain'),
  nom('voisin', 'm', 'humain'),
  // Objets
  nom('ballon', 'm', 'objet'),
  nom('livre', 'm', 'objet'),
  nom('crayon', 'm', 'objet'),
  nom('chapeau', 'm', 'objet', 'chapeaux'),
  nom('gâteau', 'm', 'objet', 'gâteaux'),
  nom('bateau', 'm', 'objet', 'bateaux'),
  nom('manteau', 'm', 'objet', 'manteaux'),
  nom('cartable', 'm', 'objet'),
  nom('panier', 'm', 'objet'),
  nom('pomme', 'f', 'objet'),
  nom('fleur', 'f', 'objet'),
  nom('balle', 'f', 'objet'),
  nom('robe', 'f', 'objet'),
  nom('voiture', 'f', 'objet'),
  nom('plante', 'f', 'objet'),
  nom('maison', 'f', 'objet'),
  nom('boîte', 'f', 'objet'),
  nom('carotte', 'f', 'objet'),
  nom('salade', 'f', 'objet'),
  nom('train', 'm', 'objet'),
];

export interface Adjectif {
  ms: string;
  fs: string;
  mp: string;
  fp: string;
  /** Se place avant le nom (une petite maison) ou après (une maison verte). */
  avant: boolean;
  /** Noms (au singulier) avec lesquels l'adjectif a du sens : pas de « pomme bleue » ni de « poule gentille ». */
  pour: readonly string[];
}

const adj = (
  ms: string,
  fs: string,
  avant: boolean,
  pour: readonly string[],
  mp = `${ms}s`,
  fp = `${fs}s`,
): Adjectif => ({
  ms,
  fs,
  mp,
  fp,
  avant,
  pour,
});

const TOUS = NOMS.map((n) => n.singulier);

export const ADJECTIFS: readonly Adjectif[] = [
  adj('petit', 'petite', true, TOUS),
  adj('grand', 'grande', true, TOUS),
  adj('joli', 'jolie', true, [
    'fille',
    'maîtresse',
    'garçon',
    'chat',
    'lapin',
    'cheval',
    'fleur',
    'maison',
    'robe',
    'chapeau',
    'bateau',
    'voiture',
    'boîte',
    'panier',
    'manteau',
    'plante',
    'ballon',
  ]),
  adj('noir', 'noire', false, [
    'chat',
    'chien',
    'cheval',
    'lapin',
    'poule',
    'vache',
    'chapeau',
    'manteau',
    'voiture',
    'cartable',
    'crayon',
    'robe',
    'boîte',
  ]),
  adj('blanc', 'blanche', false, [
    'chat',
    'chien',
    'cheval',
    'lapin',
    'poule',
    'vache',
    'souris',
    'bateau',
    'ballon',
    'fleur',
    'maison',
    'robe',
    'chapeau',
    'voiture',
    'balle',
  ]),
  adj('vert', 'verte', false, [
    'pomme',
    'plante',
    'crayon',
    'ballon',
    'robe',
    'voiture',
    'manteau',
    'cartable',
    'balle',
    'boîte',
    'chapeau',
    'salade',
  ]),
  adj('bleu', 'bleue', false, [
    'ballon',
    'livre',
    'crayon',
    'chapeau',
    'bateau',
    'manteau',
    'cartable',
    'robe',
    'voiture',
    'boîte',
    'balle',
    'fleur',
    'train',
  ]),
  adj('rond', 'ronde', false, ['ballon', 'balle', 'pomme', 'gâteau', 'panier', 'chapeau', 'boîte']),
  adj('lourd', 'lourde', false, ['livre', 'cartable', 'panier', 'manteau', 'boîte']),
  adj('gentil', 'gentille', false, [
    'garçon',
    'fille',
    'maîtresse',
    'voisin',
    'chien',
    'chat',
    'cheval',
    'lapin',
    'vache',
  ]),
];

export type Nombre = 'singulier' | 'pluriel';

export function formeNom(n: Nom, nombre: Nombre): string {
  return nombre === 'singulier' ? n.singulier : n.pluriel;
}

export function formeAdjectif(a: Adjectif, genre: Genre, nombre: Nombre): string {
  if (nombre === 'singulier') return genre === 'm' ? a.ms : a.fs;
  return genre === 'm' ? a.mp : a.fp;
}

export function determinant(genre: Genre, nombre: Nombre, defini: boolean): string {
  if (nombre === 'pluriel') return defini ? 'les' : 'des';
  if (defini) return genre === 'm' ? 'le' : 'la';
  return genre === 'm' ? 'un' : 'une';
}

export function decrireNom(n: Nom, nombre: Nombre): string {
  return `${n.genre === 'm' ? 'masculin' : 'féminin'} ${nombre}`;
}

// --- Synonymes ---

export type ClasseMot = 'nom' | 'verbe' | 'adjectif';

export interface PaireSynonymes {
  mot: string;
  synonyme: string;
  /** Mot de sens contraire, s'il existe : c'est un piège fréquent. */
  contraire?: string;
  classe: ClasseMot;
}

export const SYNONYMES: readonly PaireSynonymes[] = [
  { mot: 'content', synonyme: 'joyeux', contraire: 'triste', classe: 'adjectif' },
  { mot: 'joli', synonyme: 'beau', contraire: 'laid', classe: 'adjectif' },
  { mot: 'malin', synonyme: 'rusé', contraire: 'naïf', classe: 'adjectif' },
  { mot: 'fatigué', synonyme: 'épuisé', contraire: 'reposé', classe: 'adjectif' },
  { mot: 'froid', synonyme: 'glacé', contraire: 'brûlant', classe: 'adjectif' },
  { mot: 'drôle', synonyme: 'amusant', contraire: 'ennuyeux', classe: 'adjectif' },
  { mot: 'calme', synonyme: 'tranquille', contraire: 'agité', classe: 'adjectif' },
  { mot: 'gentil', synonyme: 'aimable', contraire: 'méchant', classe: 'adjectif' },
  { mot: 'effrayé', synonyme: 'apeuré', contraire: 'rassuré', classe: 'adjectif' },
  { mot: 'commencer', synonyme: 'débuter', contraire: 'finir', classe: 'verbe' },
  { mot: 'finir', synonyme: 'terminer', contraire: 'commencer', classe: 'verbe' },
  { mot: 'regarder', synonyme: 'observer', classe: 'verbe' },
  { mot: 'crier', synonyme: 'hurler', contraire: 'chuchoter', classe: 'verbe' },
  { mot: 'parler', synonyme: 'bavarder', classe: 'verbe' },
  { mot: 'lancer', synonyme: 'jeter', contraire: 'attraper', classe: 'verbe' },
  { mot: 'un ami', synonyme: 'un copain', contraire: 'un ennemi', classe: 'nom' },
  { mot: 'une voiture', synonyme: 'une automobile', classe: 'nom' },
  { mot: 'un bateau', synonyme: 'un navire', classe: 'nom' },
  { mot: 'un cadeau', synonyme: 'un présent', classe: 'nom' },
  { mot: 'un sentier', synonyme: 'un chemin', classe: 'nom' },
];

// --- Familles de mots ---

export interface Famille {
  mot: string;
  /** Mots de la même famille (même radical, sens lié). */
  membres: readonly string[];
  /** Mot qui ressemble mais n'est pas de la famille (piège classique), s'il y en a un sûr. */
  piege?: string;
}

export const FAMILLES: readonly Famille[] = [
  { mot: 'terre', membres: ['terrain', 'terrier', 'enterrer'], piege: 'terrible' },
  { mot: 'lait', membres: ['laitier', 'laitage', 'laiterie'], piege: 'laid' },
  { mot: 'chant', membres: ['chanter', 'chanteur', 'chanson'], piege: 'champ' },
  { mot: 'fleur', membres: ['fleuriste', 'fleurir', 'fleuri'], piege: 'fleuve' },
  { mot: 'dessin', membres: ['dessiner', 'dessinateur', 'dessinatrice'], piege: 'dessert' },
  { mot: 'bois', membres: ['boisé', 'déboiser', 'reboiser'], piege: 'boisson' },
  { mot: 'sel', membres: ['salé', 'saler', 'salière'], piege: 'selle' },
  { mot: 'lent', membres: ['lentement', 'ralentir', 'lenteur'], piege: 'lentille' },
  { mot: 'jardin', membres: ['jardinier', 'jardiner', 'jardinage'] },
  { mot: 'neige', membres: ['neiger', 'enneigé', 'neigeux'] },
  { mot: 'coiffer', membres: ['coiffeur', 'coiffure', 'décoiffer'] },
  { mot: 'glace', membres: ['glacier', 'glacé', 'glaçon'] },
];
