/**
 * Compétence visée : reconnaître le groupe nominal (déterminant, nom, adjectif)
 * et réaliser l'accord en genre et en nombre de l'adjectif avec le nom.
 * Attendus de fin de cycle 2 (CE2) ; axe « Accorder le nom et l'adjectif ».
 */
import { decrireNom, formeAdjectif, type Genre, type Nombre } from '../../lexique';
import { definirModeleTexte, majuscule, NIVEAUX_CM } from '../../moteur';
import { groupeNominal } from '../../phrases';

const ERREURS: Record<string, string> = {
  ms: 'accord oublié (forme du dictionnaire)',
  fs: 'pluriel oublié',
  mp: 'féminin oublié',
  fp: 'féminin pluriel au lieu de la bonne forme',
};

export const accordAdjectif = definirModeleTexte({
  id: 'accord-adjectif',
  titre: 'Le bon accord',
  domaine: 'accord-nom-adjectif',
  competence: 'Accorder l’adjectif en genre et en nombre avec le nom dans le groupe nominal.',
  classes: ['CE2', 'CM1', 'CM2'],
  niveauxParClasse: { CM1: NIVEAUX_CM, CM2: NIVEAUX_CM },
  // + : singulier seulement (masculin ou féminin) ; ++ : pluriels réguliers en -s ;
  // +++ : tous les pluriels (chevaux, bateaux…).
  construire: (alea, _classe, niveau) => {
    const gn = groupeNominal(alea, ['animal', 'humain', 'objet'], {
      adjectif: true,
      ...(niveau === 1 ? { nombre: 'singulier' as const } : {}),
    });
    const pluriel = gn.nombre === 'pluriel';
    if (niveau === 2 && pluriel && gn.nom.pluriel !== `${gn.nom.singulier}s`) return null;
    const a = gn.adjectif!;
    const forme = formeAdjectif(a, gn.genre, gn.nombre);
    const nomTexte = gn.mots.find((m) => m.nature === 'Nom')!.texte;
    const formes: { cle: 'ms' | 'fs' | 'mp' | 'fp'; genre: Genre; nombre: Nombre }[] = [
      { cle: 'ms', genre: 'm', nombre: 'singulier' },
      { cle: 'fs', genre: 'f', nombre: 'singulier' },
      { cle: 'mp', genre: 'm', nombre: 'pluriel' },
      { cle: 'fp', genre: 'f', nombre: 'pluriel' },
    ];
    const autres = formes.filter((f) => !(f.genre === gn.genre && f.nombre === gn.nombre));
    const accord = `« ${nomTexte} » est un nom ${decrireNom(gn.nom, gn.nombre)}. L’adjectif s’accorde avec lui : on écrit « ${forme} ».`;
    const indice = `Regarde le nom « ${nomTexte} » et son déterminant : masculin ou féminin ? Singulier ou pluriel ?`;

    if (alea.choix([true, false])) {
      // Le groupe nominal avec un trou à la place de l'adjectif.
      const avecTrou = gn.mots.map((m) => (m.nature === 'Adjectif' ? '___' : m.texte)).join(' ');
      return {
        enonce: majuscule(avecTrou),
        question: `Comment s’écrit « ${a.ms} » dans ce groupe ?`,
        reponse: forme,
        distracteurs: autres.map((f) => ({ valeur: formeAdjectif(a, f.genre, f.nombre), erreur: ERREURS[f.cle] })),
        indice,
        explication: accord,
      };
    }
    // Trouver le groupe nominal bien accordé parmi plusieurs.
    const ecrire = (adjForme: string) =>
      majuscule(gn.mots.map((m) => (m.nature === 'Adjectif' ? adjForme : m.texte)).join(' '));
    return {
      enonce: `Capy a écrit plusieurs fois le même groupe de mots.`,
      question: 'Quel groupe est bien accordé ?',
      reponse: ecrire(forme),
      distracteurs: autres.map((f) => ({
        valeur: ecrire(formeAdjectif(a, f.genre, f.nombre)),
        erreur: ERREURS[f.cle],
      })),
      indice,
      explication: `${accord} Le groupe bien accordé est « ${ecrire(forme)} ».`,
    };
  },
});
