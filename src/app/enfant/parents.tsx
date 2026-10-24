import { Text } from 'react-native';

import { BulleCapy, Ecran } from '@/composants';
import { typo } from '@/theme';

// Provisoire : l'espace parent, protégé par un contrôle parental, arrive en phase 5.
export default function EspaceParents() {
  return (
    <Ecran>
      <Text style={typo.titre1}>Espace parent</Text>
      <BulleCapy pose="serieux" texte="L’espace parent arrive bientôt : bilan, toile et réglages du profil." />
    </Ecran>
  );
}
