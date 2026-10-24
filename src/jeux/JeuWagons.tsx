// Mini-jeu « Les wagons de la phrase » (français) : la phrase est un petit train,
// chaque wagon porte un mot ou un groupe de mots. L'enfant touche le bon wagon
// (le verbe, le groupe sujet, l'adjectif…).
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import { SurfaceEnRelief } from '@/composants';
import { couleurs, espaces, formes } from '@/theme';

import type { PropsJeuTexte } from './types';

export function JeuWagons({ exercice, actif, onRepondre }: PropsJeuTexte) {
  const [touche, setTouche] = useState<number | null>(null);
  const segments = exercice.segments ?? exercice.choix.map((texte) => ({ texte }));
  const { cible, ecart } = useThemeEnfant();

  return (
    <View style={styles.jeu}>
      <View style={styles.consigne}>
        <TexteAccessible texte={exercice.question} variante="enonce" couleur={couleurs.sarcelle[900]} coloration />
      </View>
      <View
        style={[styles.train, { gap: ecart('s'), rowGap: ecart('l') }]}
        accessibilityLabel={`Phrase : ${exercice.enonce}`}
      >
        {segments.map((s, i) => {
          const choisi = touche === i;
          const juste = choisi && s.texte === exercice.reponse;
          const face = choisi ? (juste ? couleurs.menthe[500] : couleurs.brun[100]) : couleurs.blanc;
          const relief = choisi ? (juste ? couleurs.sarcelle[500] : couleurs.brun[600]) : couleurs.caramel[500];
          return (
            <View key={i} style={styles.wagon}>
              <SurfaceEnRelief
                onPress={() => {
                  if (!actif) return;
                  setTouche(i);
                  onRepondre(s.texte === exercice.reponse);
                }}
                disabled={!actif}
                accessibilityRole="button"
                accessibilityLabel={s.texte}
                couleurFace={face}
                couleurRelief={relief}
                couleurBordure={choisi ? relief : couleurs.caramel[500]}
                relief={formes.tuile.relief}
                rayon={formes.tuile.rayon}
                style={[
                  {
                    minHeight: Math.max(60, cible) + formes.tuile.relief,
                    minWidth: cible + 16,
                  },
                ]}
                styleFace={styles.faceCaisse}
              >
                <TexteAccessible
                  texte={s.texte}
                  variante="enonce"
                  couleur={choisi && !juste ? couleurs.brun[800] : undefined}
                  coloration={!choisi}
                />
              </SurfaceEnRelief>
              <View style={styles.roues} accessible={false}>
                <View style={styles.roue} />
                <View style={styles.roue} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: { gap: espaces.l },
  consigne: {
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
  },
  train: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: couleurs.creme,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
  },
  wagon: { alignItems: 'stretch' },
  faceCaisse: { paddingHorizontal: espaces.m, paddingVertical: espaces.s },
  roues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -4,
  },
  roue: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: couleurs.brun[800],
  },
});
