// Petits décors le long du chemin du parcours, pour qu'il traverse un paysage :
// en français, la forêt ; en mathématiques, la rivière. Le paysage suit les
// saisons : feuilles rousses en automne, neige en hiver, fleurs au printemps,
// soleil en été. Purement décoratifs : ignorés par les lecteurs d'écran, et
// jamais sur le chemin des étapes.
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import type { Matiere } from '@/config/domaines';
import type { Saison } from '@/parcours/saisons';

type Element =
  | 'sapin'
  | 'fleurs'
  | 'champignon'
  | 'rocher'
  | 'nenuphar'
  | 'roseaux'
  | 'feuilles'
  | 'sapinNeige'
  | 'bonhommeNeige'
  | 'flocons'
  | 'soleil'
  | 'rocherNeige';

const ELEMENTS: Record<Saison, Record<Matiere, readonly Element[]>> = {
  automne: { francais: ['sapin', 'feuilles', 'champignon'], mathematiques: ['nenuphar', 'rocher', 'feuilles'] },
  hiver: { francais: ['sapinNeige', 'bonhommeNeige', 'flocons'], mathematiques: ['rocherNeige', 'flocons', 'roseaux'] },
  printemps: { francais: ['sapin', 'fleurs', 'champignon'], mathematiques: ['nenuphar', 'rocher', 'roseaux'] },
  ete: { francais: ['sapin', 'fleurs', 'soleil'], mathematiques: ['nenuphar', 'soleil', 'roseaux'] },
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
    case 'sapinNeige':
      return (
        <>
          <Rect x={27} y={50} width={6} height={10} fill="#8d6e4f" />
          <Path d="M30 4 L48 30 L38 30 L52 50 L8 50 L22 30 L12 30 Z" fill="#5b8a46" />
          <Path d="M30 4 L39 17 Q30 21 21 17 Z" fill="#ffffff" />
          <Path d="M22 30 L38 30 Q42 35 30 35 Q18 35 22 30 Z" fill="#ffffff" />
          <Path d="M8 50 Q30 44 52 50 Z" fill="#ffffff" />
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
    case 'feuilles':
      return (
        <>
          <Path d="M14 40 Q20 26 32 30 Q28 44 14 40 Z" fill="#e76f51" />
          <Path d="M34 50 Q42 36 54 42 Q48 56 34 50 Z" fill="#f4a261" />
          <Path d="M10 56 Q18 46 28 52 Q22 62 10 56 Z" fill="#e9c46a" />
          <Path d="M20 20 Q28 10 38 16 Q32 28 20 20 Z" fill="#d4693d" />
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
    case 'bonhommeNeige':
      return (
        <>
          <Circle cx={30} cy={44} r={14} fill="#ffffff" stroke="#c4ccd2" strokeWidth={1.5} />
          <Circle cx={30} cy={22} r={10} fill="#ffffff" stroke="#c4ccd2" strokeWidth={1.5} />
          <Circle cx={26} cy={20} r={1.6} fill="#12404f" />
          <Circle cx={34} cy={20} r={1.6} fill="#12404f" />
          <Path d="M30 23 L38 25 L30 26 Z" fill="#f4a261" />
          <Rect x={22} y={9} width={16} height={4} fill="#12404f" />
          <Rect x={25} y={2} width={10} height={8} fill="#12404f" />
        </>
      );
    case 'flocons':
      return (
        <>
          {[
            [16, 18],
            [40, 12],
            [30, 34],
            [12, 46],
            [46, 44],
          ].map(([x, y], i) => (
            <Path
              key={i}
              d={`M${x - 5} ${y} L${x + 5} ${y} M${x} ${y - 5} L${x} ${y + 5} M${x - 3.5} ${y - 3.5} L${x + 3.5} ${y + 3.5} M${x - 3.5} ${y + 3.5} L${x + 3.5} ${y - 3.5}`}
              stroke="#8ecae6"
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}
        </>
      );
    case 'soleil':
      return (
        <>
          <Circle cx={30} cy={30} r={12} fill="#ffd166" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (Math.PI * i) / 4;
            return (
              <Path
                key={i}
                d={`M${30 + 17 * Math.cos(a)} ${30 + 17 * Math.sin(a)} L${30 + 24 * Math.cos(a)} ${30 + 24 * Math.sin(a)}`}
                stroke="#f4a261"
                strokeWidth={3}
                strokeLinecap="round"
              />
            );
          })}
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
    case 'rocherNeige':
      return (
        <>
          <Ellipse cx={30} cy={54} rx={26} ry={5} fill="#d6eef2" />
          <Path d="M10 54 Q14 30 30 28 Q48 30 50 54 Z" fill="#9aa5ad" />
          <Path d="M14 40 Q16 30 30 28 Q46 30 47 40 Q30 34 14 40 Z" fill="#ffffff" />
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
  /** Saison du décor (celle du jour). */
  saison: Saison;
  /** Rang de l'étape dans le chemin : il choisit le dessin. */
  rang: number;
  /** Côté libre, à l'opposé de l'étape. */
  cote: 'gauche' | 'droite';
}

/** Un décor posé sur le côté libre d'une étape du chemin. */
export function DecorParcours({ matiere, saison, rang, cote }: PropsDecor) {
  const liste = ELEMENTS[saison][matiere];
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

/** Une petite scène de la saison, pour la carte des mondes. */
export function ScenePaysage({ matiere, saison }: { matiere: Matiere; saison: Saison }) {
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}
    >
      {ELEMENTS[saison][matiere].map((e) => (
        <Svg key={e} width={44} height={44} viewBox="0 0 60 60">
          <Dessin element={e} />
        </Svg>
      ))}
    </View>
  );
}
