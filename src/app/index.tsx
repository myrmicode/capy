import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { BulleCapy, Bouton, Ecran, IconePlus } from '@/composants';
import { mascotte, RATIO_PAYSAGE } from '@/mascotte';
import { useProfils, type ProfilEnfant } from '@/store/profils';
import { couleurs, espaces, formes, typo } from '@/theme';

/** Proportions du cadre du bandeau (plus haut que l'image, qui est donc recadrée). */
const RATIO_CADRE = RATIO_PAYSAGE / 2.2;
/** Position horizontale de Capy dans l'image (de 0 à 1) : le cadrage reste centré sur lui. */
const CENTRE_CAPY = 0.48;

/** Accueil : choix de l'enfant qui joue. */
export default function Accueil() {
  const profils = useProfils((e) => e.profils);
  const choisirProfil = useProfils((e) => e.choisirProfil);

  function ouvrir(profil: ProfilEnfant) {
    choisirProfil(profil.id);
    router.push('/enfant');
  }

  return (
    <Ecran
      pied={
        <Bouton
          titre="Ajouter un enfant"
          variante={profils.length === 0 ? 'principal' : 'secondaire'}
          icone={(c) => <IconePlus taille={22} couleur={c} />}
          onPress={() => router.push('/profil/nouveau')}
        />
      }
    >
      <Paysage />
      <Text style={[typo.manuscrit, styles.centre]}>Grandes découvertes à petits pas !</Text>

      {profils.length === 0 ? (
        <BulleCapy
          pose="capy"
          tailleCapy={120}
          texte="Bonjour, je suis Capy ! Ajoutez le profil de votre enfant pour commencer."
        />
      ) : (
        <>
          <Text style={typo.titre1}>Qui joue aujourd’hui ?</Text>
          <View style={styles.liste}>
            {profils.map((p) => (
              <CarteProfil key={p.id} profil={p} onPress={() => ouvrir(p)} />
            ))}
          </View>
        </>
      )}

      {__DEV__ ? (
        <Pressable onPress={() => router.push('/galerie')} style={styles.lienDev} accessibilityRole="link">
          <Text style={[typo.petit, styles.centre]}>Voir les composants (développement)</Text>
        </Pressable>
      ) : null}
    </Ecran>
  );
}

function CarteProfil({ profil, onPress }: { profil: ProfilEnfant; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${profil.prenom}, ${profil.classe}`}
      style={({ pressed }) => [styles.carte, pressed && styles.carteAppuyee]}
    >
      <Image source={mascotte.heureux} style={styles.avatar} resizeMode="contain" accessible={false} />
      <Text style={[typo.titre3, styles.flex]} numberOfLines={1}>
        {profil.prenom}
      </Text>
      <View style={styles.pastille}>
        <Text style={[typo.texteGras, { color: couleurs.sarcelle[900] }]}>{profil.classe}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  paysage: {
    width: '100%',
    aspectRatio: RATIO_CADRE,
    borderRadius: formes.carte.rayon,
    overflow: 'hidden',
  },
  centre: { textAlign: 'center' },
  liste: { gap: espaces.m },
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.m,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderBottomColor: couleurs.gris[300],
    borderRadius: formes.carte.rayon,
    padding: espaces.m,
    minHeight: 80,
  },
  carteAppuyee: { borderBottomWidth: 2, marginTop: 3 },
  avatar: { width: 56, height: 56, borderRadius: 16 },
  flex: { flex: 1 },
  pastille: {
    backgroundColor: couleurs.menthe[100],
    borderRadius: formes.pilule,
    paddingHorizontal: espaces.m,
    paddingVertical: espaces.xs,
  },
  lienDev: { minHeight: formes.cibleTactile, justifyContent: 'center' },
});

/**
 * Bandeau d'accueil, recadré autour de Capy. La phrase écrite à droite de
 * l'image reste hors champ sur tous les écrans, au lieu d'apparaître coupée.
 */
function Paysage() {
  const [largeur, setLargeur] = useState(0);
  const hauteur = largeur / RATIO_CADRE;
  const largeurImage = hauteur * RATIO_PAYSAGE;
  return (
    <View style={styles.paysage} onLayout={(e) => setLargeur(e.nativeEvent.layout.width)}>
      {largeur > 0 ? (
        <Image
          source={mascotte.paysage}
          style={{ position: 'absolute', top: 0, height: hauteur, width: largeurImage, left: largeur / 2 - CENTRE_CAPY * largeurImage }}
          accessible={false}
        />
      ) : null}
    </View>
  );
}
