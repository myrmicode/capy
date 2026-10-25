// Déroulement d'une étape, sous forme de réducteur pur (testable sans écran).
// Jamais punitif : pas de vies, pas de limite d'essais. Une erreur mène à
// « Presque ! » puis « Réessayer » sur la même question, autant de fois que voulu.

export type Phase = 'question' | 'bravo' | 'presque' | 'terminee';

export interface EtatDeroulement {
  nombreQuestions: number;
  index: number;
  phase: Phase;
  /** Erreurs sur la question en cours. */
  essaisRates: number;
  /** Questions réussies du premier coup (servira aux étoiles et à la toile). */
  reussiesPremierCoup: number;
  /** Numéros des questions qui ont demandé plusieurs essais : elles reviendront plus tard, sous une autre forme. */
  aRevoir: number[];
}

export type ActionDeroulement =
  { type: 'repondre'; juste: boolean } | { type: 'reessayer' } | { type: 'continuer' } | { type: 'recommencer' };

export function etatInitial(nombreQuestions: number): EtatDeroulement {
  return { nombreQuestions, index: 0, phase: 'question', essaisRates: 0, reussiesPremierCoup: 0, aRevoir: [] };
}

export function derouler(etat: EtatDeroulement, action: ActionDeroulement): EtatDeroulement {
  switch (action.type) {
    case 'repondre':
      if (etat.phase !== 'question') return etat;
      if (action.juste) {
        return {
          ...etat,
          phase: 'bravo',
          reussiesPremierCoup: etat.reussiesPremierCoup + (etat.essaisRates === 0 ? 1 : 0),
        };
      }
      return {
        ...etat,
        phase: 'presque',
        essaisRates: etat.essaisRates + 1,
        aRevoir: etat.essaisRates === 0 ? [...etat.aRevoir, etat.index] : etat.aRevoir,
      };
    case 'reessayer':
      return etat.phase === 'presque' ? { ...etat, phase: 'question' } : etat;
    case 'continuer': {
      if (etat.phase !== 'bravo') return etat;
      const suivante = etat.index + 1;
      if (suivante >= etat.nombreQuestions) return { ...etat, phase: 'terminee' };
      return { ...etat, index: suivante, phase: 'question', essaisRates: 0 };
    }
    case 'recommencer':
      return etatInitial(etat.nombreQuestions);
  }
}

/** Part de l'étape déjà franchie, entre 0 et 1, pour la barre de progression. */
export function avancement(etat: EtatDeroulement): number {
  if (etat.phase === 'terminee') return 1;
  const questionFaite = etat.phase === 'bravo' ? 1 : 0;
  return (etat.index + questionFaite) / etat.nombreQuestions;
}

/** La progression en mots, toujours visible à côté de la barre : « Encore 3 questions ». */
export function resteEnMots(etat: EtatDeroulement): string {
  if (etat.phase === 'terminee') return 'Étape finie';
  const restantes = etat.nombreQuestions - etat.index - (etat.phase === 'bravo' ? 1 : 0);
  if (restantes <= 0) return 'Étape finie';
  return restantes === 1 ? 'Encore 1 question' : `Encore ${restantes} questions`;
}

/** Faut-il proposer une pause ? (réglage « Pause proposée », en minutes ; 0 = jamais) */
export function pauseDue(depuisMs: number, maintenantMs: number, minutes: number): boolean {
  return minutes > 0 && maintenantMs - depuisMs >= minutes * 60_000;
}
