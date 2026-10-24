import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useLecture } from '@/jeux/retours';
import { deverrouillerParents, verrouillerParents } from '@/parents/verrou';
import { pauseDue, resteEnMots, etatInitial } from '@/parcours/deroulement';
import { useProfils } from '@/store/profils';

import { FournisseurReglages } from '../contexte';
import { REGLAGES_PAR_DEFAUT, lireReglages } from '../reglages';
import { TexteAccessible } from '../TexteAccessible';

jest.mock('expo-router', () => {
  const params: { profil?: string; apres?: string } = {};
  return {
    useLocalSearchParams: () => params,
    router: { back: jest.fn(), replace: jest.fn(), push: jest.fn() },
    Redirect: () => null,
    params,
  };
});
const { params: mockParams, router: mockRouter } = jest.requireMock('expo-router') as {
  params: { profil?: string; apres?: string };
  router: { replace: jest.Mock };
};

// eslint-disable-next-line import/first -- l'écran importe expo-router, simulé juste au-dessus.
import ReglagesLecture from '@/app/reglages-lecture';

const avec = (reglages: Partial<typeof REGLAGES_PAR_DEFAUT>, enfant: ReactNode) => (
  <FournisseurReglages reglages={{ ...REGLAGES_PAR_DEFAUT, ...reglages }}>{enfant}</FournisseurReglages>
);

/** Les morceaux de texte imbriqués d'un texte affiché, avec leur couleur. */
interface Noeud {
  type: string;
  props: { style?: unknown };
  children: (Noeud | string)[];
}

function morceaux(texte: string) {
  const trouves: { texte: string; style: { color?: string; backgroundColor?: string } }[] = [];
  const parcourir = (n: Noeud) => {
    const enfants = n.children ?? [];
    if (n.type === 'Text' && enfants.length > 0 && enfants.every((e) => typeof e === 'string')) {
      const style = [n.props.style].flat(3).reduce<object>((a, s) => ({ ...a, ...((s as object) ?? {}) }), {});
      trouves.push({ texte: enfants.join(''), style });
    }
    enfants.forEach((e) => typeof e !== 'string' && parcourir(e));
  };
  parcourir(screen.getByLabelText(texte) as unknown as Noeud);
  return trouves;
}

describe('TexteAccessible', () => {
  it('affiche le texte tel quel sans réglage', async () => {
    await render(avec({}, <TexteAccessible texte="Le chat dort." coloration />));
    expect(screen.getByText('Le chat dort.')).toBeTruthy();
  });

  it('colore les syllabes en alternance et grise les lettres muettes', async () => {
    await render(avec({ syllabes: true }, <TexteAccessible texte="Le chapeau" coloration />));
    const m = morceaux('Le chapeau');
    const cha = m.find((x) => x.texte === 'cha')!;
    const peau = m.find((x) => x.texte === 'peau')!;
    expect(cha.style.color).toBeDefined();
    expect(peau.style.color).toBeDefined();
    expect(cha.style.color).not.toBe(peau.style.color);
    await render(avec({ syllabes: true }, <TexteAccessible texte="chat" coloration />));
    const t = morceaux('chat').find((x) => x.texte === 't')!;
    expect(t.style.color).toBe('#6f6a5e');
  });

  it('ne colore pas un texte qui n’est pas du contenu d’exercice', async () => {
    await render(avec({ syllabes: true }, <TexteAccessible texte="chapeau" />));
    expect(morceaux('chapeau').some((x) => x.texte === 'cha')).toBe(false);
  });

  it('surligne le mot que Capy est en train de lire', async () => {
    await render(avec({}, <TexteAccessible texte="Le chat dort." />));
    await act(async () => useLecture.setState({ textes: ['Le chat dort.'], debuts: [0], position: 3 }));
    const chat = morceaux('Le chat dort.').find((x) => x.texte === 'chat')!;
    expect(chat.style.backgroundColor).toBeDefined();
    await act(async () => useLecture.setState({ position: null }));
  });

  it('écarte les mots avec les espacements renforcés', async () => {
    await render(avec({ espacements: true }, <TexteAccessible texte="Le chat" />));
    expect(morceaux('Le chat').some((x) => x.texte.includes(' '))).toBe(true);
  });
});

