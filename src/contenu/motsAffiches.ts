// Tous les mots que l'enfant peut voir avec la coloration syllabique : textes
// des exercices (versions standard et FALC), choix, consignes des jeux.
// Sert au test qui vérifie que la banque de syllabes couvre tout le contenu.
import { motsDe } from '@/accessibilite/syllabes';
import { HISTOIRES, textesDHistoire } from '@/contenu/histoires';
import { MODELES_FRANCAIS } from '@/exercices/francais';
import { MODELES } from '@/exercices/modeles';
import { NIVEAUX, type ExerciceQuelconque } from '@/exercices/types';
import { JEUX } from '@/jeux/registre';

/** Les textes colorables d'un exercice. */
export function textesColorables(ex: ExerciceQuelconque): string[] {
  const textes = [
    ex.enonce,
    ex.question,
    ex.indice,
    ex.explication,
    ex.facile.enonce,
    ex.facile.question,
    ex.facile.indice,
    ex.facile.explication,
  ];
  // Les propositions de la dictée restent sans couleur : griser les lettres muettes donnerait l'orthographe.
  if (ex.nature === 'texte')
    textes.push(...(ex.lecture ? [] : ex.choix), ...(ex.phrases ?? []), ...(ex.segments ?? []).map((s) => s.texte));
  else textes.push(...(ex.questionsAuChoix ?? []));
  return textes;
}

/** Consignes et indices des jeux ; avec `faciles`, seulement ceux qu'on affiche en FALC ou en « toucher puis toucher ». */
export function textesDesJeux({ faciles = false } = {}): string[] {
  return Object.values(JEUX).flatMap((j) =>
    faciles
      ? [j.consigneFacile, j.consigneToucher ?? '', j.indiceFacile ?? '']
      : [j.consigne, j.consigneFacile, j.consigneToucher ?? '', j.indice ?? '', j.indiceFacile ?? ''],
  );
}

/** Les mots de tout le contenu CE2, sur un nombre de tirages donné par modèle et par niveau. */
export function motsDuContenu(tirages: number): Set<string> {
  const mots = new Set<string>();
  const ajouter = (t: string) => motsDe(t).forEach((m) => mots.add(m));
  for (const m of [...MODELES, ...MODELES_FRANCAIS]) {
    for (const niveau of NIVEAUX) {
      for (let g = 0; g < tirages; g++) textesColorables(m.generer('CE2', g, { niveau })).forEach(ajouter);
    }
  }
  textesDesJeux().forEach(ajouter);
  HISTOIRES.flatMap(textesDHistoire).forEach(ajouter);
  return mots;
}
