// Les images : Capy dit un mot ou une phrase, l'enfant touche le dessin ou la
// scène qui va avec (« Comprendre des mots », « Comprendre des phrases »).
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CarteEnonce, TuileImage, type EtatTuile } from '@/composants';
import { espaces } from '@/theme';

import { BoutonReecouter, useDicteeAuDemarrage } from './dicter';
import type { PropsJeuTexte } from './types';

export function JeuImages({ exercice, actif, onRepondre }: PropsJeuTexte) {
  const [choisie, setChoisie] = useState<string | null>(null);
  useDicteeAuDemarrage(exercice.lecture);

  const etat = (valeur: string): EtatTuile => {
    if (valeur !== choisie) return actif ? 'normal' : 'desactive';
    return valeur === exercice.reponse ? 'juste' : 'presque';
  };

  return (
    <View style={styles.jeu}>
      <CarteEnonce enonce={exercice.enonce} question={exercice.question} />
      {exercice.lecture ? (
        <BoutonReecouter
          lecture={exercice.lecture}
          titre={exercice.images === 'scenes' ? 'Réécouter la phrase' : 'Réécouter le mot'}
        />
      ) : null}
      <View style={styles.grille}>
        {exercice.choix.map((valeur, i) => {
          const scene = exercice.scenes?.[valeur];
          return (
            <View key={valeur} style={styles.cellule}>
              <TuileImage
                numero={i + 1}
                contenu={scene ? { scene } : { mot: valeur }}
                etat={etat(valeur)}
                onPress={() => {
                  if (!actif) return;
                  setChoisie(valeur);
                  onRepondre(valeur === exercice.reponse);
                }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: { gap: espaces.l },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.m },
  cellule: { flexBasis: '45%', flexGrow: 1 },
});
