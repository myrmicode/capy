import { Text } from 'react-native';

import { BulleCapy, Ecran, Toile } from '@/composants';
import { domainesDe } from '@/config/domaines';
import { useProfilActif } from '@/store/profils';
import { typo } from '@/theme';

/** La toile vue par l'enfant : seulement celle du jour, qui grandit avec ses étapes. */
export default function MaToile() {
  const profil = useProfilActif();
  if (!profil) return null;

  return (
    <Ecran>
      <Text style={typo.titre1}>Ma toile</Text>
      {profil.toile ? (
        <>
          <BulleCapy pose="clinOeil" texte="Ta toile grandit un peu à chaque étape. Regarde comme elle s’étend !" />
          <Toile
            domaines={domainesDe(profil.classe)}
            couches={[{ niveaux: profil.toile.actuelle, style: 'actuelle' }]}
            taille={340}
          />
        </>
      ) : (
        <BulleCapy pose="surpris" texte="Ta toile apparaîtra quand tes parents auront recopié la fiche de l’école." />
      )}
    </Ecran>
  );
}
