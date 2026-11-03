// Mini-jeu « Le chemin de Capy » (repérage) : l'enfant écrit le chemin avec des
// flèches, et Capy avance sur le quadrillage à chaque flèche. Tous les chemins
// qui mènent à la bonne case sont justes, pas seulement le plus court.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { Bouton, CarteEnonce, SurfaceEnRelief } from '@/composants';
import {
  dansLaGrille,
  deplacer,
  FLECHES,
  lireChemin,
  memeCase,
  NOMS_FLECHES,
  type Fleche,
} from '@/exercices/modeles/quadrillage';
import { couleurs, espaces, formes } from '@/theme';

import type { PropsJeuTexte } from './types';

/** Au-delà, le chemin fait des détours : mieux vaut effacer et recommencer. */
export const FLECHES_MAX = 14;

export function JeuChemin({ exercice, actif, onRepondre }: PropsJeuTexte) {
  const [chemin, setChemin] = useState<Fleche[]>([]);
  const { typo, cible, ecart } = useThemeEnfant();
  const grille = exercice.illustration?.type === 'quadrillage' ? exercice.illustration : null;
  if (!grille?.depart) return null;
  const depart = grille.depart;
  const position = deplacer(depart, chemin);
  const arrivee = deplacer(depart, lireChemin(exercice.reponse));
  const peutAller = (f: Fleche) =>
    actif && chemin.length < FLECHES_MAX && dansLaGrille(deplacer(position, [f]), grille.colonnes, grille.lignes);

  return (
    <View style={[styles.jeu, { gap: ecart('l') }]}>
      {/* Capy avance sur la grille à chaque flèche. */}
      <CarteEnonce
        enonce={exercice.enonce}
        question={exercice.question}
        illustration={{ ...grille, depart: position }}
      />
      <View
        style={[styles.chemin, { minHeight: cible + 16 }]}
        accessibilityLabel={
          chemin.length > 0
            ? `Ton chemin : ${chemin.map((f) => NOMS_FLECHES[f]).join(', ')}`
            : 'Ton chemin est encore vide'
        }
      >
        <Text style={[typo.titre2, chemin.length === 0 && styles.vide]}>
          {chemin.length > 0 ? chemin.join(' ') : 'Touche les flèches.'}
        </Text>
      </View>
      <View style={[styles.fleches, { gap: ecart('s') }]}>
        {FLECHES.map((f) => (
          <SurfaceEnRelief
            key={f}
            onPress={() => peutAller(f) && setChemin((c) => [...c, f])}
            disabled={!peutAller(f)}
            accessibilityRole="button"
            accessibilityLabel={`Une case vers ${f === '↑' || f === '↓' ? 'le' : 'la'} ${NOMS_FLECHES[f]}`}
            accessibilityState={{ disabled: !peutAller(f) }}
            couleurFace={couleurs.menthe[100]}
            couleurRelief={couleurs.sarcelle[400]}
            couleurBordure={couleurs.sarcelle[400]}
            relief={formes.tuile.relief}
            rayon={formes.tuile.rayon}
            style={{ minWidth: Math.max(64, cible), minHeight: Math.max(64, cible) + formes.tuile.relief }}
            styleFace={[styles.fleche, !peutAller(f) && styles.estompe]}
          >
            <Text style={[typo.titre1, styles.texteFleche]}>{f}</Text>
          </SurfaceEnRelief>
        ))}
      </View>
      <View style={[styles.boutons, { gap: ecart('s') }]}>
        <Bouton
          titre="Effacer"
          variante="secondaire"
          pleineLargeur={false}
          desactive={!actif || chemin.length === 0}
          onPress={() => setChemin((c) => c.slice(0, -1))}
        />
        <Bouton
          titre="Valider"
          pleineLargeur={false}
          desactive={!actif || chemin.length === 0}
          onPress={() => onRepondre(memeCase(position, arrivee))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: {},
  chemin: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.sarcelle[400],
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: formes.carte.rayon,
    padding: espaces.s,
  },
  vide: { color: couleurs.encreDouce },
  fleches: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  fleche: { alignItems: 'center', justifyContent: 'center' },
  texteFleche: { color: couleurs.sarcelle[900] },
  estompe: { opacity: 0.4 },
  boutons: { flexDirection: 'row', justifyContent: 'center' },
});
