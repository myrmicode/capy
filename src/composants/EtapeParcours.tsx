import { StyleSheet, View } from 'react-native';

import { couleurs, formes } from '@/theme';

import { IconeCadenas, IconeCoche, IconeCoffre, IconeEtoile } from './icones';
import { SurfaceEnRelief } from './SurfaceEnRelief';

export type EtatEtape = 'reussie' | 'enCours' | 'verrouillee';

interface PropsEtapeParcours {
  etat: EtatEtape;
  /** Numéro de l'étape, pour l'accessibilité. */
  numero: number;
  /** Coffre de fin d'unité au lieu d'une étape ordinaire. */
  coffre?: boolean;
  onPress: () => void;
}

const ETATS: Record<EtatEtape, { face: string; relief: string; icone: string }> = {
  reussie: { face: couleurs.jaune[400], relief: couleurs.jaune[600], icone: couleurs.jaune.texte },
  enCours: { face: couleurs.sarcelle[700], relief: couleurs.sarcelle[900], icone: couleurs.blanc },
  verrouillee: { face: couleurs.gris[200], relief: couleurs.gris[300], icone: couleurs.gris[500] },
};

const ANNEAU = 8;

/** Étape ronde du parcours : 72 px, relief 6 px. L'étape en cours est entourée d'un anneau. */
export function EtapeParcours({ etat, numero, coffre = false, onPress }: PropsEtapeParcours) {
  const c = coffre && etat === 'enCours' ? { face: couleurs.caramel[500], relief: couleurs.brun[800], icone: couleurs.blanc } : ETATS[etat];
  const { taille, relief } = formes.etape;
  const libelle = coffre
    ? `Coffre${etat === 'verrouillee' ? ', verrouillé' : etat === 'reussie' ? ', ouvert' : ', à ouvrir'}`
    : `Étape ${numero}${etat === 'reussie' ? ', réussie' : etat === 'enCours' ? ', en cours' : ', verrouillée'}`;

  let icone;
  if (coffre) icone = <IconeCoffre taille={34} couleur={c.icone} />;
  else if (etat === 'reussie') icone = <IconeCoche taille={34} couleur={c.icone} />;
  else if (etat === 'enCours') icone = <IconeEtoile taille={32} couleur={c.icone} />;
  else icone = <IconeCadenas taille={28} couleur={c.icone} />;

  const bouton = (
    <SurfaceEnRelief
      onPress={onPress}
      disabled={etat === 'verrouillee'}
      accessibilityRole="button"
      accessibilityLabel={libelle}
      accessibilityState={{ disabled: etat === 'verrouillee' }}
      couleurFace={c.face}
      couleurRelief={c.relief}
      relief={relief}
      rayon={taille / 2}
      style={{ width: taille, height: taille + relief }}
    >
      {icone}
    </SurfaceEnRelief>
  );

  if (etat !== 'enCours') return <View style={styles.cadre}>{bouton}</View>;
  return (
    <View style={styles.cadre}>
      <View style={styles.anneau}>{bouton}</View>
    </View>
  );
}

const TAILLE_CADRE = formes.etape.taille + formes.etape.relief + ANNEAU * 2;

const styles = StyleSheet.create({
  cadre: { width: TAILLE_CADRE, height: TAILLE_CADRE, alignItems: 'center', justifyContent: 'center' },
  anneau: {
    padding: ANNEAU - 4,
    borderRadius: TAILLE_CADRE,
    borderWidth: 4,
    borderColor: couleurs.sarcelle[400],
  },
});
