import type { ComponentType } from 'react';

import type { PropsJeu, PropsJeuNombre, PropsJeuTexte } from './types';

/** Branche un mini-jeu de mathématiques : il ne reçoit jamais d'exercice de français. */
export function pourNombres(Jeu: ComponentType<PropsJeuNombre>): ComponentType<PropsJeu> {
  return function JeuNombre(props: PropsJeu) {
    return props.exercice.nature === 'nombre' ? <Jeu {...props} exercice={props.exercice} /> : null;
  };
}

/** Branche un mini-jeu de français : il ne reçoit jamais d'exercice de mathématiques. */
export function pourTextes(Jeu: ComponentType<PropsJeuTexte>): ComponentType<PropsJeu> {
  return function JeuTexte(props: PropsJeu) {
    return props.exercice.nature === 'texte' ? <Jeu {...props} exercice={props.exercice} /> : null;
  };
}
