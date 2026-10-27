// Les dessins des énoncés : objets à compter, règle graduée, figure géométrique.
// Le libellé lu par le lecteur d'écran ne donne jamais la réponse.
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Rect, Text as TexteSvg } from 'react-native-svg';

import type { Forme, Illustration, IllustrationFigure, IllustrationRegle } from '@/exercices/types';
import { couleurs, polices } from '@/theme';

import { ObjetsACompter } from './ObjetsACompter';

/** Largeur du dessin de la règle : elle tient dans la carte de l'énoncé sur un téléphone. */
const LARGEUR_REGLE = 300;
const MARGE = 12;

function RegleGraduee({ debut, fin, mm }: IllustrationRegle) {
  const centimetres = fin <= 110 ? 12 : 15;
  const parCm = LARGEUR_REGLE / centimetres;
  const x = (millimetres: number) => MARGE + (millimetres / 10) * parCm;
  const largeur = LARGEUR_REGLE + 2 * MARGE;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Une règle et un segment à mesurer"
      style={{ alignItems: 'center' }}
    >
      <Svg width={largeur} height={92} viewBox={`0 0 ${largeur} 92`}>
        {/* Le segment, au-dessus de la règle. */}
        <Line
          x1={x(debut)}
          y1={16}
          x2={x(fin)}
          y2={16}
          stroke={couleurs.sarcelle[700]}
          strokeWidth={6}
          strokeLinecap="butt"
        />
        <Line x1={x(debut)} y1={8} x2={x(debut)} y2={30} stroke={couleurs.sarcelle[900]} strokeWidth={2} />
        <Line x1={x(fin)} y1={8} x2={x(fin)} y2={30} stroke={couleurs.sarcelle[900]} strokeWidth={2} />
        {/* La règle. */}
        <Rect
          x={MARGE - 6}
          y={30}
          width={LARGEUR_REGLE + 12}
          height={56}
          rx={6}
          fill={couleurs.creme}
          stroke={couleurs.brun[600]}
          strokeWidth={2}
        />
        {Array.from({ length: centimetres * (mm ? 10 : 2) + 1 }, (_, i) => {
          const pas = mm ? 1 : 5;
          const millimetres = i * pas;
          const cm = millimetres % 10 === 0;
          const demi = millimetres % 5 === 0;
          const hauteur = cm ? 18 : demi ? 12 : 7;
          return (
            <Line
              key={i}
              x1={x(millimetres)}
              y1={30}
              x2={x(millimetres)}
              y2={30 + hauteur}
              stroke={couleurs.encre}
              strokeWidth={cm ? 1.6 : 1}
            />
          );
        })}
        {Array.from({ length: centimetres + 1 }, (_, c) => (
          <TexteSvg
            key={c}
            x={x(c * 10)}
            y={74}
            textAnchor="middle"
            fontFamily={polices.nunitoGras}
            fontSize={13}
            fill={couleurs.encre}
          >
            {c}
          </TexteSvg>
        ))}
      </Svg>
    </View>
  );
}

/** Sommets d'un polygone régulier, la pointe en haut. */
function regulier(cotes: number, cx = 80, cy = 66, r = 56): string {
  return Array.from({ length: cotes }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / cotes;
    return `${Math.round(cx + r * Math.cos(a))},${Math.round(cy + r * Math.sin(a))}`;
  }).join(' ');
}

const POLYGONES: Partial<Record<Forme, string>> = {
  carre: '35,21 125,21 125,111 35,111',
  rectangle: '12,36 148,36 148,100 12,100',
  triangle: '80,12 142,118 18,118',
  losange: '80,6 128,66 80,126 32,66',
  pentagone: regulier(5),
  hexagone: regulier(6),
  octogone: regulier(8),
  trapeze: '50,28 110,28 148,108 12,108',
};

function FigureGeometrique({ forme }: IllustrationFigure) {
  const trait = {
    fill: couleurs.menthe[200],
    stroke: couleurs.sarcelle[900],
    strokeWidth: 3,
    strokeLinejoin: 'round' as const,
  };
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Une figure" style={{ alignItems: 'center' }}>
      <Svg width={160} height={132} viewBox="0 0 160 132">
        {forme === 'cercle' ? (
          <Circle cx={80} cy={66} r={56} {...trait} />
        ) : forme === 'coeur' ? (
          <Path
            d="M80 122 C30 88 12 60 22 36 C32 14 62 14 80 38 C98 14 128 14 138 36 C148 60 130 88 80 122 Z"
            {...trait}
          />
        ) : (
          <Polygon points={POLYGONES[forme]} {...trait} />
        )}
      </Svg>
    </View>
  );
}

/** Le dessin d'un énoncé, quel qu'il soit. */
export function Dessin({ illustration }: { illustration: Illustration }) {
  switch (illustration.type) {
    case 'objets':
      return <ObjetsACompter {...illustration} />;
    case 'regle':
      return <RegleGraduee {...illustration} />;
    case 'figure':
      return <FigureGeometrique {...illustration} />;
  }
}
