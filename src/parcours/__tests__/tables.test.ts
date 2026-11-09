import { resumeSemaine } from '@/parents/semaine';
import { fusionnerProgression } from '@/serveur/fusion';

import { enregistrerTables, progressionVide } from '../progression';
import {
  cleTables,
  messageTables,
  questionsTables,
  QUESTIONS_TABLES,
  resultat,
  tablesOuvertes,
  tauxReussite,
} from '../tables';

const LUNDI = new Date(2026, 10, 2, 17, 0);

describe('Les tables de Capy', () => {
  it('pose la table choisie dans l’ordre, de 1 à 10', () => {
    const q = questionsTables(7, false, 42);
    expect(q.map((x) => `${x.a}×${x.b}`)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((b) => `7×${b}`));
  });

  it('dans le désordre : les mêmes 10 calculs, mélangés, et toujours pareils pour une graine', () => {
    const q = questionsTables(7, true, 42);
    expect(q).toHaveLength(QUESTIONS_TABLES);
    expect(q.every((x) => x.a === 7)).toBe(true);
    expect(q.map((x) => x.b).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(questionsTables(7, true, 42)).toEqual(q);
    const ordres = new Set([1, 2, 3, 4, 5].map((g) => JSON.stringify(questionsTables(7, true, g))));
    expect(ordres.size).toBeGreaterThan(1);
  });

  it('toutes les tables : 10 calculs différents, au plus un avec 1', () => {
    for (let g = 0; g < 200; g++) {
      const q = questionsTables('toutes', false, g);
      expect(q).toHaveLength(QUESTIONS_TABLES);
      const paires = new Set(q.map((x) => [Math.min(x.a, x.b), Math.max(x.a, x.b)].join('×')));
      expect(paires.size).toBe(QUESTIONS_TABLES);
      expect(q.filter((x) => x.a === 1 || x.b === 1).length).toBeLessThanOrEqual(1);
      for (const x of q) {
        expect(x.a).toBeGreaterThanOrEqual(1);
        expect(x.b).toBeLessThanOrEqual(10);
      }
    }
  });

  it('calcule le résultat et le taux de réussite', () => {
    expect(resultat({ a: 7, b: 8 })).toBe(56);
    expect(tauxReussite(7, 10)).toBe(70);
    expect(tauxReussite(2, 3)).toBe(67);
    expect(tauxReussite(0, 0)).toBe(0);
  });

  it('pas de tables au CP', () => {
    expect(tablesOuvertes('CP')).toBe(false);
    expect(tablesOuvertes('CE1')).toBe(true);
  });

  it('garde le record par table, compte le jour, et se compare à soi-même', () => {
    let p = enregistrerTables(progressionVide(), cleTables(7), 6, 50, LUNDI);
    p = enregistrerTables(p, cleTables(7), 4, 50, LUNDI);
    p = enregistrerTables(p, cleTables('toutes'), 10, 60, LUNDI);
    expect(p.tables?.['table-7']).toMatchObject({ record: 6, series: 2 });
    expect(p.tables?.toutes?.record).toBe(10);
    expect(p.jours).toContain('2026-11-02');
    // Aucune étape fictive ne reste dans le parcours.
    expect(Object.keys(p.etapes)).toHaveLength(0);

    expect(messageTables(10, 10, undefined, 'Lou')).toMatch(/Parfait/);
    expect(messageTables(5, 10, undefined, 'Lou')).toMatch(/pour commencer/);
    expect(messageTables(8, 10, p.tables?.['table-7'], 'Lou')).toMatch(/Nouveau record.*2 de plus/);
    expect(messageTables(3, 10, p.tables?.['table-7'], 'Lou')).toMatch(/Ton record est de 6/);
  });

  it('se fusionne entre deux appareils et apparaît dans le résumé des parents', () => {
    const a = enregistrerTables(progressionVide(), 'table-3', 7, 40, LUNDI);
    const b = enregistrerTables(progressionVide(), 'table-3', 10, 40, LUNDI);
    expect(fusionnerProgression(a, b).tables?.['table-3'].record).toBe(10);
    expect(fusionnerProgression(progressionVide(), progressionVide()).tables).toBeUndefined();

    const phrases = resumeSemaine({ prenom: 'Lou', classe: 'CE2', progression: b }, LUNDI);
    expect(phrases.join(' ')).toMatch(/Les tables de Capy : table de 3 cette semaine\. Sans faute : table de 3\./);
  });
});
