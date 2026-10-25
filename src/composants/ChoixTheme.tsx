// Choix du thème, comme le choix du cours sur Duolingo : un panneau qui monte
// du bas, une matière à la fois, des cartes qui disent ce qu'on apprend.
// Plus de rangée qui défile sur le côté.
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { LIBELLES_MATIERES, type DomaineId, type Matiere } from '@/config/domaines';
import type { Theme } from '@/config/parcours';
import { couleurs, couleursMatieres, espaces, formes } from '@/theme';

import { CarteTheme, TEXTE_EMPILE } from './CarteTheme';
import { IconeCroix } from './icones';

interface PropsChoixTheme {
  visible: boolean;
  onFermer: () => void;
  /** Thèmes proposés, déjà triés (du plus fragile au moins fragile). */
  themes: readonly Theme[];
  matiereDe: (t: Theme) => Matiere;
  themeActuelId: string;
  priorites: ReadonlySet<DomaineId>;
  avancementDe: (t: Theme) => { faits: number; total: number };
  onChoisir: (themeId: string) => void;
}

/** Largeur minimale d'une carte, en nombre de fois la taille du texte. */
const CARTE_MIN_EN_TEXTE = 19;
const COLONNES_MAX = 3;

export function ChoixTheme({
  visible,
  onFermer,
  themes,
  matiereDe,
  themeActuelId,
  priorites,
  avancementDe,
  onChoisir,
}: PropsChoixTheme) {
  const { typo, fond, ecart, animationsReduites, cible } = useThemeEnfant();
  const { bottom } = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const actuel = themes.find((t) => t.id === themeActuelId);
  const matieres = [...new Set(themes.map(matiereDe))];
  const [matiere, setMatiere] = useState<Matiere | null>(null);
  const [largeur, setLargeur] = useState(0);
  // Ouvert, le panneau montre la matière du thème en cours.
  const matiereAffichee = matiere && matieres.includes(matiere) ? matiere : actuel ? matiereDe(actuel) : matieres[0];
  const visibles = themes.filter((t) => matiereDe(t) === matiereAffichee);

  const gap = ecart('m');
  const carteMin = CARTE_MIN_EN_TEXTE * (typo.texte.fontSize ?? 16);
  const colonnes = Math.max(1, Math.min(COLONNES_MAX, Math.floor((largeur + gap) / (carteMin + gap))));
  const largeurCarte = largeur > 0 ? (largeur - gap * (colonnes - 1)) / colonnes : undefined;
  const gras = { fontFamily: typo.texteGras.fontFamily };
  // Avec un texte plus grand, les onglets des matières passent l'un sous l'autre.
  const empile = (typo.texte.fontSize ?? 16) >= TEXTE_EMPILE;

  const fermer = () => {
    setMatiere(null);
    onFermer();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationsReduites ? 'none' : 'slide'}
      onRequestClose={fermer}
      statusBarTranslucent
    >
      <View style={styles.voile}>
        <Pressable style={StyleSheet.absoluteFill} onPress={fermer} accessible={false} />
        <View
          style={[
            styles.panneau,
            { backgroundColor: fond, maxHeight: height * 0.92, paddingBottom: bottom + espaces.l },
          ]}
        >
          <View style={styles.poignee} />
          <View style={[styles.entete, { gap: ecart('m') }]}>
            <View style={styles.flex}>
              <Text style={typo.titre2} accessibilityRole="header">
                Que veux-tu travailler{' '}?
              </Text>
              <Text style={typo.petit}>Capy a choisi ces thèmes d’après ta toile.</Text>
            </View>
            <Pressable
              onPress={fermer}
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              hitSlop={8}
              style={[styles.fermer, { width: cible, height: cible }]}
            >
              <IconeCroix taille={22} couleur={couleurs.encreDouce} />
            </Pressable>
          </View>

          {matieres.length > 1 ? (
            <View
              style={[styles.onglets, { gap: ecart('s') }, empile && styles.ongletsEmpiles]}
              accessibilityRole="tablist"
            >
              {matieres.map((m) => {
                const choisi = m === matiereAffichee;
                const c = couleursMatieres[m];
                const nombre = themes.filter((t) => matiereDe(t) === m).length;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMatiere(m)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: choisi }}
                    accessibilityLabel={`${LIBELLES_MATIERES[m]}, ${nombre} thème${nombre > 1 ? 's' : ''}`}
                    style={[
                      styles.onglet,
                      empile && styles.ongletEmpile,
                      { minHeight: cible },
                      choisi ? { backgroundColor: c.face, borderColor: c.relief } : null,
                    ]}
                  >
                    <Text style={[typo.texteGras, styles.libelleOnglet, choisi && styles.texteBlanc]}>
                      {LIBELLES_MATIERES[m]}
                    </Text>
                    <View style={[styles.nombre, { backgroundColor: choisi ? couleurs.blanc : c.clair }]}>
                      <Text style={[typo.petit, gras, { color: choisi ? c.face : couleurs.encre }]}>{nombre}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <ScrollView contentContainerStyle={styles.defilement} showsVerticalScrollIndicator={false}>
            <View
              style={[styles.grille, { gap }]}
              onLayout={(e) => setLargeur(e.nativeEvent.layout.width)}
              accessibilityRole="list"
            >
              {visibles.map((t) => (
                <View key={t.id} style={largeurCarte ? { width: largeurCarte } : styles.pleine}>
                  <CarteTheme
                    theme={t}
                    couleurs={couleursMatieres[matiereDe(t)]}
                    priorite={priorites.has(t.domaine)}
                    choisi={t.id === themeActuelId}
                    avancement={avancementDe(t)}
                    onPress={() => {
                      onChoisir(t.id);
                      fermer();
                    }}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  voile: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(18, 64, 79, 0.45)' },
  panneau: {
    width: '100%',
    maxWidth: 880,
    alignSelf: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: espaces.ecran,
    paddingTop: espaces.s,
    gap: espaces.m,
  },
  poignee: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: formes.pilule,
    backgroundColor: couleurs.gris[300],
    marginBottom: espaces.xs,
  },
  entete: { flexDirection: 'row', alignItems: 'flex-start' },
  fermer: {
    borderRadius: formes.pilule,
    backgroundColor: couleurs.gris[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  onglets: { flexDirection: 'row', flexWrap: 'wrap' },
  ongletsEmpiles: { flexDirection: 'column' },
  ongletEmpile: { flexBasis: 'auto', paddingVertical: espaces.xs },
  onglet: {
    flexGrow: 1,
    flexBasis: 150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaces.s,
    paddingHorizontal: espaces.m,
    borderRadius: formes.pilule,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.blanc,
  },
  texteBlanc: { color: couleurs.blanc },
  libelleOnglet: { flexShrink: 1, textAlign: 'center' },
  nombre: { minWidth: 26, borderRadius: formes.pilule, paddingHorizontal: espaces.s, alignItems: 'center' },
  defilement: { paddingBottom: espaces.s },
  grille: { flexDirection: 'row', flexWrap: 'wrap' },
  pleine: { width: '100%' },
});
