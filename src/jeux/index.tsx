import type { ComponentType } from 'react';

import { JeuBonFil } from './JeuBonFil';
import { JeuMarche } from './JeuMarche';
import { JeuReponses } from './JeuReponses';
import type { JeuId } from './registre';
import type { PropsJeu } from './types';

export const COMPOSANTS_JEUX: Record<JeuId, ComponentType<PropsJeu>> = {
  marche: JeuMarche,
  bonFil: JeuBonFil,
  reponses: JeuReponses,
};

export { JEUX, type JeuId } from './registre';
export type { PropsJeu } from './types';
