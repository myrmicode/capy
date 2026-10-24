import { Image, StyleSheet, Text, View } from 'react-native';

import { mascotte, type PoseCapy } from '@/mascotte';
import { couleurs, espaces, formes, typo } from '@/theme';

interface PropsBulleCapy {
  pose: PoseCapy;
  /** 2 à 3 lignes maximum. */
  texte: string;
  /** Côté où se tient Capy. */
  cote?: 'gauche' | 'droite';
  tailleCapy?: number;
}

/** Capy qui parle dans une bulle blanche ; le coin tourné vers Capy est arrondi à 6 px. */
export function BulleCapy({ pose, texte, cote = 'gauche', tailleCapy = 96 }: PropsBulleCapy) {
  const coin = cote === 'gauche' ? { borderBottomLeftRadius: formes.bulle.coinVersCapy } : { borderBottomRightRadius: formes.bulle.coinVersCapy };
  return (
    <View style={[styles.ligne, cote === 'droite' && styles.inverse]}>
      <Image
        source={mascotte[pose]}
        style={{ width: tailleCapy, height: tailleCapy }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        accessible={false}
      />
      <View style={[styles.bulle, coin]}>
        <Text style={typo.enonce} numberOfLines={3}>
          {texte}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'flex-end', gap: espaces.s },
  inverse: { flexDirection: 'row-reverse' },
  bulle: {
    flex: 1,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.bulle.rayon,
    paddingHorizontal: espaces.l,
    paddingVertical: espaces.m,
    marginBottom: espaces.l,
  },
});
