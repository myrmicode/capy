// Entraînement libre : les compétences déjà à +++ sur la fiche ne sont pas dans
// le parcours, mais l'enfant peut les rejouer ici en séries courtes, sans étapes
// ni coffre. Chaque série rapporte des étoiles et fait évoluer la toile du jour.
import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { BulleCapy, Bouton, CarteTheme, Ecran, IconeEtoile } from '@/composants';
import { domaineDe, estAtelier, LIBELLES_MATIERES, MATIERES } from '@/config/domaines';
import { nombreDeQuestions } from '@/accessibilite/adaptation';
import { QUESTIONS_SERIE, themesEntrainement } from '@/parcours/selection';
import { useProfilActif } from '@/store/profils';
import { couleurs, couleursMatieres, espaces } from '@/theme';

function Entrainement() {
  const profil = useProfilActif();
  const { typo, reglages, ecart } = useThemeEnfant();
  if (!profil) return <Redirect href="/" />;

  const themes = themesEntrainement(profil.classe, profil.toile);
  const questions = nombreDeQuestions(QUESTIONS_SERIE, reglages);
  // D'abord chaque matière, puis les ateliers (formes, mesures), qui ne sont sur aucune toile.
  const groupes = [
    ...MATIERES.map((matiere) => ({
      cle: matiere,
      titre: LIBELLES_MATIERES[matiere],
      couleurs: couleursMatieres[matiere],
      themes: themes.filter((t) => domaineDe(profil.classe, t.domaine)?.matiere === matiere),
    })),
    {
      cle: 'ateliers',
      titre: 'Les ateliers\u00a0: formes et mesures',
      couleurs: couleursMatieres.mathematiques,
      themes: themes.filter((t) => estAtelier(t.domaine)),
    },
  ];
  const ateliers = themes.some((t) => estAtelier(t.domaine));

  return (
    <Ecran pied={<Bouton titre="Retour au parcours" variante="secondaire" onPress={() => router.back()} />}>
      <Text style={typo.titre1}>Entraînement libre</Text>
      <BulleCapy
        pose="clinOeil"
        tailleCapy={88}
        texte={
          themes.length > 0
            ? `Ici, tu rejoues ce que tu sais déjà bien faire${ateliers ? ', et tu découvres les formes et les mesures' : ''}. Une série, c’est ${questions} questions, et elle rapporte des étoiles.`
            : 'Rien à rejouer pour l’instant : tout ce que je sais faire travailler est dans ton parcours.'
        }
      />
      {groupes.map((groupe) => {
        const duSujet = groupe.themes;
        if (duSujet.length === 0) return null;
        return (
          <View key={groupe.cle} style={{ gap: ecart('m') }}>
            <Text style={[typo.texteGras, styles.matiere]}>{groupe.titre}</Text>
            {duSujet.map((t) => {
              const resultat = profil.progression.entrainement?.[t.id];
              return (
                <CarteTheme key={t.id} theme={t} couleurs={groupe.couleurs}>
                  {resultat ? (
                    <View
                      style={styles.ligne}
                      accessible
                      accessibilityLabel={`${resultat.etoiles} étoiles gagnées en ${resultat.series} séries`}
                    >
                      <IconeEtoile taille={20} couleur={couleurs.jaune[600]} />
                      <Text style={typo.petit}>
                        {resultat.etoiles} étoile{resultat.etoiles > 1 ? 's' : ''} · {resultat.series} série
                        {resultat.series > 1 ? 's' : ''}
                      </Text>
                    </View>
                  ) : (
                    <Text style={typo.petit}>Pas encore de série.</Text>
                  )}
                  <Bouton
                    titre="Jouer une série"
                    libelleAccessible={`Jouer une série : ${t.titre}`}
                    onPress={() => router.push({ pathname: '/etape', params: { entrainement: t.id } })}
                  />
                </CarteTheme>
              );
            })}
          </View>
        );
      })}
    </Ecran>
  );
}

export default avecReglagesEnfant(Entrainement);

const styles = StyleSheet.create({
  matiere: { color: couleurs.encreDouce },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: espaces.xs },
});
