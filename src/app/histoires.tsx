// Les histoires de Capy : la liste. Chaque histoire se lit page par page,
// puis trois questions vérifient qu'on l'a comprise.
import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { BulleCapy, Bouton, CapyAnime, Ecran, IconeEtoile, SurfaceEnRelief } from '@/composants';
import { HISTOIRES } from '@/contenu/histoires';
import { useProfilActif } from '@/store/profils';
import { couleurs, espaces, formes } from '@/theme';

function Histoires() {
  const profil = useProfilActif();
  const { typo, ecart } = useThemeEnfant();
  if (!profil) return <Redirect href="/" />;
  const lues = profil.progression.histoires ?? {};

  return (
    <Ecran pied={<Bouton titre="Retour" variante="secondaire" onPress={() => router.back()} />}>
      <Text style={typo.titre1} accessibilityRole="header">
        Les histoires de Capy
      </Text>
      <BulleCapy
        pose="apprendre"
        tailleCapy={80}
        texte="Choisis une histoire. Lis-la tranquillement, puis réponds à trois questions."
      />
      {HISTOIRES.map((h) => {
        const etoiles = lues[h.id] ?? 0;
        return (
          <SurfaceEnRelief
            key={h.id}
            onPress={() => router.push({ pathname: '/histoire', params: { id: h.id } })}
            accessibilityRole="button"
            accessibilityLabel={`${h.titre}. ${h.resume}${etoiles > 0 ? ` Déjà lue, ${etoiles} étoiles.` : ''}`}
            couleurFace={couleurs.blanc}
            couleurRelief={couleurs.gris[300]}
            couleurBordure={couleurs.bordure}
            relief={4}
            rayon={formes.carte.rayon}
            styleFace={[styles.carte, { padding: ecart('m'), gap: ecart('m') }]}
          >
            <CapyAnime pose={h.pages[0].pose} taille={64} animation="aucune" />
            <View style={styles.flex}>
              <Text style={typo.titre3}>{h.titre}</Text>
              <Text style={typo.petit}>{h.resume}</Text>
              {etoiles > 0 ? (
                <View style={styles.etoiles}>
                  {[1, 2, 3].map((n) => (
                    <IconeEtoile
                      key={n}
                      taille={18}
                      couleur={n <= etoiles ? couleurs.jaune[600] : couleurs.gris[300]}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          </SurfaceEnRelief>
        );
      })}
    </Ecran>
  );
}

export default avecReglagesEnfant(Histoires);

const styles = StyleSheet.create({
  flex: { flex: 1, gap: espaces.xs },
  carte: { flexDirection: 'row', alignItems: 'center' },
  etoiles: { flexDirection: 'row', gap: 2 },
});
