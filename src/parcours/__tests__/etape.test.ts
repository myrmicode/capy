import { JEUX, OPERATIONS_BON_FIL } from '@/jeux/registre';

import { avancement, derouler, etatInitial } from '../deroulement';
import { genererEtape } from '../etape';

const BASE = { classe: 'CE2', domaine: 'resoudre-problemes', jeux: ['marche', 'bonFil', 'reponses'] } as const;

describe('composition d’une étape', () => {
  it('est rejouable à l’identique avec la même graine', () => {
    expect(genererEtape({ ...BASE, graine: 99 })).toEqual(genererEtape({ ...BASE, graine: 99 }));
  });

  it('mélange plusieurs mini-jeux et respecte leurs contraintes, sur 500 étapes', () => {
    for (let graine = 0; graine < 500; graine++) {
      const etape = genererEtape({ ...BASE, graine });
      expect(etape).toHaveLength(5);
      expect(new Set(etape.map((q) => q.jeu)).size).toBeGreaterThanOrEqual(2);
      for (const { jeu, exercice } of etape) {
        const def = JEUX[jeu];
        expect(def.accepte(exercice)).toBe(true);
        if (def.modeles) expect(def.modeles).toContain(exercice.modeleId);
        if (jeu === 'marche') {
          expect(exercice.enonce).toMatch(/fraises/);
          expect(exercice.reponse).toBeLessThanOrEqual(30);
        }
        if (jeu === 'bonFil' && exercice.nature === 'nombre')
          expect(OPERATIONS_BON_FIL).toContain(exercice.operations[0]);
      }
      // Jamais deux fois le même exercice dans une étape.
      expect(new Set(etape.map((q) => q.exercice.enonce)).size).toBe(etape.length);
    }
  });

  it('renvoie une étape vide quand l’axe n’a pas encore de modèles', () => {
    expect(genererEtape({ ...BASE, classe: 'CE1', domaine: 'lire-mots', modeles: undefined, graine: 1 })).toEqual([]);
  });
});

describe('déroulement d’une étape', () => {
  it('enchaîne Bravo et Continuer jusqu’à la fin', () => {
    let etat = etatInitial(2);
    etat = derouler(etat, { type: 'repondre', juste: true });
    expect(etat.phase).toBe('bravo');
    expect(avancement(etat)).toBe(0.5);
    etat = derouler(etat, { type: 'continuer' });
    expect(etat).toMatchObject({ index: 1, phase: 'question' });
    etat = derouler(etat, { type: 'repondre', juste: true });
    etat = derouler(etat, { type: 'continuer' });
    expect(etat.phase).toBe('terminee');
    expect(etat.reussiesPremierCoup).toBe(2);
    expect(avancement(etat)).toBe(1);
  });

  it('permet de réessayer sans limite après « Presque »', () => {
    let etat = etatInitial(1);
    for (let i = 0; i < 50; i++) {
      etat = derouler(etat, { type: 'repondre', juste: false });
      expect(etat.phase).toBe('presque');
      etat = derouler(etat, { type: 'reessayer' });
      expect(etat.phase).toBe('question');
    }
    etat = derouler(etat, { type: 'repondre', juste: true });
    expect(etat.phase).toBe('bravo');
    expect(etat.reussiesPremierCoup).toBe(0);
    expect(etat.essaisRates).toBe(50);
  });

  it('ignore les actions qui n’ont pas de sens à ce moment-là', () => {
    const etat = etatInitial(3);
    expect(derouler(etat, { type: 'continuer' })).toBe(etat);
    expect(derouler(etat, { type: 'reessayer' })).toBe(etat);
    const bravo = derouler(etat, { type: 'repondre', juste: true });
    expect(derouler(bravo, { type: 'repondre', juste: false })).toBe(bravo);
  });

  it('recommence une étape terminée', () => {
    let etat = derouler(etatInitial(1), { type: 'repondre', juste: true });
    etat = derouler(etat, { type: 'continuer' });
    expect(derouler(etat, { type: 'recommencer' })).toEqual(etatInitial(1));
  });
});
