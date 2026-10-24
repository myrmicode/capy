import { StyleSheet, Text, View } from 'react-native';

import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { BulleCapy, Ecran, Toile } from '@/composants';
import { domainesDe, LIBELLES_MATIERES, MATIERES } from '@/config/domaines';
import { useProfilActif } from '@/store/profils';
import { ficheSaisie } from '@/toile/niveaux';
import { espaces } from '@/theme';

/** Les toiles vues par l'enfant : seulement celles du jour, qui grandissent avec ses étapes. */
function MaToile() {
  const { typo } = useThemeEnfant();
  const profil = useProfilActif();
  if (!profil) return null;
  const matieres = MATIERES.filter((m) => ficheSaisie(profil.toile, m));

  return (
    <Ecran>
      <Text style={typo.titre1}>Mes toiles</Text>
      {profil.toile && matieres.length > 0 ? (
        <>
          <BulleCapy
            pose="clinOeil"
            texte="Tes toiles grandissent un peu à chaque étape. Regarde comme elles s’étendent !"
          />
          {matieres.map((m) => (
            <View key={m} style={styles.toile}>
              <Text style={typo.titre3}>{LIBELLES_MATIERES[m]}</Text>
              <Toile
                domaines={domainesDe(profil.classe, m)}
                couches={[{ niveaux: profil.toile!.actuelle, style: 'actuelle' }]}
                taille={340}
              />
            </View>
          ))}
        </>
      ) : (
        <BulleCapy
          pose="surpris"
          texte="Tes toiles apparaîtront quand tes parents auront recopié les fiches de l’école."
        />
      )}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  toile: { alignItems: 'center', gap: espaces.s },
});

export default avecReglagesEnfant(MaToile);
