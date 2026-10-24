// Mini-jeu « Les wagons de la phrase » (français) : la phrase est un petit train,
// chaque wagon porte un mot ou un groupe de mots. L'enfant touche le bon wagon
// (le verbe, le groupe sujet, l'adjectif…).
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SurfaceEnRelief } from '@/composants';
import { couleurs, espaces, formes, typo } from '@/theme';

import type { PropsJeuTexte } from './types';

export function JeuWagons({ exercice, actif, onRepondre }: PropsJeuTexte) {
  const [touche, setTouche] = useState<number | null>(null);
  const segments = exercice.segments ?? exercice.choix.map((texte) => ({ texte }));

  return (
    <View style={styles.jeu}>
      <View style={styles.consigne}>
        <Text style={[typo.enonce, styles.question]}>{exercice.question}</Text>
      </View>
      <View style={styles.train} accessibilityLabel={`Phrase : ${exercice.enonce}`}>
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
                style={styles.caisse}
                styleFace={styles.faceCaisse}
              >
                <Text style={[typo.enonce, choisi && !juste && { color: couleurs.brun[800] }]}>{s.texte}</Text>
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
  question: { color: couleurs.sarcelle[900] },
  train: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaces.s,
    rowGap: espaces.l,
    backgroundColor: couleurs.creme,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
  },
  wagon: { alignItems: 'stretch' },
  caisse: { minHeight: 60 + formes.tuile.relief, minWidth: formes.cibleTactile + 16 },
  faceCaisse: { paddingHorizontal: espaces.m, paddingVertical: espaces.s },
  roues: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -4 },
  roue: { width: 14, height: 14, borderRadius: 7, backgroundColor: couleurs.brun[800] },
});
