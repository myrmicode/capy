import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { couleurs, espaces, formes, typo } from '@/theme';

import { SurfaceEnRelief } from './SurfaceEnRelief';

export type VarianteBouton = 'principal' | 'reessayer' | 'jaune' | 'secondaire';

const VARIANTES: Record<
  VarianteBouton,
  { face: string; relief: string; texte: string; bordure?: string }
> = {
  principal: { face: couleurs.sarcelle[700], relief: couleurs.sarcelle[900], texte: couleurs.blanc },
  reessayer: { face: couleurs.brun[600], relief: couleurs.brun[800], texte: couleurs.blanc },
  jaune: { face: couleurs.jaune[400], relief: couleurs.jaune[600], texte: couleurs.jaune.texte },
  secondaire: {
    face: couleurs.blanc,
    relief: couleurs.gris[300],
    texte: couleurs.sarcelle[700],
    bordure: couleurs.bordure,
  },
};

const DESACTIVE = { face: couleurs.gris[200], relief: couleurs.gris[300], texte: couleurs.encreDouce };

interface PropsBouton {
  titre: string;
  onPress: () => void;
  variante?: VarianteBouton;
  /** Icône affichée avant le titre ; reçoit la couleur du texte. */
  icone?: (couleur: string) => ReactNode;
  desactive?: boolean;
  /** Prend toute la largeur disponible (vrai par défaut). */
  pleineLargeur?: boolean;
  libelleAccessible?: string;
  style?: StyleProp<ViewStyle>;
}

/** Bouton en pilule, 56 px de haut, relief 4 px. */
export function Bouton({
  titre,
  onPress,
  variante = 'principal',
  icone,
  desactive = false,
  pleineLargeur = true,
  libelleAccessible,
  style,
}: PropsBouton) {
  const c = desactive ? DESACTIVE : VARIANTES[variante];
  return (
    <SurfaceEnRelief
      onPress={onPress}
      disabled={desactive}
      accessibilityRole="button"
      accessibilityLabel={libelleAccessible ?? titre}
      accessibilityState={{ disabled: desactive }}
      couleurFace={c.face}
      couleurRelief={c.relief}
      couleurBordure={'bordure' in c ? c.bordure : undefined}
      relief={formes.bouton.relief}
      rayon={formes.pilule}
      style={[
        { height: formes.bouton.hauteur + formes.bouton.relief },
        pleineLargeur ? styles.pleineLargeur : styles.compact,
        style,
      ]}
      styleFace={styles.face}
    >
      <View style={styles.contenu}>
        {icone?.(c.texte)}
        <Text style={[typo.bouton, { color: c.texte }]} numberOfLines={1}>
          {titre}
        </Text>
      </View>
    </SurfaceEnRelief>
  );
}

const styles = StyleSheet.create({
  pleineLargeur: { alignSelf: 'stretch' },
  compact: { alignSelf: 'flex-start' },
  face: { paddingHorizontal: espaces.xl },
  contenu: { flexDirection: 'row', alignItems: 'center', gap: espaces.s },
});
