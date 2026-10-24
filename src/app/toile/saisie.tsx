import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BulleCapy, Bouton, CarteConfiance, EditeurNiveaux, Ecran, Toile } from '@/composants';
import { domainesDe } from '@/config/domaines';
import { useProfilActif, useProfils } from '@/store/profils';
import { completerNiveaux } from '@/toile/niveaux';
import { espaces, typo } from '@/theme';

/**
 * Saisie à la main des niveaux lus sur la toile de la fiche de l'école.
 * Toujours disponible, même quand l'analyse de la photo arrivera (phase 6).
 */
export default function SaisieToile() {
  const profil = useProfilActif();
  const enregistrerToile = useProfils((e) => e.enregistrerToile);
  const { apres } = useLocalSearchParams<{ apres?: string }>();
  const apresCreation = apres === 'creation';
  const [niveaux, setNiveaux] = useState(() =>
    profil ? completerNiveaux(profil.classe, profil.toile?.septembre ?? {}) : null,
  );

  if (!profil || !niveaux) return <Redirect href="/" />;
  const domaines = domainesDe(profil.classe);

  const valider = () => {
    enregistrerToile(profil.id, niveaux);
    router.replace('/bilan');
  };

  return (
    <Ecran
      pied={
        <View style={styles.boutons}>
          <Bouton titre="Valider la toile" onPress={valider} />
          <Bouton
            titre={apresCreation ? 'Plus tard' : 'Annuler'}
            variante="secondaire"
            onPress={() => (apresCreation ? router.replace('/enfant') : router.back())}
          />
        </View>
      }
    >
      <Text style={typo.titre1}>La toile de {profil.prenom}</Text>
      <BulleCapy
        pose="explorer"
        tailleCapy={80}
        texte="Recopiez la position de chaque point de la toile de la fiche de l’école, de 0 (centre) à 10 (bord)."
      />
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
