// Tous les textes que l'enfant lit passent par ce composant : il applique la
// police, la taille et les espacements choisis, la coloration syllabique,
// l'alternance des lignes, le surlignage du mot lu par Capy (karaoké) et les
// mots expliqués au toucher.
import { useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextLayoutEvent, type TextStyle } from 'react-native';

import { useMotLu } from '@/jeux/retours';
import { couleurs } from '@/theme';

import { useThemeEnfant } from './contexte';
import { decouperMot, decouperTexte } from './syllabes';
import { FOND_LIGNE_ALTERNEE, type VarianteTexte } from './theme';

/** Espace fine ajoutée entre les mots (1/6 em, WCAG 1.4.12 demande 0,16 em). */
const ESPACE_MOTS = ' ';

interface PropsTexteAccessible {
  texte: string;
  variante?: VarianteTexte;
  style?: StyleProp<TextStyle>;
  /** Couleur du texte (sinon celle de la variante). */
  couleur?: string;
  /** Coloration syllabique autorisée pour ce texte (contenu des exercices). */
  coloration?: boolean;
  /** Passage mis en valeur (le mot dont on demande la nature, par exemple). */
  surligne?: { debut: number; fin: number };
  /** Mots qui s'expliquent au toucher (vocabulaire des énoncés de maths). */
  motsExpliques?: Readonly<Record<string, string>>;
  onExpliquer?: (mot: string, explication: string) => void;
}

export function TexteAccessible({
  texte,
  variante = 'texte',
  style,
  couleur,
  coloration = false,
  surligne,
  motsExpliques,
  onExpliquer,
}: PropsTexteAccessible) {
  const theme = useThemeEnfant();
  const { reglages } = theme;
  const motLu = useMotLu(texte);
  const [lignes, setLignes] = useState<TextLayoutEvent['nativeEvent']['lines']>([]);
  const colorer = coloration && reglages.syllabes;
  const expliquer = reglages.motsExpliques && motsExpliques !== undefined;

  const jetons = decouperTexte(texte);
  const contenu = jetons.map((j, i) => {
    const fin = j.debut + j.texte.length;
    if (!j.estMot) {
      return <Text key={i}>{theme.espaceMots ? j.texte.replace(/ /g, ` ${ESPACE_MOTS}`) : j.texte}</Text>;
    }
    const lu = motLu !== null && motLu >= j.debut && motLu < fin;
    const enValeur = surligne !== undefined && j.debut < surligne.fin && fin > surligne.debut;
    const explication = expliquer ? motsExpliques[j.texte.toLowerCase()] : undefined;
    const morceaux = colorer ? decouperMot(j.texte) : null;
    const styleMot = [enValeur && styles.surligne, explication !== undefined && styles.motExplique, lu && styles.motLu];
    return (
      <Text
        key={i}
        style={styleMot}
        {...(explication !== undefined && onExpliquer
          ? {
              onPress: () => onExpliquer(j.texte, explication),
              accessibilityRole: 'button' as const,
              accessibilityHint: 'Explique ce mot',
            }
          : {})}
      >
        {morceaux
          ? morceaux.map((m, k) => (
              <Text
                key={k}
                style={
                  lu
                    ? undefined
                    : {
                        color: m.muette ? theme.couleurMuette : theme.couleursSyllabes[m.syllabe % 2],
                      }
                }
              >
                {m.texte}
              </Text>
            ))
          : j.texte}
      </Text>
    );
  });

  const texteRendu = (
    <Text
      style={[theme.typo[variante], couleur ? { color: couleur } : null, style]}
      accessibilityLabel={texte}
      onTextLayout={reglages.alternanceLignes ? (e) => setLignes(e.nativeEvent.lines) : undefined}
    >
      {contenu}
    </Text>
  );

  if (!reglages.alternanceLignes) return texteRendu;
  // Une ligne sur deux reçoit un fond très légèrement plus soutenu, derrière le texte.
  return (
    <View>
      {lignes.map((l, i) =>
        i % 2 === 1 ? (
          <View key={i} pointerEvents="none" style={[styles.bande, { top: l.y, height: l.height }]} />
        ) : null,
      )}
      {texteRendu}
    </View>
  );
}

const styles = StyleSheet.create({
  surligne: {
    backgroundColor: couleurs.jaune[400],
    color: couleurs.jaune.texte,
  },
  motExplique: { backgroundColor: couleurs.menthe[100] },
  motLu: { backgroundColor: couleurs.jaune[400], color: couleurs.jaune.texte },
  bande: {
    position: 'absolute',
    left: -4,
    right: -4,
    backgroundColor: FOND_LIGNE_ALTERNEE,
    borderRadius: 4,
  },
});
