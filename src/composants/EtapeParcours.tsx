import { StyleSheet, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { couleurs, couleursMatieres, formes, type CouleursMatiere } from '@/theme';

import { IconeCadenas, IconeCoche, IconeCoffre, IconeEtoile } from './icones';
import { SurfaceEnRelief } from './SurfaceEnRelief';

export type EtatEtape = 'reussie' | 'enCours' | 'verrouillee';

interface PropsEtapeParcours {
  etat: EtatEtape;
  /** Numéro de l'étape, pour l'accessibilité. */
  numero: number;
  /** Coffre de fin d'unité au lieu d'une étape ordinaire. */
  coffre?: boolean;
  /** Couleur de la matière, pour l'étape en cours (sarcelle par défaut). */
  couleursMatiere?: CouleursMatiere;
  onPress: () => void;
}

const FIXES: Record<Exclude<EtatEtape, 'enCours'>, { face: string; relief: string; icone: string }> = {
  reussie: { face: couleurs.jaune[400], relief: couleurs.jaune[600], icone: couleurs.jaune.texte },
  verrouillee: { face: couleurs.gris[200], relief: couleurs.gris[300], icone: couleurs.gris[500] },
};

const ANNEAU = 8;

/**
 * Étape ronde du parcours : 72 px (un peu plus sur tablette), relief 6 px.
 * L'étape en cours est entourée d'un anneau. Une étape verrouillée se touche
 * aussi : le parcours explique alors comment l'ouvrir.
 */
export function EtapeParcours({ etat, numero, coffre = false, couleursMatiere, onPress }: PropsEtapeParcours) {
  const { typo } = useThemeEnfant();
  const m = couleursMatiere ?? couleursMatieres.mathematiques;
  const c =
    etat === 'enCours'
      ? coffre
        ? { face: couleurs.caramel[500], relief: couleurs.brun[800], icone: couleurs.blanc }
        : { face: m.face, relief: m.relief, icone: couleurs.blanc }
      : FIXES[etat];
  // L'étape grandit un peu avec le texte (tablette, « Texte plus grand »), d'un quart au plus.
  const echelle = Math.min(1.25, Math.max(1, (typo.petit.fontSize ?? 14) / 14));
  const taille = Math.round(formes.etape.taille * echelle);
  const relief = formes.etape.relief;
  const icone = Math.round(34 * echelle);
  const libelle = coffre
    ? `Coffre${etat === 'verrouillee' ? ', verrouillé' : etat === 'reussie' ? ', ouvert' : ', à ouvrir'}`
    : `Étape ${numero}${etat === 'reussie' ? ', réussie' : etat === 'enCours' ? ', en cours' : ', verrouillée'}`;

  let dessin;
  if (coffre) dessin = <IconeCoffre taille={icone} couleur={c.icone} />;
  else if (etat === 'reussie') dessin = <IconeCoche taille={icone} couleur={c.icone} />;
  else if (etat === 'enCours') dessin = <IconeEtoile taille={icone - 2} couleur={c.icone} />;
  else dessin = <IconeCadenas taille={icone - 6} couleur={c.icone} />;

  const cadre = taille + relief + ANNEAU * 2;
  const bouton = (
    <SurfaceEnRelief
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={libelle}
      couleurFace={c.face}
      couleurRelief={c.relief}
      relief={relief}
      rayon={taille / 2}
      style={{ width: taille, height: taille + relief }}
    >
      {dessin}
    </SurfaceEnRelief>
  );

  return (
    <View style={[styles.cadre, { width: cadre, height: cadre }]}>
      {etat === 'enCours' ? (
        <View style={[styles.anneau, { borderRadius: cadre, borderColor: coffre ? couleurs.caramel[500] : m.anneau }]}>
          {bouton}
        </View>
      ) : (
        bouton
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: { alignItems: 'center', justifyContent: 'center' },
  anneau: { padding: ANNEAU - 4, borderWidth: 4 },
});
