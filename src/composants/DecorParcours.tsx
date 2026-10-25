// Petits décors le long du chemin du parcours, pour qu'il traverse un paysage :
// en français, la forêt (sapins, fleurs, champignons) ; en mathématiques, la
// rivière (rochers, nénuphars, roseaux). Purement décoratifs : ignorés par les
// lecteurs d'écran, et jamais sur le chemin des étapes.
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import type { Matiere } from '@/config/domaines';

type Element = 'sapin' | 'fleurs' | 'champignon' | 'rocher' | 'nenuphar' | 'roseaux';

const ELEMENTS: Record<Matiere, readonly Element[]> = {
  francais: ['sapin', 'fleurs', 'champignon'],
  mathematiques: ['nenuphar', 'rocher', 'roseaux'],
};

function Dessin({ element }: { element: Element }) {
  switch (element) {
    case 'sapin':
      return (
        <>
          <Rect x={27} y={50} width={6} height={10} fill="#8d6e4f" />
          <Path d="M30 4 L48 30 L38 30 L52 50 L8 50 L22 30 L12 30 Z" fill="#6a994e" />
        </>
      );
    case 'fleurs':
      return (
        <>
          <Path d="M18 58 L18 36 M32 58 L32 30 M44 58 L44 40" stroke="#6a994e" strokeWidth={3} />
          <Circle cx={18} cy={34} r={6} fill="#ff8fab" />
          <Circle cx={32} cy={28} r={7} fill="#ffd166" />
          <Circle cx={44} cy={38} r={6} fill="#cdb4db" />
        </>
      );
    case 'champignon':
      return (
        <>
          <Rect x={24} y={34} width={12} height={22} rx={5} fill="#f4ecdf" />
          <Path d="M8 36 Q30 6 52 36 Z" fill="#e76f51" />
          <Circle cx={22} cy={26} r={3} fill="#fff" />
          <Circle cx={36} cy={22} r={3.5} fill="#fff" />
        </>
      );
    case 'rocher':
      return (
        <>
          <Ellipse cx={30} cy={54} rx={26} ry={5} fill="#a8dadc" />
          <Path d="M10 54 Q14 30 30 28 Q48 30 50 54 Z" fill="#9aa5ad" />
          <Path d="M22 36 Q28 32 34 34" stroke="#c4ccd2" strokeWidth={3} fill="none" />
        </>
      );
    case 'nenuphar':
      return (
        <>
          <Ellipse cx={30} cy={44} rx={26} ry={10} fill="#a8dadc" />
          <Path d="M30 44 L52 40 A22 9 0 1 1 46 36 Z" fill="#6a994e" />
          <Circle cx={24} cy={40} r={6} fill="#ffafcc" />
        </>
      );
    case 'roseaux':
      return (
        <>
          <Path
            d="M20 60 Q18 30 22 10 M32 60 Q32 34 30 18 M42 60 Q44 36 40 14"
            stroke="#7a9e5b"
            strokeWidth={3}
            fill="none"
          />
          <Rect x={18} y={8} width={6} height={14} rx={3} fill="#8d6e4f" />
          <Rect x={37} y={12} width={6} height={14} rx={3} fill="#8d6e4f" />
        </>
      );
  }
}

interface PropsDecor {
  matiere: Matiere;
  /** Rang de l'étape dans le chemin : il choisit le dessin. */
  rang: number;
  /** Côté libre, à l'opposé de l'étape. */
  cote: 'gauche' | 'droite';
}

/** Un décor posé sur le côté libre d'une étape du chemin. */
export function DecorParcours({ matiere, rang, cote }: PropsDecor) {
  const liste = ELEMENTS[matiere];
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', top: 6, [cote === 'gauche' ? 'left' : 'right']: '6%' }}
    >
      <Svg width={56} height={56} viewBox="0 0 60 60">
        <Dessin element={liste[rang % liste.length]} />
      </Svg>
    </View>
  );
}
