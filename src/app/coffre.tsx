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
import { Bouton, CapyHabille, Ecran, IconeCoffre, IconeEtoile } from '@/composants';
import { trouverCoffre } from '@/config/parcours';
import { celebrer } from '@/jeux/retours';
import { mascotte } from '@/mascotte';
import * as progression from '@/parcours/progression';
import { cheminDuTheme, ETOILES_COFFRE } from '@/parcours/progression';
import { nouvelObjet, tenueValide, type ObjetCapy } from '@/collection/objets';
import { themeEstPropose } from '@/parcours/selection';
import { themeSurprise } from '@/parcours/surprise';
import { useProfilActif, useProfils } from '@/store/profils';
import { couleurs, espaces, formes } from '@/theme';

/** Coffre de fin d'unité : il s'ouvre quand toutes les étapes de l'unité sont réussies. */
function Coffre() {
  const { typo, animationsReduites } = useThemeEnfant();
  const profil = useProfilActif();
  const ouvrirCoffre = useProfils((e) => e.ouvrirCoffre);
  const porterObjet = useProfils((e) => e.porterObjet);
  // Le trésor trouvé dans ce coffre : Capy le porte tout de suite.
  const [tresor, setTresor] = useState<ObjetCapy | null>(null);
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
  // Une unité finie : Capy propose une petite série d'un autre thème, pour découvrir.
  const surprise = themeSurprise(profil.classe, profil.toile, profil.progression, id, trouve.theme.id);
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
    const objet = nouvelObjet(profil.progression, progression.ouvrirCoffre(profil.progression, id));
    ouvrirCoffre(profil.id, id);
    if (objet) {
      porterObjet(profil.id, objet.emplacement, objet.id);
      setTresor(objet);
    }
    celebrer('coffre', { silencieux: animationsReduites });
  };

  return (
    <Ecran
      pied={
        ouvert ? (
          <View style={styles.boutons}>
            {surprise && ouvertIci ? (
              <Bouton
                titre={`Thème surprise : ${surprise.titre}`}
                variante="jaune"
                onPress={() =>
                  router.replace({ pathname: '/etape', params: { entrainement: surprise.id, surprise: '1' } })
                }
              />
            ) : null}
            <Bouton
              titre="Retour au parcours"
              variante={surprise && ouvertIci ? 'secondaire' : 'principal'}
              onPress={() => router.back()}
            />
          </View>
        ) : (
          <Bouton titre="Ouvrir le coffre" variante="jaune" onPress={ouvrir} />
        )
      }
    >
      <View style={styles.centre}>
        {tresor ? (
          <CapyHabille tenue={tenueValide(profil.progression.tenue, profil.progression)} taille={160} />
        ) : (
          <Image
            source={ouvert ? mascotte.fier : mascotte.surpris}
            style={styles.capy}
            resizeMode="contain"
            accessible={false}
          />
        )}
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
              ? `Tu as terminé toute l’unité. Voici ${ETOILES_COFFRE} étoiles en cadeau !` +
                (tresor ? ` Et un trésor pour Capy : ${tresor.nom}. Regarde comme il est beau !` : '')
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
  boutons: { gap: espaces.m },
});

export default avecReglagesEnfant(Coffre);
