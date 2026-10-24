import { appliquerFiche, toileApresEtape, valeurDe } from '@/toile/niveaux';

import { genererEtape } from '../etape';
import { niveauPourDomaine, niveauxDesQuestions } from '../niveau';

const fiche = (symbole: '+' | '++' | '+++') =>
  appliquerFiche(undefined, 'CE2', 'mathematiques', { 'resoudre-problemes': valeurDe(symbole) }, '2026-09-20');

describe('niveau des exercices d’après la toile', () => {
  it('part du niveau de la fiche', () => {
    expect(niveauPourDomaine(fiche('+'), 'resoudre-problemes')).toBe(1);
    expect(niveauPourDomaine(fiche('++'), 'resoudre-problemes')).toBe(2);
    expect(niveauPourDomaine(fiche('+++'), 'resoudre-problemes')).toBe(3);
  });

  it('pose la dernière question un cran au-dessus, sauf au niveau visé', () => {
    expect(niveauxDesQuestions(1, 5)).toEqual([1, 1, 1, 1, 2]);
    expect(niveauxDesQuestions(2, 3)).toEqual([2, 2, 3]);
    expect(niveauxDesQuestions(3, 3)).toEqual([3, 3, 3]);
  });

  it('emmène l’enfant de + jusqu’à +++ quand il réussit', () => {
    let toile = fiche('+');
    const parcours: number[] = [];
    for (let etape = 0; etape < 12; etape++) {
      parcours.push(niveauPourDomaine(toile, 'resoudre-problemes'));
      toile = toileApresEtape(toile, 'resoudre-problemes', 5, 5);
    }
    // Jamais de saut en arrière quand tout est réussi, et on finit au niveau visé.
    for (let i = 1; i < parcours.length; i++) expect(parcours[i]).toBeGreaterThanOrEqual(parcours[i - 1]);
    expect(parcours[0]).toBe(1);
    expect(parcours).toContain(2);
    expect(parcours.at(-1)).toBe(3);
  });

  it('redescend doucement après une étape difficile, sans tout reprendre', () => {
    let toile = fiche('++');
    toile = toileApresEtape(toile, 'resoudre-problemes', 0, 5);
    expect(niveauPourDomaine(toile, 'resoudre-problemes')).toBe(2);
    toile = toileApresEtape(toile, 'resoudre-problemes', 0, 5);
    expect(niveauPourDomaine(toile, 'resoudre-problemes')).toBe(1);
  });

  it('génère une étape au niveau demandé, avec une question défi à la fin', () => {
    const etape = genererEtape({
      classe: 'CE2',
      domaine: 'resoudre-problemes',
      graine: 4,
      jeux: ['bonFil', 'reponses'],
      modeles: ['ajout'],
      nombreQuestions: 5,
      niveau: 1,
    });
    expect(etape.map((q) => q.exercice.niveau)).toEqual([1, 1, 1, 1, 2]);
    // Au niveau +, les additions restent sous 100.
    for (const q of etape.slice(0, 4)) expect(q.exercice.nature === 'nombre' && q.exercice.reponse).toBeLessThan(100);
  });
});
