// Mini-jeu « Attrape-lucioles » : des lucioles portent des nombres (ou des mots courts)
// et flottent lentement ; l'enfant touche celle qui porte la bonne réponse.
// Pas de chrono : les lucioles ne s'envolent jamais, elles bougent juste un peu.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CarteEnonce } from '@/composants';
import { creerAlea, nb } from '@/exercices';
import { useThemeEnfant } from '@/accessibilite/contexte';
import { ECHELLES_TEXTE } from '@/accessibilite/theme';
import { couleurs, espaces, formes } from '@/theme';

import type { PropsJeu } from './types';

const TAILLE = 104;

const etiquette = (v: number | string) => (typeof v === 'number' ? nb(v) : v);
/** Amplitude du vol, en pixels : assez pour vivre, assez peu pour viser facilement. */
const AMPLITUDE = 10;

export function JeuLucioles({ exercice, actif, onRepondre }: PropsJeu) {
  const [touchee, setTouchee] = useState<number | string | null>(null);
  const choix: readonly (number | string)[] = exercice.choix;

  const toucher = (valeur: number | string) => {
    if (!actif) return;
    setTouchee(valeur);
    onRepondre(valeur === exercice.reponse);
  };

  return (
    <View style={styles.jeu}>
      <CarteEnonce enonce={exercice.enonce} question={exercice.question} />
      <View style={styles.ciel}>
        {choix.map((valeur, i) => (
          <Luciole
            key={valeur}
            valeur={valeur}
            index={i}
            graine={exercice.graine}
            etat={touchee === valeur ? (valeur === exercice.reponse ? 'juste' : 'presque') : 'normal'}
            actif={actif}
            onPress={() => toucher(valeur)}
          />
        ))}
      </View>
    </View>
  );
}

interface PropsLuciole {
  valeur: number | string;
  index: number;
  graine: number;
  etat: 'normal' | 'juste' | 'presque';
  actif: boolean;
  onPress: () => void;
}

function Luciole({ valeur, index, graine, etat, actif, onPress }: PropsLuciole) {
  const { typo, reglages, animationsReduites } = useThemeEnfant();
  // Immobiles en mode calme, avec « Réduire les animations », et quand viser doit rester facile.
  const reduit = animationsReduites || reglages.toucherPuisToucher || reglages.grandesCibles;
  const echelle = ECHELLES_TEXTE[reglages.taille];
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);

  useEffect(() => {
    if (reduit) return;
    // Un petit vol propre à chaque luciole, reproductible.
    const alea = creerAlea(graine + index * 7919);
    const duree = 1800 + alea.entier(0, 900);
    const vers = (v: number) => withTiming(v, { duration: duree, easing: Easing.inOut(Easing.sin) });
    dx.value = withDelay(index * 200, withRepeat(withSequence(vers(AMPLITUDE), vers(-AMPLITUDE)), -1, true));
    dy.value = withDelay(index * 300, withRepeat(withSequence(vers(-AMPLITUDE), vers(AMPLITUDE)), -1, true));
  }, [dx, dy, graine, index, reduit]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: dx.value }, { translateY: dy.value }],
  }));
  const couleur =
    etat === 'juste' ? couleurs.menthe[500] : etat === 'presque' ? couleurs.brun[100] : couleurs.jaune[400];
  const bord =
    etat === 'juste' ? couleurs.sarcelle[700] : etat === 'presque' ? couleurs.brun[600] : couleurs.jaune[600];
  const texte = etat === 'presque' ? couleurs.brun[800] : etat === 'juste' ? couleurs.encre : couleurs.jaune.texte;

  return (
    <View style={styles.place}>
      <Animated.View style={style}>
        <Pressable
          onPress={onPress}
          disabled={!actif}
          accessibilityRole="button"
          accessibilityLabel={`Luciole ${etiquette(valeur)}`}
          style={({ pressed }) => [
            styles.halo,
            typeof valeur === 'string' && [styles.haloMot, { width: Math.round(144 * echelle) }],
            pressed && styles.appuye,
          ]}
        >
          {/* Un mot n'est jamais tronqué : sa terminaison est justement ce qu'il faut voir. */}
          <View
            style={[
              styles.luciole,
              typeof valeur === 'string' && [styles.lucioleMot, { width: Math.round(132 * echelle) }],
              { backgroundColor: couleur, borderColor: bord },
            ]}
          >
            <Text
              style={[
                typeof valeur === 'string'
                  ? [typo.enonce, styles.mot]
                  : [styles.nombre, { fontFamily: typo.nombreReponse.fontFamily }],
                { color: texte },
              ]}
              {...(typeof valeur === 'number' ? { adjustsFontSizeToFit: true, numberOfLines: 1 } : {})}
            >
              {etiquette(valeur)}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: { gap: espaces.l },
  ciel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    rowGap: espaces.xl,
    paddingVertical: espaces.xl,
    backgroundColor: couleurs.sarcelle[900],
    borderRadius: formes.carte.rayon,
  },
  place: { width: '45%', alignItems: 'center' },
  halo: {
    width: TAILLE + 24,
    height: TAILLE + 24,
    borderRadius: (TAILLE + 24) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(252, 196, 72, 0.18)',
  },
  appuye: { transform: [{ scale: 0.95 }] },
  luciole: {
    width: TAILLE,
    height: TAILLE,
    borderRadius: TAILLE / 2,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espaces.s,
  },
  nombre: { fontSize: 30 },
  mot: { textAlign: 'center' },
  // Les mots prennent la forme d'une pilule, assez large pour « ramasserons ».
  haloMot: { borderRadius: formes.pilule },
  lucioleMot: { borderRadius: formes.pilule, paddingHorizontal: espaces.xs },
});
