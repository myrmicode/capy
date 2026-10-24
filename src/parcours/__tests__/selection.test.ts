import { appliquerFiche, toileApresEtape, valeurDe } from '@/toile/niveaux';

import { themeEstPropose, themesProposes } from '../selection';

const plus = valeurDe('+');
const deux = valeurDe('++');
const trois = valeurDe('+++');

const maths = (niveaux: Parameters<typeof appliquerFiche>[3]) =>
  appliquerFiche(undefined, 'CE2', 'mathematiques', niveaux, '2026-09-20');

describe('thèmes proposés d’après la toile', () => {
  it('ne propose aucun exercice sans toile', () => {
    expect(themesProposes('CE2', undefined)).toEqual([]);
  });

  it('ne propose que les matières dont la fiche a été saisie', () => {
    const ids = themesProposes('CE2', maths({ 'resoudre-problemes': plus, 'calcul-mental': plus, 'ligne-graduee': plus })).map(
      (t) => t.domaine,
    );
    expect(ids.sort()).toEqual(['calcul-mental', 'ligne-graduee', 'resoudre-problemes']);
  });

  it('ne propose pas un axe déjà à +++ sur la fiche', () => {
    const ids = themesProposes('CE2', maths({ 'resoudre-problemes': trois, 'calcul-mental': deux, 'ligne-graduee': plus })).map(
      (t) => t.domaine,
    );
    expect(ids).toEqual(['ligne-graduee', 'calcul-mental']);
  });

  it('va du plus fragile au moins fragile, toutes matières confondues', () => {
    const toile = appliquerFiche(
      maths({ 'resoudre-problemes': deux, 'calcul-mental': trois, 'ligne-graduee': trois }),
      'CE2',
      'francais',
      {
        'accord-nom-adjectif': plus,
        'nature-mots': trois,
        synonymes: trois,
        'familles-mots': trois,
        'sujet-verbe': deux,
        conjugaison: trois,
        'ecrire-mots': trois,
      },
      '2026-09-21',
    );
    expect(themesProposes('CE2', toile).map((t) => t.domaine)).toEqual(['accord-nom-adjectif', 'resoudre-problemes', 'sujet-verbe']);
  });

  it('garde un thème proposé même quand l’axe progresse, et suit la toile du jour pour l’ordre', () => {
    let toile = maths({ 'resoudre-problemes': plus, 'calcul-mental': deux, 'ligne-graduee': trois });
    for (let i = 0; i < 10; i++) toile = toileApresEtape(toile, 'resoudre-problemes', 5, 5);
    const ids = themesProposes('CE2', toile).map((t) => t.domaine);
    expect(ids).toEqual(['calcul-mental', 'resoudre-problemes']);
    expect(themeEstPropose('CE2', toile, 'ce2-resoudre-problemes')).toBe(true);
    expect(themeEstPropose('CE2', toile, 'ce2-ligne-graduee')).toBe(false);
  });
});
