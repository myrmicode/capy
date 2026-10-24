// Préparation de la photo de la toile, entièrement sur le téléphone :
// découpe de la zone de la toile, réduction et compression JPEG. Le fichier de la
// photo et celui du recadrage sont effacés aussitôt : seule l'image recadrée,
// en mémoire, part vers l'analyse, et rien n'est conservé.
import { File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { Rectangle } from './cadrage';

/** Largeur maximale envoyée à l'analyse : assez pour lire la toile, sans plus. */
const LARGEUR_MAX = 1024;

/** Efface un fichier temporaire de l'appli (jamais un fichier hors du cache de l'appli). */
function effacer(uri: string | undefined) {
  if (!uri) return;
  try {
    const fichier = new File(uri);
    if (fichier.uri.startsWith(Paths.cache.uri) && fichier.exists) fichier.delete();
  } catch {
    // Le système nettoiera le cache de toute façon.
  }
}

/**
 * Renvoie l'image recadrée en base64 (JPEG), prête pour l'analyse.
 * `zone` : rectangle à découper (photo prise avec le cadre jaune) ; absent pour
 * une photo importée, déjà recadrée par le parent dans l'outil du système.
 */
export async function preparerToile(uri: string, largeurSource: number, zone?: Rectangle): Promise<string> {
  let fichierRecadre: string | undefined;
  try {
    let contexte = ImageManipulator.manipulate(uri);
    if (zone) {
      contexte = contexte.crop({ originX: zone.x, originY: zone.y, width: zone.largeur, height: zone.hauteur });
    }
    const largeur = zone ? zone.largeur : largeurSource;
    if (largeur > LARGEUR_MAX) contexte = contexte.resize({ width: LARGEUR_MAX });

    const image = await contexte.renderAsync();
    const resultat = await image.saveAsync({ base64: true, compress: 0.8, format: SaveFormat.JPEG });
    fichierRecadre = resultat.uri;
    if (!resultat.base64) throw new Error('Image vide');
    return resultat.base64;
  } finally {
    effacer(uri);
    effacer(fichierRecadre);
  }
}
