// C'est bien ça ? Capy dit un mot ou une phrase et montre une seule image :
// l'enfant dit si elle correspond (« Comprendre des mots », « Comprendre des
// phrases »). L'image est la bonne une fois sur deux, de façon reproductible.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CarteEnonce, SceneDessinee, TuileReponse, type EtatTuile } from '@/composants';
import { imageDe } from '@/contenu/imagier';
import { creerAlea } from '@/exercices';
import type { ExerciceTexte } from '@/exercices/types';
import { couleurs, espaces, formes } from '@/theme';

import { BoutonReecouter, useDicteeAuDemarrage } from './dicter';
import type { PropsJeuTexte } from './types';

/** Le choix montré : la bonne réponse, ou la première erreur typique. */
export function imageMontree(ex: ExerciceTexte): { valeur: string; juste: boolean } {
  const juste = creerAlea(ex.graine).suivant() < 0.5 || ex.distracteurs.length === 0;
  return juste ? { valeur: ex.reponse, juste } : { valeur: ex.distracteurs[0].valeur, juste };
}

export function JeuOuiNon({ exercice, actif, onRepondre }: PropsJeuTexte) {
  const [choisie, setChoisie] = useState<'Oui' | 'Non' | null>(null);
  useDicteeAuDemarrage(exercice.lecture);
  const montree = imageMontree(exercice);
  const bonne = montree.juste ? 'Oui' : 'Non';
  const scene = exercice.scenes?.[montree.valeur];

  const etat = (valeur: 'Oui' | 'Non'): EtatTuile => {
    if (valeur !== choisie) return actif ? 'normal' : 'desactive';
    return valeur === bonne ? 'juste' : 'presque';
  };

  return (
    <View style={styles.jeu}>
      <CarteEnonce enonce={exercice.enonce} question={'L’image montre-t-elle ce que dit Capy ?'} />
      {exercice.lecture ? (
        <BoutonReecouter
          lecture={exercice.lecture}
          titre={exercice.images === 'scenes' ? 'Réécouter la phrase' : 'Réécouter le mot'}
        />
      ) : null}
      <View style={styles.image} accessible accessibilityLabel="L’image de Capy">
        {scene ? (
          <View style={styles.scene}>
            <SceneDessinee scene={scene} />
          </View>
        ) : (
          <Text style={styles.dessin} importantForAccessibility="no">
            {imageDe(montree.valeur)}
          </Text>
        )}
      </View>
      <View style={styles.grille}>
        {(['Oui', 'Non'] as const).map((valeur) => (
          <View key={valeur} style={styles.cellule}>
            <TuileReponse
              libelle={valeur}
              etat={etat(valeur)}
              coloration={false}
              onPress={() => {
                if (!actif) return;
                setChoisie(valeur);
                onRepondre(valeur === bonne);
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
  image: {
    alignItems: 'center',
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.m,
  },
  scene: { width: '70%', maxWidth: 280 },
  dessin: { fontSize: 96, lineHeight: 120, textAlign: 'center' },
  grille: { flexDirection: 'row', gap: espaces.m },
  cellule: { flex: 1 },
});
