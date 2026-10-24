// Mini-jeu « Le bon fil » : l'enfant relie l'histoire à l'opération qui permet
// de répondre (+, −, ×) en traçant un fil avec le doigt depuis la bobine.
// Toucher directement une opération fonctionne aussi (plus simple, et accessible).
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { CarteEnonce, SurfaceEnRelief } from '@/composants';
import { useThemeEnfant } from '@/accessibilite/contexte';
import { couleurs, espaces, formes } from '@/theme';

import { OPERATIONS_BON_FIL } from './registre';
import type { PropsJeuNombre } from './types';

type OperationFil = (typeof OPERATIONS_BON_FIL)[number];

const NOMS: Record<OperationFil, string> = {
  '+': 'plus',
  '−': 'moins',
  '×': 'fois',
};
const ESPACE_FIL = 140;
const TAILLE_OPERATION = 84;
const RAYON_BOBINE = 16;
/** Distance (px) à laquelle on « attrape » la bobine ou une opération. */
const TOLERANCE = 56;

const LigneAnimee = Animated.createAnimatedComponent(Line);

export function JeuBonFil({ exercice, actif, onRepondre }: PropsJeuNombre) {
  const [largeur, setLargeur] = useState(0);
  const [hauteurHistoire, setHauteurHistoire] = useState(0);
  const [relie, setRelie] = useState<OperationFil | null>(null);
  const { typo, reglages } = useThemeEnfant();

  const bobine = { x: largeur / 2, y: hauteurHistoire + RAYON_BOBINE };
  const yOperations = hauteurHistoire + ESPACE_FIL + TAILLE_OPERATION / 2;
  const centres = OPERATIONS_BON_FIL.map((op, i) => ({
    op,
    x: (largeur * (2 * i + 1)) / 6,
    y: yOperations,
  }));

  const relier = (op: OperationFil) => {
    if (!actif) return;
    setRelie(op);
    onRepondre(op === exercice.operations[0]);
  };

  const lacher = (x: number, y: number) => {
    const cible = centres.find((c) => Math.hypot(c.x - x, c.y - y) < TOLERANCE);
    if (cible) relier(cible.op);
  };

  // Position du bout du fil pendant le tracé (en coordonnées de la zone de jeu).
  const bobineX = useSharedValue(0);
  const bobineY = useSharedValue(0);
  useEffect(() => {
    bobineX.value = bobine.x;
    bobineY.value = bobine.y;
  }, [bobine.x, bobine.y, bobineX, bobineY]);
  const finX = useSharedValue(0);
  const finY = useSharedValue(0);
  const trace = useSharedValue(false);

  // Avec « toucher puis toucher », pas de tracé : on touche l'opération.
  const tracer = usePanGesture({
    enabled: actif && !reglages.toucherPuisToucher,
    minDistance: 2,
    onActivate: (e) => {
      // Le fil ne part que si le doigt a commencé sur la bobine.
      const departX = e.x - e.translationX;
      const departY = e.y - e.translationY;
      trace.value = Math.hypot(departX - bobineX.value, departY - bobineY.value) < TOLERANCE;
      finX.value = e.x;
      finY.value = e.y;
    },
    onUpdate: (e) => {
      finX.value = e.x;
      finY.value = e.y;
    },
    onDeactivate: (e) => {
      if (trace.value && !e.canceled) scheduleOnRN(lacher, e.x, e.y);
      trace.value = false;
    },
  });

  const proprietesFil = useAnimatedProps(() => ({
    x1: bobineX.value,
    y1: bobineY.value,
    x2: finX.value,
    y2: finY.value,
    strokeOpacity: trace.value ? 1 : 0,
  }));

  const centreRelie = centres.find((c) => c.op === relie);
  const hauteur = yOperations + TAILLE_OPERATION / 2 + formes.tuile.relief + espaces.s;

  return (
    <GestureDetector gesture={tracer}>
      <View
        testID="zone-bon-fil"
        style={[styles.zone, { height: hauteurHistoire ? hauteur : undefined }]}
        onLayout={(e: LayoutChangeEvent) => setLargeur(e.nativeEvent.layout.width)}
      >
        <View testID="histoire-bon-fil" onLayout={(e) => setHauteurHistoire(e.nativeEvent.layout.height)}>
          <CarteEnonce enonce={exercice.enonce} question={exercice.question} />
        </View>

        {largeur > 0 && hauteurHistoire > 0 ? (
          <>
            <Svg width={largeur} height={hauteur} style={styles.calqueFil} pointerEvents="none">
              {centreRelie ? (
                <Line
                  x1={bobine.x}
                  y1={bobine.y}
                  x2={centreRelie.x}
                  y2={centreRelie.y - TAILLE_OPERATION / 2}
                  stroke={couleurs.sarcelle[700]}
                  strokeWidth={6}
                  strokeLinecap="round"
                />
              ) : null}
              <LigneAnimee
                animatedProps={proprietesFil}
                stroke={couleurs.sarcelle[700]}
                strokeWidth={6}
                strokeLinecap="round"
              />
              <Circle cx={bobine.x} cy={bobine.y} r={RAYON_BOBINE} fill={couleurs.caramel[500]} />
              <Circle cx={bobine.x} cy={bobine.y} r={RAYON_BOBINE - 7} fill={couleurs.blanc} />
            </Svg>

            {centres.map(({ op, x }) => {
              const choisie = relie === op;
              return (
                <SurfaceEnRelief
                  key={op}
                  onPress={() => relier(op)}
                  disabled={!actif}
                  accessibilityRole="button"
                  accessibilityLabel={`Opération ${NOMS[op]}`}
                  couleurFace={choisie ? couleurs.menthe[100] : couleurs.blanc}
                  couleurRelief={choisie ? couleurs.sarcelle[700] : couleurs.gris[300]}
                  couleurBordure={choisie ? couleurs.sarcelle[700] : couleurs.bordure}
                  relief={formes.tuile.relief}
                  rayon={TAILLE_OPERATION / 2}
                  style={[
                    styles.operation,
                    {
                      left: x - TAILLE_OPERATION / 2,
                      top: yOperations - TAILLE_OPERATION / 2,
                    },
                  ]}
                >
                  <Text style={[styles.signe, { fontFamily: typo.nombreReponse.fontFamily }]}>{op}</Text>
                </SurfaceEnRelief>
              );
            })}
          </>
        ) : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  zone: { width: '100%' },
  calqueFil: { position: 'absolute', left: 0, top: 0 },
  operation: {
    position: 'absolute',
    width: TAILLE_OPERATION,
    height: TAILLE_OPERATION + formes.tuile.relief,
  },
  signe: { fontSize: 48, lineHeight: 56, color: couleurs.encre },
});
