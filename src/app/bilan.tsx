import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BulleCapy, Bouton, Ecran, Toile } from '@/composants';
import { domainesDe, type Domaine } from '@/config/domaines';
import { themesDe } from '@/config/parcours';
import { useProfilActif } from '@/store/profils';
import { analyserToile } from '@/toile/niveaux';
import { couleurs, espaces, formes, typo } from '@/theme';

/** Bilan court pour les parents, à partir de la toile de la fiche de l'école. */
export default function Bilan() {
  const profil = useProfilActif();
  if (!profil) return <Redirect href="/" />;
  if (!profil.toile) return <Redirect href="/toile/saisie" />;

  const domaines = domainesDe(profil.classe);
  const { forts, aConsolider, priorite } = analyserToile(profil.classe, profil.toile.actuelle);
  const themePriorite = priorite && themesDe(profil.classe).find((t) => t.domaine === priorite.id);
  const liste = (ds: Domaine[]) => ds.map((d) => d.libelle).join(', ');

  return (
    <Ecran pied={<Bouton titre="Lancer le parcours" onPress={() => router.replace('/enfant')} />}>
      <Text style={typo.titre1}>Le bilan de {profil.prenom}</Text>
      <BulleCapy
        pose="conseils"
        tailleCapy={80}
        texte="Voici ce que dit la toile. Chaque enfant avance à son rythme : on part de là, petit pas après petit pas."
      />
      <Toile domaines={domaines} couches={[{ niveaux: profil.toile.actuelle, style: 'actuelle' }]} />

      <Carte titre="Ce qui va bien" fond={couleurs.menthe[100]} couleurTitre={couleurs.sarcelle[900]}>
        {forts.length > 0
          ? `${liste(forts)}. De belles bases sur lesquelles s’appuyer.`
          : 'Aucun domaine n’est encore bien installé. C’est fréquent en début d’année, le parcours est là pour ça.'}
      </Carte>

      {aConsolider.length > 0 ? (
        <Carte titre="À consolider" fond={couleurs.caramel[100]} couleurTitre={couleurs.brun[800]}>
          {`${liste(aConsolider)}. Ces domaines seront travaillés au fil du parcours.`}
        </Carte>
      ) : null}

      {priorite ? (
        <Carte titre="Priorité" fond={couleurs.brun[100]} couleurTitre={couleurs.brun[800]} accent>
          {themePriorite
            ? `${priorite.libelle}. C’est par là que commence le parcours de ${profil.prenom}.`
            : `${priorite.libelle}. Les exercices de ce domaine arrivent bientôt ; en attendant, le parcours commence par « Résoudre des problèmes ».`}
        </Carte>
      ) : null}
    </Ecran>
  );
}

interface PropsCarte {
  titre: string;
  fond: string;
  couleurTitre: string;
  accent?: boolean;
  children: string;
}

function Carte({ titre, fond, couleurTitre, accent = false, children }: PropsCarte) {
  return (
    <View style={[styles.carte, { backgroundColor: fond }, accent && styles.accent]}>
      <Text style={[typo.titre3, { color: couleurTitre }]}>{titre}</Text>
      <Text style={typo.texte}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: { borderRadius: formes.carte.rayon, padding: espaces.l, gap: espaces.xs },
  accent: { borderLeftWidth: 8, borderLeftColor: couleurs.brun[600] },
});
