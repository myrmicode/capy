// Petites icônes vectorielles dessinées à la main, aux bouts arrondis.
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface PropsIcone {
  taille?: number;
  couleur: string;
}

const trait = { strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

export function IconeCoche({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={couleur} strokeWidth={3.2} {...trait} />
    </Svg>
  );
}

export function IconeCadenas({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={couleur} strokeWidth={2.4} {...trait} />
      <Rect x={5} y={11} width={14} height={10} rx={3} fill={couleur} />
    </Svg>
  );
}

export function IconeEtoile({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path
        d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.6l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"
        fill={couleur}
        stroke={couleur}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconeCoffre({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M4 10a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1H4z" fill={couleur} />
      <Rect x={4} y={12.5} width={16} height={7.5} rx={2} fill={couleur} />
      <Rect x={10.5} y={10} width={3} height={5} rx={1.2} fill="#ffffff" />
    </Svg>
  );
}

export function IconeBouclier({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z" fill={couleur} />
      <Path d="M8.8 12.2l2.2 2.2 4.4-4.6" stroke="#ffffff" strokeWidth={2.2} {...trait} />
    </Svg>
  );
}

export function IconeHautParleur({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={couleur} stroke={couleur} strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" stroke={couleur} strokeWidth={2.2} {...trait} />
    </Svg>
  );
}

export function IconeAmpoule({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z" fill={couleur} />
      <Path d="M9.5 19h5M10.5 21.5h3" stroke={couleur} strokeWidth={2.2} {...trait} />
    </Svg>
  );
}

export function IconeFlamme({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M12 2.5c1 3.5 6 6 6 11.5a6 6 0 0 1-12 0c0-3 1.6-4.6 3-6 .3 1.8 1.2 3 2.3 3.2C10.6 8 11 5 12 2.5z" fill={couleur} />
    </Svg>
  );
}

export function IconePlus({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M12 5v14M5 12h14" stroke={couleur} strokeWidth={3} {...trait} />
    </Svg>
  );
}

export function IconeRetour({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M15 5l-7 7 7 7" stroke={couleur} strokeWidth={3} {...trait} />
    </Svg>
  );
}

export function IconeFeuille({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M5 19C5 10 10 5 20 4c0 9-5 15-13 15z" fill={couleur} />
      <Path d="M5 19c3-4 6-7 10-10" stroke="#ffffff" strokeWidth={1.6} {...trait} />
    </Svg>
  );
}

export function IconePoint({ taille = 12, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 12 12">
      <Circle cx={6} cy={6} r={5} fill={couleur} />
    </Svg>
  );
}
