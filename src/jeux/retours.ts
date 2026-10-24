import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

/** Lit un texte à voix haute en français (bouton « Écouter »). */
export function lireAVoixHaute(texte: string) {
  Speech.stop();
  Speech.speak(texte, { language: 'fr-FR', rate: 0.92 });
}

export function arreterLecture() {
  Speech.stop();
}

/** Vibration légère, uniquement après une bonne réponse. */
export function vibrerBravo() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
    // Appareil sans vibreur : rien à faire.
  });
}
