// Moteur des exercices de français : comme pour les mathématiques, chaque
// exercice est tiré par le code à partir du lexique, avec une graine
// (reproductible), et ses mauvaises réponses viennent d'erreurs typiques.
import type { Classe } from '@/config/classes';
import type { DomaineId } from '@/config/domaines';

import { creerAlea, type Alea } from '../alea';
import {
  NIVEAU_CIBLE,
  type DistracteurTexte,
  type Illustration,
  type ExerciceTexte,
  type ModeleTexte,
  type NiveauDifficulte,
  type Segment,
  type VersionFacile,
} from '../types';

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
  /** Texte dit par Capy à la place de l'énoncé (dictée : le mot est dit, jamais écrit). */
  lecture?: string;
  /** Texte découpé en phrases à toucher ; la réponse est l'une d'elles. */
  phrases?: string[];
  /** L'enfant lit seul : « Écouter » ne lit pas le texte. */
  lectureAutonome?: boolean;
  /** Mots mélangés à remettre dans l'ordre. */
  motsEnDesordre?: string[];
  /** Figure dessinée dans l'énoncé. */
  illustration?: Illustration;
  indice: string;
  explication: string;
  /**
   * Version FALC (phrases courtes, une idée par phrase, mots simples) de la question,
   * de l'indice et de l'explication. Un champ absent reprend la version standard,
   * déjà assez simple (le test FALC le vérifie). L'énoncé, objet de l'exercice, ne change pas.
   */
  facile?: Partial<Pick<VersionFacile, 'question' | 'indice' | 'explication'>>;
}

export interface DefinitionModeleTexte {
  id: string;
  titre: string;
  domaine: DomaineId;
  /** Compétence visée, formulée d'après les attendus officiels (relecture par un enseignant). */
  competence: string;
  classes: Classe[];
  /**
   * Niveau du contenu pour chaque niveau demandé, quand une classe n'est pas
   * celle pour laquelle le contenu a été écrit (le CE2) : en CE1, le niveau visé
   * reprend le ++ du CE2 ; en CM, le + reprend déjà le ++ du CE2.
   */
  niveauxParClasse?: Partial<Record<Classe, Record<NiveauDifficulte, NiveauDifficulte>>>;
  /**
   * Fabrique un exercice au niveau demandé (1 : +, 2 : ++, 3 : +++, le niveau visé) ;
   * renvoie null pour retenter un autre tirage.
   */
  construire: (alea: Alea, classe: Classe, niveau: NiveauDifficulte) => ContenuTexte | null;
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
    generer: (classe, graine, options = {}): ExerciceTexte => {
      const niveau = options.niveau ?? NIVEAU_CIBLE;
      if (!def.classes.includes(classe)) {
        throw new Error(`Le modèle « ${def.id} » n'a pas de règles pour la classe ${classe}.`);
      }
      const alea = creerAlea(graine);
      for (let essai = 0; essai < ESSAIS_MAX; essai++) {
        const contenu = def.construire(alea, classe, def.niveauxParClasse?.[classe]?.[niveau] ?? niveau);
        if (!contenu) continue;
        const distracteurs = choisirDistracteursTexte(contenu.reponse, contenu.distracteurs);
        if (!contenu.categories && distracteurs.length < 2) continue;
        return {
          nature: 'texte',
          modeleId: def.id,
          niveau,
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
          ...(contenu.lecture ? { lecture: contenu.lecture } : {}),
          ...(contenu.phrases ? { phrases: contenu.phrases } : {}),
          ...(contenu.lectureAutonome ? { lectureAutonome: true } : {}),
          ...(contenu.motsEnDesordre ? { motsEnDesordre: contenu.motsEnDesordre } : {}),
          ...(contenu.illustration ? { illustration: contenu.illustration } : {}),
          indice: contenu.indice,
          explication: contenu.explication,
          facile: {
            enonce: contenu.enonce,
            question: contenu.facile?.question ?? contenu.question,
            indice: contenu.facile?.indice ?? contenu.indice,
            explication: contenu.facile?.explication ?? contenu.explication,
          },
        };
      }
      throw new Error(`Le modèle « ${def.id} » n'arrive pas à tirer un exercice valide en ${classe}.`);
    },
  };
}

/** Correspondance des niveaux : le contenu de CE2, un cran plus simple en CE1, un cran plus exigeant en CM. */
export const NIVEAUX_CE1: Record<NiveauDifficulte, NiveauDifficulte> = { 1: 1, 2: 1, 3: 2 };
export const NIVEAUX_CM: Record<NiveauDifficulte, NiveauDifficulte> = { 1: 2, 2: 3, 3: 3 };

/**
 * Reprend un modèle pour un autre axe de la toile (en CM2, « synonymes et
 * familles de mots » réunit deux axes du CM1) : mêmes exercices, autre axe.
 */
export function reprendreModele(
  modele: ModeleTexte,
  nouveau: { id: string; titre: string; domaine: DomaineId; classes: Classe[]; competence?: string },
): ModeleTexte {
  // Le contenu est celui de la dernière classe du modèle d'origine (la plus avancée).
  const source = modele.classes[modele.classes.length - 1];
  return {
    id: nouveau.id,
    titre: nouveau.titre,
    domaine: nouveau.domaine,
    competence: nouveau.competence ?? modele.competence,
    classes: nouveau.classes,
    generer: (classe, graine, options) => {
      if (!nouveau.classes.includes(classe)) {
        throw new Error(`Le modèle « ${nouveau.id} » n'a pas de règles pour la classe ${classe}.`);
      }
      return { ...modele.generer(source, graine, options), modeleId: nouveau.id, domaine: nouveau.domaine, classe };
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
