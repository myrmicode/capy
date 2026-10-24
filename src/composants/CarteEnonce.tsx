import { StyleSheet, Text, View } from 'react-native';

import { couleurs, espaces, formes, typo } from '@/theme';

interface PropsCarteEnonce {
  enonce: string;
  question?: string;
}

/** L'histoire du problème et sa question, en 18 px minimum. */
export function CarteEnonce({ enonce, question }: PropsCarteEnonce) {
  return (
    <View style={styles.carte}>
      <Text style={typo.enonce}>{enonce}</Text>
      {question ? <Text style={[typo.enonce, styles.question]}>{question}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
    gap: espaces.s,
  },
  question: { color: couleurs.sarcelle[900], fontSize: 19 },
});
