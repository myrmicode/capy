/**
 * Compétence visée : savoir trouver des synonymes (et ne pas les confondre avec
 * des mots de sens contraire). Attendus de fin de cycle 2 (CE2) ;
 * axe « Reconnaître des synonymes ».
 */
import { SYNONYMES } from '../../lexique';
import { definirModeleTexte } from '../../moteur';

export const synonymes = definirModeleTexte({
  id: 'synonymes',
  titre: 'Le mot qui veut dire pareil',
  domaine: 'synonymes',
  competence: 'Trouver le synonyme d’un mot parmi des mots de même classe.',
  classes: ['CE2'],
  construire: (alea) => {
    const paire = alea.choix(SYNONYMES);
    // On demande dans un sens ou dans l'autre.
    const [mot, reponse] = alea.choix([true, false]) ? [paire.mot, paire.synonyme] : [paire.synonyme, paire.mot];
    const memeClasse = SYNONYMES.filter((p) => p !== paire && p.classe === paire.classe);
    const autres = alea
      .melanger(memeClasse)
      .map((p) => alea.choix([p.mot, p.synonyme]))
      // Aucun autre mot proposé ne doit pouvoir passer pour un synonyme.
      .filter((m) => m !== paire.contraire);
    const distracteurs = [
      ...(paire.contraire ? [{ valeur: paire.contraire, erreur: 'mot de sens contraire' }] : []),
      ...autres.map((m) => ({ valeur: m, erreur: 'mot sans rapport de sens' })),
    ];
    return {
      enonce: `« ${mot} »`,
      question: 'Quel mot veut presque dire la même chose ?',
      reponse,
      distracteurs,
      indice: 'Imagine une phrase avec ce mot, puis remplace-le par chaque proposition : le sens doit rester le même.',
      explication:
        `« ${mot} » et « ${reponse} » veulent presque dire la même chose : ce sont des synonymes.` +
        (paire.contraire ? ` Attention, « ${paire.contraire} » veut dire le contraire.` : ''),
    };
  },
});
