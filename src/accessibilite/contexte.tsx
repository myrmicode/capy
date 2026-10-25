// Fournit à tout un écran d'enfant le thème adapté à ses réglages.
// Hors fournisseur (espace parent, saisie des fiches), le thème par défaut
// s'applique ; sur tablette, il grandit un peu dans les deux cas.
import { createContext, useContext, useMemo, type ComponentType, type ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { useProfilActif } from '@/store/profils';
import { useReglages } from '@/store/reglages';

import { lireReglages, REGLAGES_PAR_DEFAUT, type ReglagesEnfant } from './reglages';
import { deriverTheme, echelleAppareil, estLeSoir, type ThemeEnfant } from './theme';

const ContexteTheme = createContext<ThemeEnfant | null>(null);
/** Thèmes par défaut, un par agrandissement d'appareil (téléphone, tablette). */
const THEMES_PAR_DEFAUT = new Map<number, ThemeEnfant>();

function themeParDefaut(agrandissement: number): ThemeEnfant {
  let theme = THEMES_PAR_DEFAUT.get(agrandissement);
  if (!theme) {
    theme = deriverTheme(REGLAGES_PAR_DEFAUT, false, agrandissement);
    THEMES_PAR_DEFAUT.set(agrandissement, theme);
  }
  return theme;
}

/** Agrandissement de l'appareil en cours (il suit les changements de fenêtre). */
function useAgrandissement(): number {
  const { width, height } = useWindowDimensions();
  return echelleAppareil(width, height);
}

interface PropsFournisseur {
  /** Réglages imposés (aperçu en direct) ; sinon ceux de l'enfant actif. */
  reglages?: ReglagesEnfant;
  children: ReactNode;
}

export function FournisseurReglages({ reglages, children }: PropsFournisseur) {
  const profil = useProfilActif();
  const reductionSysteme = useReducedMotion();
  const agrandissement = useAgrandissement();
  const actifs = reglages ?? lireReglages(profil?.reglages);
  // Ambiance du soir (réglage de l'appareil), relue à chaque affichage d'écran.
  const soir = useReglages((e) => e.ambianceSoir) && estLeSoir(new Date());
  // Clé stable : on ne recalcule le thème que si un réglage change.
  const cle = JSON.stringify(actifs);
  const theme = useMemo(
    () => deriverTheme(JSON.parse(cle) as ReglagesEnfant, reductionSysteme, agrandissement, soir),
    [cle, reductionSysteme, agrandissement, soir],
  );
  return <ContexteTheme.Provider value={theme}>{children}</ContexteTheme.Provider>;
}

export function useThemeEnfant(): ThemeEnfant {
  const theme = useContext(ContexteTheme);
  const agrandissement = useAgrandissement();
  return theme ?? themeParDefaut(agrandissement);
}

/** Écran d'enfant : tout ce qu'il affiche suit les réglages de l'enfant actif. */
export function avecReglagesEnfant<P extends object>(Ecran: ComponentType<P>): ComponentType<P> {
  return function EcranAvecReglages(props: P) {
    return (
      <FournisseurReglages>
        <Ecran {...props} />
      </FournisseurReglages>
    );
  };
}
