import { THEMES } from '@/config/parcours';
import { JEUX } from '@/jeux/registre';

import { genererEtape } from '../etape';
import {
  cheminDuTheme,
  dateLocale,
  enregistrerEtape,
  etoilesPour,
  graineDePartie,
  joursDepuisDerniereActivite,
  ouvrirCoffre,
  progressionVide,
  serieDeJours,
  tempsDeLaSemaine,
  totalEtoiles,
} from '../progression';

const theme = THEMES[0];
const jour = (texte: string) => new Date(`${texte}T10:00:00`);

describe('thème « Résoudre des problèmes » CE2', () => {
  const etapes = theme.unites.flatMap((u) => u.etapes);

  it('compte 18 étapes aux identifiants uniques (dont les schémas en barres), avec un coffre par unité', () => {
    expect(etapes).toHaveLength(18);
    expect(new Set(etapes.map((e) => e.id)).size).toBe(18);
    expect(theme.unites.at(-1)?.id).toBe('ce2-rp-schemas');
    expect(new Set(theme.unites.map((u) => u.coffre)).size).toBe(theme.unites.length);
  });

  it.each(etapes.map((e) => [e.titre, e] as const))(
    '« %s » mélange au moins 2 mini-jeux et se génère toujours',
    (_, etape) => {
      expect(etape.jeux.length).toBeGreaterThanOrEqual(2);
      for (let graine = 0; graine < 200; graine++) {
        const questions = genererEtape({ classe: theme.classe, domaine: theme.domaine, graine, ...etape });
        expect(questions).toHaveLength(etape.nombreQuestions);
        expect(new Set(questions.map((q) => q.jeu)).size).toBeGreaterThanOrEqual(2);
        for (const q of questions) {
          expect(etape.modeles).toContain(q.exercice.modeleId);
          expect(JEUX[q.jeu].accepte(q.exercice)).toBe(true);
        }
      }
    },
  );
});

describe.each(THEMES.map((t) => [t.titre, t] as const))('thème « %s »', (_, t) => {
  const etapes = t.unites.flatMap((u) => u.etapes);

  it('a des identifiants uniques et un coffre par unité', () => {
    const tous = THEMES.flatMap((x) => x.unites.flatMap((u) => [u.coffre, ...u.etapes.map((e) => e.id)]));
    expect(new Set(tous).size).toBe(tous.length);
  });

  it.each(etapes.map((e) => [e.titre, e] as const))(
    '« %s » se génère toujours, à tous les niveaux, avec au moins 2 mini-jeux',
    (_titre, etape) => {
      for (let graine = 0; graine < 300; graine++) {
        // Chaque étape doit se générer à tous les niveaux (+, ++, +++).
        const niveau = ((graine % 3) + 1) as 1 | 2 | 3;
        const questions = genererEtape({ classe: t.classe, domaine: t.domaine, graine, ...etape, niveau });
        expect(questions).toHaveLength(etape.nombreQuestions);
        expect(new Set(questions.map((q) => q.jeu)).size).toBeGreaterThanOrEqual(2);
        for (const q of questions) {
          expect(etape.modeles).toContain(q.exercice.modeleId);
          expect(JEUX[q.jeu].accepte(q.exercice)).toBe(true);
        }
      }
    },
  );
});

describe('étoiles', () => {
  it('donne 1 à 3 étoiles, jamais zéro', () => {
    expect(etoilesPour(5, 5)).toBe(3);
    expect(etoilesPour(3, 5)).toBe(2);
    expect(etoilesPour(2, 5)).toBe(1);
    expect(etoilesPour(0, 5)).toBe(1);
  });

  it('garde le meilleur résultat quand on rejoue, et ajoute les coffres', () => {
    let p = enregistrerEtape(progressionVide(), 'e1', 5, 5, 60, jour('2026-10-20'));
    p = enregistrerEtape(p, 'e1', 1, 5, 60, jour('2026-10-20'));
    expect(p.etapes.e1).toEqual({ etoiles: 3, fois: 2 });
    p = ouvrirCoffre(p, 'c1');
    p = ouvrirCoffre(p, 'c1');
    expect(p.coffresOuverts).toEqual(['c1']);
    expect(totalEtoiles(p)).toBe(6);
  });
});

describe('jours et temps', () => {
  it('écrit la date locale', () => {
    expect(dateLocale(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('compte la série de jours d’affilée', () => {
    const jours = ['2026-10-18', '2026-10-20', '2026-10-21', '2026-10-22'];
    expect(serieDeJours(jours, '2026-10-22')).toBe(3);
    // Pas encore joué aujourd'hui : la série d'hier tient toujours.
    expect(serieDeJours(jours, '2026-10-23')).toBe(3);
    expect(serieDeJours(jours, '2026-10-24')).toBe(0);
    expect(serieDeJours([], '2026-10-24')).toBe(0);
  });

  it('passe correctement les changements de mois', () => {
    expect(serieDeJours(['2026-02-27', '2026-02-28', '2026-03-01'], '2026-03-01')).toBe(3);
  });

  it('mesure l’absence depuis la dernière étape', () => {
    expect(joursDepuisDerniereActivite([], '2026-10-24')).toBeNull();
    expect(joursDepuisDerniereActivite(['2026-10-20', '2026-10-15'], '2026-10-24')).toBe(4);
  });

  it('additionne le temps de la semaine', () => {
    let p = enregistrerEtape(progressionVide(), 'e1', 5, 5, 120, jour('2026-10-10'));
    p = enregistrerEtape(p, 'e2', 5, 5, 300, jour('2026-10-20'));
    p = enregistrerEtape(p, 'e3', 5, 5, 200, jour('2026-10-24'));
    expect(tempsDeLaSemaine(p, '2026-10-24')).toBe(500);
    expect(p.jours).toEqual(['2026-10-10', '2026-10-20', '2026-10-24']);
  });
});

describe('chemin du parcours', () => {
  it('met en cours la première étape au départ et verrouille le reste', () => {
    const chemin = cheminDuTheme(theme, progressionVide());
    expect(chemin).toHaveLength(22);
    expect(chemin[0]).toMatchObject({ type: 'etape', numero: 1, etat: 'enCours' });
    expect(chemin.slice(1).every((n) => n.etat === 'verrouillee')).toBe(true);
    expect(chemin[5]).toMatchObject({ type: 'coffre', id: 'ce2-rp-u1-coffre' });
  });

  it('ouvre le coffre une fois l’unité terminée, puis l’unité suivante', () => {
    let p = progressionVide();
    for (const e of theme.unites[0].etapes) p = enregistrerEtape(p, e.id, 3, 5, 60, jour('2026-10-24'));
    let chemin = cheminDuTheme(theme, p);
    expect(chemin.slice(0, 5).every((n) => n.etat === 'reussie')).toBe(true);
    expect(chemin[5]).toMatchObject({ type: 'coffre', etat: 'enCours' });
    expect(chemin[6].etat).toBe('verrouillee');

    p = ouvrirCoffre(p, theme.unites[0].coffre);
    chemin = cheminDuTheme(theme, p);
    expect(chemin[5].etat).toBe('reussie');
    expect(chemin[6]).toMatchObject({ numero: 6, etat: 'enCours' });
  });
});

it('donne une nouvelle graine à chaque partie, reproductible', () => {
  expect(graineDePartie('lou', 'e1', 0)).toBe(graineDePartie('lou', 'e1', 0));
  expect(graineDePartie('lou', 'e1', 0)).not.toBe(graineDePartie('lou', 'e1', 1));
});
