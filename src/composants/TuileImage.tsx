// Tuiles de réponse en images : le dessin d'un mot de l'imagier, ou une petite
// scène (« Comprendre des phrases »). Le lecteur d'écran dit « Image 1 »,
// « Image 2 »… : dire ce qu'elles montrent donnerait la réponse.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { imageDe } from '@/contenu/imagier';
import type { Scene } from '@/exercices/types';
import { espaces, formes } from '@/theme';

import { SurfaceEnRelief } from './SurfaceEnRelief';
import { COULEURS_TUILE, type EtatTuile } from './TuileReponse';

/** Taille des dessins, en part de la largeur d'une case de la scène. */
const TAILLES = { petit: 0.48, normal: 0.72, grand: 1 } as const;

/** Une scène : 3 lignes et 3 colonnes de dessins. */
export function SceneDessinee({ scene }: { scene: Scene }) {
  const [largeur, setLargeur] = useState(0);
  const caseScene = largeur / 3;
  return (
    <View
      style={styles.scene}
      onLayout={(e) => setLargeur(e.nativeEvent.layout.width)}
      importantForAccessibility="no-hide-descendants"
    >
      {largeur > 0
        ? scene.map((e, i) => {
            const taille = caseScene * TAILLES[e.taille ?? 'normal'];
            return (
              <Text
                key={i}
                style={{
                  position: 'absolute',
                  left: e.colonne * caseScene + (caseScene - taille * 1.2) / 2,
                  // Les grands dessins poussent vers le haut, comme posés sur la même ligne que les autres.
                  top: e.ligne * caseScene + (caseScene - taille * 1.2) * (e.taille === 'grand' ? 0.2 : 0.6),
                  width: taille * 1.2,
                  fontSize: taille,
                  lineHeight: taille * 1.2,
                  textAlign: 'center',
                }}
              >
                {imageDe(e.objet)}
              </Text>
            );
          })
        : null}
    </View>
  );
}

interface PropsTuileImage {
  /** « Image 2 » pour le lecteur d'écran. */
  numero: number;
  /** Un mot de l'imagier, ou une scène. */
  contenu: { mot: string } | { scene: Scene };
  etat?: EtatTuile;
  onPress: () => void;
}

export function TuileImage({ numero, contenu, etat = 'normal', onPress }: PropsTuileImage) {
  const c = COULEURS_TUILE[etat];
  const { cible } = useThemeEnfant();
  return (
    <SurfaceEnRelief
      onPress={onPress}
      disabled={etat === 'desactive'}
      accessibilityRole="button"
      accessibilityLabel={`Image ${numero}`}
      accessibilityState={{ selected: etat === 'selectionne', disabled: etat === 'desactive' }}
      couleurFace={c.face}
      couleurRelief={c.relief}
      couleurBordure={c.bordure}
      relief={formes.tuile.relief}
      rayon={formes.tuile.rayon}
      style={{ minHeight: cible + formes.tuile.relief, minWidth: cible }}
      styleFace={[styles.face, etat === 'desactive' && styles.estompe]}
    >
      {'mot' in contenu ? (
        <Text style={styles.dessin} importantForAccessibility="no">
          {imageDe(contenu.mot)}
        </Text>
      ) : (
        <SceneDessinee scene={contenu.scene} />
      )}
    </SurfaceEnRelief>
  );
}

const styles = StyleSheet.create({
  face: { padding: espaces.s, alignItems: 'center', justifyContent: 'center' },
  estompe: { opacity: 0.5 },
  dessin: { fontSize: 64, lineHeight: 80, textAlign: 'center' },
  scene: { width: '100%', aspectRatio: 1, overflow: 'hidden', borderRadius: formes.tuile.rayon - 4 },
});
