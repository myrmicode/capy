import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import type { Domaine, DomaineId } from '@/config/domaines';
import { SYMBOLES, symboleDe, valeurDe, type Symbole } from '@/toile/niveaux';
import { couleurs, espaces, formes, polices } from '@/theme';

interface PropsEditeurNiveaux {
  domaines: readonly Domaine[];
  niveaux: Record<DomaineId, number>;
  onChange: (niveaux: Record<DomaineId, number>) => void;
}

/** Saisie des niveaux de la fiche, axe par axe, avec les symboles de l'école : + / ++ / +++. */
export function EditeurNiveaux({ domaines, niveaux, onChange }: PropsEditeurNiveaux) {
  const { typo } = useThemeEnfant();
  const choisir = (id: DomaineId, s: Symbole) => onChange({ ...niveaux, [id]: valeurDe(s) });

  return (
    <View style={styles.liste}>
      {domaines.map((d) => {
        const actuel = symboleDe(niveaux[d.id] ?? 0);
        return (
          <View key={d.id} style={styles.ligne}>
            <Text style={[typo.texteGras, styles.libelle]}>{d.libelle}</Text>
            <View style={styles.choix} accessibilityRole="radiogroup" accessibilityLabel={d.libelle}>
              {SYMBOLES.map((s) => {
                const choisi = s === actuel;
                return (
                  <Pressable
                    key={s}
                    onPress={() => choisir(d.id, s)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: choisi }}
                    accessibilityLabel={`${d.libelle} : ${s.length} plus`}
                    style={[styles.symbole, choisi && styles.symboleChoisi]}
                  >
                    <Text style={[styles.texteSymbole, choisi && styles.texteChoisi]}>{s}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  liste: { gap: espaces.m },
  ligne: {
    gap: espaces.s,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.m,
  },
  libelle: {},
  choix: { flexDirection: 'row', gap: espaces.s },
  symbole: {
    flex: 1,
    minHeight: formes.cibleTactile + 4,
    borderRadius: formes.pilule,
    borderWidth: 2,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.blanc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symboleChoisi: { backgroundColor: couleurs.sarcelle[700], borderColor: couleurs.sarcelle[700] },
  texteSymbole: { fontFamily: polices.fredokaGras, fontSize: 22, color: couleurs.encre },
  texteChoisi: { color: couleurs.blanc },
});
