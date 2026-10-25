import { graineDuJour, PHRASES_CAPY, phraseDe } from '@/contenu/phrasesCapy';
import { appliquerFiche } from '@/toile/niveaux';

import { genererDefi, QUESTIONS_DEFI, themesDuDefi } from '../defi';
import { defiFait, enregistrerDefi, progressionVide, totalEtoiles } from '../progression';
import { noterRevisions } from '../revision';

// Fiche de mathématiques à + partout : les thèmes de maths sont proposés.
const TOILE = appliquerFiche(undefined, 'CE2', 'mathematiques', {}, '2026-09-15');

const BASE = {
  classe: 'CE2' as const,
  toile: TOILE,
  progression: progressionVide(),
  profilId: 'lou',
  jour: '2026-10-25',
  partie: 0,
};

describe('défi du jour', () => {
  it('pose 3 questions, de plusieurs thèmes', () => {
    const defi = genererDefi(BASE);
    expect(defi).toHaveLength(QUESTIONS_DEFI);
    expect(new Set(defi.map((q) => q.exercice.domaine)).size).toBeGreaterThan(1);
    expect(new Set(defi.map((q) => q.exercice.enonce)).size).toBe(QUESTIONS_DEFI);
  });

  it('est le même pour une même partie, et change d’un jour à l’autre', () => {
    expect(genererDefi(BASE)).toEqual(genererDefi(BASE));
    const autre = genererDefi({ ...BASE, jour: '2026-10-26' });
    expect(autre.map((q) => q.exercice.enonce)).not.toEqual(genererDefi(BASE).map((q) => q.exercice.enonce));
  });

  it('commence par un petit rappel quand il y en a un', () => {
    const theme = themesDuDefi('CE2', TOILE)[0];
    const etape = theme.unites[0].etapes[0];
    const aRevoir = noterRevisions(
      undefined,
      [{ modeleId: etape.modeles[0], jeu: 'reponses', domaine: theme.domaine, niveau: 1, rate: true, revision: false }],
      '2026-10-24',
    );
    const defi = genererDefi({ ...BASE, progression: { ...progressionVide(), aRevoir } });
    expect(defi[0].revision).toBe(true);
    expect(defi).toHaveLength(QUESTIONS_DEFI);
  });

  it('n’existe pas sans fiche de l’école', () => {
    expect(genererDefi({ ...BASE, toile: undefined })).toEqual([]);
  });

  it('donne ses étoiles une fois par jour (la meilleure partie)', () => {
    const lundi = new Date(2026, 9, 26, 18);
    let p = enregistrerDefi(progressionVide(), 1, 3, 60, lundi);
    expect(defiFait(p, '2026-10-26')).toBe(true);
    expect(defiFait(p, '2026-10-27')).toBe(false);
    p = enregistrerDefi(p, 3, 3, 60, lundi);
    p = enregistrerDefi(p, 0, 3, 60, lundi);
    expect(p.defis).toEqual({ '2026-10-26': 3 });
    expect(totalEtoiles(p)).toBe(3);
    expect(p.jours).toEqual(['2026-10-26']);
    expect(p.etapes).toEqual({});
  });
});

describe('phrases de Capy', () => {
  it('varient avec la graine, et restent les mêmes pour une même graine', () => {
    expect(phraseDe(PHRASES_CAPY.bravo, 0)).toBe('Bravo !');
    expect(phraseDe(PHRASES_CAPY.bravo, 1)).not.toBe('Bravo !');
    expect(phraseDe(PHRASES_CAPY.bravo, -1)).toBe(PHRASES_CAPY.bravo.at(-1));
    expect(phraseDe(PHRASES_CAPY.prochaine, graineDuJour('2026-10-25'))).toBe(
      phraseDe(PHRASES_CAPY.prochaine, graineDuJour('2026-10-25')),
    );
  });

  it('ne sont jamais punitives', () => {
    for (const phrase of Object.values(PHRASES_CAPY).flat()) expect(phrase).not.toMatch(/faux|note|score|nul/i);
  });
});
