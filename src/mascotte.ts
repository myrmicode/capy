// Images de Capy. C'est le seul fichier qui connaît leurs chemins. Elles sont
// découpées dans la planche assets/capy-source/planche-capy.png par
// scripts/decouper-capy.js (fond transparent) : pour changer une image, modifier
// la planche ou le cadrage dans ce script, puis le relancer.
import type { ImageSourcePropType } from 'react-native';

export const mascotte = {
  /** Accueil, création du profil. */
  capy: require('../assets/capy/capy.png'),
  exploration: require('../assets/capy/exploration.png'),
  /** Photo et analyse de la toile. */
  explorer: require('../assets/capy/explorer.png'),
  /** Énoncé, indice, après une erreur. */
  reflechi: require('../assets/capy/reflechi.png'),
  apprendre: require('../assets/capy/apprendre.png'),
  /** Bonne réponse, fin d'étape. */
  heureux: require('../assets/capy/heureux.png'),
  bravo: require('../assets/capy/bravo.png'),
  /** Nouveau thème, coffre de fin d'unité. */
  surpris: require('../assets/capy/surpris.png'),
  /** Coffre ouvert. */
  fier: require('../assets/capy/fier.png'),
  /** Série de jours, encouragement. */
  clinOeil: require('../assets/capy/clin-oeil.png'),
  /** Écran du parcours. */
  reussite: require('../assets/capy/reussite.png'),
  /** Pause. */
  ralentir: require('../assets/capy/ralentir.png'),
  /** Espace parent, bilan. */
  serieux: require('../assets/capy/serieux.png'),
  conseils: require('../assets/capy/conseils.png'),
  /** Jamais après une erreur : uniquement au retour après plusieurs jours d'absence. */
  triste: require('../assets/capy/triste.png'),
  /** Icône de l'appli et écran de démarrage. La version carrée icone-appli-carree.png
   *  (générée à partir de celle-ci) est déclarée dans app.json. */
  iconeAppli: require('../assets/capy/icone-appli.png'),
  /** Bandeau d'accueil. */
  paysage: require('../assets/capy/paysage.png'),
} satisfies Record<string, ImageSourcePropType>;

export type PoseCapy = keyof typeof mascotte;

/** Rapport largeur / hauteur du bandeau, pour l'afficher sans le déformer. */
export const RATIO_PAYSAGE = 905 / 172;
