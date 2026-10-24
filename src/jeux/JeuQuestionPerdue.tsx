// Mini-jeu « La question perdue » : l'histoire est là, mais sans sa question.
// L'enfant choisit la question à laquelle on peut répondre avec ses nombres.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CarteEnonce, TuileReponse, type EtatTuile } from '@/composants';
import { espaces } from '@/theme';

import type { PropsJeuNombre } from './types';

export function JeuQuestionPerdue({ exercice, actif, onRepondre }: PropsJeuNombre) {
  const [choisie, setChoisie] = useState<string | null>(null);
  const questions = exercice.questionsAuChoix ?? [exercice.question];

  const etat = (q: string): EtatTuile => {
    if (q !== choisie) return actif ? 'normal' : 'desactive';
    return q === exercice.question ? 'juste' : 'presque';
  };

  return (
    <View style={styles.jeu}>
      <CarteEnonce enonce={exercice.enonce} />
      <View style={styles.questions}>
        {questions.map((q) => (
          <TuileReponse
            key={q}
            libelle={q}
            etat={etat(q)}
            hauteur={64}
            onPress={() => {
              if (!actif) return;
              setChoisie(q);
              onRepondre(q === exercice.question);
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: { gap: espaces.l },
  questions: { gap: espaces.m },
});
