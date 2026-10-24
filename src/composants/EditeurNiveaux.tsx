import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Domaine, DomaineId } from '@/config/domaines';
import { borner } from '@/toile/niveaux';
import { couleurs, espaces, formes, typo } from '@/theme';

import { IconeMoins, IconePlus } from './icones';

const PAS = 0.1;
const SEGMENTS = 10;

interface PropsEditeurNiveaux {
  domaines: readonly Domaine[];
  niveaux: Record<DomaineId, number>;
  onChange: (niveaux: Record<DomaineId, number>) => void;
}

/** Saisie des niveaux par domaine, de 0 à 10, avec des boutons − et +. */
export function EditeurNiveaux({ domaines, niveaux, onChange }: PropsEditeurNiveaux) {
  const changer = (id: DomaineId, delta: number) => onChange({ ...niveaux, [id]: borner((niveaux[id] ?? 0) + delta) });

  return (
    <View style={styles.liste}>
      {domaines.map((d) => {
        const v = niveaux[d.id] ?? 0;
        const sur10 = Math.round(v * SEGMENTS);
        return (
          <View key={d.id} style={styles.ligne}>
            <Text style={[typo.texteGras, styles.libelle]}>{d.libelle}</Text>
            <View style={styles.reglage}>
              <BoutonPas
                onPress={() => changer(d.id, -PAS)}
                desactive={sur10 === 0}
                libelle={`Baisser ${d.libelle}`}
                icone={<IconeMoins taille={22} couleur={couleurs.sarcelle[700]} />}
              />
              <View
                style={styles.barre}
                accessible
                accessibilityRole="adjustable"
                accessibilityLabel={d.libelle}
                accessibilityValue={{ min: 0, max: SEGMENTS, now: sur10, text: `${sur10} sur 10` }}
                accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
                onAccessibilityAction={(e) => changer(d.id, e.nativeEvent.actionName === 'increment' ? PAS : -PAS)}
              >
                {Array.from({ length: SEGMENTS }, (_, i) => (
                  <View key={i} style={[styles.segment, i < sur10 && styles.segmentPlein]} />
                ))}
              </View>
              <BoutonPas
                onPress={() => changer(d.id, PAS)}
                desactive={sur10 === SEGMENTS}
                libelle={`Monter ${d.libelle}`}
                icone={<IconePlus taille={22} couleur={couleurs.sarcelle[700]} />}
              />
              <Text style={[typo.texteGras, styles.valeur]}>{sur10}/10</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function BoutonPas({
  onPress,
  desactive,
  libelle,
  icone,
}: {
  onPress: () => void;
  desactive: boolean;
  libelle: string;
  icone: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desactive}
      accessibilityRole="button"
      accessibilityLabel={libelle}
      style={({ pressed }) => [styles.pas, pressed && styles.pasAppuye, desactive && styles.pasDesactive]}
    >
      {icone}
    </Pressable>
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
  reglage: { flexDirection: 'row', alignItems: 'center', gap: espaces.s },
  barre: { flex: 1, flexDirection: 'row', gap: 3, height: 20 },
  segment: { flex: 1, borderRadius: 4, backgroundColor: couleurs.gris[200] },
  segmentPlein: { backgroundColor: couleurs.sarcelle[400] },
  pas: {
    width: formes.cibleTactile,
    height: formes.cibleTactile,
    borderRadius: formes.cibleTactile / 2,
    borderWidth: 2,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.menthe[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasAppuye: { backgroundColor: couleurs.menthe[200] },
  pasDesactive: { opacity: 0.4 },
  valeur: { width: 44, textAlign: 'right' },
});
