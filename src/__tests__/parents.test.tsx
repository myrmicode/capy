import { fireEvent, render, screen } from '@testing-library/react-native';

import { ControleParental } from '@/composants/ControleParental';
import { EditeurNiveaux } from '@/composants/EditeurNiveaux';
import { Toile } from '@/composants/Toile';
import { domainesDe } from '@/config/domaines';
import { creerAlea } from '@/exercices';
import { nouveauDefi } from '@/parents/controleParental';
import { dateEnFrancais, dureeEnFrancais } from '@/parents/format';
import { completerNiveaux } from '@/toile/niveaux';

const GRAINE = Math.floor(0.5 * 2 ** 31);

async function taper(nombre: string) {
  for (const chiffre of nombre) await fireEvent.press(screen.getByRole('button', { name: chiffre }));
  await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
}

describe('contrôle parental', () => {
  beforeEach(() => jest.spyOn(Math, 'random').mockReturnValue(0.5));
  afterEach(() => jest.restoreAllMocks());

  it('ouvre l’espace parent avec le bon nombre', async () => {
    const defi = nouveauDefi(creerAlea(GRAINE));
    const onReussi = jest.fn();
    await render(<ControleParental onReussi={onReussi} />);
    expect(screen.getByText(defi.enLettres)).toBeTruthy();
    await taper(defi.reponse);
    expect(onReussi).toHaveBeenCalled();
  });

  it('propose un autre nombre après une erreur, sans blocage ni mot punitif', async () => {
    const onReussi = jest.fn();
    await render(<ControleParental onReussi={onReussi} />);
    await taper('12');
    expect(onReussi).not.toHaveBeenCalled();
    expect(screen.getByText(/Voici un autre nombre/)).toBeTruthy();
    expect(screen.queryByText(/faux/i)).toBeNull();
  });
});

describe('éditeur de niveaux', () => {
  it('monte et baisse un niveau d’un dixième', async () => {
    const onChange = jest.fn();
    const niveaux = completerNiveaux('CE2', { nombres: 0.5 });
    await render(<EditeurNiveaux domaines={domainesDe('CE2')} niveaux={niveaux} onChange={onChange} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Monter Nombres' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...niveaux, nombres: 0.6 });
    await fireEvent.press(screen.getByRole('button', { name: 'Baisser Nombres' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...niveaux, nombres: 0.4 });
  });
});

describe('toile', () => {
  it('décrit les niveaux du jour pour les lecteurs d’écran', async () => {
    const niveaux = completerNiveaux('CE2', { 'resoudre-problemes': 0.3 });
    await render(<Toile domaines={domainesDe('CE2')} couches={[{ niveaux, style: 'actuelle' }]} />);
    expect(screen.getByLabelText(/Résoudre des problèmes : 3 sur 10/)).toBeTruthy();
  });

  it('affiche la légende septembre / aujourd’hui avec deux couches', async () => {
    const niveaux = completerNiveaux('CE2', {});
    await render(
      <Toile
        domaines={domainesDe('CE2')}
        couches={[
          { niveaux, style: 'septembre' },
          { niveaux, style: 'actuelle' },
        ]}
      />,
    );
    expect(screen.getByText('Septembre (fiche de l’école)')).toBeTruthy();
    expect(screen.getByText('Aujourd’hui')).toBeTruthy();
  });
});

describe('formats pour les parents', () => {
  it('écrit les dates et les durées en français', () => {
    expect(dateEnFrancais('2026-09-01')).toBe('1er septembre 2026');
    expect(dateEnFrancais('2026-10-24')).toBe('24 octobre 2026');
    expect(dureeEnFrancais(45)).toBe('1 min');
    expect(dureeEnFrancais(3900)).toBe('1 h 05');
  });
});
