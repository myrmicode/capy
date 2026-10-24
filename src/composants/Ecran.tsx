import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { couleurs, espaces } from '@/theme';

interface PropsEcran {
  children: ReactNode;
  /** Contenu fixé en bas de l'écran (bouton principal). */
  pied?: ReactNode;
  defilant?: boolean;
  /** Faux pour bloquer le défilement pendant un glisser-déposer. */
  defilementActif?: boolean;
}

/** Cadre commun des écrans : fond de page, marges, largeur limitée sur tablette. */
export function Ecran({ children, pied, defilant = true, defilementActif = true }: PropsEcran) {
  const contenu = <View style={styles.colonne}>{children}</View>;
  return (
    <SafeAreaView style={styles.fond} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {defilant ? (
          <ScrollView
            contentContainerStyle={styles.defilement}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={defilementActif}
          >
            {contenu}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.defilement]}>{contenu}</View>
        )}
        {pied ? <View style={[styles.colonne, styles.pied]}>{pied}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, backgroundColor: couleurs.fondPage },
  flex: { flex: 1 },
  defilement: { paddingHorizontal: espaces.ecran, paddingVertical: espaces.xl, flexGrow: 1 },
  colonne: { width: '100%', maxWidth: espaces.largeurMax, alignSelf: 'center', gap: espaces.l },
  pied: { paddingHorizontal: espaces.ecran, paddingBottom: espaces.l, paddingTop: espaces.s },
});
