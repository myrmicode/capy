// Le bon schéma : avant de calculer, on choisit le dessin en barres qui raconte
// l'histoire (le tout et ses parties, deux barres à comparer, des parts égales).
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CarteEnonce, SchemaBarres, SurfaceEnRelief } from '@/composants';
import { COULEURS_TUILE, type EtatTuile } from '@/composants/TuileReponse';
import { decrireSchema, schemasAuChoix } from '@/exercices/schemas';
import { espaces, formes } from '@/theme';

import type { PropsJeuNombre } from './types';

export function JeuSchema({ exercice, actif, onRepondre }: PropsJeuNombre) {
  const [choisi, setChoisi] = useState<number | null>(null);
  const choix = useMemo(() => schemasAuChoix(exercice), [exercice]);
  if (!choix) return null;

  const etat = (i: number): EtatTuile => {
    if (i !== choisi) return actif ? 'normal' : 'desactive';
    return i === choix.bon ? 'juste' : 'presque';
  };

  return (
    <View style={styles.jeu}>
      <CarteEnonce enonce={exercice.enonce} question={exercice.question} />
      {choix.schemas.map((s, i) => {
        const c = COULEURS_TUILE[etat(i)];
        return (
          <SurfaceEnRelief
            key={i}
            onPress={() => {
              if (!actif) return;
              setChoisi(i);
              onRepondre(i === choix.bon);
            }}
            disabled={!actif && i !== choisi}
            accessibilityRole="button"
            accessibilityLabel={`Schéma ${i + 1}. ${decrireSchema(s)}`}
            couleurFace={c.face}
            couleurRelief={c.relief}
            couleurBordure={c.bordure}
            relief={formes.tuile.relief}
            rayon={formes.tuile.rayon}
            styleFace={styles.face}
          >
            <SchemaBarres schema={s} />
          </SurfaceEnRelief>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: { gap: espaces.m },
  face: { padding: espaces.m },
});
