/**
 * Compétence visée : identifier la phrase simple et en repérer les principaux
 * constituants : le groupe sujet et le verbe (y compris quand un complément est
 * placé en tête de phrase). Attendus de fin de cycle 2 (CE2) ;
 * axe « Repérer le sujet et le verbe ».
 */
import { conjuguer, pronom } from '../../conjugaison';
import { definirModeleTexte, majuscule, NIVEAUX_CM, phrase } from '../../moteur';
import { groupeNominal, tirerNom, tirerVerbe } from '../../phrases';

const DEBUTS = ['Ce matin,', 'Dans la cour,', 'Le soir,', 'Sous la pluie,', 'Après l’école,'];

export const sujetEtVerbe = definirModeleTexte({
  id: 'sujet-et-verbe',
  titre: 'Le sujet et le verbe',
  domaine: 'sujet-verbe',
  competence: 'Repérer le verbe et le groupe sujet dans une phrase simple.',
  classes: ['CE2', 'CM1'],
  niveauxParClasse: { CM1: NIVEAUX_CM },
  // + : un groupe nominal en début de phrase ; ++ : aussi un pronom ou « Capy » ;
  // +++ : aussi un complément placé en tête de phrase (le sujet n'est plus au début).
  construire: (alea, _classe, niveau) => {
    // Le sujet : un groupe nominal, un pronom ou « Capy ».
    const forme = niveau === 1 ? 'gn' : alea.choix(['gn', 'gn', 'pronom', 'capy'] as const);
    let sujet: string;
    let pluriel: boolean;
    // Un pronom ou Capy peuvent tout faire ; un groupe nominal dépend du nom.
    let categorie: 'animal' | 'humain' = 'humain';
    if (forme === 'gn') {
      const gn = groupeNominal(alea, ['animal', 'humain'], { adjectif: alea.choix([true, false]) });
      sujet = gn.mots.map((m) => m.texte).join(' ');
      pluriel = gn.nombre === 'pluriel';
      categorie = gn.nom.categorie === 'animal' ? 'animal' : 'humain';
    } else if (forme === 'pronom') {
      pluriel = alea.choix([true, false]);
      sujet = pronom(pluriel ? 5 : 2, alea.choix([true, false]));
    } else {
      sujet = 'Capy';
      pluriel = false;
    }
    const infinitif = tirerVerbe(alea, categorie);
    const verbe = conjuguer(infinitif, 'present', pluriel ? 5 : 2);
    const objet = tirerNom(alea, ['objet']);
    const groupeComplement = `${objet.genre === 'm' ? alea.choix(['un', 'le']) : alea.choix(['une', 'la'])} ${objet.singulier}`;

    const debut = niveau === 3 && alea.choix([true, false]) ? alea.choix(DEBUTS) : null;
    const groupes = [...(debut ? [debut] : []), sujet, verbe, groupeComplement];
    const segments = groupes.map((g, i) => ({ texte: i === 0 ? majuscule(g) : g }));
    const indexSujet = debut ? 1 : 0;
    const texteSujet = segments[indexSujet].texte;
    const sujetDansLExplication = sujet === 'Capy' ? 'Capy' : sujet;

    const cherche = alea.choix(['sujet', 'verbe'] as const);
    const reponse = cherche === 'sujet' ? texteSujet : verbe;
    const autres = segments.map((s) => s.texte).filter((t) => t !== reponse);
    return {
      enonce: phrase(segments),
      question: cherche === 'sujet' ? 'Touche le groupe sujet.' : 'Touche le verbe.',
      reponse,
      distracteurs: autres.map((t) => ({
        valeur: t,
        erreur:
          t === verbe
            ? 'verbe au lieu du sujet'
            : t === texteSujet
              ? 'sujet au lieu du verbe'
              : 'complément au lieu du sujet ou du verbe',
      })),
      segments,
      indice:
        cherche === 'sujet'
          ? `Repère d’abord le verbe, puis pose la question « Qui est-ce qui ${conjuguer(infinitif, 'present', 2)} ${groupeComplement} ? ».`
          : 'Le verbe change si on dit « hier » ou « demain ». Repère le mot qui change.',
      explication: `« ${verbe} » est le verbe (${infinitif}). Qui est-ce qui ${conjuguer(infinitif, 'present', 2)} ${groupeComplement} ? ${pluriel ? 'Ce sont' : 'C’est'} « ${sujetDansLExplication} » : c’est le groupe sujet.`,
      facile: {
        indice:
          cherche === 'sujet'
            ? `Trouve le verbe. Puis demande : « Qui est-ce qui ${conjuguer(infinitif, 'present', 2)} ${groupeComplement} ? »`
            : 'Le verbe change si on dit « hier » ou « demain ».',
        explication: `Le verbe est « ${verbe} ». Le groupe sujet est « ${sujetDansLExplication} ».`,
      },
    };
  },
});
