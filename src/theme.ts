// Charte graphique de Capy. Toutes les couleurs, polices et formes de l'appli viennent d'ici.

export const couleurs = {
  sarcelle: {
    /** Remplissage de la toile du jour, barres de progression, décor. Jamais de texte blanc dessus. */
    400: '#36b69e',
    /** Icônes Découverte et Confiance. */
    500: '#3d9f8c',
    /** Bouton principal, sélection, liens. Texte blanc dessus. */
    700: '#1f7a6d',
    /** Relief sous sarcelle-700, titres sur menthe-100. */
    900: '#1b5c5a',
  },
  menthe: {
    /** Fond panneau Bravo, élément sélectionné. */
    100: '#e3f4ec',
    /** Bordure carte de confiance, décor végétal. */
    200: '#cfe7d9',
    /** Bonne réponse, bienveillance. Texte encre dessus. */
    500: '#66c5a1',
  },
  caramel: {
    /** Fond « À consolider ». */
    100: '#fdf0e0',
    /** Pelage de Capy, accent chaud, décor. */
    500: '#ee9b5b',
  },
  brun: {
    /** Fond panneau « Presque ! », carte Priorité. */
    100: '#fbe9dc',
    /** Thème prioritaire, bouton Réessayer. Texte blanc dessus. */
    600: '#b25d34',
    /** Relief sous brun-600, texte brun. */
    800: '#8a4424',
  },
  jaune: {
    /** Étoiles, étapes réussies, cadre de scan. */
    400: '#fcc448',
    /** Relief sous jaune-400. */
    600: '#e0a52a',
    /** Icône ou texte sur jaune-400. */
    texte: '#5b3a00',
  },
  /** Fonds d'illustration, bandeaux. */
  creme: '#f4e5c5',
  /** Fond de tous les écrans. */
  fondPage: '#faf9f5',
  /** Cartes, tuiles, bulles. */
  blanc: '#ffffff',
  /** Bordure discrète des cartes et champs. */
  bordure: '#ede8dc',
  /** Texte principal. */
  encre: '#12404f',
  /** Texte secondaire. */
  encreDouce: '#3f6776',
  /** Verrouillé, désactivé. */
  gris: {
    200: '#ece8de',
    300: '#d8d1c2',
    500: '#6f6a5e',
  },
  /** Décor uniquement. */
  joues: '#fb845f',
} as const;

/**
 * Paires texte / fond autorisées. Le test `theme.test.ts` vérifie qu'elles
 * respectent toutes le contraste minimal de 4,5:1.
 */
export const pairesTexte: readonly { texte: string; fond: string; usage: string }[] = [
  { texte: couleurs.encre, fond: couleurs.fondPage, usage: 'texte principal' },
  { texte: couleurs.encre, fond: couleurs.blanc, usage: 'texte des cartes' },
  { texte: couleurs.encreDouce, fond: couleurs.fondPage, usage: 'texte secondaire' },
  { texte: couleurs.encreDouce, fond: couleurs.blanc, usage: 'texte secondaire sur carte' },
  { texte: couleurs.blanc, fond: couleurs.sarcelle[700], usage: 'bouton principal' },
  { texte: couleurs.blanc, fond: couleurs.brun[600], usage: 'bouton Réessayer' },
  { texte: couleurs.jaune.texte, fond: couleurs.jaune[400], usage: 'texte sur jaune' },
  { texte: couleurs.encre, fond: couleurs.menthe[500], usage: 'bonne réponse' },
  { texte: couleurs.sarcelle[900], fond: couleurs.menthe[100], usage: 'titre panneau Bravo' },
  { texte: couleurs.encre, fond: couleurs.menthe[100], usage: 'texte panneau Bravo' },
  { texte: couleurs.brun[800], fond: couleurs.brun[100], usage: 'titre panneau Presque' },
  { texte: couleurs.encre, fond: couleurs.brun[100], usage: 'texte panneau Presque' },
  { texte: couleurs.brun[800], fond: couleurs.caramel[100], usage: 'carte À consolider' },
  { texte: couleurs.encre, fond: couleurs.creme, usage: 'titre du bandeau de thème' },
  { texte: couleurs.brun[800], fond: couleurs.creme, usage: 'unité du bandeau de thème' },
  { texte: couleurs.brun[800], fond: couleurs.brun[100], usage: 'compteur de série' },
  { texte: couleurs.sarcelle[700], fond: couleurs.blanc, usage: 'liens, bouton secondaire' },
  { texte: couleurs.sarcelle[700], fond: couleurs.fondPage, usage: 'liens sur fond de page' },
  // gris-500 sur gris-200 ne donne que 4,4:1 : le texte désactivé utilise encre-douce.
  { texte: couleurs.encreDouce, fond: couleurs.gris[200], usage: 'élément désactivé' },
];

/** Noms des polices chargées dans `app/_layout.tsx`. */
export const polices = {
  fredoka: 'Fredoka_600SemiBold',
  fredokaGras: 'Fredoka_700Bold',
  nunito: 'Nunito_600SemiBold',
  nunitoGras: 'Nunito_700Bold',
  nunitoExtraGras: 'Nunito_800ExtraBold',
  caveat: 'Caveat_600SemiBold',
} as const;

/**
 * Styles de texte. Sur Android, la graisse vient du fichier de police :
 * on ne met donc pas de `fontWeight`.
 */
export const typo = {
  titre1: { fontFamily: polices.fredoka, fontSize: 30, lineHeight: 38, color: couleurs.encre },
  titre2: { fontFamily: polices.fredoka, fontSize: 24, lineHeight: 31, color: couleurs.encre },
  titre3: { fontFamily: polices.fredoka, fontSize: 21, lineHeight: 27, color: couleurs.encre },
  bouton: { fontFamily: polices.fredoka, fontSize: 18, lineHeight: 23 },
  nombreReponse: { fontFamily: polices.fredokaGras, fontSize: 28, lineHeight: 34 },
  /** Énoncés lus par l'enfant : 18 px minimum. */
  enonce: { fontFamily: polices.nunitoGras, fontSize: 18, lineHeight: 26, color: couleurs.encre },
  texte: { fontFamily: polices.nunito, fontSize: 16, lineHeight: 23, color: couleurs.encre },
  texteGras: { fontFamily: polices.nunitoGras, fontSize: 16, lineHeight: 23, color: couleurs.encre },
  petit: { fontFamily: polices.nunito, fontSize: 14, lineHeight: 20, color: couleurs.encreDouce },
  /** Un petit mot manuscrit par écran au plus, jamais pour une consigne. */
  manuscrit: { fontFamily: polices.caveat, fontSize: 24, lineHeight: 30, color: couleurs.sarcelle[700] },
} as const;

export const formes = {
  bouton: { hauteur: 56, relief: 4 },
  tuile: { rayon: 16, relief: 5 },
  carte: { rayon: 24 },
  bulle: { rayon: 24, coinVersCapy: 6 },
  etape: { taille: 72, relief: 6 },
  /** Taille minimale d'une cible tactile. */
  cibleTactile: 44,
  pilule: 999,
} as const;

export const espaces = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  /** Marge horizontale des écrans. */
  ecran: 20,
  /** Largeur maximale du contenu sur tablette. */
  largeurMax: 640,
} as const;
