// Le schéma en barres d'un problème : le tout au-dessus, les morceaux dans la
// barre, le nombre cherché en jaune avec un point d'interrogation.
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { nb } from '@/exercices';
import { decrireSchema, longueurs, type Schema } from '@/exercices/schemas';
import { couleurs, espaces, formes } from '@/theme';

/** Au-delà, on dessine quelques parts, des points de suspension et la dernière. */
const PARTS_DESSINEES_MAX = 8;

const etiquette = (n: number | null) => (n === null ? '?' : nb(n));

function Morceau({ valeur, flex, pointille = false }: { valeur: number | null; flex: number; pointille?: boolean }) {
  const { typo } = useThemeEnfant();
  const cherche = valeur === null;
  return (
    <View style={[styles.morceau, { flex }, cherche && styles.cherche, pointille && styles.pointille]}>
      <Text
        style={[typo.texteGras, styles.texte, { color: cherche ? couleurs.jaune.texte : couleurs.encre }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {etiquette(valeur)}
      </Text>
    </View>
  );
}

/** L'accolade du tout, au-dessus (ou au-dessous) d'une barre. */
function Accolade({ valeur }: { valeur: number | null }) {
  const { typo } = useThemeEnfant();
  return (
    <View>
      <Text
        style={[
          typo.texteGras,
          styles.texte,
          valeur === null ? styles.chercheTexte : null,
          { color: valeur === null ? couleurs.jaune.texte : couleurs.sarcelle[900] },
        ]}
      >
        {etiquette(valeur)}
      </Text>
      <View style={styles.accolade} />
    </View>
  );
}

export function SchemaBarres({ schema }: { schema: Schema }) {
  const { typo } = useThemeEnfant();
  let contenu: ReactNode;
  if (schema.type === 'parties') {
    const l = longueurs(schema.parties, schema.tout);
    contenu = (
      <>
        <Accolade valeur={schema.tout} />
        <View style={styles.barre}>
          {schema.parties.map((p, i) => (
            <Morceau key={i} valeur={p} flex={l[i]} />
          ))}
        </View>
      </>
    );
  } else if (schema.type === 'comparaison') {
    const grand = schema.grand ?? (schema.petit ?? 0) + (schema.ecart ?? 0);
    const petit = schema.petit ?? grand - (schema.ecart ?? 0);
    const [lPetit, lEcart] = longueurs([petit, grand - petit], grand);
    contenu = (
      <>
        <View style={styles.barre}>
          <Morceau valeur={schema.grand} flex={1} />
        </View>
        <View style={styles.barre}>
          <Morceau valeur={schema.petit} flex={lPetit} />
          <Morceau valeur={schema.ecart} flex={lEcart} pointille />
        </View>
      </>
    );
  } else {
    const dessinees =
      schema.nombre <= PARTS_DESSINEES_MAX
        ? Array.from({ length: schema.nombre }, () => schema.parGroupe)
        : [...Array.from({ length: PARTS_DESSINEES_MAX - 2 }, () => schema.parGroupe), undefined, schema.parGroupe];
    contenu = (
      <>
        <Accolade valeur={schema.total} />
        <View style={styles.barre}>
          {dessinees.map((p, i) =>
            p === undefined ? (
              <View key={i} style={styles.suspension}>
                <Text style={[typo.texteGras, styles.texte]}>…</Text>
              </View>
            ) : (
              <Morceau key={i} valeur={p} flex={1} />
            ),
          )}
        </View>
        <Text style={[typo.petit, styles.texte]}>{nb(schema.nombre)} parts égales</Text>
      </>
    );
  }
  return (
    <View style={styles.schema} accessible accessibilityLabel={decrireSchema(schema)}>
      {contenu}
    </View>
  );
}

const styles = StyleSheet.create({
  schema: { gap: espaces.xs, width: '100%' },
  barre: { flexDirection: 'row', minHeight: 44 },
  morceau: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: couleurs.menthe[100],
    borderColor: couleurs.sarcelle[700],
    borderWidth: 2,
    marginRight: -2,
    paddingHorizontal: 2,
  },
  cherche: { backgroundColor: couleurs.jaune[400], borderColor: couleurs.jaune[600] },
  pointille: { borderStyle: 'dashed' },
  suspension: { width: 28, alignItems: 'center', justifyContent: 'center' },
  texte: { textAlign: 'center' },
  chercheTexte: {
    alignSelf: 'center',
    backgroundColor: couleurs.jaune[400],
    borderRadius: formes.pilule,
    paddingHorizontal: espaces.s,
    overflow: 'hidden',
  },
  accolade: {
    height: 10,
    borderColor: couleurs.sarcelle[900],
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
});
