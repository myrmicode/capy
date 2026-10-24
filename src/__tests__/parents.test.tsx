import { fireEvent, render, screen } from '@testing-library/react-native';

import { ControleParental } from '@/composants/ControleParental';
import { EditeurNiveaux } from '@/composants/EditeurNiveaux';
import { disposer, Toile } from '@/composants/Toile';
import { CLASSES } from '@/config/classes';
import { domainesDe, MATIERES } from '@/config/domaines';
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
  it('recopie le symbole de la fiche : +, ++ ou +++', async () => {
    const onChange = jest.fn();
    const domaines = domainesDe('CE2', 'mathematiques');
    const niveaux = completerNiveaux('CE2', {}, 'mathematiques');
    await render(<EditeurNiveaux domaines={domaines} niveaux={niveaux} onChange={onChange} />);
    expect(screen.getByRole('radio', { name: 'Poser et calculer : 2 plus' }).props.accessibilityState.checked).toBe(true);
    await fireEvent.press(screen.getByRole('radio', { name: 'Poser et calculer : 3 plus' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...niveaux, 'poser-calculer': 1 });
    await fireEvent.press(screen.getByRole('radio', { name: 'Poser et calculer : 1 plus' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...niveaux, 'poser-calculer': 0.33 });
  });
});

describe('toile', () => {
  it('décrit les niveaux du jour pour les lecteurs d’écran', async () => {
    const niveaux = completerNiveaux('CE2', { 'resoudre-problemes': 0.33 }, 'mathematiques');
    await render(<Toile domaines={domainesDe('CE2', 'mathematiques')} couches={[{ niveaux, style: 'actuelle' }]} />);
    expect(screen.getByLabelText(/Résoudre des problèmes : 1 plus/)).toBeTruthy();
  });

  it('affiche la légende septembre / aujourd’hui avec deux couches', async () => {
    const niveaux = completerNiveaux('CE2', {}, 'francais');
    await render(
      <Toile
        domaines={domainesDe('CE2', 'francais')}
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

describe('disposition de la toile', () => {
  const cas = CLASSES.flatMap((classe) => MATIERES.map((matiere) => [classe, matiere] as const));
  it.each(cas)('aucun libellé ne se chevauche ni ne déborde (%s, %s)', (classe, matiere) => {
    const domaines = domainesDe(classe, matiere);
    for (const [largeur, police] of [
      [340, 12],
      [720, 14],
    ] as const) {
      const d = disposer(domaines.length, domaines.map((x) => x.libelle), largeur, police);
      const p = d.taillePolice;
      const boites = d.libelles.map((l) => {
        const w = Math.max(...l.lignes.map((m) => m.length)) * p * 0.56;
        const gauche = l.ancre === 'start' ? l.x : l.ancre === 'end' ? l.x - w : l.x - w / 2;
        return { gauche, droite: gauche + w, haut: l.haut, bas: l.haut + l.hauteur };
      });
      for (const b of boites) {
        expect(b.gauche).toBeGreaterThanOrEqual(0);
        expect(b.droite).toBeLessThanOrEqual(largeur);
      }
      for (let i = 0; i < boites.length; i++) {
        for (let j = i + 1; j < boites.length; j++) {
          const a = boites[i];
          const b = boites[j];
          const chevauche = a.gauche < b.droite && b.gauche < a.droite && a.haut < b.bas && b.haut < a.bas;
          expect(chevauche).toBe(false);
        }
      }
      // La toile grandit avec la place disponible.
      if (largeur === 720) expect(d.rayon).toBeGreaterThan(150);
    }
  });
});
