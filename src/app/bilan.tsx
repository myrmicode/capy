import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BulleCapy, Bouton, Ecran, Toile } from '@/composants';
import { domainesDe, LIBELLES_MATIERES, MATIERES, type Domaine, type Matiere } from '@/config/domaines';
import { themesDe } from '@/config/parcours';
import { useProfilActif } from '@/store/profils';
import { analyserToile, ficheSaisie, type ToileEnfant } from '@/toile/niveaux';
import { couleurs, espaces, formes, typo } from '@/theme';

/** Bilan court pour les parents, à partir des toiles des fiches de l'école. */
export default function Bilan() {
  const profil = useProfilActif();
  if (!profil) return <Redirect href="/" />;
  const toile = profil.toile;
  const matieres = MATIERES.filter((m) => ficheSaisie(toile, m));
  if (!toile || matieres.length === 0) return <Redirect href="/toile" />;

  return (
    <Ecran pied={<Bouton titre="Lancer le parcours" onPress={() => router.replace('/enfant')} />}>
      <Text style={typo.titre1}>Le bilan de {profil.prenom}</Text>
      <BulleCapy
        pose="conseils"
        tailleCapy={80}
        texte="Voici ce que disent les toiles. Chaque enfant avance à son rythme : on part de là, petit pas après petit pas."
      />
      {matieres.map((m) => (
        <BilanMatiere key={m} matiere={m} classe={profil.classe} prenom={profil.prenom} toile={toile} />
      ))}
      {matieres.length < MATIERES.length ? (
        <Bouton
          titre={`Ajouter la fiche de ${LIBELLES_MATIERES[MATIERES.find((m) => !matieres.includes(m))!].toLowerCase()}`}
          variante="secondaire"
          onPress={() => router.push('/toile')}
        />
      ) : null}
    </Ecran>
  );
}

interface PropsBilanMatiere {
  matiere: Matiere;
  classe: Parameters<typeof domainesDe>[0];
  prenom: string;
  toile: ToileEnfant;
}

function BilanMatiere({ matiere, classe, prenom, toile }: PropsBilanMatiere) {
  const domaines = domainesDe(classe, matiere);
  const { forts, aConsolider, priorite } = analyserToile(classe, matiere, toile.actuelle);
  const themePriorite = priorite && themesDe(classe).find((t) => t.domaine === priorite.id);
  const liste = (ds: Domaine[]) => ds.map((d) => d.libelle).join(', ');
  const horsAppli = [...forts, ...aConsolider].filter((d) => d.horsAppli && !forts.includes(d));

  return (
    <View style={styles.matiere}>
      <Text style={typo.titre2}>{LIBELLES_MATIERES[matiere]}</Text>
      <Toile domaines={domaines} couches={[{ niveaux: toile.actuelle, style: 'actuelle' }]} />

      <Carte titre="Ce qui va bien" fond={couleurs.menthe[100]} couleurTitre={couleurs.sarcelle[900]}>
        {forts.length > 0
          ? `${liste(forts)}. De belles bases sur lesquelles s’appuyer.`
          : 'Aucun axe n’est encore à +++. C’est fréquent en début d’année, le parcours est là pour ça.'}
      </Carte>

      {aConsolider.length > 0 ? (
        <Carte titre="À consolider" fond={couleurs.caramel[100]} couleurTitre={couleurs.brun[800]}>
          {`${liste(aConsolider)}. Ces compétences seront travaillées au fil du parcours.`}
        </Carte>
      ) : null}

      {priorite ? (
        <Carte titre="Priorité" fond={couleurs.brun[100]} couleurTitre={couleurs.brun[800]} accent>
          {themePriorite
            ? `${priorite.libelle}. Capy la fait travailler en priorité dans le parcours de ${prenom}.`
            : `${priorite.libelle}. Les exercices de cette compétence arrivent bientôt dans Capy.`}
        </Carte>
      ) : null}

      {horsAppli.length > 0 ? (
        <Text style={typo.petit}>
          {liste(horsAppli)} : Capy n’enregistre jamais la voix, cette compétence se travaille en lisant à voix haute
          avec vous, quelques minutes par jour.
        </Text>
      ) : null}
    </View>
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
  matiere: { gap: espaces.m, paddingTop: espaces.l, borderTopWidth: 2, borderTopColor: couleurs.bordure },
  carte: { borderRadius: formes.carte.rayon, padding: espaces.l, gap: espaces.xs },
  accent: { borderLeftWidth: 8, borderLeftColor: couleurs.brun[600] },
});
