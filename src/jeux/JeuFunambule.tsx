// Mini-jeu « Le funambule » (ligne graduée) : Capy marche sur un fil gradué ;
// l'enfant le fait glisser jusqu'au bon nombre, puis valide. Les boutons ← et →
// le font avancer d'une graduation (plus simple, et accessible).
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { Bouton, CarteEnonce, IconeRetour } from '@/composants';
import { nb } from '@/exercices';
import { INTERVALLES_LIGNE } from '@/exercices/modeles/ce2/ligneGraduee';
import { mascotte } from '@/mascotte';
import { couleurs, espaces, formes, typo } from '@/theme';

import type { PropsJeuNombre } from './types';

const MARGE = 40;
const TAILLE_CAPY = 64;
const HAUTEUR = 150;
const Y_FIL = 96;

export function JeuFunambule({ exercice, actif, onRepondre }: PropsJeuNombre) {
  const { debut, pas } = exercice.donnees;
  const fin = debut + INTERVALLES_LIGNE * pas;
  const [largeur, setLargeur] = useState(0);
  const [rang, setRang] = useState(0);

  const ecart = largeur > 0 ? (largeur - 2 * MARGE) / INTERVALLES_LIGNE : 0;
  const xDe = (r: number) => MARGE + r * ecart;

  const x = useSharedValue(MARGE);
  const depart = useSharedValue(MARGE);
  const ecartPartage = useSharedValue(0);
  useEffect(() => {
    ecartPartage.set(ecart);
    x.set(withSpring(MARGE + rang * ecart, { damping: 18 }));
  }, [rang, ecart, x, ecartPartage]);

  const deplacer = (r: number) => setRang(Math.max(0, Math.min(INTERVALLES_LIGNE, r)));

  const glisser = usePanGesture({
    enabled: actif && largeur > 0,
    minDistance: 2,
    onActivate: () => {
      depart.set(x.get());
    },
    onUpdate: (e) => {
      const max = MARGE + INTERVALLES_LIGNE * ecartPartage.get();
      x.set(Math.min(max, Math.max(MARGE, depart.get() + e.translationX)));
    },
    onDeactivate: () => {
      // Capy se pose sur la graduation la plus proche.
      const e = ecartPartage.get();
      const r = e > 0 ? Math.round((x.get() - MARGE) / e) : 0;
      scheduleOnRN(deplacer, r);
    },
  });
  const styleCapy = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() - TAILLE_CAPY / 2 }] }));

  return (
    <View style={styles.jeu}>
      <CarteEnonce enonce={exercice.enonce} question={exercice.question} />

      <View style={styles.scene} onLayout={(e) => setLargeur(e.nativeEvent.layout.width)}>
        {largeur > 0 ? (
          <>
            <Svg width={largeur} height={HAUTEUR} style={StyleSheet.absoluteFill} pointerEvents="none">
              <Line x1={MARGE} y1={Y_FIL} x2={largeur - MARGE} y2={Y_FIL} stroke={couleurs.brun[800]} strokeWidth={4} strokeLinecap="round" />
              {Array.from({ length: INTERVALLES_LIGNE + 1 }, (_, i) => {
                const grande = i === 0 || i === INTERVALLES_LIGNE || i === INTERVALLES_LIGNE / 2;
                return (
                  <Line
                    key={i}
                    x1={xDe(i)}
                    y1={Y_FIL - (grande ? 12 : 8)}
                    x2={xDe(i)}
                    y2={Y_FIL + (grande ? 12 : 8)}
                    stroke={couleurs.brun[800]}
                    strokeWidth={grande ? 3 : 2}
                    strokeLinecap="round"
                  />
                );
              })}
            </Svg>
            <Text style={[typo.texteGras, styles.etiquette, { left: 0 }]}>{nb(debut)}</Text>
            <Text style={[typo.texteGras, styles.etiquette, { right: 0, textAlign: 'right' }]}>{nb(fin)}</Text>

            <GestureDetector gesture={glisser}>
              <Animated.View style={[styles.capy, styleCapy]} accessibilityLabel="Capy sur le fil">
                <Image source={mascotte.capy} style={styles.image} resizeMode="contain" accessible={false} />
              </Animated.View>
            </GestureDetector>
          </>
        ) : null}
      </View>

      <View style={styles.commandes}>
        <BoutonPas sens="gauche" desactive={!actif || rang === 0} onPress={() => deplacer(rang - 1)} />
        <BoutonPas sens="droite" desactive={!actif || rang === INTERVALLES_LIGNE} onPress={() => deplacer(rang + 1)} />
      </View>
      <Bouton titre="Valider" desactive={!actif} onPress={() => onRepondre(debut + rang * pas === exercice.reponse)} />
    </View>
  );
}

function BoutonPas({ sens, desactive, onPress }: { sens: 'gauche' | 'droite'; desactive: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desactive}
      accessibilityRole="button"
      accessibilityLabel={sens === 'gauche' ? 'Reculer d’une graduation' : 'Avancer d’une graduation'}
      style={({ pressed }) => [styles.pas, pressed && styles.pasAppuye, desactive && styles.pasDesactive]}
    >
      <View style={sens === 'droite' ? styles.retourne : undefined}>
        <IconeRetour taille={28} couleur={couleurs.sarcelle[700]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  jeu: { gap: espaces.l },
  scene: {
    height: HAUTEUR,
    backgroundColor: couleurs.creme,
    borderRadius: formes.carte.rayon,
  },
  etiquette: { position: 'absolute', top: Y_FIL + 16, width: 2 * MARGE + 40, paddingHorizontal: espaces.xs },
  capy: { position: 'absolute', top: Y_FIL - TAILLE_CAPY - 2, width: TAILLE_CAPY, height: TAILLE_CAPY },
  image: { width: TAILLE_CAPY, height: TAILLE_CAPY },
  commandes: { flexDirection: 'row', justifyContent: 'center', gap: espaces.xl },
  pas: {
    width: 64,
    height: 56,
    borderRadius: formes.pilule,
    borderWidth: 2,
    borderColor: couleurs.bordure,
    borderBottomWidth: 5,
    borderBottomColor: couleurs.gris[300],
    backgroundColor: couleurs.blanc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasAppuye: { borderBottomWidth: 2, marginTop: 3 },
  pasDesactive: { opacity: 0.4 },
  retourne: { transform: [{ scaleX: -1 }] },
});
