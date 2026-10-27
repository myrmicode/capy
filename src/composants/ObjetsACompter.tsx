// Objets dessinés à compter (CP) : rangées de cinq, ou de dix séparées en deux
// moitiés, comme sur une boîte à œufs ou les doigts des deux mains.
import { View } from 'react-native';
import Svg, { Circle, G, Path, Polygon } from 'react-native-svg';

import type { IllustrationObjets } from '@/exercices/types';

const CASE = 30;
/** Espace supplémentaire entre deux groupes de cinq dans une rangée de dix. */
const ECART_CINQ = 10;
const ECHELLE_CINQ = 1.5;

const NOMS: Record<IllustrationObjets['objet'], string> = { fraise: 'fraises', pomme: 'pommes', etoile: 'étoiles' };

function Objet({ objet }: { objet: IllustrationObjets['objet'] }) {
  switch (objet) {
    case 'fraise':
      return (
        <>
          <Path d="M15 27 C6 20 4 12 8 9 C11 7 13 8 15 9 C17 8 19 7 22 9 C26 12 24 20 15 27 Z" fill="#e5484d" />
          <Path d="M10 8 L15 4 L20 8 L15 10 Z" fill="#6a994e" />
          <Circle cx={12} cy={15} r={1} fill="#ffd166" />
          <Circle cx={18} cy={15} r={1} fill="#ffd166" />
          <Circle cx={15} cy={20} r={1} fill="#ffd166" />
        </>
      );
    case 'pomme':
      return (
        <>
          <Circle cx={15} cy={17} r={10} fill="#e5484d" />
          <Path d="M15 8 L16 3" stroke="#8d6e4f" strokeWidth={2} />
          <Path d="M16 6 Q21 2 24 6 Q20 8 16 6 Z" fill="#6a994e" />
        </>
      );
    case 'etoile':
      return (
        <Polygon
          points="15,3 18.5,11 27,11.5 20.5,17 22.5,26 15,21 7.5,26 9.5,17 3,11.5 11.5,11"
          fill="#fcc448"
          stroke="#e0a52a"
          strokeWidth={1.5}
        />
      );
  }
}

export function ObjetsACompter({ objet, nombre, parDix }: IllustrationObjets) {
  const parRangee = parDix ? 10 : 5;
  const rangees = Math.ceil(nombre / parRangee);
  const largeur = parRangee * CASE + (parDix ? ECART_CINQ : 0);
  const hauteur = rangees * CASE;
  // Les rangées de cinq ont la place d'être dessinées plus grand.
  const echelle = parDix ? 1 : ECHELLE_CINQ;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Des ${NOMS[objet]} à compter`}
      style={{ alignItems: 'center' }}
    >
      <Svg width={largeur * echelle} height={hauteur * echelle} viewBox={`0 0 ${largeur} ${hauteur}`}>
        {Array.from({ length: nombre }, (_, i) => {
          const col = i % parRangee;
          const x = col * CASE + (parDix && col >= 5 ? ECART_CINQ : 0);
          const y = Math.floor(i / parRangee) * CASE;
          return (
            <G key={i} transform={`translate(${x} ${y})`}>
              <Objet objet={objet} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
