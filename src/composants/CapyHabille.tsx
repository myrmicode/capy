// Capy avec les objets qu'il porte (voir collection/objets.ts). Les objets sont
// dessinés par-dessus l'image capy.png, dans son repère : 380 × 385.
import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Image as ImageSvg, Path, Rect } from 'react-native-svg';

import { EMPLACEMENTS, type ObjetId, type Tenue } from '@/collection/objets';
import { mascotte } from '@/mascotte';

const LARGEUR = 380;
const HAUTEUR = 385;
/** Place au-dessus de la tête, pour les chapeaux et le pompon. */
const MARGE_HAUT = 40;

/** Cadre de chaque objet dans le repère de Capy, pour le montrer seul sur une tuile. */
const CADRES: Record<ObjetId, [number, number, number, number]> = {
  echarpe: [100, 170, 190, 130],
  chapeauPaille: [95, -15, 210, 90],
  lunettesRondes: [110, 75, 160, 75],
  noeudPapillon: [200, 170, 80, 60],
  couronneFleurs: [110, 10, 180, 70],
  lunettesSoleil: [110, 75, 160, 75],
  bonnet: [115, -40, 170, 125],
  medaille: [130, 170, 150, 120],
};

export function DessinObjet({ id }: { id: ObjetId }) {
  switch (id) {
    case 'echarpe':
      return (
        <G>
          <Path d="M118 196 Q190 228 270 196 L274 222 Q190 256 114 222 Z" fill="#d1495b" />
          <Path d="M118 204 Q190 236 270 204" stroke="#f2b8c0" strokeWidth={5} fill="none" />
          <Path d="M236 222 L262 222 L272 290 L244 292 Z" fill="#c03a4c" />
          <Path d="M246 278 L270 276 M244 286 L272 284" stroke="#f2b8c0" strokeWidth={4} />
        </G>
      );
    case 'chapeauPaille':
      return (
        <G>
          <Ellipse cx={200} cy={58} rx={100} ry={18} fill="#e9c46a" />
          <Path d="M148 58 Q150 0 200 -2 Q250 0 252 58 Z" fill="#f4d58d" />
          <Path d="M149 46 Q200 56 251 46 L252 58 Q200 66 148 58 Z" fill="#2a9d8f" />
          <Path d="M110 62 Q200 84 290 62" stroke="#d4a84b" strokeWidth={3} fill="none" />
        </G>
      );
    case 'lunettesRondes':
      return (
        <G fill="none" stroke="#3d405b" strokeWidth={6}>
          <Circle cx={195} cy={112} r={28} fill="rgba(255,255,255,0.25)" />
          <Path d="M223 108 Q238 100 252 106" />
          <Path d="M167 106 L120 96" />
        </G>
      );
    case 'noeudPapillon':
      return (
        <G>
          <Path d="M240 200 L208 182 L210 218 Z" fill="#3a86ff" />
          <Path d="M240 200 L272 182 L270 218 Z" fill="#3a86ff" />
          <Circle cx={240} cy={200} r={9} fill="#265ec4" />
        </G>
      );
    case 'couronneFleurs':
      return (
        <G>
          <Path d="M120 64 Q200 30 282 58" stroke="#6a994e" strokeWidth={6} fill="none" />
          {[
            [128, 60, '#ff8fab'],
            [160, 46, '#ffd166'],
            [195, 40, '#ff8fab'],
            [230, 42, '#cdb4db'],
            [262, 50, '#ffd166'],
          ].map(([x, y, c]) => (
            <G key={`${x}`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <Circle
                  key={a}
                  cx={(x as number) + 9 * Math.cos((a * Math.PI) / 180)}
                  cy={(y as number) + 9 * Math.sin((a * Math.PI) / 180)}
                  r={7}
                  fill={c as string}
                />
              ))}
              <Circle cx={x as number} cy={y as number} r={5} fill="#f4a261" />
            </G>
          ))}
        </G>
      );
    case 'lunettesSoleil':
      return (
        <G>
          <Path d="M222 108 Q238 100 252 106" stroke="#e76f51" strokeWidth={6} fill="none" />
          <Path d="M167 104 L120 94" stroke="#e76f51" strokeWidth={6} />
          <Path
            d="M166 98 Q166 92 172 92 L218 92 Q224 92 224 98 Q224 140 195 140 Q166 140 166 98 Z"
            fill="#264653"
            opacity={0.9}
            stroke="#e76f51"
            strokeWidth={6}
          />
          <Path d="M178 102 L188 102 M176 112 L182 112" stroke="#a8dadc" strokeWidth={5} strokeLinecap="round" />
        </G>
      );
    case 'bonnet':
      return (
        <G>
          <Path d="M128 70 Q126 -10 200 -12 Q274 -10 274 70 Z" fill="#457b9d" />
          <Rect x={120} y={54} width={162} height={26} rx={12} fill="#a8dadc" />
          <Path d="M164 2 L164 54 M200 -8 L200 54 M236 2 L236 54" stroke="#3a6a88" strokeWidth={4} />
          <Circle cx={200} cy={-18} r={18} fill="#f1faee" />
        </G>
      );
    case 'medaille':
      return (
        <G>
          <Path d="M150 190 L218 262 L238 262 L262 196" stroke="#2a9d8f" strokeWidth={10} fill="none" />
          <Circle cx={228} cy={270} r={20} fill="#f6bd60" stroke="#d99a2b" strokeWidth={4} />
          <Path d="M228 260 l4 8 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1 z" fill="#fff3c4" />
        </G>
      );
  }
}

/** L'objet seul, centré dans une tuile. */
export function TuileObjet({ id, taille = 72 }: { id: ObjetId; taille?: number }) {
  const [x, y, w, h] = CADRES[id];
  const cote = Math.max(w, h);
  return (
    <Svg width={taille} height={taille} viewBox={`${x - (cote - w) / 2} ${y - (cote - h) / 2} ${cote} ${cote}`}>
      <DessinObjet id={id} />
    </Svg>
  );
}

interface PropsCapyHabille {
  tenue: Tenue;
  taille: number;
}

/** Capy de face (pose « capy »), avec sa tenue. */
export function CapyHabille({ tenue, taille }: PropsCapyHabille) {
  const hauteur = (taille * (HAUTEUR + MARGE_HAUT)) / LARGEUR;
  // Le cou d'abord, puis les yeux, puis la tête : le chapeau passe devant le reste.
  const ordre = [...EMPLACEMENTS].sort(
    (a, b) => ['cou', 'yeux', 'tete'].indexOf(a) - ['cou', 'yeux', 'tete'].indexOf(b),
  );
  return (
    <View style={{ width: taille, height: hauteur }} accessible={false}>
      <Svg width={taille} height={hauteur} viewBox={`0 ${-MARGE_HAUT} ${LARGEUR} ${HAUTEUR + MARGE_HAUT}`}>
        <ImageSvg href={mascotte.capy} x={0} y={0} width={LARGEUR} height={HAUTEUR} />
        {ordre.map((e) => {
          const id = tenue[e];
          return id ? <DessinObjet key={e} id={id} /> : null;
        })}
      </Svg>
    </View>
  );
}
