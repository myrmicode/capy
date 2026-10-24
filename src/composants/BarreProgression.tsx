import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { couleurs, formes } from '@/theme';

/** Barre de progression de l'étape (valeur entre 0 et 1). Elle ne glisse pas en mode calme. */
export function BarreProgression({ valeur }: { valeur: number }) {
  const { animationsReduites } = useThemeEnfant();
  const largeur = useSharedValue(valeur);
  useEffect(() => {
    largeur.value = animationsReduites ? valeur : withTiming(valeur, { duration: 400 });
  }, [valeur, largeur, animationsReduites]);
  const style = useAnimatedStyle(() => ({
    width: `${Math.max(0.04, largeur.value) * 100}%`,
  }));

  return (
    <View
      style={styles.piste}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(valeur * 100) }}
    >
      <Animated.View style={[styles.remplissage, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  piste: {
    flex: 1,
    height: 16,
    borderRadius: formes.pilule,
    backgroundColor: couleurs.gris[200],
    overflow: 'hidden',
  },
  remplissage: {
    height: '100%',
    borderRadius: formes.pilule,
    backgroundColor: couleurs.sarcelle[400],
  },
});
