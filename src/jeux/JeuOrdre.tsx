// Mini-jeu « La phrase en désordre » (français) : les mots d'une phrase sont
// mélangés. L'enfant les touche dans l'ordre pour reconstruire la phrase ; il
// touche un mot de la phrase pour le remettre en bas. Puis il valide.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import { Bouton, SurfaceEnRelief } from '@/composants';
import { couleurs, espaces, formes } from '@/theme';

import type { PropsJeuTexte } from './types';

export function JeuOrdre({ exercice, actif, onRepondre }: PropsJeuTexte) {
  const mots = exercice.motsEnDesordre ?? exercice.reponse.split(' ');
  // Positions (dans « mots ») des mots déjà placés, dans l'ordre de la phrase.
  const [places, setPlaces] = useState<number[]>([]);
  const { typo, cible, ecart } = useThemeEnfant();
  const restants = mots.map((_, i) => i).filter((i) => !places.includes(i));
  const phrase = places.map((i) => mots[i]).join(' ');

  const tuile = (i: number, dansLaPhrase: boolean) => (
    <SurfaceEnRelief
      key={i}
      onPress={() => {
        if (!actif) return;
        setPlaces((p) => (dansLaPhrase ? p.filter((x) => x !== i) : [...p, i]));
      }}
      disabled={!actif}
      accessibilityRole="button"
      accessibilityLabel={dansLaPhrase ? `Retirer « ${mots[i]} »` : `Placer « ${mots[i]} »`}
      couleurFace={dansLaPhrase ? couleurs.menthe[100] : couleurs.blanc}
      couleurRelief={dansLaPhrase ? couleurs.sarcelle[400] : couleurs.caramel[500]}
      couleurBordure={dansLaPhrase ? couleurs.sarcelle[400] : couleurs.caramel[500]}
      relief={formes.tuile.relief}
      rayon={formes.tuile.rayon}
      style={{ minHeight: Math.max(52, cible) + formes.tuile.relief, minWidth: cible }}
      styleFace={styles.face}
    >
      <TexteAccessible texte={mots[i]} variante="enonce" coloration={!dansLaPhrase} />
    </SurfaceEnRelief>
  );

  return (
    <View style={[styles.jeu, { gap: ecart('l') }]}>
      {/* La consigne (« Touche les mots dans l'ordre ») est déjà au-dessus du jeu : pas de carte en double. */}
      <View
        style={[styles.phrase, { gap: ecart('s'), minHeight: cible + 40 }]}
        accessibilityLabel={places.length > 0 ? `Ta phrase : ${phrase}` : 'Ta phrase est encore vide'}
      >
        {places.length === 0 ? (
          <Text style={[typo.texte, styles.vide]}>Touche les mots dans l’ordre.</Text>
        ) : (
          places.map((i) => tuile(i, true))
        )}
      </View>
      <View style={[styles.reserve, { gap: ecart('s') }]}>{restants.map((i) => tuile(i, false))}</View>
      <Bouton
        titre="Valider"
        desactive={!actif || restants.length > 0}
        onPress={() => onRepondre(phrase === exercice.reponse)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: {},
  phrase: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.sarcelle[400],
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: formes.carte.rayon,
    padding: espaces.m,
  },
  vide: { color: couleurs.encreDouce },
  reserve: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: couleurs.creme,
    borderRadius: formes.carte.rayon,
    padding: espaces.m,
  },
  face: { paddingHorizontal: espaces.m, paddingVertical: espaces.s },
});
