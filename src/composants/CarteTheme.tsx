import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import type { Theme } from '@/config/parcours';
import { couleurs, espaces, formes, type CouleursMatiere } from '@/theme';

import { IconeCoche } from './icones';
import { TuileTheme } from './IconeTheme';
import { SurfaceEnRelief } from './SurfaceEnRelief';

/** Taille de texte (px) à partir de laquelle le titre d'une carte passe sous sa tuile. */
export const TEXTE_EMPILE = 20;

interface PropsCarteTheme {
  theme: Theme;
  couleurs: CouleursMatiere;
  /** Axe prioritaire de la toile : « À faire en premier ». */
  priorite?: boolean;
  /** Thème affiché en ce moment sur le parcours. */
  choisi?: boolean;
  /** Nœuds franchis sur le total (étapes et coffres). */
  avancement?: { faits: number; total: number };
  /** Toute la carte se touche ; sinon, elle porte ses propres boutons (`children`). */
  onPress?: () => void;
  children?: ReactNode;
}

/**
 * Carte d'un thème : pictogramme, titre, ce qu'on y apprend et un exemple,
 * pour savoir d'un coup d'œil de quoi il s'agit.
 */
export function CarteTheme({ theme, couleurs: c, priorite, choisi, avancement, onPress, children }: PropsCarteTheme) {
  const { typo, ecart } = useThemeEnfant();
  const tuile = Math.round((typo.titre3.fontSize ?? 21) * 2.6);
  const termine = !!avancement && avancement.faits === avancement.total;
  const gras = { fontFamily: typo.texteGras.fontFamily };
  // Avec un texte plus grand, le titre passe sous la tuile : il a toute la largeur et aucun mot n'est coupé.
  const empile = (typo.texte.fontSize ?? 16) >= TEXTE_EMPILE;
  const titre = <Text style={typo.titre3}>{theme.titre}</Text>;
  const badges =
    priorite || choisi ? (
      <View style={styles.badges}>
        {choisi ? (
          <View style={[styles.badge, { backgroundColor: c.face }]}>
            <Text style={[typo.petit, gras, { color: couleurs.blanc }]}>En ce moment</Text>
          </View>
        ) : null}
        {priorite ? (
          <View style={[styles.badge, { backgroundColor: couleurs.jaune[400] }]}>
            <Text style={[typo.petit, gras, { color: couleurs.jaune.texte }]}>À faire en premier</Text>
          </View>
        ) : null}
      </View>
    ) : null;

  const contenu = (
    <View style={[styles.contenu, { gap: ecart('s') }]}>
      <View style={[styles.haut, { gap: ecart('m') }]}>
        <TuileTheme domaine={theme.domaine} couleurs={c} taille={tuile} />
        <View style={[styles.flex, { gap: ecart('xs') }]}>
          {badges}
          {empile ? null : titre}
        </View>
      </View>
      {empile ? titre : null}
      <Text style={typo.texte}>{theme.description}</Text>
      <View style={[styles.exemple, { backgroundColor: c.clair }]}>
        <Text style={[typo.petit, { color: couleurs.encre }]}>
          <Text style={gras}>Exemple : </Text>
          {theme.exemple}
        </Text>
      </View>
      {avancement ? (
        <View
          style={styles.avancement}
          accessible
          accessibilityLabel={termine ? 'Thème terminé' : `${avancement.faits} sur ${avancement.total} franchies`}
        >
          {termine ? (
            <>
              <IconeCoche taille={20} couleur={couleurs.sarcelle[700]} />
              <Text style={[typo.petit, styles.termine, gras]}>Terminé</Text>
            </>
          ) : (
            <>
              <View style={styles.piste}>
                <View
                  style={[
                    styles.remplissage,
                    { backgroundColor: c.face, width: `${Math.max(4, (avancement.faits / avancement.total) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={typo.petit}>
                {avancement.faits} / {avancement.total}
              </Text>
            </>
          )}
        </View>
      ) : null}
      {children}
    </View>
  );

  if (!onPress) return <View style={[styles.carte, styles.carteFixe]}>{contenu}</View>;
  return (
    <SurfaceEnRelief
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!choisi }}
      accessibilityLabel={[
        theme.titre,
        theme.description,
        choisi ? 'en ce moment' : '',
        priorite ? 'à faire en premier' : '',
        termine ? 'terminé' : avancement ? `${avancement.faits} sur ${avancement.total} franchies` : '',
      ]
        .filter(Boolean)
        .join(', ')}
      couleurFace={couleurs.blanc}
      couleurRelief={choisi ? c.relief : couleurs.gris[300]}
      couleurBordure={choisi ? c.face : couleurs.bordure}
      epaisseurBordure={choisi ? 3 : 2}
      relief={formes.tuile.relief}
      rayon={formes.carte.rayon}
      style={styles.remplir}
      styleFace={styles.face}
    >
      {contenu}
    </SurfaceEnRelief>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  carte: { borderRadius: formes.carte.rayon, backgroundColor: couleurs.blanc },
  carteFixe: { borderWidth: 2, borderColor: couleurs.bordure },
  remplir: { flexGrow: 1 },
  face: { alignItems: 'stretch', justifyContent: 'flex-start' },
  contenu: { padding: espaces.l, flexGrow: 1 },
  haut: { flexDirection: 'row', alignItems: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.xs },
  badge: { borderRadius: formes.pilule, paddingHorizontal: espaces.s + 2, paddingVertical: 1, maxWidth: '100%' },
  exemple: { borderRadius: 12, paddingHorizontal: espaces.m, paddingVertical: espaces.s, alignSelf: 'flex-start' },
  avancement: { flexDirection: 'row', alignItems: 'center', gap: espaces.s, marginTop: 'auto' },
  piste: { flex: 1, height: 10, borderRadius: formes.pilule, backgroundColor: couleurs.gris[200], overflow: 'hidden' },
  remplissage: { height: '100%', borderRadius: formes.pilule },
  termine: { color: couleurs.sarcelle[700] },
});
