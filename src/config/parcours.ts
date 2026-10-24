// Parcours par thème : des unités d'étapes, chacune terminée par un coffre.
// Chaque étape choisit les modèles d'exercices travaillés et mélange 2 ou 3 mini-jeux.
import type { JeuId } from '@/jeux/registre';

import type { Classe } from './classes';
import type { DomaineId } from './domaines';

export interface EtapeTheme {
  id: string;
  titre: string;
  modeles: readonly string[];
  jeux: readonly JeuId[];
  nombreQuestions: number;
}

export interface Unite {
  id: string;
  titre: string;
  etapes: readonly EtapeTheme[];
  /** Identifiant du coffre de fin d'unité. */
  coffre: string;
}

export interface Theme {
  id: string;
  domaine: DomaineId;
  classe: Classe;
  titre: string;
  unites: readonly Unite[];
}

const RESOUDRE_PROBLEMES_CE2: Theme = {
  id: 'ce2-resoudre-problemes',
  domaine: 'resoudre-problemes',
  classe: 'CE2',
  titre: 'Résoudre des problèmes',
  unites: [
    {
      id: 'ce2-rp-u1',
      titre: 'Au marché',
      coffre: 'ce2-rp-u1-coffre',
      etapes: [
        { id: 'ce2-rp-1', titre: 'Les paquets', modeles: ['groupements'], jeux: ['marche', 'reponses'], nombreQuestions: 5 },
        { id: 'ce2-rp-2', titre: 'On en ajoute', modeles: ['ajout'], jeux: ['bonFil', 'reponses'], nombreQuestions: 5 },
        { id: 'ce2-rp-3', titre: 'On en enlève', modeles: ['retrait'], jeux: ['bonFil', 'reponses'], nombreQuestions: 5 },
        {
          id: 'ce2-rp-4',
          titre: 'Ajouter ou enlever ?',
          modeles: ['ajout', 'retrait'],
          jeux: ['bonFil', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-rp-5',
          titre: 'Petite révision',
          modeles: ['groupements', 'ajout', 'retrait'],
          jeux: ['marche', 'bonFil', 'reponses'],
          nombreQuestions: 6,
        },
      ],
    },
    {
      id: 'ce2-rp-u2',
      titre: 'À la ferme',
      coffre: 'ce2-rp-u2-coffre',
      etapes: [
        { id: 'ce2-rp-6', titre: 'Combien de plus ?', modeles: ['ecart'], jeux: ['bonFil', 'reponses'], nombreQuestions: 5 },
        {
          id: 'ce2-rp-7',
          titre: 'Multiplier et partager',
          modeles: ['groupements', 'partage'],
          jeux: ['marche', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-rp-8',
          titre: 'En deux étapes',
          modeles: ['deux-etapes', 'ajout'],
          jeux: ['bonFil', 'reponses'],
          nombreQuestions: 5,
        },
        {
          id: 'ce2-rp-9',
          titre: 'Le bon calcul',
          modeles: ['ecart', 'retrait', 'groupements'],
          jeux: ['bonFil', 'reponses'],
          nombreQuestions: 6,
        },
        {
          id: 'ce2-rp-10',
          titre: 'Grande révision',
          modeles: ['groupements', 'ajout', 'retrait', 'ecart', 'partage', 'deux-etapes'],
          jeux: ['marche', 'bonFil', 'reponses'],
          nombreQuestions: 7,
        },
      ],
    },
  ],
};

export const THEMES: readonly Theme[] = [RESOUDRE_PROBLEMES_CE2];

export function themesDe(classe: Classe): Theme[] {
  return THEMES.filter((t) => t.classe === classe);
}

export function trouverEtape(etapeId: string): { theme: Theme; unite: Unite; etape: EtapeTheme } | undefined {
  for (const theme of THEMES) {
    for (const unite of theme.unites) {
      const etape = unite.etapes.find((e) => e.id === etapeId);
      if (etape) return { theme, unite, etape };
    }
  }
  return undefined;
}

export function trouverCoffre(coffreId: string): { theme: Theme; unite: Unite } | undefined {
  for (const theme of THEMES) {
    const unite = theme.unites.find((u) => u.coffre === coffreId);
    if (unite) return { theme, unite };
  }
  return undefined;
}
