import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

import { create } from 'zustand';

import { useReglages } from '@/store/reglages';

export const VITESSE_NORMALE = 0.92;
export const VITESSE_LENTE = 0.72;

interface EtatLecture {
  /** Textes en cours de lecture, dans l'ordre, et leur position dans la phrase lue. */
  textes: string[];
  debuts: number[];
  /** Position (dans le texte lu en entier) du mot en cours ; null hors lecture. */
  position: number | null;
}

/** Ce que Capy est en train de lire, pour surligner le mot lu (karaoké). */
export const useLecture = create<EtatLecture>(() => ({ textes: [], debuts: [], position: null }));

let numeroLecture = 0;

/**
 * Lit à voix haute en français (bouton « Écouter », lecture automatique, dictée).
 * Plusieurs textes sont lus à la suite ; chacun peut surligner son mot lu.
 */
export function lireAVoixHaute(textes: string | readonly string[], options: { lente?: boolean } = {}) {
  const liste = (typeof textes === 'string' ? [textes] : [...textes]).filter((t) => t.trim() !== '');
  const debuts: number[] = [];
  let position = 0;
  for (const t of liste) {
    debuts.push(position);
    position += t.length + 1;
  }
  const numero = ++numeroLecture;
  const finir = () => {
    if (numero === numeroLecture) useLecture.setState({ position: null });
  };
  Speech.stop();
  useLecture.setState({ textes: liste, debuts, position: null });
  Speech.speak(liste.join(' '), {
    language: 'fr-FR',
    rate: options.lente ? VITESSE_LENTE : VITESSE_NORMALE,
    onBoundary: (e: { charIndex: number }) => {
      if (numero === numeroLecture) useLecture.setState({ position: e.charIndex });
    },
    onDone: finir,
    onStopped: finir,
    onError: finir,
  });
}

export function arreterLecture() {
  numeroLecture++;
  useLecture.setState({ position: null });
  Speech.stop();
}

/** Position, dans ce texte, du mot que Capy est en train de lire ; null sinon. */
export function positionDans(etat: EtatLecture, texte: string): number | null {
  if (etat.position === null) return null;
  for (let i = 0; i < etat.textes.length; i++) {
    const debut = etat.debuts[i];
    if (etat.textes[i] === texte && etat.position >= debut && etat.position < debut + texte.length) {
      return etat.position - debut;
    }
  }
  return null;
}

export function useMotLu(texte: string): number | null {
  return useLecture((etat) => positionDans(etat, texte));
}

/** Les bruitages, tous doux et courts (voir scripts/generer-son-bravo.js et scripts/generer-sons.js). */
const SONS = {
  bravo: require('../../assets/sons/bravo.wav'),
  /** Fin d'étape, de défi ou d'histoire. */
  fin: require('../../assets/sons/fin.wav'),
  /** Coffre ouvert. */
  coffre: require('../../assets/sons/coffre.wav'),
} as const;
export type Son = keyof typeof SONS;

const lecteurs: Partial<Record<Son, AudioPlayer>> = {};

function lecteur(son: Son): AudioPlayer {
  let l = lecteurs[son];
  if (!l) {
    // Sur iPhone, l'interrupteur « silencieux » coupe le son. Sur Android, c'est
    // le volume « multimédia » qui s'applique.
    setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
    l = createAudioPlayer(SONS[son]);
    l.volume = 0.6;
    lecteurs[son] = l;
  }
  return l;
}

/** Joue un bruitage si le réglage « son » est actif (jamais en mode calme). */
export function jouerSon(son: Son, options: { silencieux?: boolean } = {}) {
  if (options.silencieux || !useReglages.getState().sons) return;
  try {
    const l = lecteur(son);
    l.seekTo(0);
    l.play();
  } catch {
    // Pas de son disponible : l'animation suffit.
  }
}

/**
 * Retour d'une bonne réponse : vibration légère et, si le réglage est actif,
 * un son doux. Rien de tel après une erreur : jamais de son ni de vibration punitifs.
 * En mode calme, aucun son.
 */
export function feliciter(options: { silencieux?: boolean } = {}) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
    // Appareil sans vibreur : rien à faire.
  });
  jouerSon('bravo', options);
}

/** Fin d'une étape, d'un défi, d'une histoire, ou coffre ouvert : vibration et petit air. */
export function celebrer(son: 'fin' | 'coffre', options: { silencieux?: boolean } = {}) {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  } catch {
    // Appareil sans vibreur : rien à faire.
  }
  jouerSon(son, options);
}
