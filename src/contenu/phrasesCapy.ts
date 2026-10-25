// Ce que dit Capy, en plusieurs versions pour ne pas toujours lire la même
// phrase. Toujours bienveillant : jamais « faux », « note » ni « score ».
// Le choix dépend d'une graine (numéro de question, jour…), donc il est
// reproductible : la même question donne la même phrase.

export const PHRASES_CAPY = {
  /** Titre du panneau après une bonne réponse. */
  bravo: ['Bravo !', 'Super !', 'Bien joué !', 'C’est ça !', 'Excellent !', 'Génial !'],
  /** Titre du panneau après une erreur : on encourage à chercher encore. */
  presque: ['Presque !', 'Pas tout à fait…', 'On y est presque !', 'Cherche encore un peu !'],
  /** Petite phrase manuscrite à la fin d'une étape. */
  finEtape: ['Petit pas après petit pas…', 'Chaque jour un peu plus loin.', 'Tu avances bien !', 'Quel beau travail !'],
  /** Invitation sur le parcours, avant le nom de la prochaine étape. */
  prochaine: ['On y va ?', 'Prêt pour la suite ?', 'C’est reparti ?', 'Allez, on continue ?'],
  /** Après un jour sans jouer ou plus, dans la même semaine. */
  retour: ['Content de te revoir !', 'Te revoilà !', 'Ah, te voilà !'],
} as const satisfies Record<string, readonly string[]>;

/** Une phrase de la liste, choisie par la graine (entier quelconque, même négatif). */
export function phraseDe(liste: readonly string[], graine: number): string {
  const n = liste.length;
  return liste[((Math.trunc(graine) % n) + n) % n];
}

/** Graine du jour (AAAA-MM-JJ) : la phrase change chaque jour, pas à chaque affichage. */
export function graineDuJour(jour: string): number {
  return Number(jour.replace(/-/g, ''));
}
