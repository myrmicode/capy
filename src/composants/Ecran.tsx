import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { espaces } from '@/theme';

/** Au-delà de cette largeur (tablette), les marges des écrans s'élargissent. */
const LARGEUR_TABLETTE = 700;
/** Largeur du contenu sur tablette : un peu plus large, le texte y est aussi un peu plus grand. */
const LARGEUR_COLONNE_TABLETTE = 720;

interface PropsEcran {
  children: ReactNode;
  /** Contenu fixé en bas de l'écran (bouton principal). */
  pied?: ReactNode;
  defilant?: boolean;
  /** Faux pour bloquer le défilement pendant un glisser-déposer. */
  defilementActif?: boolean;
  /** Largeur maximale du contenu (640 sur téléphone, 720 sur tablette, plus pour un écran en deux colonnes). */
  largeurMax?: number;
}

/** Cadre commun des écrans : fond de page (teinté selon les réglages de l'enfant), marges, largeur limitée sur tablette. */
export function Ecran({ children, pied, defilant = true, defilementActif = true, largeurMax }: PropsEcran) {
  const { fond, ecart } = useThemeEnfant();
  const { width } = useWindowDimensions();
  const tablette = width >= LARGEUR_TABLETTE;
  const marge = tablette ? espaces.xxl : espaces.ecran;
  const maxWidth = largeurMax ?? (tablette ? LARGEUR_COLONNE_TABLETTE : espaces.largeurMax);
  const colonne = [styles.colonne, { maxWidth, gap: ecart('l') }];
  const contenu = <View style={[colonne, !defilant && styles.flex]}>{children}</View>;
  return (
    <SafeAreaView style={[styles.fond, { backgroundColor: fond }]} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {defilant ? (
          <ScrollView
            contentContainerStyle={[styles.defilement, { paddingHorizontal: marge }]}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={defilementActif}
          >
            {contenu}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.defilement, { paddingHorizontal: marge }]}>{contenu}</View>
        )}
        {pied ? <View style={[colonne, styles.pied, { paddingHorizontal: marge }]}>{pied}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1 },
  flex: { flex: 1 },
  defilement: { paddingVertical: espaces.xl, flexGrow: 1 },
  colonne: { width: '100%', alignSelf: 'center' },
  pied: { paddingBottom: espaces.l, paddingTop: espaces.s },
});
