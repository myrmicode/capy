// Les schémas en barres (modélisation, « méthode de Singapour ») : avant de
// calculer, on dessine l'histoire. Trois structures couvrent les problèmes du
// primaire :
// - le tout et ses parties (ajouter, enlever, rendre la monnaie, deux étapes) ;
// - la comparaison (deux barres, l'écart entre elles) ;
// - les parts égales (paquets, partages).
// Le nombre cherché est un point d'interrogation. Fonctions pures, testées.
import { creerAlea } from './alea';
import { nb } from './moteur';
import type { Exercice } from './types';

export type Schema =
  | { type: 'parties'; tout: number | null; parties: readonly (number | null)[] }
  | { type: 'comparaison'; grand: number | null; petit: number | null; ecart: number | null }
  | { type: 'groupes'; total: number | null; nombre: number; parGroupe: number | null };

/** Modèles de problèmes qui ont un schéma. */
export const MODELES_AVEC_SCHEMA = [
  'ajout',
  'payer',
  'retrait',
  'rendre-monnaie',
  'deux-etapes',
  'ecart',
  'groupements',
  'partage',
] as const;

/** Le schéma qui raconte l'histoire du problème (null si le problème n'en a pas). */
export function schemaDe(ex: Exercice): Schema | null {
  const d = ex.donnees;
  switch (ex.modeleId) {
    case 'ajout':
      return { type: 'parties', tout: null, parties: [d.depart, d.ajout] };
    case 'payer':
      return { type: 'parties', tout: null, parties: [d.prixA, d.prixB] };
    case 'retrait':
      return { type: 'parties', tout: d.depart, parties: [d.retrait, null] };
    case 'rendre-monnaie':
      return { type: 'parties', tout: d.billet, parties: [d.prix, null] };
    case 'deux-etapes':
      return { type: 'parties', tout: d.depart, parties: [d.premier, d.second, null] };
    case 'ecart':
      return { type: 'comparaison', grand: d.grand, petit: d.petit, ecart: null };
    case 'groupements':
      return { type: 'groupes', total: null, nombre: d.groupes, parGroupe: d.parGroupe };
    case 'partage':
      return { type: 'groupes', total: d.total, nombre: d.parts, parGroupe: null };
    default:
      return null;
  }
}

/** Des schémas qui ressemblent au bon, mais racontent une autre histoire : les confusions typiques. */
function schemasVoisins(s: Schema): Schema[] {
  if (s.type === 'parties') {
    const connues = s.parties.filter((p): p is number => p !== null);
    if (s.tout === null) {
      const [a, b] = connues;
      return [
        // Le premier nombre pris pour le tout : on enlèverait au lieu d'ajouter.
        { type: 'parties', tout: a, parties: [b, null] },
        { type: 'comparaison', grand: Math.max(a, b), petit: Math.min(a, b), ecart: null },
      ];
    }
    return [
      // On ajoute tout ce qu'on voit, au lieu de chercher la part qui manque.
      { type: 'parties', tout: null, parties: [s.tout, ...connues] },
      connues.length > 1
        ? { type: 'parties', tout: s.tout, parties: [connues[0], null] }
        : { type: 'parties', tout: connues[0], parties: [s.tout, null] },
    ];
  }
  if (s.type === 'comparaison') {
    const grand = s.grand ?? 0;
    const petit = s.petit ?? 0;
    return [
      { type: 'parties', tout: null, parties: [grand, petit] },
      { type: 'comparaison', grand: null, petit, ecart: grand },
    ];
  }
  if (s.total === null) {
    const parGroupe = s.parGroupe ?? 0;
    return [
      // Ajouter les deux nombres au lieu de faire des paquets.
      { type: 'parties', tout: null, parties: [s.nombre, parGroupe] },
      { type: 'groupes', total: parGroupe, nombre: s.nombre, parGroupe: null },
    ];
  }
  return [
    { type: 'groupes', total: null, nombre: s.nombre, parGroupe: s.total },
    { type: 'parties', tout: s.total, parties: [s.nombre, null] },
  ];
}

const cle = (s: Schema) => JSON.stringify(s);

/** Le bon schéma et deux voisins, mélangés de façon reproductible (jeu « Le bon schéma »). */
export function schemasAuChoix(ex: Exercice): { schemas: Schema[]; bon: number } | null {
  const bon = schemaDe(ex);
  if (!bon) return null;
  const vus = new Set([cle(bon)]);
  const voisins = schemasVoisins(bon).filter((s) => {
    if (vus.has(cle(s))) return false;
    vus.add(cle(s));
    return true;
  });
  const schemas = creerAlea(ex.graine).melanger([bon, ...voisins]);
  return { schemas, bon: schemas.findIndex((s) => cle(s) === cle(bon)) };
}

const ou = (n: number | null) => (n === null ? 'un nombre à trouver' : nb(n));

/** Ce que montre le schéma, en mots (lecteur d'écran). Le nombre cherché n'y est jamais. */
export function decrireSchema(s: Schema): string {
  if (s.type === 'parties') {
    return `Une barre. Le tout : ${ou(s.tout)}. Les morceaux : ${s.parties.map(ou).join(', ')}.`;
  }
  if (s.type === 'comparaison') {
    return `Deux barres. La grande : ${ou(s.grand)}. La petite : ${ou(s.petit)}. L’écart : ${ou(s.ecart)}.`;
  }
  return `Une barre en ${nb(s.nombre)} parts égales. Le tout : ${ou(s.total)}. Chaque part : ${ou(s.parGroupe)}.`;
}

/**
 * Les longueurs des morceaux d'une barre, à partir des nombres connus : le
 * morceau cherché prend ce qui reste. Chaque morceau garde une largeur
 * minimale, pour qu'on puisse y lire son nombre.
 */
export function longueurs(valeurs: readonly (number | null)[], tout: number | null): number[] {
  const connues = valeurs.filter((v): v is number => v !== null);
  const somme = connues.reduce((a, b) => a + b, 0);
  const total = tout ?? somme;
  const inconnues = valeurs.length - connues.length;
  const reste = inconnues > 0 ? Math.max(0, total - somme) / inconnues : 0;
  const brutes = valeurs.map((v) => v ?? reste);
  const reference = Math.max(
    1,
    brutes.reduce((a, b) => a + b, 0),
  );
  return brutes.map((v) => Math.max(v / reference, 0.18));
}
