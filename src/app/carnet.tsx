// Le carnet de Capy : les règles découvertes dans le parcours, à relire comme
// une mini-leçon. Une page s'ajoute dès la première étape finie d'un thème.
import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import { BulleCapy, Bouton, Ecran, IconeCadenas, IconeHautParleur, TuileTheme } from '@/composants';
import { domaineDe } from '@/config/domaines';
import { pagesDuCarnet, type EntreeCarnet } from '@/contenu/carnet';
import { arreterLecture, lireAVoixHaute } from '@/jeux/retours';
import { useProfilActif } from '@/store/profils';
import { couleurs, couleursMatieres, espaces, formes } from '@/theme';

function Carnet() {
  const profil = useProfilActif();
  const { typo } = useThemeEnfant();
  useEffect(() => arreterLecture, []);
  if (!profil) return <Redirect href="/" />;

  const pages = pagesDuCarnet(profil.classe, profil.progression);
  const decouvertes = pages.filter((e) => e.decouverte);

  return (
    <Ecran pied={<Bouton titre="Retour" variante="secondaire" onPress={() => router.back()} />}>
      <Text style={typo.titre1} accessibilityRole="header">
        Le carnet de Capy
      </Text>
      <BulleCapy
        pose="apprendre"
        tailleCapy={80}
        texte={
          decouvertes.length > 0
            ? 'Ici, je note tout ce que tu as découvert. Relis une page quand tu veux !'
            : 'Mon carnet est encore vide. Finis une première étape : j’y noterai ce que tu as appris.'
        }
      />
      {pages.length === 0 ? <Text style={typo.texte}>Le carnet de ta classe arrive bientôt.</Text> : null}
      {pages.map((e) =>
        e.decouverte ? (
          <PageOuverte key={e.theme.id} entree={e} classe={profil.classe} />
        ) : (
          <View key={e.theme.id} style={[styles.page, styles.pageFermee]} accessible>
            <IconeCadenas taille={22} couleur={couleurs.encreDouce} />
            <Text style={[typo.texte, styles.flex]}>Page à découvrir : {e.theme.titre}</Text>
          </View>
        ),
      )}
    </Ecran>
  );
}

function PageOuverte({ entree, classe }: { entree: EntreeCarnet; classe: Parameters<typeof domaineDe>[0] }) {
  const { typo, reglages, ecart } = useThemeEnfant();
  const { theme, page } = entree;
  const c = couleursMatieres[domaineDe(classe, theme.domaine)?.matiere ?? 'mathematiques'];
  const aLire = [page.titre, page.regle, ...page.exemples, `Astuce : ${page.astuce}`];
  return (
    <View style={[styles.page, { gap: ecart('s') }]}>
      <View style={styles.ligne}>
        <TuileTheme domaine={theme.domaine} couleurs={c} taille={48} />
        <Text style={[typo.titre3, styles.flex]} accessibilityRole="header">
          {page.titre}
        </Text>
      </View>
      <TexteAccessible texte={page.regle} variante="texte" />
      <View style={[styles.exemples, { backgroundColor: c.clair }]}>
        {page.exemples.map((ex) => (
          <TexteAccessible key={ex} texte={ex} variante="texte" />
        ))}
      </View>
      <Text style={[typo.texteGras, { color: couleurs.brun[800] }]}>Astuce</Text>
      <TexteAccessible texte={page.astuce} variante="texte" />
      <Bouton
        titre="Écouter"
        variante="secondaire"
        pleineLargeur={false}
        icone={(couleur) => <IconeHautParleur taille={22} couleur={couleur} />}
        onPress={() => lireAVoixHaute(aLire, { lente: reglages.lectureLente })}
      />
    </View>
  );
}

export default avecReglagesEnfant(Carnet);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  page: {
    backgroundColor: couleurs.blanc,
    borderRadius: formes.carte.rayon,
    borderWidth: 2,
    borderColor: couleurs.bordure,
    padding: espaces.l,
  },
  pageFermee: { flexDirection: 'row', alignItems: 'center', gap: espaces.m, backgroundColor: couleurs.gris[200] },
  exemples: { borderRadius: formes.carte.rayon, padding: espaces.m, gap: espaces.xs },
});
