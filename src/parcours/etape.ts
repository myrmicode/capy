import type { Classe } from '@/config/classes';
import type { DomaineId } from '@/config/domaines';
import { creerAlea, modelesPour, type ExerciceQuelconque } from '@/exercices';
import { JEUX, type JeuId } from '@/jeux/registre';

export interface QuestionEtape {
  jeu: JeuId;
  exercice: ExerciceQuelconque;
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
}

const ESSAIS_PAR_QUESTION = 200;

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
}: ParametresEtape): QuestionEtape[] {
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

  for (let i = 0; i < nombreQuestions; i++) {
    const jeu = JEUX[ordre[i % ordre.length]];
    const candidats = modeles.filter((m) => !jeu.modeles || jeu.modeles.includes(m.id));
    // On évite deux fois de suite le même modèle quand c'est possible.
    const varies = candidats.filter((m) => m.id !== dernierModele);
    const choisis = varies.length > 0 ? varies : candidats;

    let exercice: ExerciceQuelconque | null = null;
    for (let essai = 0; essai < ESSAIS_PAR_QUESTION && !exercice; essai++) {
      const modele = alea.choix(choisis);
      const ex = modele.generer(classe, alea.entier(0, 2 ** 31 - 1), { histoire: jeu.histoire });
      if (jeu.accepte(ex) && !dejaPosees.has(ex.enonce)) exercice = ex;
    }
    if (!exercice) throw new Error(`Aucun exercice ne convient au jeu « ${jeu.id} » en ${classe}.`);

    questions.push({ jeu: jeu.id, exercice });
    dernierModele = exercice.modeleId;
    dejaPosees.add(exercice.enonce);
  }
  return questions;
}
