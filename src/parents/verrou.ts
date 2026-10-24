// Déverrouillage de l'espace parent, partagé entre ses écrans (réglages de
// lecture et de jeu compris). Il expire vite et se referme dès que l'enfant
// revient sur son parcours.
const DUREE_MS = 10 * 60_000;
let deverrouilleJusqua = 0;

export function deverrouillerParents(maintenant = Date.now()) {
  deverrouilleJusqua = maintenant + DUREE_MS;
}

export function verrouillerParents() {
  deverrouilleJusqua = 0;
}

export function parentsDeverrouilles(maintenant = Date.now()): boolean {
  return maintenant < deverrouilleJusqua;
}
