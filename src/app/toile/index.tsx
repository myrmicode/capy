import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { BulleCapy, Bouton, CarteConfiance, Ecran, IconeCoche } from '@/composants';
import { LIBELLES_MATIERES, MATIERES, type Matiere } from '@/config/domaines';
import { dateEnFrancais } from '@/parents/format';
import { useProfilActif } from '@/store/profils';
import { couleurs, espaces, formes } from '@/theme';

/**
 * Les fiches de l'école : une toile en français, une en mathématiques.
 * Le parent photographie (ou recopie) chacune, dans l'ordre qu'il veut.
 */
export default function FichesEcole() {
  const { typo } = useThemeEnfant();
  const profil = useProfilActif();
  const { apres } = useLocalSearchParams<{ apres?: string }>();
  if (!profil) return <Redirect href="/" />;

  const saisies = MATIERES.filter((m) => profil.toile?.saisieLe[m]);
  const ouvrir = (pathname: '/toile/photo' | '/toile/saisie', matiere: Matiere) =>
    router.push({ pathname, params: { matiere, apres } });

  return (
    <Ecran
      pied={
        <View style={styles.boutons}>
          {saisies.length > 0 ? (
            <Bouton titre="Voir le bilan" onPress={() => router.replace('/bilan')} />
          ) : null}
          <Bouton
            titre={apres === 'creation' ? 'Plus tard' : 'Retour'}
            variante="secondaire"
            onPress={() => (apres === 'creation' ? router.replace('/enfant') : router.back())}
          />
        </View>
      }
    >
      <Text style={typo.titre1}>Les fiches de {profil.prenom}</Text>
      <BulleCapy
        pose="explorer"
        tailleCapy={80}
        texte="L’école vous a remis deux fiches, chacune avec une toile : une en français, une en mathématiques."
      />

      {MATIERES.map((matiere) => {
        const saisieLe = profil.toile?.saisieLe[matiere];
        return (
          <View key={matiere} style={styles.carte}>
            <View style={styles.entete}>
              <Text style={[typo.titre3, styles.flex]}>{LIBELLES_MATIERES[matiere]}</Text>
              {saisieLe ? (
                <View style={styles.fait}>
                  <IconeCoche taille={18} couleur={couleurs.sarcelle[900]} />
                  <Text style={[typo.petit, { color: couleurs.sarcelle[900] }]}>{dateEnFrancais(saisieLe)}</Text>
                </View>
              ) : null}
            </View>
            <Bouton
              titre={saisieLe ? 'Photographier une nouvelle fiche' : 'Photographier la toile'}
              variante={saisieLe ? 'secondaire' : 'jaune'}
              onPress={() => ouvrir('/toile/photo', matiere)}
            />
            <Bouton titre="Saisir à la main" variante="secondaire" onPress={() => ouvrir('/toile/saisie', matiere)} />
          </View>
        );
      })}

      <CarteConfiance
        titre="La photo ne quitte pas le téléphone"
        texte="Seule la zone de la toile est envoyée pour être lue, puis oubliée. Seuls les niveaux sont conservés."
      />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  boutons: { gap: espaces.m },
  carte: {
    gap: espaces.m,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
  },
  entete: { flexDirection: 'row', alignItems: 'center', gap: espaces.s },
  flex: { flex: 1 },
  fait: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.xs,
    backgroundColor: couleurs.menthe[100],
    borderRadius: formes.pilule,
    paddingHorizontal: espaces.m,
    paddingVertical: espaces.xs,
  },
});
