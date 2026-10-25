/**
 * Compétence visée : identifier la phrase simple et l'ordre de ses constituants
 * (groupe sujet, verbe, complément ; complément placé en tête au niveau visé).
 * Attendus de fin de cycle 2 (CE2) ; axe « Repérer le sujet et le verbe ».
 *
 * La majuscule et le point restent sur leurs mots : ils aident à trouver le
 * début et la fin, et rendent l'ordre unique.
 */
import { conjuguer } from '../../conjugaison';
import { definirModeleTexte, majuscule } from '../../moteur';
import { groupeNominal, tirerVerbe } from '../../phrases';

const DEBUTS = ['Ce matin,', 'Dans la cour,', 'Le soir,', 'Sous la pluie,', 'Après l’école,'];

export const phraseEnOrdre = definirModeleTexte({
  id: 'phrase-en-ordre',
  titre: 'La phrase en désordre',
  domaine: 'sujet-verbe',
  competence: 'Remettre dans l’ordre les mots d’une phrase simple : groupe sujet, verbe, complément.',
  classes: ['CE2'],
  // + : sujet sans adjectif ; ++ : avec un adjectif ; +++ : un complément peut ouvrir la phrase.
  construire: (alea, _classe, niveau) => {
    const sujet = groupeNominal(alea, ['animal', 'humain'], { adjectif: niveau >= 2 });
    const infinitif = tirerVerbe(alea, sujet.nom.categorie);
    const verbe = conjuguer(infinitif, 'present', sujet.nombre === 'singulier' ? 2 : 5);
    const complement = groupeNominal(alea, ['objet'], { adjectif: false, nombre: 'singulier' });
    const debut = niveau === 3 && alea.choix([true, false]) ? alea.choix(DEBUTS) : null;

    const groupeSujet = sujet.mots.map((m) => m.texte);
    const groupeComplement = complement.mots.map((m) => m.texte);
    const mots = [...(debut ? debut.split(' ') : []), ...groupeSujet, verbe, ...groupeComplement];
    mots[0] = majuscule(mots[0]);
    mots[mots.length - 1] = `${mots[mots.length - 1]}.`;
    // Un même mot deux fois rendrait l'ordre ambigu pour l'enfant (et pour la vérification).
    if (new Set(mots.map((m) => m.toLowerCase())).size !== mots.length) return null;
    const reponse = mots.join(' ');

    // Mots mélangés, jamais déjà dans l'ordre.
    let desordre = alea.melanger(mots);
    for (let i = 0; i < 10 && desordre.join(' ') === reponse; i++) desordre = alea.melanger(mots);
    if (desordre.join(' ') === reponse) return null;

    // Mauvais ordres typiques (pour « La bonne réponse » seulement).
    const sansPoint = (g: string[]) => g.map((m) => m.replace(/\.$/, ''));
    const s = sansPoint(groupeSujet).join(' ');
    const c = sansPoint(groupeComplement).join(' ');
    const d = debut ? `${debut} ` : '';
    const distracteurs = [
      { valeur: majuscule(`${d}${verbe} ${s} ${c}.`), erreur: 'verbe avant le sujet' },
      { valeur: majuscule(`${d}${c} ${verbe} ${s}.`), erreur: 'sujet et complément échangés' },
      { valeur: majuscule(`${d}${s} ${c} ${verbe}.`), erreur: 'verbe à la fin' },
    ];

    return {
      enonce: desordre.join(' · '),
      question: 'Remets les mots dans l’ordre pour faire une phrase.',
      reponse,
      distracteurs,
      motsEnDesordre: desordre,
      lectureAutonome: true,
      indice: `Le mot avec une majuscule commence la phrase, le mot avec un point la termine. Cherche ensuite le verbe : « ${verbe} ». Qui est-ce qui ${verbe} ?`,
      explication: `La phrase commence par la majuscule et finit par le point. ${debut ? `On dit d’abord quand ou où : « ${debut} ». ` : ''}Puis le sujet, le verbe « ${verbe} » et la suite : « ${reponse} »`,
      facile: {
        indice: 'Le mot avec une majuscule va au début. Le mot avec un point va à la fin.',
        explication: `La phrase est : « ${reponse} »`,
      },
    };
  },
});
