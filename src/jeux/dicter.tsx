// Voix de Capy pour la dictée : elle dit le mot à l'arrivée de la question, et
// l'enfant peut le réentendre autant qu'il veut.
import { useEffect } from 'react';

import { Bouton, IconeHautParleur } from '@/composants';

import { lireAVoixHaute } from './retours';

/** Petit délai : l'écran de l'étape coupe la voix en changeant de question. */
const DELAI_DICTEE_MS = 500;

export function useDicteeAuDemarrage(lecture: string | undefined) {
  useEffect(() => {
    if (!lecture) return;
    const minuteur = setTimeout(() => lireAVoixHaute(lecture), DELAI_DICTEE_MS);
    return () => clearTimeout(minuteur);
  }, [lecture]);
}

export function BoutonReecouter({ lecture }: { lecture: string }) {
  return (
    <Bouton
      titre="Réécouter le mot"
      variante="secondaire"
      icone={(c) => <IconeHautParleur taille={24} couleur={c} />}
      onPress={() => lireAVoixHaute(lecture)}
    />
  );
}
