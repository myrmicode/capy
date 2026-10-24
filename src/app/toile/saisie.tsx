import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { BulleCapy, Bouton, CarteConfiance, EditeurNiveaux, Ecran, Toile } from '@/composants';
import { domainesDe, LIBELLES_MATIERES, MATIERES, type Matiere } from '@/config/domaines';
import { useProfilActif, useProfils } from '@/store/profils';
import { completerNiveaux, ficheSaisie, type Niveaux } from '@/toile/niveaux';
import { espaces } from '@/theme';

function lire(json: string | undefined): Niveaux | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as Niveaux;
  } catch {
    return null;
  }
}

function matiereDe(valeur: string | undefined): Matiere {
  return (MATIERES as readonly string[]).includes(valeur ?? '') ? (valeur as Matiere) : 'mathematiques';
}

/**
 * Saisie des niveaux de la toile d'une fiche de l'école (une matière). Deux usages :
 * - vérification après la photo : les niveaux lus sont pré-remplis et le parent
 *   corrige avant de valider (on ne fait jamais confiance aveuglément à l'IA) ;
 * - saisie à la main, toujours disponible, notamment si l'analyse échoue.
 */
export default function SaisieToile() {
  const { typo } = useThemeEnfant();
  const profil = useProfilActif();
  const enregistrerToile = useProfils((e) => e.enregistrerToile);
  const params = useLocalSearchParams<{ matiere?: string; apres?: string; source?: string; lu?: string; message?: string }>();
  const matiere = matiereDe(params.matiere);
  const depuisPhoto = params.source === 'photo' && lire(params.lu) !== null;
  const [niveaux, setNiveaux] = useState(() =>
    profil ? completerNiveaux(profil.classe, lire(params.lu) ?? profil.toile?.septembre ?? {}, matiere) : null,
  );

  if (!profil || !niveaux) return <Redirect href="/" />;
  const domaines = domainesDe(profil.classe, matiere);
  const nomMatiere = LIBELLES_MATIERES[matiere].toLowerCase();

  const valider = () => {
    enregistrerToile(profil.id, matiere, niveaux);
    const autre = MATIERES.find((m) => m !== matiere)!;
    // L'autre fiche reste à saisir : on revient à la liste des fiches ; sinon, place au bilan.
    if (ficheSaisie(useProfils.getState().profils.find((p) => p.id === profil.id)?.toile, autre)) {
      router.replace('/bilan');
    } else {
      router.replace({ pathname: '/toile', params: { apres: params.apres } });
    }
  };

  let bulle = (
    <BulleCapy
      pose="explorer"
      tailleCapy={80}
      texte="Pour chaque axe de la toile, recopiez le niveau indiqué sur la fiche : +, ++ ou +++."
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
  } else if (params.message) {
    bulle = <BulleCapy pose="reflechi" tailleCapy={80} texte={params.message} />;
  }

  return (
    <Ecran
      pied={
        <View style={styles.boutons}>
          <Bouton titre={depuisPhoto ? 'C’est bien la toile, valider' : 'Valider la toile'} onPress={valider} />
          <Bouton
            titre="Prendre une photo"
            variante="secondaire"
            onPress={() => router.replace({ pathname: '/toile/photo', params: { matiere, apres: params.apres } })}
          />
          <Bouton titre="Annuler" variante="secondaire" onPress={() => router.back()} />
        </View>
      }
    >
      <Text style={typo.titre1}>{depuisPhoto ? `Vérifiez la toile de ${nomMatiere}` : `Toile de ${nomMatiere}`}</Text>
      {bulle}
      {ficheSaisie(profil.toile, matiere) ? (
        <Text style={typo.petit}>
          Cette nouvelle fiche remplacera la toile de référence en {nomMatiere}. La progression est conservée.
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
