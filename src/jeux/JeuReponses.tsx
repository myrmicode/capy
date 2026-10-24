// Jeu de base : l'énoncé et des tuiles de réponse (nombres ou mots).
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CarteEnonce, TuileReponse, type EtatTuile } from '@/composants';
import { espaces } from '@/theme';

import type { PropsJeu } from './types';

export function JeuReponses({ exercice, actif, onRepondre }: PropsJeu) {
  const [choisie, setChoisie] = useState<number | string | null>(null);
  const choix: readonly (number | string)[] = exercice.choix;

  const etat = (valeur: number | string): EtatTuile => {
    if (valeur !== choisie) return actif ? 'normal' : 'desactive';
    return valeur === exercice.reponse ? 'juste' : 'presque';
  };

  return (
    <View style={styles.jeu}>
      <CarteEnonce enonce={exercice.enonce} question={exercice.question} />
      <View style={styles.grille}>
        {choix.map((valeur) => (
          <View key={valeur} style={typeof valeur === 'string' && valeur.length > 12 ? styles.ligneEntiere : styles.cellule}>
            <TuileReponse
              libelle={valeur}
              etat={etat(valeur)}
              onPress={() => {
                if (!actif) return;
                setChoisie(valeur);
                onRepondre(valeur === exercice.reponse);
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: { gap: espaces.l },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.m },
  cellule: { flexBasis: '45%', flexGrow: 1 },
  ligneEntiere: { flexBasis: '100%' },
});
