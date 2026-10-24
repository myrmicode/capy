import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { Bouton, Ecran, IconeCoffre, IconeEtoile } from '@/composants';
import { trouverCoffre } from '@/config/parcours';
import { feliciter } from '@/jeux/retours';
import { mascotte } from '@/mascotte';
import { cheminDuTheme, ETOILES_COFFRE } from '@/parcours/progression';
import { themeEstPropose } from '@/parcours/selection';
import { useProfilActif, useProfils } from '@/store/profils';
import { couleurs, espaces, formes } from '@/theme';

/** Coffre de fin d'unité : il s'ouvre quand toutes les étapes de l'unité sont réussies. */
function Coffre() {
  const { typo, animationsReduites } = useThemeEnfant();
  const profil = useProfilActif();
  const ouvrirCoffre = useProfils((e) => e.ouvrirCoffre);
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const trouve = trouverCoffre(id);
  const [ouvertIci, setOuvertIci] = useState(false);

  const echelle = useSharedValue(1);
  const rotation = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: echelle.value }, { rotate: `${rotation.value}deg` }],
  }));

  if (!profil || !trouve || !themeEstPropose(profil.classe, profil.toile, trouve.theme.id))
    return <Redirect href="/enfant" />;
  const noeud = cheminDuTheme(trouve.theme, profil.progression).find((n) => n.id === id);
  if (!noeud || noeud.etat === 'verrouillee') return <Redirect href="/enfant" />;

  const dejaOuvert = noeud.etat === 'reussie' && !ouvertIci;
  const ouvert = noeud.etat === 'reussie';

  const ouvrir = () => {
    // En mode calme, le coffre s'ouvre sans secousse ni son.
    if (!animationsReduites) {
      rotation.set(
        withSequence(
          withTiming(-8, { duration: 90 }),
          withTiming(8, { duration: 90 }),
          withTiming(-6, { duration: 90 }),
          withTiming(0, { duration: 90 }),
        ),
      );
      echelle.set(withSequence(withTiming(1.25, { duration: 260 }), withSpring(1)));
    }
    setOuvertIci(true);
    ouvrirCoffre(profil.id, id);
    feliciter({ silencieux: animationsReduites });
  };

  return (
    <Ecran
      pied={
        ouvert ? (
          <Bouton titre="Retour au parcours" onPress={() => router.back()} />
        ) : (
          <Bouton titre="Ouvrir le coffre" variante="jaune" onPress={ouvrir} />
        )
      }
    >
      <View style={styles.centre}>
        <Image
          source={ouvert ? mascotte.defis : mascotte.surpris}
          style={styles.capy}
          resizeMode="contain"
          accessible={false}
        />
        <Text style={[typo.titre1, styles.texteCentre]}>
          {ouvert ? 'Le coffre est ouvert !' : `Le coffre de l’unité « ${trouve.unite.titre} »`}
        </Text>
        <Animated.View style={[styles.coffre, ouvert && styles.coffreOuvert, style]}>
          <IconeCoffre taille={96} couleur={ouvert ? couleurs.jaune.texte : couleurs.brun[800]} />
        </Animated.View>
        {ouvert ? (
          <View style={styles.gain} accessible accessibilityLabel={`${ETOILES_COFFRE} étoiles gagnées`}>
            {Array.from({ length: ETOILES_COFFRE }, (_, i) => (
              <IconeEtoile key={i} taille={44} couleur={couleurs.jaune[400]} />
            ))}
          </View>
        ) : null}
        <Text style={[typo.enonce, styles.texteCentre]}>
          {dejaOuvert
            ? 'Tu as déjà ouvert ce coffre. Tu peux rejouer les étapes de l’unité quand tu veux.'
            : ouvert
              ? `Tu as terminé toute l’unité. Voici ${ETOILES_COFFRE} étoiles en cadeau !`
              : 'Tu as réussi toutes les étapes de l’unité. Qu’y a-t-il dedans ?'}
        </Text>
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center', gap: espaces.l, paddingTop: espaces.xl },
  texteCentre: { textAlign: 'center' },
  capy: { width: 160, height: 160 },
  coffre: {
    width: 160,
    height: 160,
    borderRadius: formes.carte.rayon,
    backgroundColor: couleurs.caramel[100],
    borderColor: couleurs.caramel[500],
    borderWidth: 3,
    borderBottomWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coffreOuvert: {
    backgroundColor: couleurs.jaune[400],
    borderColor: couleurs.jaune[600],
  },
  gain: { flexDirection: 'row', gap: espaces.s },
});

export default avecReglagesEnfant(Coffre);
