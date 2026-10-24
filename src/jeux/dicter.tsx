// Voix de Capy pour la dictée : elle dit le mot à l'arrivée de la question, et
// l'enfant peut le réentendre autant qu'il veut.
import { useEffect } from 'react';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { Bouton, IconeHautParleur } from '@/composants';

import { lireAVoixHaute } from './retours';

/** Petit délai : l'écran de l'étape coupe la voix en changeant de question. */
const DELAI_DICTEE_MS = 500;

export function useDicteeAuDemarrage(lecture: string | undefined) {
  const { lectureLente: lente, lectureAuto } = useThemeEnfant().reglages;
  useEffect(() => {
    // Avec la lecture automatique, l'écran d'étape dit déjà la consigne et le mot.
    if (!lecture || lectureAuto) return;
    const minuteur = setTimeout(() => lireAVoixHaute(lecture, { lente }), DELAI_DICTEE_MS);
    return () => clearTimeout(minuteur);
  }, [lecture, lente, lectureAuto]);
}

export function BoutonReecouter({ lecture }: { lecture: string }) {
  const lente = useThemeEnfant().reglages.lectureLente;
  return (
    <Bouton
      titre="Réécouter le mot"
      variante="secondaire"
      icone={(c) => <IconeHautParleur taille={24} couleur={c} />}
      onPress={() => lireAVoixHaute(lecture, { lente })}
    />
  );
}
