// La carte des mondes : chaque matière est un pays (la forêt des mots, la
// rivière des nombres), et chaque thème proposé une étape du voyage, avec son
// avancement. Le paysage suit la saison. Toucher un thème l'ouvre sur le parcours.
import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { Bouton, BulleCapy, Ecran, IconeCoche, ScenePaysage, TuileTheme } from '@/composants';
import { domaineDe, MATIERES, type Matiere } from '@/config/domaines';
import type { Theme } from '@/config/parcours';
import { avancementDuTheme } from '@/parcours/progression';
import { saisonDe } from '@/parcours/saisons';
import { themesProposes } from '@/parcours/selection';
import { useProfilActif } from '@/store/profils';
import { couleurs, couleursMatieres, espaces, formes } from '@/theme';

const PAYS: Record<Matiere, string> = {
  francais: 'La forêt des mots',
  mathematiques: 'La rivière des nombres',
};

/** L'icône du thème dans un anneau qui se remplit avec l'avancement. */
function Station({ theme, matiere, faits, total }: { theme: Theme; matiere: Matiere; faits: number; total: number }) {
  const c = couleursMatieres[matiere];
  const taille = 76;
  const rayon = 34;
  const tour = 2 * Math.PI * rayon;
  return (
    <View style={{ width: taille, height: taille, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={taille} height={taille} style={StyleSheet.absoluteFill}>
        <Circle cx={taille / 2} cy={taille / 2} r={rayon} stroke={couleurs.gris[200]} strokeWidth={6} fill="none" />
        {faits > 0 ? (
          <Circle
            cx={taille / 2}
            cy={taille / 2}
            r={rayon}
            stroke={couleurs.jaune[400]}
            strokeWidth={6}
            fill="none"
            strokeDasharray={`${(tour * faits) / Math.max(1, total)} ${tour}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${taille / 2} ${taille / 2})`}
          />
        ) : null}
      </Svg>
      <TuileTheme domaine={theme.domaine} couleurs={c} taille={52} />
    </View>
  );
}

function Carte() {
  const profil = useProfilActif();
  const { typo, ecart } = useThemeEnfant();
  if (!profil) return <Redirect href="/" />;

  const themes = themesProposes(profil.classe, profil.toile);
  const saison = saisonDe(new Date());
  const matiereDe = (t: Theme): Matiere => domaineDe(profil.classe, t.domaine)?.matiere ?? 'mathematiques';

  return (
    <Ecran pied={<Bouton titre="Retour au parcours" variante="secondaire" onPress={() => router.back()} />}>
      <Text style={typo.titre1} accessibilityRole="header">
        La carte des mondes
      </Text>
      <BulleCapy
        pose="exploration"
        tailleCapy={80}
        texte={
          themes.length > 0
            ? 'Voici tous nos voyages ! L’anneau jaune se remplit à chaque étape. Touche un thème pour y aller.'
            : 'La carte apparaîtra quand tes parents auront recopié les fiches de l’école.'
        }
      />
      {MATIERES.map((matiere) => {
        const duPays = themes.filter((t) => matiereDe(t) === matiere);
        if (duPays.length === 0) return null;
        const c = couleursMatieres[matiere];
        return (
          <View key={matiere} style={[styles.pays, { backgroundColor: c.clair, gap: ecart('m'), padding: ecart('l') }]}>
            <Text style={[typo.titre2, { color: c.relief }]} accessibilityRole="header">
              {PAYS[matiere]}
            </Text>
            <ScenePaysage matiere={matiere} saison={saison} />
            {duPays.map((t, i) => {
              const { faits, total } = avancementDuTheme(t, profil.progression);
              const termine = faits === total;
              return (
                <View key={t.id}>
                  {/* Le chemin pointillé qui relie les étapes du voyage. */}
                  {i > 0 ? <View style={[styles.chemin, { borderColor: c.face }]} /> : null}
                  <Pressable
                    onPress={() => router.navigate({ pathname: '/enfant', params: { theme: t.id } })}
                    accessibilityRole="button"
                    accessibilityLabel={`${t.titre} : ${faits} sur ${total}${termine ? ', terminé' : ''}. Ouvrir sur le parcours.`}
                    style={({ pressed }) => [
                      styles.station,
                      { flexDirection: i % 2 === 0 ? 'row' : 'row-reverse', gap: ecart('m') },
                      pressed && styles.appuye,
                    ]}
                  >
                    <Station theme={t} matiere={matiere} faits={faits} total={total} />
                    <View style={styles.texte}>
                      <Text style={typo.texteGras}>{t.titre}</Text>
                      <View style={styles.ligne}>
                        {termine ? <IconeCoche taille={18} couleur={couleurs.sarcelle[700]} /> : null}
                        <Text style={typo.petit}>{termine ? 'Terminé' : `${faits} sur ${total}`}</Text>
                      </View>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        );
      })}
    </Ecran>
  );
}

export default avecReglagesEnfant(Carte);

const styles = StyleSheet.create({
  pays: { borderRadius: formes.carte.rayon },
  station: {
    alignItems: 'center',
    backgroundColor: couleurs.blanc,
    borderRadius: formes.carte.rayon,
    padding: espaces.s,
  },
  appuye: { opacity: 0.85 },
  texte: { flex: 1, gap: espaces.xs },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: espaces.xs },
  chemin: { alignSelf: 'center', height: 18, borderLeftWidth: 3, borderStyle: 'dashed' },
});