describe('progression en mots et pauses', () => {
  it('dit combien de questions il reste', () => {
    expect(resteEnMots(etatInitial(5))).toBe('Encore 5 questions');
    expect(resteEnMots({ ...etatInitial(3), index: 2 })).toBe('Encore 1 question');
    expect(resteEnMots({ ...etatInitial(3), index: 2, phase: 'bravo' })).toBe('Étape finie');
  });

  it('propose une pause au bout du temps choisi, jamais avec « Jamais »', () => {
    expect(pauseDue(0, 5 * 60_000, 5)).toBe(true);
    expect(pauseDue(0, 4 * 60_000, 5)).toBe(false);
    expect(pauseDue(0, 60 * 60_000, 0)).toBe(false);
  });
});

describe('écran « Réglages de lecture et de jeu »', () => {
  let id: string;
  beforeEach(() => {
    useProfils.setState({ profils: [], profilActifId: null, suppressionsEnAttente: [] });
    id = useProfils.getState().ajouterProfil('Lou', 'CE2').id;
    mockParams.profil = id;
    delete mockParams.apres;
    jest.clearAllMocks();
  });
  const reglagesDeLou = () => lireReglages(useProfils.getState().profils.find((p) => p.id === id)!.reglages);

  it('reste derrière le contrôle parental si l’espace parent n’est pas ouvert', async () => {
    verrouillerParents();
    await render(<ReglagesLecture />);
    expect(screen.queryByText('Réglages de lecture et de jeu')).toBeNull();
  });

  it('un raccourci s’active, puis se retire au second toucher', async () => {
    deverrouillerParents();
    await render(<ReglagesLecture />);
    expect(screen.getByText(/Aucune information de santé/)).toBeTruthy();
    expect(screen.getByText('Aucun réglage activé')).toBeTruthy();
    const raccourci = () => screen.getByRole('switch', { name: /^Aide à la lecture\./ });
    await fireEvent.press(raccourci());
    expect(reglagesDeLou().police).toBe('andika');
    expect(reglagesDeLou().syllabes).toBe(true);
    expect(screen.getByText('Activé')).toBeTruthy();
    await fireEvent.press(raccourci());
    expect(reglagesDeLou()).toEqual(REGLAGES_PAR_DEFAUT);
  });

  it('chaque option s’active et se désactive seule, avec son choix une fois activée', async () => {
    deverrouillerParents();
    await render(<ReglagesLecture />);
    // Désactivée, l'option ne montre pas ses valeurs.
    expect(screen.queryByRole('radio', { name: 'Police adaptée : Luciole' })).toBeNull();
    await fireEvent(screen.getByLabelText('Police adaptée'), 'valueChange', true);
    expect(reglagesDeLou().police).toBe('andika');
    await fireEvent.press(screen.getByRole('radio', { name: 'Police adaptée : Luciole' }));
    expect(reglagesDeLou().police).toBe('luciole');
    await fireEvent(screen.getByLabelText('Mode calme'), 'valueChange', true);
    expect(reglagesDeLou().modeCalme).toBe(true);
    expect(screen.getByText('2 réglages activés')).toBeTruthy();
    await fireEvent(screen.getByLabelText('Police adaptée'), 'valueChange', false);
    expect(reglagesDeLou().police).toBe('nunito');
    expect(reglagesDeLou().modeCalme).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: 'Tout désactiver' }));
    expect(reglagesDeLou()).toEqual(REGLAGES_PAR_DEFAUT);
  });

  it('montre les couleurs des syllabes seulement quand les syllabes en couleur sont activées', async () => {
    deverrouillerParents();
    await render(<ReglagesLecture />);
    expect(screen.queryByText('Couleurs des syllabes')).toBeNull();
    await fireEvent(screen.getByLabelText('Syllabes en couleur'), 'valueChange', true);
    await fireEvent.press(screen.getByRole('radio', { name: 'Couleurs des syllabes : Bleu et rouge' }));
    expect(reglagesDeLou().couleursSyllabes).toBe('bleuRouge');
  });

  it('se propose, sans obligation, à la création d’un profil', async () => {
    verrouillerParents();
    mockParams.apres = 'creation';
    await render(<ReglagesLecture />);
    expect(screen.getByText('Voulez-vous adapter la lecture ou les jeux ?')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Plus tard' }));
    expect(mockRouter.replace).toHaveBeenCalledWith({ pathname: '/toile', params: { apres: 'creation' } });
    expect(reglagesDeLou()).toEqual(REGLAGES_PAR_DEFAUT);
  });
});
