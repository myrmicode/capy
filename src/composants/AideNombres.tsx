// Aide visuelle en calcul : chaque nombre de l'énoncé est montré en centaines
// (plaques), dizaines (barres) et unités (cubes), comme le matériel de la classe.
import { StyleSheet, Text, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { nb } from '@/exercices';
import { couleurs, espaces, formes } from '@/theme';

const CUBE = 12;

/** Décompose un nombre (jusqu'à 9 999) en centaines, dizaines et unités. */
export function decomposer(n: number): {
  centaines: number;
  dizaines: number;
  unites: number;
} {
  return {
    centaines: Math.floor(n / 100),
    dizaines: Math.floor((n % 100) / 10),
    unites: n % 10,
  };
}

export function AideNombres({ nombres }: { nombres: readonly number[] }) {
  const { typo } = useThemeEnfant();
  const affiches = nombres.filter((n) => Number.isInteger(n) && n > 0 && n < 10000);
  if (affiches.length === 0) return null;
  return (
    <View style={styles.cadre} accessibilityLabel="Aide : les nombres en centaines, dizaines et unités">
      {affiches.map((n, i) => {
        const { centaines, dizaines, unites } = decomposer(n);
        return (
          <View key={`${n}-${i}`} style={styles.nombre}>
            <Text style={[typo.titre3, styles.valeur]}>{nb(n)}</Text>
            <View
              style={styles.blocs}
              accessible
              accessibilityLabel={`${centaines} centaines, ${dizaines} dizaines, ${unites} unités`}
            >
              {centaines > 0 ? (
                <View style={styles.groupe}>
                  {Array.from({ length: Math.min(centaines, 9) }, (_, k) => (
                    <View key={k} style={styles.plaque} />
                  ))}
                  {centaines > 9 ? <Text style={typo.petit}>×{centaines}</Text> : null}
                </View>
              ) : null}
              {dizaines > 0 ? (
                <View style={styles.groupe}>
                  {Array.from({ length: dizaines }, (_, k) => (
                    <View key={k} style={styles.barre} />
                  ))}
                </View>
              ) : null}
              {unites > 0 ? (
                <View style={[styles.groupe, styles.cubes]}>
                  {Array.from({ length: unites }, (_, k) => (
                    <View key={k} style={styles.cube} />
                  ))}
                </View>
              ) : null}
            </View>
            <Text style={typo.petit}>
              {[centaines && `${centaines} c`, dizaines && `${dizaines} d`, unites && `${unites} u`]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaces.l,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.m,
  },
  nombre: { gap: espaces.xs, minWidth: 120 },
  valeur: { color: couleurs.sarcelle[900] },
  blocs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: espaces.s,
    flexWrap: 'wrap',
  },
  groupe: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  cubes: { maxWidth: 3 * (CUBE + 2) },
  plaque: {
    width: CUBE * 3,
    height: CUBE * 3,
    backgroundColor: couleurs.caramel[500],
    borderRadius: 3,
  },
  barre: {
    width: CUBE / 1.5,
    height: CUBE * 3,
    backgroundColor: couleurs.sarcelle[400],
    borderRadius: 2,
  },
  cube: {
    width: CUBE,
    height: CUBE,
    backgroundColor: couleurs.jaune[400],
    borderRadius: 2,
  },
});
