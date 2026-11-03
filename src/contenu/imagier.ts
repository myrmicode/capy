// L'imagier de Capy : des mots du quotidien et leur dessin, pour « Comprendre
// des mots » et « Comprendre des phrases » (CP, CE1). Capy dit le mot, l'enfant
// touche le dessin : il n'a pas besoin de savoir lire.
//
// Les dessins sont les pictogrammes en couleur du système (ceux du clavier),
// présents sur toutes les tablettes et dans tous les navigateurs.
// Niveaux, comme dans les évaluations : 1 = mots très fréquents, 2 = mots
// courants, 3 = mots moins fréquents (on les rencontre surtout dans les livres).
// À FAIRE RELIRE PAR UN ENSEIGNANT.

export type CategorieImagier =
  | 'animaux'
  | 'fruits'
  | 'legumes'
  | 'vehicules'
  | 'maison'
  | 'outils'
  | 'vetements'
  | 'nature'
  | 'musique'
  | 'nourriture'
  | 'jeux';

export interface MotImagier {
  /** Le mot, sans article ; il sert aussi de clé. */
  mot: string;
  image: string;
  genre: 'm' | 'f';
  categorie: CategorieImagier;
  niveau: 1 | 2 | 3;
}

const m = (mot: string, image: string, categorie: CategorieImagier, niveau: 1 | 2 | 3): MotImagier => ({
  mot,
  image,
  genre: 'm',
  categorie,
  niveau,
});
const f = (mot: string, image: string, categorie: CategorieImagier, niveau: 1 | 2 | 3): MotImagier => ({
  mot,
  image,
  genre: 'f',
  categorie,
  niveau,
});

