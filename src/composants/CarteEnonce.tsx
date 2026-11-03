import { StyleSheet, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { useExplications } from '@/accessibilite/explications';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import type { Illustration } from '@/exercices/types';
import { couleurs, formes } from '@/theme';

import { Dessin } from './Dessins';

interface PropsCarteEnonce {
  enonce: string;
  question?: string;
  /** Objets à compter, dessinés sous l'énoncé. */
  illustration?: Illustration;
}

/**
 * L'histoire du problème et sa question, en 18 px minimum (plus avec les réglages
 * de lecture). En maths, les mots difficiles s'expliquent au toucher. Les mots
 * importants de la question sont soulignés.
 */
export function CarteEnonce({ enonce, question, illustration }: PropsCarteEnonce) {
  const { ecart } = useThemeEnfant();
  const explications = useExplications();
  const commun = {
    variante: 'enonce' as const,
    coloration: true,
    motsExpliques: explications?.mots,
    onExpliquer: explications?.onExpliquer,
  };
  return (
    <View style={[styles.carte, { padding: ecart('l'), gap: ecart('s') }]}>
      <TexteAccessible texte={enonce} {...commun} />
      {illustration ? <Dessin illustration={illustration} /> : null}
      {question ? <TexteAccessible texte={question} couleur={couleurs.sarcelle[900]} motsCles {...commun} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
  },
});
