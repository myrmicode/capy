import type { ComponentType } from 'react';

import { pourNombres, pourTextes } from './garde';
import { JeuBonFil } from './JeuBonFil';
import { JeuCaisse } from './JeuCaisse';
import { JeuDictee } from './JeuDictee';
import { JeuFunambule } from './JeuFunambule';
import { JeuHorloge } from './JeuHorloge';
import { JeuLucioles } from './JeuLucioles';
import { JeuMarche } from './JeuMarche';
import { JeuOrdre } from './JeuOrdre';
import { JeuPaniers } from './JeuPaniers';
import { JeuPassage } from './JeuPassage';
import { JeuQuestionPerdue } from './JeuQuestionPerdue';
import { JeuReponses } from './JeuReponses';
import { JeuWagons } from './JeuWagons';
import type { JeuId } from './registre';
import type { PropsJeu } from './types';

export const COMPOSANTS_JEUX: Record<JeuId, ComponentType<PropsJeu>> = {
  marche: pourNombres(JeuMarche),
  bonFil: pourNombres(JeuBonFil),
  lucioles: JeuLucioles,
  questionPerdue: pourNombres(JeuQuestionPerdue),
  funambule: pourNombres(JeuFunambule),
  wagons: pourTextes(JeuWagons),
  paniers: pourTextes(JeuPaniers),
  dictee: pourTextes(JeuDictee),
  passage: pourTextes(JeuPassage),
  reponses: JeuReponses,
  ordre: pourTextes(JeuOrdre),
  caisse: pourNombres(JeuCaisse),
  horloge: pourNombres(JeuHorloge),
};

export { JEUX, type JeuId } from './registre';
export type { PropsJeu } from './types';
