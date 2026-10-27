import type { Classe } from '@/config/classes';
import type { DomaineId } from '@/config/domaines';
import { creerAlea, modelesPour, NIVEAU_CIBLE, type ExerciceQuelconque, type NiveauDifficulte } from '@/exercices';
import { cleIllustration } from '@/exercices/types';
import { JEUX, type JeuId } from '@/jeux/registre';

import { niveauxDesQuestions } from './niveau';

export interface QuestionEtape {
  jeu: JeuId;
  exercice: ExerciceQuelconque;
  /** Petit rappel d'une question qui avait demandé plusieurs essais (voir revision.ts). */
  revision?: boolean;
}

export interface ParametresEtape {
  classe: Classe;
  domaine: DomaineId;
  graine: number;
  /** Mini-jeux à mélanger dans l'étape (2 ou 3). */
  jeux: readonly JeuId[];
  /** Modèles travaillés dans l'étape (tous ceux du domaine si absent). */
  modeles?: readonly string[];
  nombreQuestions?: number;
  /** Niveau de difficulté de l'étape (le niveau visé si absent) ; la dernière question est un cran au-dessus. */
  niveau?: NiveauDifficulte;
  /** Révision à poser en premier, sous une autre forme (même modèle, même mini-jeu, nouvel exercice). */
  revision?: { modeleId: string; jeu: JeuId; niveau: NiveauDifficulte };
}

const ESSAIS_PAR_QUESTION = 200;

/**
 * Ce qui ne doit pas revenir deux fois dans une étape : l'énoncé, ou le texte
 * dit par Capy quand l'énoncé est le même pour tous (texte entendu, dictée),
 * ou le nombre d'objets dessinés.
 */
const cleQuestion = (ex: ExerciceQuelconque) =>
  ex.lecture ?? (ex.illustration ? `${ex.enonce} ${cleIllustration(ex.illustration)}` : ex.enonce);

/**
 * Compose une étape : une suite de questions qui alterne les mini-jeux.
 * Entièrement déterminée par la graine, donc rejouable à l'identique.
 * Renvoie une liste vide si aucun modèle n'existe encore pour cette classe.
 */
export function genererEtape({
  classe,
  domaine,
  graine,
  jeux,
  modeles: modelesVoulus,
  nombreQuestions = 5,
  niveau = NIVEAU_CIBLE,
  revision,
}: ParametresEtape): QuestionEtape[] {
  const niveaux = niveauxDesQuestions(niveau, nombreQuestions);
  const alea = creerAlea(graine);
  const modeles = modelesPour(domaine, classe).filter((m) => !modelesVoulus || modelesVoulus.includes(m.id));
  const jeuxPossibles = jeux.filter((j) => {
    const jeu = JEUX[j];
    return modeles.some((m) => !jeu.modeles || jeu.modeles.includes(m.id));
  });
  if (jeuxPossibles.length === 0) return [];

  // Ordre des jeux : on parcourt la liste mélangée en boucle, ce qui garantit le mélange.
  const ordre = alea.melanger(jeuxPossibles);
  const questions: QuestionEtape[] = [];
  let dernierModele: string | null = null;
  const dejaPosees = new Set<string>();

  // La révision prend la place de la première question, si son modèle existe encore pour cette classe.
  const modeleRevu = revision && modelesPour(domaine, classe).find((m) => m.id === revision.modeleId);
  if (revision && modeleRevu && nombreQuestions > 1) {
    const jeu = JEUX[revision.jeu];
    for (let essai = 0; essai < ESSAIS_PAR_QUESTION; essai++) {
      const ex = modeleRevu.generer(classe, alea.entier(0, 2 ** 31 - 1), {
        histoire: jeu.histoire,
        niveau: revision.niveau,
      });
      if (jeu.accepte(ex)) {
        questions.push({ jeu: jeu.id, exercice: ex, revision: true });
        dernierModele = ex.modeleId;
        dejaPosees.add(cleQuestion(ex));
        break;
      }
    }
  }

  for (let i = questions.length; i < nombreQuestions; i++) {
    const jeu = JEUX[ordre[i % ordre.length]];
    const candidats = modeles.filter((m) => !jeu.modeles || jeu.modeles.includes(m.id));
    // On évite deux fois de suite le même modèle quand c'est possible.
    const varies = candidats.filter((m) => m.id !== dernierModele);
    const choisis = varies.length > 0 ? varies : candidats;

    let exercice: ExerciceQuelconque | null = null;
    for (let essai = 0; essai < ESSAIS_PAR_QUESTION && !exercice; essai++) {
      // Si le modèle « varié » ne convient jamais à ce jeu, on reprend tous les modèles du jeu.
      const modele = alea.choix(essai < ESSAIS_PAR_QUESTION / 2 ? choisis : candidats);
      const ex = modele.generer(classe, alea.entier(0, 2 ** 31 - 1), { histoire: jeu.histoire, niveau: niveaux[i] });
      if (jeu.accepte(ex) && !dejaPosees.has(cleQuestion(ex))) exercice = ex;
    }
    if (!exercice) throw new Error(`Aucun exercice ne convient au jeu « ${jeu.id} » en ${classe}.`);

    questions.push({ jeu: jeu.id, exercice });
    dernierModele = exercice.modeleId;
    dejaPosees.add(cleQuestion(exercice));
  }
  return questions;
}
