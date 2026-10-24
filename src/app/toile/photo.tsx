import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { BulleCapy, Bouton, CarteConfiance } from '@/composants';
import { domainesDe, LIBELLES_MATIERES, MATIERES, type Matiere } from '@/config/domaines';
import { mascotte } from '@/mascotte';
import { useProfilActif } from '@/store/profils';
import { useReglages } from '@/store/reglages';
import { analyserPhoto, messageEchec, type ResultatAnalyse } from '@/toile/analyse';
import { cadreDansLaVue, cadreVersPhoto, type Taille } from '@/toile/cadrage';
import { preparerToile } from '@/toile/photo';
import { couleurs, espaces, formes } from '@/theme';

const VOILE = 'rgba(18, 64, 79, 0.45)';

/** Photo de la toile : le parent cadre uniquement la toile, l'image est recadrée sur le téléphone. */
export default function PhotoToile() {
  const { typo } = useThemeEnfant();
  const profil = useProfilActif();
  const { apres, matiere: matiereParam } = useLocalSearchParams<{ apres?: string; matiere?: string }>();
  const matiere: Matiere = (MATIERES as readonly string[]).includes(matiereParam ?? '') ? (matiereParam as Matiere) : 'mathematiques';
  const [permission, demanderPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [vue, setVue] = useState<Taille | null>(null);
  const [pret, setPret] = useState(false);
  const [analyseEnCours, setAnalyseEnCours] = useState(false);

  if (!profil) return <Redirect href="/" />;
  const domaines = domainesDe(profil.classe, matiere);
  const cadre = vue ? cadreDansLaVue(vue) : null;

  const saisirALaMain = (message?: string) =>
    router.replace({ pathname: '/toile/saisie', params: { matiere, apres, ...(message ? { message } : {}) } });

  const conclure = (resultat: ResultatAnalyse) => {
    if (resultat.ok) {
      router.replace({
        pathname: '/toile/saisie',
        params: { matiere, apres, source: 'photo', lu: JSON.stringify(resultat.niveaux) },
      });
    } else {
      saisirALaMain(messageEchec(resultat.raison));
    }
  };

  const analyser = async (preparer: () => Promise<string>) => {
    setAnalyseEnCours(true);
    try {
      conclure(await analyserPhoto(await preparer(), domaines, matiere, useReglages.getState().appareil));
    } catch {
      saisirALaMain(messageEchec('illisible'));
    }
  };

  const photographier = async () => {
    if (!camera.current || !vue || !cadre) return;
    let photo;
    try {
      photo = await camera.current.takePictureAsync({ quality: 0.9, shutterSound: false });
    } catch {
      return;
    }
    if (!photo) return;
    const zone = cadreVersPhoto(vue, { largeur: photo.width, hauteur: photo.height }, cadre);
    await analyser(() => preparerToile(photo.uri, photo.width, zone));
  };

  const importer = async () => {
    const choix = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });
    if (choix.canceled || !choix.assets[0]) return;
    const { uri, width } = choix.assets[0];
    await analyser(() => preparerToile(uri, width));
  };

  if (analyseEnCours) {
    return (
      <SafeAreaView style={[styles.fond, styles.centre]}>
        <Image source={mascotte.explorer} style={styles.capy} resizeMode="contain" accessible={false} />
        <Text style={typo.titre2}>Capy lit la toile…</Text>
        <ActivityIndicator size="large" color={couleurs.sarcelle[700]} />
        <Text style={[typo.petit, styles.texteCentre]}>Seule la zone de la toile est envoyée. Rien n’est conservé.</Text>
      </SafeAreaView>
    );
  }

  const autorisee = permission?.granted === true;

  return (
    <SafeAreaView style={styles.fond}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={typo.titre1}>Toile de {LIBELLES_MATIERES[matiere].toLowerCase()}</Text>
        <BulleCapy pose="explorer" tailleCapy={72} texte={`Cadrez uniquement la toile de la fiche de ${LIBELLES_MATIERES[matiere].toLowerCase()}, bien à plat et sans reflet.`} />

        <View style={styles.zoneCamera} onLayout={(e) => setVue({ largeur: e.nativeEvent.layout.width, hauteur: e.nativeEvent.layout.height })}>
          {autorisee ? (
            <>
              <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" onCameraReady={() => setPret(true)} />
              {cadre ? (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  {/* Voile autour du cadre, pour bien montrer la zone envoyée. */}
                  <View style={[styles.voile, { top: 0, left: 0, right: 0, height: cadre.y }]} />
                  <View style={[styles.voile, { top: cadre.y + cadre.hauteur, left: 0, right: 0, bottom: 0 }]} />
                  <View style={[styles.voile, { top: cadre.y, left: 0, width: cadre.x, height: cadre.hauteur }]} />
                  <View style={[styles.voile, { top: cadre.y, right: 0, width: cadre.x, height: cadre.hauteur }]} />
                  <View style={[styles.cadre, { top: cadre.y, left: cadre.x, width: cadre.largeur, height: cadre.hauteur }]} />
                  <View style={[styles.consigne, { top: Math.max(8, cadre.y - 44) }]}>
                    <Text style={[typo.texteGras, { color: couleurs.jaune.texte }]}>Cadrez uniquement la toile</Text>
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <View style={[styles.centre, styles.sansCamera]}>
              <Text style={[typo.texte, styles.texteCentre]}>
                {permission?.canAskAgain === false
                  ? 'L’accès à l’appareil photo est refusé. Vous pouvez l’autoriser dans les réglages du téléphone, importer une photo ou saisir la toile à la main.'
                  : 'Capy a besoin de l’appareil photo pour photographier la toile.'}
              </Text>
              {permission?.canAskAgain !== false ? (
                <Bouton
                  titre="Autoriser l’appareil photo"
                  pleineLargeur={false}
                  style={styles.boutonCentre}
                  onPress={demanderPermission}
                />
              ) : null}
            </View>
          )}
        </View>

        <View style={styles.boutons}>
          {autorisee ? <Bouton titre="Prendre la photo" variante="jaune" desactive={!pret} onPress={photographier} /> : null}
          <Bouton titre="Importer une photo" variante="secondaire" onPress={importer} />
          <Bouton titre="Saisir à la main" variante="secondaire" onPress={() => saisirALaMain()} />
          <Bouton titre="Retour" variante="secondaire" onPress={() => router.back()} />
        </View>

        <CarteConfiance
          titre="La photo ne quitte pas le téléphone"
          texte="Seule la zone de la toile est envoyée pour être lue, puis oubliée. Ni la photo ni le recadrage ne sont conservés : seuls les niveaux le sont."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, backgroundColor: couleurs.fondPage },
  contenu: {
    padding: espaces.ecran,
    gap: espaces.l,
    width: '100%',
    maxWidth: espaces.largeurMax,
    alignSelf: 'center',
  },
  centre: { alignItems: 'center', justifyContent: 'center', gap: espaces.l, padding: espaces.xl },
  texteCentre: { textAlign: 'center' },
  capy: { width: 160, height: 160 },
  zoneCamera: {
    width: '100%',
    aspectRatio: 3 / 4,
    maxHeight: 560,
    borderRadius: formes.carte.rayon,
    overflow: 'hidden',
    backgroundColor: couleurs.encre,
  },
  sansCamera: { flex: 1, backgroundColor: couleurs.creme },
  voile: { position: 'absolute', backgroundColor: VOILE },
  cadre: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: couleurs.jaune[400],
    borderRadius: formes.carte.rayon,
  },
  consigne: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: couleurs.jaune[400],
    borderRadius: formes.pilule,
    paddingHorizontal: espaces.l,
    paddingVertical: espaces.xs,
  },
  boutons: { gap: espaces.m },
  boutonCentre: { alignSelf: 'center' },
});
