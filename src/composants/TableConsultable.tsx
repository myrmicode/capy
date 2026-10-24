// Table d'addition ou de multiplication, consultable pendant les problèmes :
// on évalue alors le raisonnement, pas la mémoire des résultats.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { couleurs, espaces, formes } from '@/theme';

type Operation = 'addition' | 'multiplication';
const VALEURS = Array.from({ length: 10 }, (_, i) => i + 1);

export function TableConsultable() {
  const [operation, setOperation] = useState<Operation>('multiplication');
  const { typo, cible } = useThemeEnfant();
  const signe = operation === 'addition' ? '+' : '×';
  const calculer = (a: number, b: number) => (operation === 'addition' ? a + b : a * b);

  return (
    <View style={styles.cadre}>
      <View style={styles.onglets} accessibilityRole="tablist">
        {(['multiplication', 'addition'] as const).map((op) => (
          <Pressable
            key={op}
            onPress={() => setOperation(op)}
            accessibilityRole="tab"
            accessibilityState={{ selected: operation === op }}
            style={[styles.onglet, { minHeight: cible }, operation === op && styles.ongletActif]}
          >
            <Text style={[typo.texteGras, operation === op && styles.texteActif]}>
              {op === 'multiplication' ? 'Table de multiplication' : 'Table d’addition'}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView horizontal>
        <View accessibilityLabel={`Table ${operation === 'addition' ? 'd’addition' : 'de multiplication'} de 1 à 10`}>
          <View style={styles.ligne}>
            <Text style={[typo.texteGras, styles.case, styles.entete]}>{signe}</Text>
            {VALEURS.map((b) => (
              <Text key={b} style={[typo.texteGras, styles.case, styles.entete]}>
                {b}
              </Text>
            ))}
          </View>
          {VALEURS.map((a) => (
            <View key={a} style={styles.ligne}>
              <Text style={[typo.texteGras, styles.case, styles.entete]}>{a}</Text>
              {VALEURS.map((b) => (
                <Text key={b} style={[typo.texte, styles.case, (a + b) % 2 === 0 && styles.caseAlternee]}>
                  {calculer(a, b)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: {
    gap: espaces.m,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.m,
  },
  onglets: { flexDirection: 'row', gap: espaces.s, flexWrap: 'wrap' },
  onglet: {
    justifyContent: 'center',
    paddingHorizontal: espaces.m,
    borderRadius: formes.pilule,
    borderWidth: 2,
    borderColor: couleurs.bordure,
  },
  ongletActif: {
    backgroundColor: couleurs.menthe[100],
    borderColor: couleurs.sarcelle[700],
  },
  texteActif: { color: couleurs.sarcelle[900] },
  ligne: { flexDirection: 'row' },
  case: { minWidth: 44, paddingVertical: espaces.xs, textAlign: 'center' },
  entete: {
    backgroundColor: couleurs.menthe[100],
    color: couleurs.sarcelle[900],
  },
  caseAlternee: { backgroundColor: couleurs.fondPage },
});
