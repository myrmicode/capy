// Mini-jeu « La caisse » (mathématiques) : l'enfant pose des pièces et des
// billets sur le plateau pour faire la somme demandée (prix à payer, monnaie à
// rendre), puis valide. Toucher une pièce du plateau la retire.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { Bouton, CarteEnonce } from '@/composants';
import { nb } from '@/exercices';
import { couleurs, espaces, formes } from '@/theme';

import type { PropsJeuNombre } from './types';

/** Pièces et billets proposés, en euros. */
const VALEURS = [1, 2, 5, 10, 20, 50] as const;
type Valeur = (typeof VALEURS)[number];
const estBillet = (v: Valeur) => v >= 5;

function Monnaie({ valeur, petite = false }: { valeur: Valeur; petite?: boolean }) {
  const { typo } = useThemeEnfant();
  const billet = estBillet(valeur);
  const taille = petite ? 0.7 : 1;
  return (
    <View
      style={[
        billet ? styles.billet : styles.piece,
        billet
          ? { width: 76 * taille, height: 44 * taille, backgroundColor: COULEURS_BILLETS[valeur] }
          : {
              width: 52 * taille,
              height: 52 * taille,
              borderRadius: 26 * taille,
              backgroundColor: valeur === 2 ? '#e9c46a' : '#d9b56a',
            },
      ]}
    >
      <Text style={[typo.texteGras, styles.valeur, petite && { fontSize: 13 }]}>{valeur} €</Text>
    </View>
  );
}

const COULEURS_BILLETS: Partial<Record<Valeur, string>> = {
  5: '#c9d6df',
  10: '#f4a7a3',
  20: '#9ec5e8',
  50: '#f6c68b',
};

export function JeuCaisse({ exercice, actif, onRepondre }: PropsJeuNombre) {
  const [plateau, setPlateau] = useState<Valeur[]>([]);
  const { typo, cible, ecart } = useThemeEnfant();
  const total = plateau.reduce((s, v) => s + v, 0);
  // Pas de billet plus grand que la réponse au niveau visé : ce serait une fausse piste inutile.
  const proposees = VALEURS.filter((v) => v <= Math.max(10, exercice.reponse));

  return (
    <View style={[styles.jeu, { gap: ecart('m') }]}>
      <CarteEnonce enonce={exercice.enonce} question={exercice.question} />

      <View style={[styles.plateau, { minHeight: cible + 48 }]} accessibilityLabel={`Sur le plateau : ${nb(total)} €`}>
        {plateau.length === 0 ? (
          <Text style={[typo.texte, styles.vide]}>Touche les pièces et les billets pour les poser ici.</Text>
        ) : (
          plateau.map((v, i) => (
            <Pressable
              key={i}
              onPress={() => setPlateau((p) => p.filter((_, j) => j !== i))}
              disabled={!actif}
              accessibilityRole="button"
              accessibilityLabel={`Retirer ${v} €`}
              hitSlop={4}
            >
              <Monnaie valeur={v} petite />
            </Pressable>
          ))
        )}
      </View>
      <Text style={[typo.enonce, styles.total]}>Sur le plateau : {nb(total)} €</Text>

      <View style={[styles.caisse, { gap: ecart('s') }]}>
        {proposees.map((v) => (
          <Pressable
            key={v}
            onPress={() => setPlateau((p) => [...p, v].sort((a, b) => b - a))}
            disabled={!actif}
            accessibilityRole="button"
            accessibilityLabel={`Poser ${estBillet(v) ? 'un billet' : 'une pièce'} de ${v} €`}
            style={({ pressed }) => [
              styles.case,
              { minWidth: cible + 24, minHeight: cible + 16 },
              pressed && styles.appuye,
            ]}
          >
            <Monnaie valeur={v} />
          </Pressable>
        ))}
      </View>
      <Bouton
        titre="Valider"
        desactive={!actif || total === 0}
        onPress={() => onRepondre(total === exercice.reponse)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: {},
  plateau: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: espaces.s,
    backgroundColor: couleurs.menthe[100],
    borderRadius: formes.carte.rayon,
    borderWidth: 2,
    borderColor: couleurs.sarcelle[400],
    padding: espaces.m,
  },
  vide: { color: couleurs.sarcelle[900] },
  total: { textAlign: 'center' },
  caisse: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: couleurs.caramel[100],
    borderRadius: formes.carte.rayon,
    padding: espaces.m,
  },
  case: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: couleurs.blanc,
    borderRadius: formes.tuile.rayon,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: couleurs.caramel[500],
    padding: espaces.xs,
  },
  appuye: { borderBottomWidth: 2, marginTop: 3 },
  piece: { alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#b8860b' },
  billet: { alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 2, borderColor: '#5c677d' },
  valeur: { color: couleurs.encre },
});
