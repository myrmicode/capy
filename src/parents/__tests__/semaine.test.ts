import { deriverTheme, estLeSoir, FOND_SOIR } from '@/accessibilite/theme';
import { rapportContraste } from '@/accessibilite/contraste';
import { REGLAGES_PAR_DEFAUT } from '@/accessibilite/reglages';
import { CONSEILS_PARENTS } from '@/contenu/conseilsParents';
import { THEMES } from '@/config/parcours';
import { enregistrerDefi, enregistrerEtape, progressionVide } from '@/parcours/progression';
import { noterRevisions } from '@/parcours/revision';
import { appliquerFiche } from '@/toile/niveaux';
import { couleurs } from '@/theme';

import { resumeSemaine } from '../semaine';

const MAINTENANT = new Date(2026, 9, 25, 18);

describe('résumé de la semaine', () => {
  it('encourage sans reprocher quand l’enfant n’a pas joué', () => {
    const [phrase] = resumeSemaine({ prenom: 'Lou', classe: 'CE2', progression: progressionVide() }, MAINTENANT);
    expect(phrase).toMatch(/^Lou n’a pas encore joué cette semaine/);
  });

  it('dit les jours, le temps, les défis, les progrès et ce qui reviendra', () => {
    let p = enregistrerEtape(progressionVide(), 'ce2-rp-1', 5, 5, 600, new Date(2026, 9, 23));
    p = enregistrerDefi(p, 3, 3, 120, new Date(2026, 9, 25));
    p = {
      ...p,
      aRevoir: noterRevisions(
        undefined,
        [{ modeleId: 'ajout', jeu: 'reponses', domaine: 'resoudre-problemes', niveau: 1, rate: true, revision: false }],
        '2026-10-25',
      ),
    };
    const fiche = appliquerFiche(undefined, 'CE2', 'mathematiques', { 'resoudre-problemes': 0.2 }, '2026-09-15');
    const toile = { ...fiche, actuelle: { ...fiche.actuelle, 'resoudre-problemes': 0.6 } };
    const texte = resumeSemaine({ prenom: 'Lou', classe: 'CE2', progression: p, toile }, MAINTENANT).join(' ');
    expect(texte).toContain('a joué 2 jours, 12 min en tout');
    expect(texte).toContain('Défi du jour réussi 1 fois');
    expect(texte).toContain('résoudre des problèmes (de + à ++)');
    expect(texte).toContain('Capy fera revoir');
    expect(texte).not.toMatch(/faux|note|score|nul/i);
  });

  it('dit aussi ce qui avance depuis la toile de mi-année', () => {
    const fiche = appliquerFiche(undefined, 'CE2', 'mathematiques', { 'resoudre-problemes': 0.2 }, '2026-09-15');
    const toile = {
      ...fiche,
      janvier: { ...fiche.actuelle, 'resoudre-problemes': 0.6 },
      janvierLe: { mathematiques: '2027-01-15' },
      actuelle: { ...fiche.actuelle, 'resoudre-problemes': 0.9 },
    };
    const texte = resumeSemaine(
      { prenom: 'Lou', classe: 'CE2', progression: progressionVide(), toile },
      new Date(2027, 2, 1),
    ).join(' ');
    expect(texte).toContain('Depuis janvier aussi : résoudre des problèmes (de ++ à +++)');
  });
});

describe('idées de jeux sans écran', () => {
  it('existent pour chaque thème de CE2, sans vocabulaire punitif', () => {
    for (const t of THEMES.filter((x) => x.classe === 'CE2')) {
      expect(CONSEILS_PARENTS[t.domaine]).toBeDefined();
      expect(CONSEILS_PARENTS[t.domaine]).not.toMatch(/faux|note|score|perdu/i);
    }
  });
});

describe('ambiance du soir', () => {
  it('commence à 19 h et finit le matin', () => {
    expect(estLeSoir(new Date(2026, 9, 25, 18, 59))).toBe(false);
    expect(estLeSoir(new Date(2026, 9, 25, 19))).toBe(true);
    expect(estLeSoir(new Date(2026, 9, 26, 5))).toBe(true);
    expect(estLeSoir(new Date(2026, 9, 26, 7))).toBe(false);
  });

  it('adoucit le fond par défaut, garde un fond choisi, et reste lisible', () => {
    expect(deriverTheme(REGLAGES_PAR_DEFAUT, false, 1, true).fond).toBe(FOND_SOIR);
    expect(deriverTheme({ ...REGLAGES_PAR_DEFAUT, fond: 'bleu' }, false, 1, true).fond).not.toBe(FOND_SOIR);
    expect(rapportContraste(couleurs.encre, FOND_SOIR)).toBeGreaterThanOrEqual(7);
    expect(rapportContraste(couleurs.encreDouce, FOND_SOIR)).toBeGreaterThanOrEqual(4.5);
  });
});
