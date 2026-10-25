import { StyleSheet, View } from 'react-native';

import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import type { PoseCapy } from '@/mascotte';
import { couleurs, espaces, formes } from '@/theme';

import { CapyAnime } from './CapyAnime';

interface PropsBulleCapy {
  pose: PoseCapy;
  /** 2 à 3 lignes en temps normal ; le texte passe toujours à la ligne, jamais coupé. */
  texte: string;
  /** Côté où se tient Capy. */
  cote?: 'gauche' | 'droite';
  tailleCapy?: number;
  /** Coloration syllabique (contenu des exercices, comme un indice). */
  coloration?: boolean;
}

/** Capy qui parle dans une bulle blanche ; le coin tourné vers Capy est arrondi à 6 px. Il bouge un peu selon sa pose. */
export function BulleCapy({ pose, texte, cote = 'gauche', tailleCapy = 96, coloration = false }: PropsBulleCapy) {
  const coin =
    cote === 'gauche'
      ? { borderBottomLeftRadius: formes.bulle.coinVersCapy }
      : { borderBottomRightRadius: formes.bulle.coinVersCapy };
  return (
    <View style={[styles.ligne, cote === 'droite' && styles.inverse]}>
      <CapyAnime pose={pose} taille={tailleCapy} />
      <View style={[styles.bulle, coin]}>
        <TexteAccessible texte={texte} variante="enonce" coloration={coloration} />
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
