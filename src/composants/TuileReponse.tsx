import { StyleSheet, Text } from 'react-native';

import { couleurs, espaces, formes, typo } from '@/theme';

import { SurfaceEnRelief } from './SurfaceEnRelief';

export type EtatTuile = 'normal' | 'selectionne' | 'juste' | 'presque' | 'desactive';

const ETATS: Record<EtatTuile, { face: string; relief: string; bordure: string; texte: string }> = {
  normal: { face: couleurs.blanc, relief: couleurs.gris[300], bordure: couleurs.bordure, texte: couleurs.encre },
  selectionne: {
    face: couleurs.menthe[100],
    relief: couleurs.sarcelle[700],
    bordure: couleurs.sarcelle[700],
    texte: couleurs.sarcelle[900],
  },
  juste: { face: couleurs.menthe[500], relief: couleurs.sarcelle[500], bordure: couleurs.menthe[500], texte: couleurs.encre },
  presque: { face: couleurs.brun[100], relief: couleurs.brun[600], bordure: couleurs.brun[600], texte: couleurs.brun[800] },
  desactive: { face: couleurs.gris[200], relief: couleurs.gris[300], bordure: couleurs.gris[200], texte: couleurs.encreDouce },
};

interface PropsTuileReponse {
  libelle: string | number;
  onPress: () => void;
  etat?: EtatTuile;
  /** Hauteur minimale de la tuile (72 px par défaut). */
  hauteur?: number;
}

/** Tuile de réponse : rayon 16 px, relief 5 px. Les nombres s'affichent en Fredoka 28 px. */
export function TuileReponse({ libelle, onPress, etat = 'normal', hauteur = 72 }: PropsTuileReponse) {
  const c = ETATS[etat];
  const estNombre = typeof libelle === 'number';
  return (
    <SurfaceEnRelief
      onPress={onPress}
      disabled={etat === 'desactive'}
      accessibilityRole="button"
      accessibilityLabel={String(libelle)}
      accessibilityState={{ selected: etat === 'selectionne', disabled: etat === 'desactive' }}
      couleurFace={c.face}
      couleurRelief={c.relief}
      couleurBordure={c.bordure}
      relief={formes.tuile.relief}
      rayon={formes.tuile.rayon}
      style={{ minHeight: hauteur + formes.tuile.relief, minWidth: formes.cibleTactile }}
      styleFace={styles.face}
    >
      <Text style={[estNombre ? typo.nombreReponse : typo.enonce, styles.texte, { color: c.texte }]}>
        {estNombre ? libelle.toLocaleString('fr-FR') : libelle}
      </Text>
    </SurfaceEnRelief>
  );
}

const styles = StyleSheet.create({
  face: { paddingHorizontal: espaces.l, paddingVertical: espaces.s },
  texte: { textAlign: 'center' },
});
