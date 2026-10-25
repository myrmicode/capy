import { useEffect } from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { mascotte, type PoseCapy } from '@/mascotte';

/**
 * - saut : Capy saute de joie (bonne réponse, fin d'étape) ;
 * - hesite : il penche la tête d'un côté puis de l'autre, comme s'il se grattait la tête ;
 * - respire : il respire lentement, comme un bâillement (pause).
 */
export type AnimationCapy = 'saut' | 'hesite' | 'respire' | 'aucune';

/** L'animation qui va avec chaque pose. */
export const ANIMATION_DE_LA_POSE: Partial<Record<PoseCapy, AnimationCapy>> = {
  heureux: 'saut',
  bravo: 'saut',
  fier: 'saut',
  clinOeil: 'saut',
  reussite: 'saut',
  reflechi: 'hesite',
  conseils: 'hesite',
  apprendre: 'hesite',
  ralentir: 'respire',
};

/** La respiration s'arrête d'elle-même : rien ne bouge plus de 5 secondes (WCAG 2.2.2). */
const RESPIRATIONS = 2;

interface PropsCapyAnime {
  pose: PoseCapy;
  taille: number;
  /** Par défaut, celle de la pose. */
  animation?: AnimationCapy;
  style?: StyleProp<ImageStyle>;
}

/**
 * Capy qui bouge un peu, une seule fois à l'apparition (ou au changement de pose).
 * En mode calme ou avec « réduire les animations », il reste immobile.
 */
export function CapyAnime({ pose, taille, animation, style }: PropsCapyAnime) {
  const { animationsReduites } = useThemeEnfant();
  const type = animationsReduites ? 'aucune' : (animation ?? ANIMATION_DE_LA_POSE[pose] ?? 'aucune');
  const y = useSharedValue(0);
  const rotation = useSharedValue(0);
  const echelle = useSharedValue(1);

  useEffect(() => {
    if (type === 'saut') {
      y.value = withSequence(
        withTiming(-taille * 0.14, { duration: 180, easing: Easing.out(Easing.quad) }),
        withSpring(0, { damping: 8, stiffness: 180 }),
      );
    } else if (type === 'hesite') {
      rotation.value = withSequence(
        withTiming(-7, { duration: 220 }),
        withTiming(6, { duration: 300 }),
        withTiming(-3, { duration: 240 }),
        withTiming(0, { duration: 200 }),
      );
    } else if (type === 'respire') {
      echelle.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 1100 }), withTiming(1, { duration: 1100 })),
        RESPIRATIONS,
      );
    }
    return () => {
      cancelAnimation(y);
      cancelAnimation(rotation);
      cancelAnimation(echelle);
      y.value = 0;
      rotation.value = 0;
      echelle.value = 1;
    };
  }, [pose, type, taille, y, rotation, echelle]);

  const styleAnime = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${rotation.value}deg` }, { scale: echelle.value }],
  }));

  const base = [{ width: taille, height: taille }, style];
  if (type === 'aucune') {
    return <Image source={mascotte[pose]} style={base} resizeMode="contain" accessible={false} />;
  }
  return <Animated.Image source={mascotte[pose]} style={[base, styleAnime]} resizeMode="contain" accessible={false} />;
}