export const IMAGIER: readonly MotImagier[] = [
  // Animaux
  m('chat', '🐈', 'animaux', 1),
  m('chien', '🐕', 'animaux', 1),
  m('lapin', '🐇', 'animaux', 1),
  m('cheval', '🐎', 'animaux', 1),
  f('vache', '🐄', 'animaux', 1),
  m('poisson', '🐟', 'animaux', 1),
  m('oiseau', '🐦', 'animaux', 1),
  f('poule', '🐔', 'animaux', 1),
  m('canard', '🦆', 'animaux', 1),
  f('souris', '🐁', 'animaux', 1),
  m('cochon', '🐖', 'animaux', 2),
  m('mouton', '🐑', 'animaux', 2),
  m('lion', '🦁', 'animaux', 2),
  m('singe', '🐒', 'animaux', 2),
  f('tortue', '🐢', 'animaux', 2),
  m('escargot', '🐌', 'animaux', 2),
  m('papillon', '🦋', 'animaux', 2),
  f('grenouille', '🐸', 'animaux', 2),
  m('serpent', '🐍', 'animaux', 2),
  m('renard', '🦊', 'animaux', 2),
  f('abeille', '🐝', 'animaux', 2),
  m('hérisson', '🦔', 'animaux', 3),
  m('hibou', '🦉', 'animaux', 3),
  m('écureuil', '🐿️', 'animaux', 3),
  m('kangourou', '🦘', 'animaux', 3),
  f('pieuvre', '🐙', 'animaux', 3),
  m('perroquet', '🦜', 'animaux', 3),
  m('paon', '🦚', 'animaux', 3),
  m('chameau', '🐫', 'animaux', 3),
  f('chauve-souris', '🦇', 'animaux', 3),
  m('crabe', '🦀', 'animaux', 3),
  // Fruits
  f('pomme', '🍎', 'fruits', 1),
  f('banane', '🍌', 'fruits', 1),
  f('fraise', '🍓', 'fruits', 1),
  f('cerise', '🍒', 'fruits', 2),
  m('raisin', '🍇', 'fruits', 2),
  f('poire', '🍐', 'fruits', 2),
  m('citron', '🍋', 'fruits', 2),
  f('pastèque', '🍉', 'fruits', 3),
  m('ananas', '🍍', 'fruits', 3),
  f('châtaigne', '🌰', 'fruits', 3),
  // Légumes
  f('carotte', '🥕', 'legumes', 1),
  f('tomate', '🍅', 'legumes', 1),
  m('champignon', '🍄', 'legumes', 2),
  m('maïs', '🌽', 'legumes', 2),
  m('brocoli', '🥦', 'legumes', 3),
  f('aubergine', '🍆', 'legumes', 3),
  m('poivron', '🫑', 'legumes', 3),
  m('concombre', '🥒', 'legumes', 3),
  // Véhicules
  f('voiture', '🚗', 'vehicules', 1),
  m('vélo', '🚲', 'vehicules', 1),
  m('bateau', '⛵', 'vehicules', 1),
  m('train', '🚂', 'vehicules', 1),
  m('bus', '🚌', 'vehicules', 2),
  m('camion', '🚚', 'vehicules', 2),
  f('fusée', '🚀', 'vehicules', 2),
  f('moto', '🏍️', 'vehicules', 2),
  m('tracteur', '🚜', 'vehicules', 3),
  m('hélicoptère', '🚁', 'vehicules', 3),
  f('trottinette', '🛴', 'vehicules', 3),
  m('parachute', '🪂', 'vehicules', 3),
  // À la maison
  f('maison', '🏠', 'maison', 1),
  m('lit', '🛏️', 'maison', 1),
  f('chaise', '🪑', 'maison', 1),
  m('livre', '📖', 'maison', 1),
  f('clé', '🔑', 'maison', 2),
  m('parapluie', '☂️', 'maison', 2),
  m('crayon', '✏️', 'maison', 2),
  f('boîte', '📦', 'maison', 2),
  m('réveil', '⏰', 'maison', 2),
  m('panier', '🧺', 'maison', 2),
  f('bougie', '🕯️', 'maison', 3),
  f('enveloppe', '✉️', 'maison', 3),
  m('cadenas', '🔒', 'maison', 3),
  m('sablier', '⏳', 'maison', 3),
  m('miroir', '🪞', 'maison', 3),
  f('cloche', '🔔', 'maison', 3),
  // Outils
  m('marteau', '🔨', 'outils', 2),
  m('pinceau', '🖌️', 'outils', 2),
  m('balai', '🧹', 'outils', 2),
  f('loupe', '🔍', 'outils', 3),
  m('aimant', '🧲', 'outils', 3),
  f('boussole', '🧭', 'outils', 3),
  f('échelle', '🪜', 'outils', 3),
  m('microscope', '🔬', 'outils', 3),
  f('scie', '🪚', 'outils', 3),
  // Vêtements
  m('chapeau', '🎩', 'vetements', 1),
  f('robe', '👗', 'vetements', 1),
  m('pantalon', '👖', 'vetements', 1),
  f('chaussette', '🧦', 'vetements', 2),
  f('botte', '👢', 'vetements', 2),
  f('écharpe', '🧣', 'vetements', 2),
  m('manteau', '🧥', 'vetements', 2),
  f('couronne', '👑', 'vetements', 2),
  f('casquette', '🧢', 'vetements', 3),
  m('gant', '🧤', 'vetements', 3),
  // Nature
  m('arbre', '🌳', 'nature', 1),
  f('fleur', '🌼', 'nature', 1),
  m('soleil', '☀️', 'nature', 1),
  f('lune', '🌙', 'nature', 1),
  f('étoile', '⭐', 'nature', 1),
  m('nuage', '☁️', 'nature', 2),
  m('sapin', '🌲', 'nature', 2),
  f('montagne', '⛰️', 'nature', 2),
  m('feu', '🔥', 'nature', 2),
  m('volcan', '🌋', 'nature', 3),
  m('cactus', '🌵', 'nature', 3),
  m('coquillage', '🐚', 'nature', 3),
  m('tournesol', '🌻', 'nature', 3),
  m('flocon', '❄️', 'nature', 3),
  f('vague', '🌊', 'nature', 3),
  // Musique
  m('tambour', '🥁', 'musique', 2),
  f('guitare', '🎸', 'musique', 2),
  m('piano', '🎹', 'musique', 2),
  m('violon', '🎻', 'musique', 3),
  f('trompette', '🎺', 'musique', 3),
  m('saxophone', '🎷', 'musique', 3),
  m('accordéon', '🪗', 'musique', 3),
  // Nourriture
  m('gâteau', '🎂', 'nourriture', 1),
  m('pain', '🍞', 'nourriture', 1),
  f('glace', '🍦', 'nourriture', 1),
  m('fromage', '🧀', 'nourriture', 2),
  m('bonbon', '🍬', 'nourriture', 2),
  f('pizza', '🍕', 'nourriture', 2),
  m('biscuit', '🍪', 'nourriture', 2),
  m('croissant', '🥐', 'nourriture', 2),
  f('sucette', '🍭', 'nourriture', 3),
  m('miel', '🍯', 'nourriture', 3),
  f('crêpe', '🥞', 'nourriture', 3),
  // Jeux
  m('ballon', '⚽', 'jeux', 1),
  m('cadeau', '🎁', 'jeux', 1),
  m('robot', '🤖', 'jeux', 2),
  m('dé', '🎲', 'jeux', 2),
  m('puzzle', '🧩', 'jeux', 2),
  m('cerf-volant', '🪁', 'jeux', 3),
  f('luge', '🛷', 'jeux', 3),
  m('trophée', '🏆', 'jeux', 3),
  f('médaille', '🏅', 'jeux', 3),
];

const PAR_MOT: ReadonlyMap<string, MotImagier> = new Map(IMAGIER.map((i) => [i.mot, i]));

export function motImagier(mot: string): MotImagier | undefined {
  return PAR_MOT.get(mot);
}

/** Le dessin d'un mot de l'imagier (un point d'interrogation s'il manque, pour ne jamais planter). */
export function imageDe(mot: string): string {
  return PAR_MOT.get(mot)?.image ?? '❓';
}

/** « un chat », « une fleur ». */
export function avecArticle(i: MotImagier): string {
  return `${i.genre === 'm' ? 'un' : 'une'} ${i.mot}`;
}
