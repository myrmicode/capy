import { CLASSES } from '@/config/classes';
import { domainesDe, MATIERES } from '@/config/domaines';
import { creerAlea } from '@/exercices';
import { nombreEnLettres, nouveauDefi } from '@/parents/controleParental';

import {
  analyserToile,
  appliquerFiche,
  avecPhotoDeJanvier,
  completerNiveaux,
  ficheSaisie,
  jourMiAnnee,
  migrerToile,
  niveauApresEtape,
  prioritesDe,
  symboleDe,
  toileApresEtape,
  valeurDe,
} from '../niveaux';

const plus = valeurDe('+');
const deux = valeurDe('++');
const trois = valeurDe('+++');

describe('axes des toiles (planches officielles des évaluations Repères)', () => {
  it.each(CLASSES)('%s a une toile de français et une de mathématiques, aux axes uniques', (classe) => {
    for (const m of MATIERES) expect(domainesDe(classe, m).length).toBeGreaterThanOrEqual(6);
    const ids = domainesDe(classe).map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('reprend les axes de la fiche de CE2', () => {
    expect(domainesDe('CE2', 'mathematiques').map((d) => d.libelle)).toEqual(
      expect.arrayContaining([
        'Résoudre des problèmes',
        'Placer un nombre sur une ligne graduée',
        'Calculer rapidement',
        'Poser et calculer',
        'Connaître et comprendre les fractions',
      ]),
    );
    expect(domainesDe('CE2', 'francais').map((d) => d.libelle)).toEqual(
      expect.arrayContaining([
        'Accorder le nom et l’adjectif',
        'Identifier la nature des mots',
        'Lire à voix haute un texte',
      ]),
    );
  });

  it('signale la lecture à voix haute comme hors de l’appli (pas de voix enregistrée)', () => {
    expect(
      domainesDe('CE2')
        .filter((d) => d.horsAppli)
        .map((d) => d.id),
    ).toEqual(['lire-texte']);
  });
});

describe('symboles + / ++ / +++', () => {
  it('passe du symbole au niveau et retour', () => {
    expect([plus, deux, trois]).toEqual([0.33, 0.67, 1]);
    expect(symboleDe(plus)).toBe('+');
    expect(symboleDe(deux)).toBe('++');
    expect(symboleDe(trois)).toBe('+++');
    expect(symboleDe(0.49)).toBe('+');
    expect(symboleDe(0.82)).toBe('++');
  });
});

describe('évolution des niveaux', () => {
  it('suit une moyenne glissante : 80 % ancien niveau, 20 % réussite de l’étape', () => {
    expect(niveauApresEtape(0.5, 5, 5)).toBe(0.6);
    expect(niveauApresEtape(0.5, 0, 5)).toBe(0.4);
  });

  it('reste toujours entre 0 et 1, et converge sans dépasser', () => {
    let n = 0;
    for (let i = 0; i < 100; i++) n = niveauApresEtape(n, 5, 5);
    expect(n).toBeLessThanOrEqual(1);
    expect(n).toBeGreaterThan(0.95);
  });

  it('enregistre chaque matière à part, sans toucher à l’autre', () => {
    let toile = appliquerFiche(undefined, 'CE2', 'mathematiques', { 'resoudre-problemes': plus }, '2026-09-20');
    expect(ficheSaisie(toile, 'mathematiques')).toBe(true);
    expect(ficheSaisie(toile, 'francais')).toBe(false);
    expect(Object.keys(toile.septembre)).toHaveLength(domainesDe('CE2', 'mathematiques').length);

    toile = appliquerFiche(toile, 'CE2', 'francais', { 'nature-mots': trois }, '2026-09-22');
    expect(toile.saisieLe).toEqual({ mathematiques: '2026-09-20', francais: '2026-09-22' });
    expect(toile.septembre['resoudre-problemes']).toBe(plus);
    expect(toile.septembre['nature-mots']).toBe(trois);
  });

  it('ne touche jamais à la toile de septembre', () => {
    const toile = appliquerFiche(undefined, 'CE2', 'mathematiques', { 'resoudre-problemes': plus }, '2026-09-20');
    const apres = toileApresEtape(toile, 'resoudre-problemes', 5, 5);
    expect(apres.septembre['resoudre-problemes']).toBe(plus);
    expect(apres.actuelle['resoudre-problemes']).toBe(0.46);
  });

  it('n’invente pas de niveau pour une matière pas encore saisie', () => {
    const toile = appliquerFiche(undefined, 'CE2', 'mathematiques', {}, '2026-09-20');
    expect(toileApresEtape(toile, 'nature-mots', 5, 5)).toBe(toile);
  });

  it('complète les axes manquants et borne les valeurs', () => {
    const niveaux = completerNiveaux('CE2', { fractions: 1.4, denombrer: -1 }, 'mathematiques');
    expect(Object.keys(niveaux)).toHaveLength(domainesDe('CE2', 'mathematiques').length);
    expect(niveaux.fractions).toBe(1);
    expect(niveaux.denombrer).toBe(0);
    expect(niveaux['calcul-mental']).toBe(deux);
  });
});

describe('bilan', () => {
  const toile = appliquerFiche(
    appliquerFiche(
      undefined,
      'CE2',
      'mathematiques',
      { denombrer: trois, 'calcul-mental': trois, 'resoudre-problemes': plus, fractions: plus, 'ligne-graduee': deux },
      '2026-09-20',
    ),
    'CE2',
    'francais',
    { 'lire-texte': plus, 'nature-mots': plus, synonymes: trois },
    '2026-09-20',
  );

  it('range les axes d’une matière en forts, à consolider et priorité', () => {
    const bilan = analyserToile('CE2', 'mathematiques', toile.actuelle);
    expect(bilan.forts.map((d) => d.id)).toEqual(['denombrer', 'calcul-mental']);
    // Égalité à + : on garde l'ordre de la fiche.
    expect(bilan.priorite?.id).toBe('fractions');
    expect(bilan.aConsolider.map((d) => d.id)).toContain('resoudre-problemes');
  });

  it('ne choisit jamais comme priorité un axe que l’appli ne peut pas travailler', () => {
    const bilan = analyserToile('CE2', 'francais', toile.actuelle);
    expect(bilan.priorite?.id).toBe('nature-mots');
    expect(bilan.aConsolider.map((d) => d.id)).toContain('lire-texte');
  });

  it('donne une priorité par matière saisie', () => {
    expect([...prioritesDe('CE2', toile)].sort()).toEqual(['fractions', 'nature-mots']);
    expect(prioritesDe('CE2', undefined).size).toBe(0);
  });
});

describe('toile de mi-année', () => {
  const fiche = appliquerFiche(undefined, 'CE2', 'mathematiques', { 'resoudre-problemes': plus }, '2026-09-20');
  const avancee = { ...fiche, actuelle: { ...fiche.actuelle, 'resoudre-problemes': 0.6 } };

  it('a lieu le 15 janvier qui suit une fiche de la rentrée, jamais pour une fiche de janvier', () => {
    expect(jourMiAnnee('2026-09-20')).toBe('2027-01-15');
    expect(jourMiAnnee('2026-12-02')).toBe('2027-01-15');
    expect(jourMiAnnee('2027-01-10')).toBeUndefined();
  });

  it('garde la toile du jour une seule fois, et seulement pour les matières saisies', () => {
    expect(avecPhotoDeJanvier(avancee, 'CE2', '2027-01-14')).toBe(avancee);
    const photo = avecPhotoDeJanvier(avancee, 'CE2', '2027-02-03');
    expect(photo.janvier).toEqual(avancee.actuelle);
    expect(photo.janvierLe).toEqual({ mathematiques: '2027-02-03' });
    // Plus tard, la toile du jour avance mais la photo ne bouge plus.
    const plusTard = toileApresEtape(photo, 'resoudre-problemes', 5, 5);
    expect(avecPhotoDeJanvier(plusTard, 'CE2', '2027-03-01').janvier).toEqual(photo.janvier);
  });

  it('s’efface quand une nouvelle fiche de la même matière est saisie, et survit à la synchronisation', () => {
    const photo = avecPhotoDeJanvier(avancee, 'CE2', '2027-01-15');
    expect(migrerToile(JSON.parse(JSON.stringify(photo)), 'CE2')).toEqual(photo);
    const nouvelle = appliquerFiche(photo, 'CE2', 'mathematiques', { 'resoudre-problemes': deux }, '2027-09-18');
    expect(nouvelle.janvier).toBeUndefined();
    expect(nouvelle.janvierLe).toBeUndefined();
    expect(appliquerFiche(photo, 'CE2', 'francais', {}, '2027-01-20').janvier).toEqual(photo.janvier);
  });
});

describe('migration des toiles enregistrées avant les deux matières', () => {
  it('garde les axes qui existent toujours et date la fiche de mathématiques', () => {
    const ancienne = {
      septembre: { nombres: 0.4, 'resoudre-problemes': 0.3, 'ligne-graduee': 0.6, geometrie: 0.5 },
      actuelle: { nombres: 0.45, 'resoudre-problemes': 0.36, 'ligne-graduee': 0.6, geometrie: 0.5 },
      saisieLe: '2026-09-20',
    };
    expect(migrerToile(ancienne, 'CE2')).toEqual({
      septembre: { 'resoudre-problemes': 0.3, 'ligne-graduee': 0.6 },
      actuelle: { 'resoudre-problemes': 0.36, 'ligne-graduee': 0.6 },
      saisieLe: { mathematiques: '2026-09-20' },
    });
  });

  it('laisse passer une toile déjà au bon format', () => {
    const toile = appliquerFiche(undefined, 'CE2', 'francais', {}, '2026-09-20');
    expect(migrerToile(toile, 'CE2')).toEqual(toile);
    expect(migrerToile(null, 'CE2')).toBeUndefined();
  });
});

describe('contrôle parental', () => {
  it.each([
    [0, 'zéro'],
    [17, 'dix-sept'],
    [21, 'vingt et un'],
    [71, 'soixante et onze'],
    [77, 'soixante-dix-sept'],
    [80, 'quatre-vingts'],
    [81, 'quatre-vingt-un'],
    [91, 'quatre-vingt-onze'],
    [100, 'cent'],
    [200, 'deux cents'],
    [201, 'deux cent un'],
    [1000, 'mille'],
    [1980, 'mille neuf cent quatre-vingts'],
    [2347, 'deux mille trois cent quarante-sept'],
    [80000, 'quatre-vingt mille'],
    [200000, 'deux cent mille'],
    [99999, 'quatre-vingt-dix-neuf mille neuf cent quatre-vingt-dix-neuf'],
  ])('écrit %i « %s »', (n, lettres) => {
    expect(nombreEnLettres(n)).toBe(lettres);
  });

  it('propose des nombres de 1 000 à 99 999, sans chiffres dans l’énoncé', () => {
    const alea = creerAlea(3);
    for (let i = 0; i < 2000; i++) {
      const defi = nouveauDefi(alea);
      const n = Number(defi.reponse);
      expect(n).toBeGreaterThanOrEqual(1000);
      expect(n).toBeLessThanOrEqual(99999);
      expect(defi.enLettres).not.toMatch(/\d/);
    }
  });
});
