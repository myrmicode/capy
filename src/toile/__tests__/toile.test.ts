import { creerAlea } from '@/exercices';
import { nombreEnLettres, nouveauDefi } from '@/parents/controleParental';

import {
  analyserToile,
  completerNiveaux,
  domainesParPriorite,
  niveauApresEtape,
  nouvelleToile,
  toileApresEtape,
} from '../niveaux';

describe('évolution des niveaux', () => {
  it('suit une moyenne glissante : 80 % ancien niveau, 20 % réussite de l’étape', () => {
    expect(niveauApresEtape(0.5, 5, 5)).toBe(0.6);
    expect(niveauApresEtape(0.5, 0, 5)).toBe(0.4);
    expect(niveauApresEtape(0.3, 3, 5)).toBe(0.36);
  });

  it('reste toujours entre 0 et 1, et converge sans dépasser', () => {
    let n = 0;
    for (let i = 0; i < 100; i++) n = niveauApresEtape(n, 5, 5);
    expect(n).toBeLessThanOrEqual(1);
    expect(n).toBeGreaterThan(0.95);
  });

  it('ne touche jamais à la toile de septembre', () => {
    const toile = nouvelleToile('CE2', { 'resoudre-problemes': 0.3 }, '2026-09-20');
    const apres = toileApresEtape(toile, 'resoudre-problemes', 5, 5);
    expect(apres.septembre['resoudre-problemes']).toBe(0.3);
    expect(apres.actuelle['resoudre-problemes']).toBe(0.44);
    expect(toile.actuelle['resoudre-problemes']).toBe(0.3);
  });

  it('complète les domaines manquants et borne les valeurs', () => {
    const niveaux = completerNiveaux('CE2', { nombres: 1.4, geometrie: -1 });
    expect(Object.keys(niveaux)).toHaveLength(6);
    expect(niveaux.nombres).toBe(1);
    expect(niveaux.geometrie).toBe(0);
    expect(niveaux['calcul-mental']).toBe(0.5);
  });
});

describe('bilan', () => {
  const niveaux = {
    nombres: 0.8,
    'ligne-graduee': 0.6,
    'calcul-mental': 0.75,
    'calcul-en-ligne': 0.5,
    'resoudre-problemes': 0.3,
    geometrie: 0.65,
  };

  it('range les domaines en forts, à consolider et priorité', () => {
    const bilan = analyserToile('CE2', niveaux);
    expect(bilan.forts.map((d) => d.id)).toEqual(['nombres', 'calcul-mental']);
    expect(bilan.priorite?.id).toBe('resoudre-problemes');
    expect(bilan.aConsolider.map((d) => d.id)).toEqual(['ligne-graduee', 'calcul-en-ligne', 'geometrie']);
  });

  it('n’a pas de priorité quand tout est solide', () => {
    const tout = completerNiveaux('CE2', Object.fromEntries(Object.keys(niveaux).map((k) => [k, 0.9])));
    expect(analyserToile('CE2', tout).priorite).toBeNull();
  });

  it('ordonne les domaines du plus fragile au plus solide', () => {
    expect(domainesParPriorite('CE2', niveaux)[0]).toBe('resoudre-problemes');
    expect(domainesParPriorite('CE2', undefined)[0]).toBe('nombres');
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
