import { Text } from 'react-native';

import { BulleCapy, Ecran } from '@/composants';
import { typo } from '@/theme';

// Provisoire : la toile de l'enfant arrive en phase 5.
export default function MaToile() {
  return (
    <Ecran>
      <Text style={typo.titre1}>Ma toile</Text>
      <BulleCapy pose="surpris" texte="Bientôt, tu verras ici ta toile grandir à chaque étape !" />
    </Ecran>
  );
}
