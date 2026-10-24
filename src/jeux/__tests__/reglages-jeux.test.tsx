// Chaque mini-jeu doit pouvoir se terminer avec chaque réglage de lecture et de jeu.
import { fireEvent, render as renderBrut, screen } from '@testing-library/react-native';
import type { ComponentType, ReactElement } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { adapterExercice, nombreDeQuestions } from '@/accessibilite/adaptation';
import { FournisseurReglages } from '@/accessibilite/contexte';
import { REGLAGES_PAR_DEFAUT, type ReglagesEnfant } from '@/accessibilite/reglages';
import { THEMES } from '@/config/parcours';
import { modeleParId, modeleTexteParId, type Exercice, type ExerciceQuelconque, type ExerciceTexte } from '@/exercices';
import { derouler, etatInitial } from '@/parcours/deroulement';
import { genererEtape } from '@/parcours/etape';

import { pourNombres, pourTextes } from '../garde';
import { JeuBonFil } from '../JeuBonFil';
import { JeuDictee } from '../JeuDictee';
import { JeuFunambule } from '../JeuFunambule';
import { JeuLucioles } from '../JeuLucioles';
import { JeuMarche } from '../JeuMarche';
import { JeuPaniers } from '../JeuPaniers';
import { JeuPassage } from '../JeuPassage';
import { JeuQuestionPerdue } from '../JeuQuestionPerdue';
import { JeuReponses } from '../JeuReponses';
import { JeuWagons } from '../JeuWagons';
import type { JeuId } from '../registre';
import type { PropsJeu } from '../types';

const render = (ui: ReactElement) => renderBrut(<GestureHandlerRootView>{ui}</GestureHandlerRootView>);

const CONFIGURATIONS: readonly [string, Partial<ReglagesEnfant>][] = [
  ['toucher puis toucher', { toucherPuisToucher: true, grandesCibles: true }],
  ['moins de choix', { nombreChoix: 2 }],
  ['mode calme', { modeCalme: true }],
  ['taille +50 % et aides à la lecture', { taille: 'tresGrande', espacements: true, syllabes: true, alternanceLignes: true, police: 'opendyslexic' }],
  ['consignes faciles', { falc: true }],
  ['aide en calcul', { aidesVisuelles: true, nombreChoix: 3, tableConsultable: true }],
];

const bouton = (nom: string | RegExp) => screen.getByRole('button', { name: nom });

interface CasJeu {
  jeu: JeuId;
  Composant: ComponentType<PropsJeu>;
  exercice: () => ExerciceQuelconque;
  reussir: (ex: ExerciceQuelconque, r: ReglagesEnfant) => Promise<void>;
}

function exerciceMarche(): Exercice {
  for (let graine = 0; ; graine++) {
    const ex = modeleParId('groupements')!.generer('CE2', graine, { histoire: 0 });
    if (ex.donnees.groupes === 3 && ex.donnees.parGroupe === 4) return ex;
  }
}

