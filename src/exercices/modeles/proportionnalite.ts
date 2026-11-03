/**
 * Compétence visée : résoudre un problème de proportionnalité (CM1, CM2), comme
 * dans les évaluations : « 4 cahiers coûtent 12 €, combien coûtent 8 cahiers ? ».
 * + : on achète 2 ou 3 fois plus ; ++ : jusqu'à 10 fois plus ; +++ : on passe
 * par la valeur d'un seul (6 cahiers, quand on connaît le prix de 4).
 * L'erreur typique, au cœur des évaluations : ajouter l'écart (4 cahiers de
 * plus, donc 4 € de plus) au lieu de multiplier.
 *
 * À FAIRE RELIRE PAR UN ENSEIGNANT, comme le reste du contenu.
 */
import { definirModele, nb } from '../moteur';

type D = { quantite: number; prix: number; autre: number };

/** Combien de fois plus, quand « autre » est un multiple de « quantite » ; sinon null. */
const fois = ({ quantite, autre }: D) => (autre % quantite === 0 ? autre / quantite : null);

/** Explication commune : par « combien de fois plus », ou par la valeur d'un seul. */
function methode(d: D, r: number, un: string, plusieurs: string, unite: string): string {
  const k = fois(d);
  if (k !== null)
    return `${nb(d.autre)} ${plusieurs}, c’est ${nb(k)} fois ${nb(d.quantite)} ${plusieurs}. Donc ${nb(k)} × ${nb(d.prix)} = ${nb(r)}${unite}.`;
  const u = d.prix / d.quantite;
  return `Pour ${un}, ${nb(d.prix)} : ${nb(d.quantite)} = ${nb(u)}${unite}. Pour ${nb(d.autre)} ${plusieurs}, ${nb(d.autre)} × ${nb(u)} = ${nb(r)}${unite}.`;
}

function methodeFacile(d: D, r: number, un: string, unite: string): string {
  const k = fois(d);
  if (k !== null) return `C’est ${nb(k)} fois plus. ${nb(k)} × ${nb(d.prix)} = ${nb(r)}${unite}.`;
  const u = d.prix / d.quantite;
  return `Pour ${un} : ${nb(u)}${unite}. ${nb(d.autre)} × ${nb(u)} = ${nb(r)}${unite}.`;
}

