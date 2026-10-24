import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

import { useReglages } from '@/store/reglages';

/** Lit un texte à voix haute en français (bouton « Écouter »). */
export function lireAVoixHaute(texte: string) {
  Speech.stop();
  Speech.speak(texte, { language: 'fr-FR', rate: 0.92 });
}

export function arreterLecture() {
  Speech.stop();
}

let lecteur: AudioPlayer | null = null;

function lecteurBravo(): AudioPlayer {
  if (!lecteur) {
    // Sur iPhone, l'interrupteur « silencieux » coupe le son. Sur Android, c'est
    // le volume « multimédia » qui s'applique.
    setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
    lecteur = createAudioPlayer(require('../../assets/sons/bravo.wav'));
    lecteur.volume = 0.6;
  }
  return lecteur;
}

/**
 * Retour d'une bonne réponse : vibration légère et, si le réglage est actif,
 * un son doux. Rien de tel après une erreur : jamais de son ni de vibration punitifs.
 */
export function feliciter() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
    // Appareil sans vibreur : rien à faire.
  });
  if (!useReglages.getState().sons) return;
  try {
    const l = lecteurBravo();
    l.seekTo(0);
    l.play();
  } catch {
    // Pas de son disponible : la vibration et l'animation suffisent.
  }
}