const CAS: readonly CasJeu[] = [
  {
    jeu: 'marche',
    Composant: pourNombres(JeuMarche),
    exercice: exerciceMarche,
    reussir: async (_ex, r) => {
      for (let panier = 1; panier <= 3; panier++) {
        for (let k = 0; k < 4; k++) {
          // Toucher puis toucher : on prend la fraise, puis on touche le panier.
          if (r.toucherPuisToucher) await fireEvent.press(bouton('Prendre une fraise'));
          await fireEvent.press(bouton(new RegExp(`^Panier ${panier},`)));
        }
      }
      await fireEvent.press(bouton('Valider'));
    },
  },
  {
    jeu: 'bonFil',
    Composant: pourNombres(JeuBonFil),
    exercice: () => modeleParId('retrait')!.generer('CE2', 3),
    reussir: async () => {
      const mesure = (width: number, height: number) => ({ nativeEvent: { layout: { width, height, x: 0, y: 0 } } });
      await fireEvent(screen.getByTestId('zone-bon-fil'), 'layout', mesure(400, 400));
      await fireEvent(screen.getByTestId('histoire-bon-fil'), 'layout', mesure(400, 120));
      await fireEvent.press(bouton('Opération moins'));
    },
  },
  {
    jeu: 'lucioles',
    Composant: JeuLucioles,
    exercice: () => modeleParId('tables')!.generer('CE2', 4),
    reussir: async (ex) => fireEvent.press(bouton(`Luciole ${ex.reponse}`)),
  },
  {
    jeu: 'questionPerdue',
    Composant: pourNombres(JeuQuestionPerdue),
    exercice: () => modeleParId('retrait')!.generer('CE2', 2),
    reussir: async (ex) => fireEvent.press(bouton(ex.question)),
  },
  {
    jeu: 'funambule',
    Composant: pourNombres(JeuFunambule),
    exercice: () => modeleParId('placer-grands-pas')!.generer('CE2', 9),
    reussir: async (ex) => {
      const e = ex as Exercice;
      for (let i = 0; i < (e.reponse - e.donnees.debut) / e.donnees.pas; i++) await fireEvent.press(bouton('Avancer d’une graduation'));
      await fireEvent.press(bouton('Valider'));
    },
  },
  {
    jeu: 'wagons',
    Composant: pourTextes(JeuWagons),
    exercice: () => modeleTexteParId('sujet-et-verbe')!.generer('CE2', 5),
    reussir: async (ex) => fireEvent.press(bouton(String(ex.reponse))),
  },
  {
    jeu: 'paniers',
    Composant: pourTextes(JeuPaniers),
    exercice: () => modeleTexteParId('nature-du-mot')!.generer('CE2', 8),
    reussir: async (ex) => fireEvent.press(bouton(new RegExp(`^Panier ${ex.reponse}`))),
  },
  {
    jeu: 'dictee',
    Composant: pourTextes(JeuDictee),
    exercice: () => modeleTexteParId('dictee-mots')!.generer('CE2', 5, { niveau: 1 }),
    reussir: async (ex) => {
      await fireEvent.changeText(screen.getByLabelText('Le mot que tu as écrit'), String(ex.reponse));
      await fireEvent.press(bouton('Valider'));
    },
  },
  {
    jeu: 'passage',
    Composant: pourTextes(JeuPassage),
    exercice: () => modeleTexteParId('preuve-texte')!.generer('CE2', 3, { niveau: 2 }),
    reussir: async (ex) => fireEvent.press(bouton((ex as ExerciceTexte).reponse)),
  },
  {
    jeu: 'reponses',
    Composant: JeuReponses,
    exercice: () => modeleParId('ajout')!.generer('CE2', 8),
    reussir: async (ex) => fireEvent.press(bouton(String(ex.reponse))),
  },
];

describe.each(CAS.map((c) => [c.jeu, c] as const))('mini-jeu « %s »', (_jeu, cas) => {
  it.each(CONFIGURATIONS)('se termine avec « %s »', async (_nom, options) => {
    const reglages = { ...REGLAGES_PAR_DEFAUT, ...options };
    const exercice = adapterExercice(cas.exercice(), reglages, cas.jeu);
    const onRepondre = jest.fn();
    await render(
      <FournisseurReglages reglages={reglages}>
        <cas.Composant exercice={exercice} actif onRepondre={onRepondre} />
      </FournisseurReglages>,
    );
    await cas.reussir(exercice, reglages);
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });
});

describe('moins de choix', () => {
  it('ne propose que 2 réponses, dont la bonne', async () => {
    const reglages = { ...REGLAGES_PAR_DEFAUT, nombreChoix: 2 as const };
    const ex = adapterExercice(modeleParId('ajout')!.generer('CE2', 8), reglages);
    expect(ex.choix).toHaveLength(2);
    expect(ex.choix).toContain(ex.reponse);
  });
});

describe('toucher puis toucher', () => {
  it('le marché remplace le glisser par deux touchers et le dit', async () => {
    const reglages = { ...REGLAGES_PAR_DEFAUT, toucherPuisToucher: true };
    await render(
      <FournisseurReglages reglages={reglages}>
        <JeuMarche exercice={exerciceMarche()} actif onRepondre={jest.fn()} />
      </FournisseurReglages>,
    );
    expect(screen.queryByLabelText('Fraise à glisser dans un panier')).toBeNull();
    expect(screen.getByText('Touche la fraise, puis touche un panier.')).toBeTruthy();
    await fireEvent.press(bouton('Prendre une fraise'));
    expect(screen.getByText('Maintenant, touche un panier.')).toBeTruthy();
  });
});

describe('sessions courtes', () => {
  const reglages = { ...REGLAGES_PAR_DEFAUT, sessionsCourtes: true };
  const etapes = THEMES.flatMap((t) => t.unites.flatMap((u) => u.etapes.map((e) => [e.id, t, e] as const)));
  it.each(etapes)('l’étape « %s » se termine en 3 questions', (_id, theme, etape) => {
    const nombreQuestions = nombreDeQuestions(etape.nombreQuestions, reglages);
    const questions = genererEtape({ classe: theme.classe, domaine: theme.domaine, graine: 11, ...etape, nombreQuestions, niveau: 2 });
    expect(questions).toHaveLength(3);
    let etat = etatInitial(questions.length);
    for (let i = 0; i < questions.length; i++) {
      etat = derouler(derouler(etat, { type: 'repondre', juste: true }), { type: 'continuer' });
    }
    expect(etat.phase).toBe('terminee');
  });
});
