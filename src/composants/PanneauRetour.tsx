import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { mascotte } from '@/mascotte';
import { couleurs, espaces, formes, typo } from '@/theme';

import { Bouton } from './Bouton';
import { IconeAmpoule } from './icones';

interface PropsPanneauRetour {
  type: 'bravo' | 'presque';
  /** Explication de la méthode, affichée dans les deux cas. */
  explication: string;
  /** Indice qui guide sans donner la réponse, affiché après une erreur. */
  indice?: string;
  onContinuer: () => void;
}

/**
 * Retour après une réponse. Jamais punitif : après une erreur on affiche
 * « Presque ! », un indice et « Réessayer », sans limite. Capy réfléchit,
 * il n'est jamais triste.
 */
export function PanneauRetour({ type, explication, indice, onContinuer }: PropsPanneauRetour) {
  const bravo = type === 'bravo';
  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      style={[styles.panneau, { backgroundColor: bravo ? couleurs.menthe[100] : couleurs.brun[100] }]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.entete}>
        <Image
          source={bravo ? mascotte.heureux : mascotte.reflechi}
          style={styles.capy}
          resizeMode="contain"
          accessible={false}
        />
        <Text style={[typo.titre2, { color: bravo ? couleurs.sarcelle[900] : couleurs.brun[800] }]}>
          {bravo ? 'Bravo !' : 'Presque !'}
        </Text>
      </View>
      {!bravo && indice ? (
        <View style={styles.indice}>
          <IconeAmpoule taille={22} couleur={couleurs.brun[600]} />
          <Text style={[typo.enonce, styles.flex]}>{indice}</Text>
        </View>
      ) : null}
      <Text style={typo.texte}>{explication}</Text>
      <Bouton
        titre={bravo ? 'Continuer' : 'Réessayer'}
        variante={bravo ? 'principal' : 'reessayer'}
        onPress={onContinuer}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panneau: {
    borderRadius: formes.carte.rayon,
    padding: espaces.xl,
    gap: espaces.m,
  },
  entete: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  capy: { width: 64, height: 64 },
  indice: { flexDirection: 'row', gap: espaces.s, alignItems: 'flex-start' },
  flex: { flex: 1 },
});
