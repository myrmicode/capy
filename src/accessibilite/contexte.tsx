// Fournit à tout un écran d'enfant le thème adapté à ses réglages.
// Hors fournisseur (espace parent, saisie des fiches), le thème par défaut s'applique.
import { createContext, useContext, useMemo, type ComponentType, type ReactNode } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { useProfilActif } from '@/store/profils';

import { lireReglages, REGLAGES_PAR_DEFAUT, type ReglagesEnfant } from './reglages';
import { deriverTheme, type ThemeEnfant } from './theme';

const ContexteTheme = createContext<ThemeEnfant | null>(null);
const THEME_PAR_DEFAUT = deriverTheme(REGLAGES_PAR_DEFAUT);

interface PropsFournisseur {
  /** Réglages imposés (aperçu en direct) ; sinon ceux de l'enfant actif. */
  reglages?: ReglagesEnfant;
  children: ReactNode;
}

export function FournisseurReglages({ reglages, children }: PropsFournisseur) {
  const profil = useProfilActif();
  const reductionSysteme = useReducedMotion();
  const actifs = reglages ?? lireReglages(profil?.reglages);
  // Clé stable : on ne recalcule le thème que si un réglage change.
  const cle = JSON.stringify(actifs);
  const theme = useMemo(
    () => deriverTheme(JSON.parse(cle) as ReglagesEnfant, reductionSysteme),
    [cle, reductionSysteme],
  );
  return <ContexteTheme.Provider value={theme}>{children}</ContexteTheme.Provider>;
}

export function useThemeEnfant(): ThemeEnfant {
  return useContext(ContexteTheme) ?? THEME_PAR_DEFAUT;
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
