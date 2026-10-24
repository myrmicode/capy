import { StyleSheet, Text, View } from 'react-native';

import { couleurs, espaces, formes, typo } from '@/theme';

import { IconeBouclier } from './icones';

interface PropsCarteConfiance {
  titre?: string;
  texte?: string;
}

/** Carte rassurante pour les parents sur les données demandées. */
export function CarteConfiance({
  titre = 'Rien d’autre n’est demandé',
  texte = 'Pas de nom de famille, pas d’école, pas de date de naissance. Le profil reste sur cet appareil.',
}: PropsCarteConfiance) {
  return (
    <View style={styles.carte} accessible accessibilityLabel={`${titre}. ${texte}`}>
      <IconeBouclier taille={32} couleur={couleurs.sarcelle[500]} />
      <View style={styles.textes}>
        <Text style={typo.texteGras}>{titre}</Text>
        <Text style={[typo.petit, styles.texte]}>{texte}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    flexDirection: 'row',
    gap: espaces.m,
    alignItems: 'flex-start',
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.menthe[200],
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
  },
  textes: { flex: 1, gap: 2 },
  texte: { fontSize: 15 },
});
