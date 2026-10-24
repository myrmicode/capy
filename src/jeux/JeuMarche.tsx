// Mini-jeu « Le marché » : l'enfant glisse des fraises dans les paniers pour
// construire la réponse (a paniers de b fraises), puis valide.
// On peut aussi toucher un panier pour y ajouter une fraise (plus simple, et
// accessible), et retirer une fraise avec le bouton « − ».
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type HostInstance } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Bouton, CarteEnonce, IconeFraise, IconeMoins } from '@/composants';
import { nb } from '@/exercices';
import { couleurs, espaces, formes, typo } from '@/theme';

import type { PropsJeuNombre } from './types';

const MAX_PAR_PANIER = 12;

interface Zone {
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
}

export function JeuMarche({ exercice, actif, onRepondre }: PropsJeuNombre) {
  const groupes = exercice.donnees.groupes;
  const [paniers, setPaniers] = useState<number[]>(() => Array(groupes).fill(0));
  const refsPaniers = useRef<(HostInstance | null)[]>([]);
  const zones = useRef<(Zone | undefined)[]>([]);
  const total = paniers.reduce((a, b) => a + b, 0);

  const modifier = (i: number, delta: number) =>
    setPaniers((p) => p.map((n, j) => (j === i ? Math.max(0, Math.min(MAX_PAR_PANIER, n + delta)) : n)));

  const mesurer = () =>
    refsPaniers.current.forEach((vue, i) =>
      vue?.measureInWindow((x, y, largeur, hauteur) => {
        zones.current[i] = { x, y, largeur, hauteur };
      }),
    );

  const deposer = (x: number, y: number) => {
    const i = zones.current.findIndex(
      (z) => z !== undefined && x >= z.x && x <= z.x + z.largeur && y >= z.y && y <= z.y + z.hauteur,
    );
    if (i >= 0) modifier(i, 1);
  };

  // La fraise suit le doigt sur le fil d'interface, puis revient à l'étal.
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const echelle = useSharedValue(1);
  const glisser = usePanGesture({
    enabled: actif,
    minDistance: 4,
    onActivate: () => {
      echelle.value = withSpring(1.25);
      scheduleOnRN(mesurer);
    },
    onUpdate: (e) => {
      dx.value = e.translationX;
      dy.value = e.translationY;
    },
    onDeactivate: (e) => {
      if (!e.canceled) scheduleOnRN(deposer, e.absoluteX, e.absoluteY);
      dx.value = 0;
      dy.value = 0;
      echelle.value = withSpring(1);
    },
  });
  const styleFraise = useAnimatedStyle(() => ({
    transform: [{ translateX: dx.value }, { translateY: dy.value }, { scale: echelle.value }],
  }));

  return (
    <View style={styles.jeu}>
      <CarteEnonce enonce={exercice.enonce} question={exercice.question} />

      <View style={styles.etal}>
        <GestureDetector gesture={glisser}>
          <Animated.View
            style={[styles.fraiseGlissable, styleFraise]}
            accessibilityLabel="Fraise à glisser dans un panier"
          >
            <IconeFraise taille={56} />
          </Animated.View>
        </GestureDetector>
        <Text style={[typo.texteGras, styles.flex]}>Glisse une fraise dans un panier, ou touche un panier.</Text>
      </View>

      <View style={styles.paniers}>
        {paniers.map((n, i) => (
          <Pressable
            key={i}
            ref={(vue) => {
              refsPaniers.current[i] = vue;
            }}
            onLayout={mesurer}
            onPress={() => modifier(i, 1)}
            disabled={!actif}
            accessibilityRole="button"
            accessibilityLabel={`Panier ${i + 1}, ${n} fraise${n > 1 ? 's' : ''}. Touche pour ajouter une fraise.`}
            style={({ pressed }) => [styles.panier, pressed && styles.panierAppuye]}
          >
            <View style={styles.fraises}>
              {Array.from({ length: n }, (_, k) => (
                <IconeFraise key={k} taille={22} />
              ))}
            </View>
            <View style={styles.piedPanier}>
              <Text style={[typo.nombreReponse, styles.compte]}>{n}</Text>
              <Pressable
                onPress={() => modifier(i, -1)}
                disabled={!actif || n === 0}
                accessibilityRole="button"
                accessibilityLabel={`Retirer une fraise du panier ${i + 1}`}
                hitSlop={6}
                style={[styles.retirer, n === 0 && styles.retirerVide]}
              >
                <IconeMoins taille={20} couleur={couleurs.brun[800]} />
              </Pressable>
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={[typo.enonce, styles.total]}>
        Dans les paniers : {nb(total)} fraise{total > 1 ? 's' : ''}
      </Text>
      <Bouton titre="Valider" desactive={!actif || total === 0} onPress={() => onRepondre(total === exercice.reponse)} />
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: { gap: espaces.m },
  flex: { flex: 1 },
  etal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.m,
    backgroundColor: couleurs.creme,
    borderRadius: formes.carte.rayon,
    padding: espaces.m,
    zIndex: 10,
  },
  fraiseGlissable: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: couleurs.blanc,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  paniers: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.m, justifyContent: 'center' },
  panier: {
    width: 132,
    minHeight: 140,
    padding: espaces.s,
    backgroundColor: couleurs.caramel[100],
    borderColor: couleurs.caramel[500],
    borderWidth: 3,
    borderBottomWidth: 6,
    borderRadius: formes.carte.rayon,
    justifyContent: 'space-between',
  },
  panierAppuye: { borderBottomWidth: 3, marginTop: 3 },
  fraises: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center', minHeight: 70 },
  piedPanier: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  compte: { color: couleurs.brun[800] },
  retirer: {
    width: formes.cibleTactile,
    height: formes.cibleTactile,
    borderRadius: formes.cibleTactile / 2,
    backgroundColor: couleurs.blanc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retirerVide: { opacity: 0.4 },
  total: { textAlign: 'center' },
});
