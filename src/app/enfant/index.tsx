import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BulleCapy, Bouton, Ecran, EtapeParcours, type EtatEtape } from '@/composants';
import { useProfilActif } from '@/store/profils';
import { espaces, typo } from '@/theme';

// Aperçu provisoire : le vrai parcours (étapes, étoiles, série de jours) arrive en phase 4.
const APERCU: { etat: EtatEtape; coffre?: boolean }[] = [
  { etat: 'reussie' },
  { etat: 'reussie' },
  { etat: 'enCours' },
  { etat: 'verrouillee' },
  { etat: 'verrouillee', coffre: true },
];
const DECALAGES = [0, 60, 0, -60, 0];

export default function ParcoursEnfant() {
  const profil = useProfilActif();
  if (!profil) return <Redirect href="/" />;

  return (
    <Ecran
      pied={<Bouton titre="Changer d’enfant" variante="secondaire" onPress={() => router.replace('/')} />}
    >
      <Text style={typo.titre1}>Salut {profil.prenom} !</Text>
      <BulleCapy pose="reussite" tailleCapy={110} texte="Ton parcours arrive très bientôt. On va bien s’amuser !" />
      <View style={styles.chemin}>
        {APERCU.map((e, i) => (
          <View key={i} style={{ transform: [{ translateX: DECALAGES[i] }] }}>
            <EtapeParcours numero={i + 1} etat={e.etat} coffre={e.coffre} onPress={() => {}} />
          </View>
        ))}
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  chemin: { alignItems: 'center', gap: espaces.m, paddingVertical: espaces.l },
});
