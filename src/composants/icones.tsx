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

export function IconeCroix({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M6 6l12 12M18 6L6 18" stroke={couleur} strokeWidth={3} {...trait} />
    </Svg>
  );
}

export function IconeMoins({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M5 12h14" stroke={couleur} strokeWidth={3} {...trait} />
    </Svg>
  );
}

/** Fraise du mini-jeu « Le marché ». Les couleurs viennent de la charte (décor). */
export function IconeFraise({ taille = 24 }: { taille?: number }) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M12 7.5c4.6 0 7.5 2 7.5 5 0 4.4-4.4 9-7.5 9s-7.5-4.6-7.5-9c0-3 2.9-5 7.5-5z" fill="#fb845f" />
      <Path d="M12 7.5L8 4.5M12 7.5l4-3M12 7.5V3" stroke="#3d9f8c" strokeWidth={2.2} {...trait} />
      <Path d="M9 11.5v.1M12 13v.1M15 11.5v.1M10.5 16v.1M13.5 16v.1" stroke="#fdf0e0" strokeWidth={1.8} {...trait} />
    </Svg>
  );
}

export function IconeChemin({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M7 20c-2.5 0-3-3 0-4l10-3c3-1 2.5-4 0-4H9" stroke={couleur} strokeWidth={2.4} {...trait} />
      <Circle cx={7} cy={20} r={2.2} fill={couleur} />
      <Path d="M9 9V3l6 3-6 3" fill={couleur} stroke={couleur} strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  );
}

export function IconeToile({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M12 3l8.5 6.2-3.3 10H6.8L3.5 9.2z" stroke={couleur} strokeWidth={2} {...trait} />
      <Path d="M12 7.5l4.6 3.3-1.8 5.4H9.2l-1.8-5.4z" fill={couleur} />
    </Svg>
  );
}

export function IconeParents({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Circle cx={8.5} cy={7} r={3} fill={couleur} />
      <Circle cx={16.5} cy={9} r={2.4} fill={couleur} />
      <Path d="M3 19.5c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6zM14.2 19.5c.1-2.3-.6-4.2-1.7-5.3.9-.6 2-.9 3.1-.9 2.6 0 4.4 2.3 4.4 6.2z" fill={couleur} />
    </Svg>
  );
}

export function IconeOeil({ taille = 24, couleur }: PropsIcone) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke={couleur} strokeWidth={2.4} {...trait} />
      <Circle cx={12} cy={12} r={3} fill={couleur} />
    </Svg>
  );
}
