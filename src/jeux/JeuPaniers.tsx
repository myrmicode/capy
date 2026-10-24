// Mini-jeu « Les paniers » (français) : un mot est mis en couleur dans la phrase ;
// l'enfant le range dans le bon panier (nom, verbe, adjectif, déterminant).
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import { SurfaceEnRelief } from '@/composants';
import { couleurs, espaces, formes } from '@/theme';

import type { PropsJeuTexte } from './types';

export function JeuPaniers({ exercice, actif, onRepondre }: PropsJeuTexte) {
  const [choisi, setChoisi] = useState<string | null>(null);
  const segments = exercice.segments ?? [{ texte: exercice.enonce }];
  const paniers = exercice.categories ?? exercice.choix;
  const mot = segments.find((s) => s.surligne)?.texte;
  const { typo, ecart } = useThemeEnfant();
  // Position du mot en couleur dans la phrase (segments séparés par une espace).
  const avant = segments
    .slice(
      0,
      segments.findIndex((s) => s.surligne),
    )
    .map((s) => s.texte + ' ')
    .join('');
  const surligne = mot ? { debut: avant.length, fin: avant.length + mot.length } : undefined;

  return (
    <View style={styles.jeu}>
      <View style={styles.carte}>
        <TexteAccessible texte={exercice.enonce} variante="enonce" surligne={surligne} coloration />
        <TexteAccessible texte={exercice.question} variante="enonce" couleur={couleurs.sarcelle[900]} coloration />
      </View>

      <View style={[styles.paniers, { gap: ecart('m') }]}>
        {paniers.map((p) => {
          const estChoisi = choisi === p;
          const juste = estChoisi && p === exercice.reponse;
          return (
            <View key={p} style={styles.cellule}>
              <SurfaceEnRelief
                onPress={() => {
                  if (!actif) return;
                  setChoisi(p);
                  onRepondre(p === exercice.reponse);
                }}
                disabled={!actif}
                accessibilityRole="button"
                accessibilityLabel={`Panier ${p}${mot ? `, pour ranger « ${mot} »` : ''}`}
                couleurFace={estChoisi ? (juste ? couleurs.menthe[500] : couleurs.brun[100]) : couleurs.caramel[100]}
                couleurRelief={
                  estChoisi ? (juste ? couleurs.sarcelle[500] : couleurs.brun[600]) : couleurs.caramel[500]
                }
                couleurBordure={
                  estChoisi ? (juste ? couleurs.sarcelle[500] : couleurs.brun[600]) : couleurs.caramel[500]
                }
                relief={formes.tuile.relief}
                rayon={formes.carte.rayon}
                style={styles.panier}
                styleFace={styles.facePanier}
              >
                <View style={styles.anse} />
                <Text style={[typo.titre3, styles.etiquette, estChoisi && !juste && { color: couleurs.brun[800] }]}>
                  {p}
                </Text>
              </SurfaceEnRelief>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: { gap: espaces.l },
  carte: {
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
    gap: espaces.s,
  },
  paniers: { flexDirection: 'row', flexWrap: 'wrap' },
  cellule: { flexBasis: '45%', flexGrow: 1 },
  panier: { minHeight: 96 + formes.tuile.relief },
  facePanier: { paddingTop: espaces.s },
  anse: {
    position: 'absolute',
    top: -2,
    width: 56,
    height: 22,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 4,
    borderBottomWidth: 0,
    borderColor: couleurs.caramel[500],
  },
  etiquette: { color: couleurs.brun[800] },
});
