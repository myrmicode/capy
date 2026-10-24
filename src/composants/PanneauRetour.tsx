import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import { mascotte } from '@/mascotte';
import { couleurs, espaces, formes } from '@/theme';

import { Bouton } from './Bouton';
import { IconeAmpoule } from './icones';

interface PropsPanneauRetour {
  type: 'bravo' | 'presque';
  /** Explication de la méthode, montrée après une bonne réponse. */
  explication?: string;
  /** Indice qui guide sans donner la réponse, montré après une erreur. */
  indice?: string;
  onContinuer: () => void;
}

/**
 * Retour après une réponse. Jamais punitif : après une erreur on affiche
 * « Presque ! », un indice et « Réessayer », sans limite. L'explication complète
 * n'arrive qu'après la bonne réponse, pour que l'enfant cherche encore.
 * Capy réfléchit, il n'est jamais triste. En mode calme, rien ne bouge.
 */
export function PanneauRetour({ type, explication, indice, onContinuer }: PropsPanneauRetour) {
  const bravo = type === 'bravo';
  const { typo, animationsReduites, ecart } = useThemeEnfant();
  const echelle = useSharedValue(1);
  useEffect(() => {
    if (bravo && !animationsReduites) echelle.value = withSequence(withTiming(1.18, { duration: 180 }), withSpring(1));
  }, [bravo, echelle, animationsReduites]);
  const styleCapy = useAnimatedStyle(() => ({
    transform: [{ scale: echelle.value }],
  }));
  const fond = {
    backgroundColor: bravo ? couleurs.menthe[100] : couleurs.brun[100],
    padding: ecart('xl'),
    gap: ecart('m'),
  };
  const image = bravo ? mascotte.heureux : mascotte.reflechi;

  const contenu = (
    <>
      <View style={styles.entete}>
        {animationsReduites ? (
          <Image source={image} style={styles.capy} resizeMode="contain" accessible={false} />
        ) : (
          <Animated.Image source={image} style={[styles.capy, styleCapy]} resizeMode="contain" accessible={false} />
        )}
        <Text style={[typo.titre2, { color: bravo ? couleurs.sarcelle[900] : couleurs.brun[800] }]}>
          {bravo ? 'Bravo !' : 'Presque !'}
        </Text>
      </View>
      {bravo && explication ? <TexteAccessible texte={explication} variante="texte" coloration /> : null}
      {!bravo ? (
        <View style={styles.indice}>
          <IconeAmpoule taille={22} couleur={couleurs.brun[600]} />
          <View style={styles.flex}>
            <TexteAccessible texte={indice ?? 'Relis bien l’histoire, tu vas trouver.'} variante="enonce" coloration />
          </View>
        </View>
      ) : null}
      <Bouton
        titre={bravo ? 'Continuer' : 'Réessayer'}
        variante={bravo ? 'principal' : 'reessayer'}
        onPress={onContinuer}
      />
    </>
  );

  if (animationsReduites) {
    return (
      <View style={[styles.panneau, fond]} accessibilityLiveRegion="polite">
        {contenu}
      </View>
    );
  }
  return (
    <Animated.View entering={FadeInDown.duration(260)} style={[styles.panneau, fond]} accessibilityLiveRegion="polite">
      {contenu}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panneau: { borderRadius: formes.carte.rayon },
  entete: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  capy: { width: 64, height: 64, borderRadius: 16 },
  indice: { flexDirection: 'row', gap: espaces.s, alignItems: 'flex-start' },
  flex: { flex: 1 },
});
