// Moteur des exercices de français : comme pour les mathématiques, chaque
// exercice est tiré par le code à partir du lexique, avec une graine
// (reproductible), et ses mauvaises réponses viennent d'erreurs typiques.
import type { Classe } from '@/config/classes';
import type { DomaineId } from '@/config/domaines';

import { creerAlea, type Alea } from '../alea';
import type { DistracteurTexte, ExerciceTexte, ModeleTexte, Segment } from '../types';

export const NOMBRE_DISTRACTEURS_TEXTE = 3;
const ESSAIS_MAX = 1000;

export interface ContenuTexte {
  enonce: string;
  question: string;
  reponse: string;
  distracteurs: DistracteurTexte[];
  segments?: Segment[];
  /** Toutes les catégories possibles (jeu des paniers) : elles deviennent les choix, dans cet ordre. */
  categories?: string[];
  indice: string;
  explication: string;
}

export interface DefinitionModeleTexte {
  id: string;
  titre: string;
  domaine: DomaineId;
  /** Compétence visée, formulée d'après les attendus officiels (relecture par un enseignant). */
  competence: string;
  classes: Classe[];
  /** Fabrique un exercice ; renvoie null pour retenter un autre tirage. */
  construire: (alea: Alea, classe: Classe) => ContenuTexte | null;
}

/** Garde des distracteurs différents de la réponse et entre eux. */
export function choisirDistracteursTexte(reponse: string, candidats: readonly DistracteurTexte[]): DistracteurTexte[] {
  const vus = new Set([reponse]);
  const retenus: DistracteurTexte[] = [];
  for (const c of candidats) {
    if (retenus.length >= NOMBRE_DISTRACTEURS_TEXTE || vus.has(c.valeur) || c.valeur.trim() === '') continue;
    vus.add(c.valeur);
    retenus.push(c);
  }
  return retenus;
}

export function definirModeleTexte(def: DefinitionModeleTexte): ModeleTexte {
  return {
    id: def.id,
    titre: def.titre,
    domaine: def.domaine,
    competence: def.competence,
    classes: def.classes,
    generer: (classe, graine): ExerciceTexte => {
      if (!def.classes.includes(classe)) {
        throw new Error(`Le modèle « ${def.id} » n'a pas de règles pour la classe ${classe}.`);
      }
      const alea = creerAlea(graine);
      for (let essai = 0; essai < ESSAIS_MAX; essai++) {
        const contenu = def.construire(alea, classe);
        if (!contenu) continue;
        const distracteurs = choisirDistracteursTexte(contenu.reponse, contenu.distracteurs);
        if (!contenu.categories && distracteurs.length < 2) continue;
        return {
          nature: 'texte',
          modeleId: def.id,
          domaine: def.domaine,
          classe,
          graine,
          enonce: contenu.enonce,
          question: contenu.question,
          reponse: contenu.reponse,
          distracteurs,
          choix: contenu.categories ?? alea.melanger([contenu.reponse, ...distracteurs.map((d) => d.valeur)]),
          ...(contenu.segments ? { segments: contenu.segments } : {}),
          ...(contenu.categories ? { categories: contenu.categories } : {}),
          indice: contenu.indice,
          explication: contenu.explication,
        };
      }
      throw new Error(`Le modèle « ${def.id} » n'arrive pas à tirer un exercice valide en ${classe}.`);
    },
  };
}

/** Met une majuscule au début d'une phrase. */
export function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** Recolle des segments en phrase (espaces, virgule déjà incluse, point final). */
export function phrase(segments: readonly Segment[], ponctuation = '.'): string {
  return `${segments.map((s) => s.texte).join(' ')}${ponctuation}`;
}
