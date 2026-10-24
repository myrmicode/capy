// Passage du cadre jaune affiché à l'écran au rectangle à découper dans la photo.
//
// L'aperçu de la caméra remplit la vue en « cover » : la photo est agrandie
// jusqu'à couvrir toute la vue, et ce qui dépasse est rogné à parts égales.

export interface Taille {
  largeur: number;
  hauteur: number;
}

export interface Rectangle {
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
}

/** Le cadre de scan : un carré centré dans la vue, avec une marge autour. */
export function cadreDansLaVue(vue: Taille, marge = 24): Rectangle {
  const cote = Math.max(0, Math.min(vue.largeur, vue.hauteur) - 2 * marge);
  return { x: (vue.largeur - cote) / 2, y: (vue.hauteur - cote) / 2, largeur: cote, hauteur: cote };
}

/** Rectangle de la photo (en pixels de la photo) qui correspond au cadre affiché. */
export function cadreVersPhoto(vue: Taille, photo: Taille, cadre: Rectangle): Rectangle {
  const echelle = Math.max(vue.largeur / photo.largeur, vue.hauteur / photo.hauteur);
  const decalageX = (photo.largeur * echelle - vue.largeur) / 2;
  const decalageY = (photo.hauteur * echelle - vue.hauteur) / 2;

  const x = Math.max(0, Math.round((cadre.x + decalageX) / echelle));
  const y = Math.max(0, Math.round((cadre.y + decalageY) / echelle));
  const largeur = Math.min(photo.largeur - x, Math.round(cadre.largeur / echelle));
  const hauteur = Math.min(photo.hauteur - y, Math.round(cadre.hauteur / echelle));
  return { x, y, largeur, hauteur };
}
