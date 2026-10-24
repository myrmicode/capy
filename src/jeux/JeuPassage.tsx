// La bonne phrase : le texte s'affiche phrase par phrase, l'enfant touche celle
// qui répond à la consigne. Les phrases restent dans l'ordre du texte.
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import { couleurs, espaces, formes } from '@/theme';

import type { PropsJeuTexte } from './types';

type EtatPhrase = 'normal' | 'juste' | 'presque' | 'desactive';

const COULEURS: Record<EtatPhrase, { fond: string; bordure: string; texte: string }> = {
  normal: {
    fond: couleurs.blanc,
    bordure: couleurs.bordure,
    texte: couleurs.encre,
  },
  juste: {
    fond: couleurs.menthe[500],
    bordure: couleurs.menthe[500],
    texte: couleurs.encre,
  },
  presque: {
    fond: couleurs.brun[100],
    bordure: couleurs.brun[600],
    texte: couleurs.encre,
  },
  desactive: {
    fond: couleurs.blanc,
    bordure: couleurs.bordure,
    texte: couleurs.encre,
  },
};

export function JeuPassage({ exercice, actif, onRepondre }: PropsJeuTexte) {
  const [choisie, setChoisie] = useState<string | null>(null);
  const phrases = exercice.phrases ?? [];
  const { cible, ecart } = useThemeEnfant();

  const etat = (p: string): EtatPhrase => {
    if (p !== choisie) return actif ? 'normal' : 'desactive';
    return p === exercice.reponse ? 'juste' : 'presque';
  };

  return (
    <View style={styles.jeu}>
      <View style={styles.consigne}>
        <TexteAccessible texte={exercice.question} variante="enonce" couleur={couleurs.sarcelle[900]} coloration />
      </View>
      <View style={{ gap: ecart('s') }}>
        {phrases.map((p) => {
          const c = COULEURS[etat(p)];
          return (
            <Pressable
              key={p}
              disabled={!actif}
              onPress={() => {
                setChoisie(p);
                onRepondre(p === exercice.reponse);
              }}
              accessibilityRole="button"
              accessibilityLabel={p}
              style={({ pressed }) => [
                styles.phrase,
                { minHeight: cible },
                { backgroundColor: c.fond, borderColor: c.bordure },
                pressed && actif && styles.appuyee,
              ]}
            >
              <TexteAccessible texte={p} variante="enonce" couleur={c.texte} coloration={etat(p) === 'normal'} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: { gap: espaces.l },
  consigne: {
    backgroundColor: couleurs.menthe[100],
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
  },
  phrase: {
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: formes.tuile.rayon,
    paddingHorizontal: espaces.l,
    paddingVertical: espaces.m,
  },
  appuyee: { backgroundColor: couleurs.menthe[100] },
});
