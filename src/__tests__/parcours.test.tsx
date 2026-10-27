import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { THEMES } from '@/config/parcours';
import { useProfils } from '@/store/profils';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn(), push: jest.fn() },
  useFocusEffect: () => {},
  useLocalSearchParams: () => ({}),
  Redirect: () => null,
}));
const { router: mockRouter } = jest.requireMock('expo-router') as { router: { push: jest.Mock } };

// eslint-disable-next-line import/first -- l'écran importe expo-router, simulé juste au-dessus.
import Parcours from '@/app/enfant';

const METRIQUES = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
const afficher = () =>
  render(
    <SafeAreaProvider initialMetrics={METRIQUES}>
      <Parcours />
    </SafeAreaProvider>,
  );

describe('présentation des thèmes', () => {
  it.each(THEMES.map((t) => [t.titre, t] as const))('« %s » dit ce qu’on apprend, avec un exemple', (_, t) => {
    expect(t.description.length).toBeGreaterThan(10);
    expect(t.description.length).toBeLessThanOrEqual(60);
    expect(t.description).toMatch(/\.$/);
    expect(t.exemple.length).toBeGreaterThan(0);
    expect(t.exemple.length).toBeLessThanOrEqual(45);
    for (const u of t.unites) expect(u.objectif.length).toBeGreaterThan(10);
    const tout = [t.titre, t.description, t.exemple, ...t.unites.map((u) => u.objectif)].join(' ');
    expect(tout).not.toMatch(/\b(faux|note|score)\b/i);
  });
});

describe('écran Parcours', () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
    useProfils.setState({ profils: [], profilActifId: null, suppressionsEnAttente: [] });
    const { id } = useProfils.getState().ajouterProfil('Lou', 'CE2');
    useProfils.getState().choisirProfil(id);
    useProfils.getState().enregistrerToile(id, 'mathematiques', {
      'resoudre-problemes': 1 / 3,
      'ligne-graduee': 2 / 3,
      'calcul-mental': 1,
    });
    // Les axes non précisés valent ++ : les dix thèmes de français et six thèmes de mathématiques en plus sont proposés.
    useProfils.getState().enregistrerToile(id, 'francais', { 'accord-nom-adjectif': 1 / 3 });
  });

  it('présente le thème en cours dans un bandeau, sans rangée de thèmes qui défile', async () => {
    await afficher();
    expect(screen.getByText('Résoudre des problèmes')).toBeTruthy();
    expect(screen.getByText('Lire une petite histoire et trouver le bon calcul.')).toBeTruthy();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
    expect(screen.getByLabelText('Changer de thème, 18 thèmes')).toBeTruthy();
  });

  it('choisit un autre thème dans le panneau, une matière à la fois', async () => {
    await afficher();
    await fireEvent.press(screen.getByLabelText('Changer de thème, 18 thèmes'));
    expect(screen.getByText('Que veux-tu travailler\u00a0?')).toBeTruthy();
    // Le panneau s'ouvre sur la matière du thème en cours.
    expect(screen.getByLabelText('Mathématiques, 8 thèmes').props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByText('Placer des nombres sur une ligne')).toBeTruthy();
    expect(screen.queryByText('Accorder les adjectifs')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Français, 10 thèmes'));
    expect(screen.getByText('Exemple : des fleurs bleues')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(/^Accorder les adjectifs, Mettre la bonne fin/));
    expect(screen.queryByText('Que veux-tu travailler\u00a0?')).toBeNull();
    expect(screen.getByText('Mettre la bonne fin à l’adjectif : e, s ou es.')).toBeTruthy();
  });

  it('ouvre la fiche d’une étape avant de la commencer', async () => {
    await afficher();
    await fireEvent.press(screen.getByLabelText('Étape 1, en cours'));
    expect(screen.getByText('Étape 1 sur 5')).toBeTruthy();
    expect(mockRouter.push).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByLabelText('Commencer : Les paquets'));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/etape', params: { etape: 'ce2-rp-1' } });
  });

  it('explique comment ouvrir une étape verrouillée, sans y aller', async () => {
    await afficher();
    await fireEvent.press(screen.getByLabelText('Étape 2, verrouillée'));
    expect(screen.getByText('Fais d’abord les étapes d’avant pour ouvrir celle-ci.')).toBeTruthy();
    expect(screen.queryByLabelText(/^Commencer/)).toBeNull();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
