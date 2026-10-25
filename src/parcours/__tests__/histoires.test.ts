import { HISTOIRES, textesDHistoire } from '@/contenu/histoires';
import { mascotte } from '@/mascotte';
import { appliquerFiche } from '@/toile/niveaux';

import { enregistrerEtape, enregistrerHistoire, progressionVide, totalEtoiles } from '../progression';
import { themeSurprise, themesSurprise } from '../surprise';

describe('histoires de Capy', () => {
  it.each(HISTOIRES.map((h) => [h.id, h] as const))('« %s » est complète et cohérente', (_id, h) => {
    expect(h.pages.length).toBeGreaterThanOrEqual(3);
    expect(h.questions).toHaveLength(3);
    for (const p of h.pages) expect(mascotte[p.pose]).toBeDefined();
    for (const q of h.questions) {
      expect(q.choix).toContain(q.reponse);
      expect(new Set(q.choix).size).toBe(q.choix.length);
      expect(q.page).toBeGreaterThanOrEqual(1);
      expect(q.page).toBeLessThanOrEqual(h.pages.length);
    }
    for (const t of textesDHistoire(h)) expect(t).not.toMatch(/faux|note|score|nul/i);
  });

  it('ont des identifiants uniques', () => {
    expect(new Set(HISTOIRES.map((h) => h.id)).size).toBe(HISTOIRES.length);
  });

  it('donnent leurs étoiles une fois (la meilleure lecture)', () => {
    const jour = new Date(2026, 9, 25);
    let p = enregistrerHistoire(progressionVide(), 'soupe', 1, 3, 120, jour);
    p = enregistrerHistoire(p, 'soupe', 3, 3, 120, jour);
    p = enregistrerHistoire(p, 'soupe', 0, 3, 120, jour);
    expect(p.histoires).toEqual({ soupe: 3 });
    expect(totalEtoiles(p)).toBe(3);
    expect(p.etapes).toEqual({});
    expect(p.jours).toEqual(['2026-10-25']);
  });
});

describe('thème surprise', () => {
  const toile = appliquerFiche(undefined, 'CE2', 'mathematiques', {}, '2026-09-15');

  it('reste dans les matières dont la fiche est saisie', () => {
    const themes = themesSurprise('CE2', toile);
    expect(themes.length).toBeGreaterThan(1);
    expect(themesSurprise('CE2', undefined)).toEqual([]);
  });

  it('propose un autre thème, de préférence jamais essayé, toujours le même pour un coffre', () => {
    const [actuel, ...autres] = themesSurprise('CE2', toile);
    const t = themeSurprise('CE2', toile, progressionVide(), 'ce2-rp-u1-coffre', actuel.id);
    expect(t).toBeDefined();
    expect(t!.id).not.toBe(actuel.id);
    expect(themeSurprise('CE2', toile, progressionVide(), 'ce2-rp-u1-coffre', actuel.id)).toBe(t);
    // Tous les autres essayés sauf un : c'est lui qui est proposé.
    let p = progressionVide();
    for (const a of autres.slice(1)) p = enregistrerEtape(p, a.unites[0].etapes[0].id, 3, 5, 60, new Date(2026, 9, 25));
    expect(themeSurprise('CE2', toile, p, 'x', actuel.id)!.id).toBe(autres[0].id);
  });
});
