import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BulleCapy, Bouton, CarteConfiance, EditeurNiveaux, Ecran, Toile } from '@/composants';
import { domainesDe } from '@/config/domaines';
import { useProfilActif, useProfils } from '@/store/profils';
import { completerNiveaux, type Niveaux } from '@/toile/niveaux';
import { espaces, typo } from '@/theme';

function lire(json: string | undefined): Niveaux | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as Niveaux;
  } catch {
    return null;
  }
}

/**
 * Saisie des niveaux de la toile de la fiche de l'école. Deux usages :
 * - vérification après la photo : les niveaux lus sont pré-remplis et le parent
 *   corrige avant de valider (on ne fait jamais confiance aveuglément à l'IA) ;
 * - saisie à la main, toujours disponible, notamment si l'analyse échoue.
 */
export default function SaisieToile() {
  const profil = useProfilActif();
  const enregistrerToile = useProfils((e) => e.enregistrerToile);
  const { apres, source, lu, message } = useLocalSearchParams<{
    apres?: string;
    source?: string;
    lu?: string;
    message?: string;
  }>();
  const apresCreation = apres === 'creation';
  const depuisPhoto = source === 'photo' && lire(lu) !== null;
  const [niveaux, setNiveaux] = useState(() =>
    profil ? completerNiveaux(profil.classe, lire(lu) ?? profil.toile?.septembre ?? {}) : null,
  );

  if (!profil || !niveaux) return <Redirect href="/" />;
  const domaines = domainesDe(profil.classe);

  const valider = () => {
    enregistrerToile(profil.id, niveaux);
    router.replace('/bilan');
  };

  let bulle = (
    <BulleCapy
      pose="explorer"
      tailleCapy={80}
      texte="Recopiez la position de chaque point de la toile de la fiche de l’école, de 0 (centre) à 10 (bord)."
    />
  );
  if (depuisPhoto) {
    bulle = (
      <BulleCapy
        pose="conseils"
        tailleCapy={80}
        texte="Voici ce que j’ai lu sur la photo. Comparez avec la fiche et corrigez si besoin avant de valider."
      />
    );
  } else if (message) {
    bulle = <BulleCapy pose="reflechi" tailleCapy={80} texte={message} />;
  }

  return (
    <Ecran
      pied={
        <View style={styles.boutons}>
          <Bouton titre={depuisPhoto ? 'C’est bien la toile, valider' : 'Valider la toile'} onPress={valider} />
          <Bouton
            titre="Prendre une photo"
            variante="secondaire"
            onPress={() => router.replace({ pathname: '/toile/photo', params: { apres } })}
          />
          <Bouton
            titre={apresCreation ? 'Plus tard' : 'Annuler'}
            variante="secondaire"
            onPress={() => (apresCreation ? router.replace('/enfant') : router.back())}
          />
        </View>
      }
    >
      <Text style={typo.titre1}>{depuisPhoto ? 'Vérifiez la toile' : `La toile de ${profil.prenom}`}</Text>
      {bulle}
      {profil.toile && !apresCreation ? (
        <Text style={typo.petit}>
          Cette nouvelle fiche remplacera la toile de référence. La progression dans le parcours est conservée.
        </Text>
      ) : null}

      <Toile domaines={domaines} couches={[{ niveaux, style: 'actuelle' }]} />
      <EditeurNiveaux domaines={domaines} niveaux={niveaux} onChange={setNiveaux} />
      <CarteConfiance
        titre="Seuls les niveaux sont enregistrés"
        texte="Ces niveaux restent sur cet appareil. Aucune photo, aucun nom d’école n’est conservé."
      />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  boutons: { gap: espaces.m },
});
