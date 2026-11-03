import { StyleSheet, Text } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import { couleurs, espaces, formes } from '@/theme';

import { SurfaceEnRelief } from './SurfaceEnRelief';

export type EtatTuile = 'normal' | 'selectionne' | 'juste' | 'presque' | 'desactive';

/** Couleurs de chaque état d’une tuile (aussi utilisées par les tuiles d’images). */
export const COULEURS_TUILE: Record<EtatTuile, { face: string; relief: string; bordure: string; texte: string }> = {
  normal: {
    face: couleurs.blanc,
    relief: couleurs.gris[300],
    bordure: couleurs.bordure,
    texte: couleurs.encre,
  },
  selectionne: {
    face: couleurs.menthe[100],
    relief: couleurs.sarcelle[700],
    bordure: couleurs.sarcelle[700],
    texte: couleurs.sarcelle[900],
  },
  juste: {
    face: couleurs.menthe[500],
    relief: couleurs.sarcelle[500],
    bordure: couleurs.menthe[500],
    texte: couleurs.encre,
  },
  presque: {
    face: couleurs.brun[100],
    relief: couleurs.brun[600],
    bordure: couleurs.brun[600],
    texte: couleurs.brun[800],
  },
  desactive: {
    face: couleurs.gris[200],
    relief: couleurs.gris[300],
    bordure: couleurs.gris[200],
    texte: couleurs.encreDouce,
  },
};

interface PropsTuileReponse {
  libelle: string | number;
  onPress: () => void;
  etat?: EtatTuile;
  /** Hauteur minimale de la tuile (72 px par défaut). */
  hauteur?: number;
  /** Coloration syllabique (désactivée pour les propositions de la dictée, où elle donnerait l'orthographe). */
  coloration?: boolean;
}

/** Tuile de réponse : rayon 16 px, relief 5 px. Les nombres s'affichent en Fredoka 28 px. */
export function TuileReponse({ libelle, onPress, etat = 'normal', hauteur = 72, coloration = true }: PropsTuileReponse) {
  const c = COULEURS_TUILE[etat];
  const estNombre = typeof libelle === 'number';
  const { typo, cible } = useThemeEnfant();
  return (
    <SurfaceEnRelief
      onPress={onPress}
      disabled={etat === 'desactive'}
      accessibilityRole="button"
      accessibilityLabel={String(libelle)}
      accessibilityState={{
        selected: etat === 'selectionne',
        disabled: etat === 'desactive',
      }}
      couleurFace={c.face}
      couleurRelief={c.relief}
      couleurBordure={c.bordure}
      relief={formes.tuile.relief}
      rayon={formes.tuile.rayon}
      style={{
        minHeight: Math.max(hauteur, cible) + formes.tuile.relief,
        minWidth: cible,
      }}
      styleFace={styles.face}
    >
      {estNombre ? (
        <Text style={[typo.nombreReponse, styles.texte, { color: c.texte }]}>{libelle.toLocaleString('fr-FR')}</Text>
      ) : (
        <TexteAccessible
          texte={libelle}
          variante="enonce"
          couleur={c.texte}
          style={styles.texte}
          coloration={coloration && etat === 'normal'}
        />
      )}
    </SurfaceEnRelief>
  );
}

const styles = StyleSheet.create({
  face: { paddingHorizontal: espaces.l, paddingVertical: espaces.s },
  texte: { textAlign: 'center' },
});
