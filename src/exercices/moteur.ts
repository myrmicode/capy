import type { Classe } from '@/config/classes';

import { creerAlea, type Alea } from './alea';
import type { DefinitionModele, Distracteur, Donnees, Exercice, ModeleExercice, ReglesClasse } from './types';

export const NOMBRE_DISTRACTEURS = 3;
const ESSAIS_MAX = 10_000;

/** Écrit un nombre à la française : 12 345 (espace fine insécable entre les milliers). */
export function nb(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function tirageUniforme<D extends Donnees>(alea: Alea, regles: ReglesClasse<D>): D {
  const d: Donnees = {};
  for (const [nom, { min, max }] of Object.entries(regles.donnees)) d[nom] = alea.entier(min, max);
  return d as D;
}

/**
 * Garde les erreurs typiques valables (entières, strictement positives,
 * différentes de la réponse et entre elles), puis complète si besoin par des
 * valeurs proches de la réponse.
 */
export function choisirDistracteurs(reponse: number, candidats: Distracteur[], alea: Alea): Distracteur[] {
  const retenus: Distracteur[] = [];
  const dejaVu = new Set([reponse]);
  const ajouter = (c: Distracteur) => {
    if (retenus.length < NOMBRE_DISTRACTEURS && Number.isInteger(c.valeur) && c.valeur > 0 && !dejaVu.has(c.valeur)) {
      retenus.push(c);
      dejaVu.add(c.valeur);
    }
  };
  candidats.forEach(ajouter);
  const ecarts = alea.melanger([1, -1, 2, -2, 10, -10, 3, -3, 5, -5, 20, 100]);
  for (const ecart of ecarts) ajouter({ valeur: reponse + ecart, erreur: 'valeur proche' });
  return retenus;
}

/** Transforme une définition de modèle en modèle utilisable. */
export function definirModele<D extends Donnees>(def: DefinitionModele<D>): ModeleExercice {
  const classes = Object.keys(def.regles) as Classe[];

  const reglesDe = (classe: Classe): ReglesClasse<D> => {
    const regles = def.regles[classe];
    if (!regles) throw new Error(`Le modèle « ${def.id} » n'a pas de règles pour la classe ${classe}.`);
    return regles;
  };

  return {
    id: def.id,
    titre: def.titre,
    domaine: def.domaine,
    competence: def.competence,
    operations: def.operations,
    classes,
    regles: (classe) => reglesDe(classe) as ReglesClasse<Donnees>,
    generer: (classe, graine, options = {}): Exercice => {
      const regles = reglesDe(classe);
      const alea = creerAlea(graine);
      for (let essai = 0; essai < ESSAIS_MAX; essai++) {
        const d = def.tirer ? def.tirer(alea, regles) : tirageUniforme(alea, regles);
        if (def.estValide && !def.estValide(d)) continue;
        const reponse = def.calculer(d);
        if (reponse < regles.reponse.min || reponse > regles.reponse.max) continue;

        const tiree = alea.choix(def.histoires);
        const histoire = options.histoire === undefined ? tiree : def.histoires[options.histoire];
        if (!histoire) throw new Error(`Le modèle « ${def.id} » n'a pas d'histoire n° ${options.histoire}.`);
        const { enonce, question, indice, explication, autresQuestions } = histoire(d, reponse);
        const distracteurs = choisirDistracteurs(reponse, def.erreursTypiques(d), alea);
        return {
          nature: 'nombre',
          modeleId: def.id,
          domaine: def.domaine,
          classe,
          graine,
          donnees: { ...d },
          enonce,
          question,
          reponse,
          operations: def.operations,
          distracteurs,
          choix: alea.melanger([reponse, ...distracteurs.map((x) => x.valeur)]),
          indice,
          explication,
          ...(autresQuestions ? { questionsAuChoix: alea.melanger([question, ...autresQuestions]) } : {}),
        };
      }
      throw new Error(`Le modèle « ${def.id} » n'arrive pas à tirer un exercice valide en ${classe}.`);
    },
  };
}