export const proportionnalite = definirModele<D>({
  id: 'proportionnalite',
  titre: 'Plus on en prend, plus ça coûte',
  domaine: 'resoudre-problemes',
  competence: 'Résoudre un problème de proportionnalité : utiliser « fois plus » ou passer par la valeur d’une unité.',
  operations: ['×'],
  regles: {
    CM1: {
      donnees: { quantite: { min: 2, max: 10 }, prix: { min: 2, max: 90 }, autre: { min: 3, max: 40 } },
      reponse: { min: 4, max: 200 },
    },
    CM2: {
      donnees: { quantite: { min: 2, max: 12 }, prix: { min: 2, max: 240 }, autre: { min: 3, max: 60 } },
      reponse: { min: 4, max: 600 },
    },
  },
  reglesAccessibles: {
    CM1: {
      1: {
        donnees: { quantite: { min: 2, max: 5 }, prix: { min: 2, max: 30 }, autre: { min: 4, max: 15 } },
        reponse: { min: 4, max: 60 },
      },
      2: {
        donnees: { quantite: { min: 2, max: 8 }, prix: { min: 2, max: 60 }, autre: { min: 4, max: 40 } },
        reponse: { min: 4, max: 150 },
      },
    },
    CM2: {
      1: {
        donnees: { quantite: { min: 2, max: 6 }, prix: { min: 2, max: 60 }, autre: { min: 4, max: 18 } },
        reponse: { min: 4, max: 120 },
      },
      2: {
        donnees: { quantite: { min: 2, max: 10 }, prix: { min: 2, max: 150 }, autre: { min: 4, max: 60 } },
        reponse: { min: 4, max: 400 },
      },
    },
  },
  // On tire le prix d'un seul : tout tombe juste. Au niveau +++, « autre » n'est plus un multiple de « quantite ».
  tirer: (alea, regles, niveau) => {
    const { quantite: q, prix: p, autre: a } = regles.donnees;
    const quantite = alea.entier(q.min, q.max);
    const unite = alea.entier(1, Math.max(1, Math.floor(p.max / quantite)));
    let autre: number;
    if (niveau === 3) {
      autre = alea.entier(a.min, a.max);
      for (let essai = 0; essai < 5 && autre % quantite === 0; essai++) autre = alea.entier(a.min, a.max);
    } else {
      autre = quantite * alea.entier(2, Math.max(2, Math.min(niveau === 1 ? 3 : 10, Math.floor(a.max / quantite))));
    }
    return { quantite, prix: unite * quantite, autre };
  },
  estValide: (d) => d.prix % d.quantite === 0 && d.autre !== d.quantite,
  calculer: ({ quantite, prix, autre }) => (prix / quantite) * autre,
  erreursTypiques: (d) => [
    { valeur: d.prix + (d.autre - d.quantite), erreur: 'écart ajouté au lieu de multiplier' },
    { valeur: d.prix * d.autre, erreur: 'prix de tout le lot multiplié' },
    { valeur: d.prix / d.quantite, erreur: 'arrêt à la valeur d’un seul' },
    { valeur: d.prix + d.autre, erreur: 'nombres ajoutés' },
  ],
  histoires: [
    (d, r) => ({
      enonce: `À la papeterie, ${nb(d.quantite)} cahiers pareils coûtent ${nb(d.prix)} €.`,
      question: `Combien coûtent ${nb(d.autre)} cahiers ?`,
      autresQuestions: ['Combien de pages a un cahier ?', 'De quelle couleur sont les cahiers ?'],
      indice: 'Cherche d’abord combien de fois plus de cahiers on achète, ou le prix d’un seul cahier.',
      explication: methode(d, r, 'un seul cahier', 'cahiers', ' €'),
      facile: {
        enonce: `${nb(d.quantite)} cahiers coûtent ${nb(d.prix)} €. Les cahiers sont pareils.`,
        question: `Combien coûtent ${nb(d.autre)} cahiers ?`,
        indice: 'Cherche le prix d’un seul cahier.',
        explication: methodeFacile(d, r, 'un seul cahier', ' €'),
      },
    }),
    (d, r) => ({
      enonce: `En ${nb(d.quantite)} minutes, la machine de la boulangerie fabrique ${nb(d.prix)} biscuits. Elle va toujours à la même vitesse.`,
      question: `Combien de biscuits fabrique-t-elle en ${nb(d.autre)} minutes ?`,
      autresQuestions: ['Combien coûte un biscuit ?', 'À quelle heure ouvre la boulangerie ?'],
      indice: 'Cherche d’abord combien de fois plus de minutes il y a, ou combien de biscuits en une seule minute.',
      explication: methode(d, r, 'une seule minute', 'minutes', ' biscuits'),
      facile: {
        enonce: `En ${nb(d.quantite)} minutes, la machine fait ${nb(d.prix)} biscuits. Elle va toujours aussi vite.`,
        question: `Combien de biscuits en ${nb(d.autre)} minutes ?`,
        indice: 'Cherche combien de biscuits en une minute.',
        explication: methodeFacile(d, r, 'une seule minute', ' biscuits'),
      },
    }),
    (d, r) => ({
      enonce: `${nb(d.quantite)} sachets de billes pareils contiennent ${nb(d.prix)} billes en tout.`,
      question: `Combien de billes y a-t-il dans ${nb(d.autre)} sachets ?`,
      autresQuestions: ['Combien coûte un sachet ?', 'Combien de billes sont bleues ?'],
      indice: 'Cherche d’abord combien de fois plus de sachets il y a, ou combien de billes dans un seul sachet.',
      explication: methode(d, r, 'un seul sachet', 'sachets', ' billes'),
      facile: {
        enonce: `${nb(d.quantite)} sachets contiennent ${nb(d.prix)} billes. Les sachets sont pareils.`,
        question: `Combien de billes dans ${nb(d.autre)} sachets ?`,
        indice: 'Cherche combien de billes dans un sachet.',
        explication: methodeFacile(d, r, 'un seul sachet', ' billes'),
      },
    }),
  ],
});
