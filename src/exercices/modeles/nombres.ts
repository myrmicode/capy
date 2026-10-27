/**
 * Numération : lire, écrire, comparer, dénombrer et reconnaître des nombres.
 * Axes des fiches « Lire des nombres », « Écrire des nombres », « Comparer des
 * nombres », « Dénombrer », « Reconnaître des nombres » (CP à CM2).
 *
 * Les mauvaises réponses proposées viennent des erreurs de numération les plus
 * fréquentes : le nombre écrit comme on l'entend (« trois cent quarante-deux »
 * → 30042), le zéro oublié, les chiffres inversés, un rang de trop ou de moins.
 *
 * À FAIRE RELIRE PAR UN ENSEIGNANT, comme le reste du contenu.
 */
import type { Alea } from '../alea';
import { definirModele, nb } from '../moteur';
import { erreursDeNumeration, nombreEnLettres } from '../nombres';
import type { ReglesClasse } from '../types';

const regle = (min: number, max: number): ReglesClasse<{ nombre: number }> => ({
  donnees: { nombre: { min, max } },
  reponse: { min, max },
});

/** Décomposition dite à l'enfant : « 3 centaines, 4 dizaines et 2 unités ». */
function decomposition(n: number): string {
  const rangs = [
    [1_000_000, 'million', 'millions'],
    [1000, 'millier', 'milliers'],
    [100, 'centaine', 'centaines'],
    [10, 'dizaine', 'dizaines'],
    [1, 'unité', 'unités'],
  ] as const;
  const morceaux: string[] = [];
  let reste = n;
  for (const [valeur, un, plusieurs] of rangs) {
    const q = Math.floor(reste / valeur);
    reste %= valeur;
    // On cite les rangs à partir du premier chiffre, zéros compris : c'est là que l'erreur se cache.
    if (q > 0 || morceaux.length > 0) morceaux.push(`${q >= 1000 ? nb(q) : q} ${q > 1 ? plusieurs : un}`);
  }
  return morceaux.length > 1 ? `${morceaux.slice(0, -1).join(', ')} et ${morceaux[morceaux.length - 1]}` : morceaux[0];
}

/** Un nombre et son nom, accordé : « 1 boîte », « 3 boîtes ». */
const compte = (n: number, un: string, plusieurs: string) => `${nb(n)} ${n > 1 ? plusieurs : un}`;

const INDICE_LECTURE =
  'Lis le nombre morceau par morceau. Chaque morceau va à sa place\u00a0: les milliers, les centaines, les dizaines, les unités.';

export const lireNombre = definirModele<{ nombre: number }>({
  id: 'lire-nombre',
  titre: 'Lire un nombre écrit en lettres',
  domaine: 'lire-nombres',
  competence: 'Lire un nombre écrit en lettres et l’écrire en chiffres (jusqu’à 100 au CP, 1 000 au CE1).',
  operations: [],
  regles: { CP: regle(10, 99), CE1: regle(100, 999) },
  reglesAccessibles: {
    // + : jusqu'à 20 ; ++ : jusqu'à 69 (avant soixante-dix).
    CP: { 1: regle(1, 20), 2: regle(10, 69) },
    // + : jusqu'à 99 ; ++ : jusqu'à 599.
    CE1: { 1: regle(20, 99), 2: regle(100, 599) },
  },
  calculer: ({ nombre }) => nombre,
  erreursTypiques: ({ nombre }) => erreursDeNumeration(nombre),
  histoires: [
    ({ nombre }, r) => ({
      enonce: `Capy a écrit un nombre en lettres\u00a0: ${nombreEnLettres(nombre)}.`,
      question: 'Quel est ce nombre\u00a0?',
      indice: INDICE_LECTURE,
      explication: `${nombreEnLettres(nombre)}, c’est ${decomposition(r)}\u00a0: ${nb(r)}.`,
      facile: {
        enonce: `Le nombre est\u00a0: ${nombreEnLettres(nombre)}.`,
        question: 'Quel est ce nombre\u00a0?',
        indice: 'Lis le nombre un morceau à la fois.',
        explication: `${nombreEnLettres(nombre)}, c’est ${nb(r)}.`,
      },
    }),
    ({ nombre }, r) => ({
      enonce: `Sur l’étiquette du pot de billes, Lina a écrit\u00a0: ${nombreEnLettres(nombre)} billes.`,
      question: 'Combien de billes y a-t-il dans le pot\u00a0?',
      indice: INDICE_LECTURE,
      explication: `${nombreEnLettres(nombre)}, c’est ${decomposition(r)}\u00a0: ${nb(r)} billes.`,
      facile: {
        enonce: `Sur l’étiquette, il est écrit\u00a0: ${nombreEnLettres(nombre)} billes.`,
        question: 'Combien de billes\u00a0?',
        indice: 'Lis le nombre un morceau à la fois.',
        explication: `${nombreEnLettres(nombre)}, c’est ${nb(r)}.`,
      },
    }),
  ],
});

export const ecrireNombre = definirModele<{ nombre: number }>({
  id: 'ecrire-nombre',
  titre: 'La dictée de nombres',
  domaine: 'ecrire-nombres',
  competence:
    'Écrire en chiffres un nombre dicté (jusqu’à 100 au CP, 1 000 au CE1, 10 000 au CE2, puis au-delà en CM).',
  operations: [],
  regles: {
    CP: regle(10, 99),
    CE1: regle(100, 999),
    CE2: regle(1000, 9999),
    CM1: regle(10_000, 999_999),
    CM2: regle(1_000_000, 9_999_999),
  },
  reglesAccessibles: {
    CP: { 1: regle(1, 20), 2: regle(10, 69) },
    CE1: { 1: regle(20, 99), 2: regle(100, 599) },
    CE2: { 1: regle(100, 999), 2: regle(1000, 4999) },
    CM1: { 1: regle(1000, 9999), 2: regle(10_000, 99_999) },
    CM2: { 1: regle(10_000, 999_999), 2: regle(100_000, 999_999) },
  },
  calculer: ({ nombre }) => nombre,
  erreursTypiques: ({ nombre }) => erreursDeNumeration(nombre),
  histoires: [
    ({ nombre }, r) => ({
      enonce: 'Touche «\u00a0Écouter\u00a0»\u00a0: Capy dit un nombre.',
      question: 'Quel nombre Capy a-t-il dit\u00a0?',
      lecture: nombreEnLettres(nombre),
      indice: 'Écoute le nombre morceau par morceau, et pense aux rangs vides\u00a0: il faut alors écrire un zéro.',
      explication: `Capy a dit «\u00a0${nombreEnLettres(nombre)}\u00a0»\u00a0: ${decomposition(r)}. On écrit ${nb(r)}.`,
      facile: {
        enonce: 'Touche «\u00a0Écouter\u00a0». Capy dit un nombre.',
        question: 'Quel nombre Capy a-t-il dit\u00a0?',
        indice: 'Écoute un morceau à la fois. Un rang vide, c’est un zéro.',
        explication: `Capy a dit «\u00a0${nombreEnLettres(nombre)}\u00a0». On écrit ${nb(r)}.`,
      },
    }),
  ],
});

// --- Comparer ---

type Quatre = { a: number; b: number; c: number; d: number };
const regle4 = (min: number, max: number): ReglesClasse<Quatre> => ({
  donnees: { a: { min, max }, b: { min, max }, c: { min, max }, d: { min, max } },
  reponse: { min, max },
});

/**
 * Le nombre cherché et trois pièges : les chiffres inversés, un nombre qui a un
 * plus grand chiffre des unités, un nombre voisin. `grand` : on cherche le plus grand.
 */
function tirerComparaison(alea: Alea, { reponse }: ReglesClasse<Quatre>, grand: boolean): Quatre {
  const { min, max } = reponse;
  for (;;) {
    const n = alea.entier(Math.max(min, 11), max);
    const s = String(n);
    const pieges = [
      // 47 et 74 : les mêmes chiffres, dans un autre ordre.
      Number(s.split('').reverse().join('')),
      // Plus grand (ou plus petit) chiffre des unités, mais une dizaine de moins (ou de plus).
      grand ? n - 10 + (9 - (n % 10)) : n + 10 - (n % 10),
      grand ? n - 1 : n + 1,
      grand ? n - 10 : n + 10,
      grand ? n - 100 : n + 100,
      alea.entier(min, max),
    ];
    const autres = [...new Set(pieges)].filter((v) => v >= min && v <= max && (grand ? v < n : v > n));
    if (autres.length < 3) continue;
    const [a, b, c, d] = alea.melanger([n, ...autres.slice(0, 3)]);
    return { a, b, c, d };
  }
}

function comparer(id: string, grand: boolean) {
  const mot = grand ? 'grand' : 'petit';
  return definirModele<Quatre>({
    id,
    titre: `Le plus ${mot}`,
    domaine: 'comparer-nombres',
    competence: `Comparer des nombres et trouver le plus ${mot} (jusqu’à 100 au CP, 1 000 au CE1).`,
    operations: [],
    regles: { CP: regle4(1, 99), CE1: regle4(10, 999) },
    reglesAccessibles: {
      CP: { 1: regle4(1, 20), 2: regle4(1, 69) },
      CE1: { 1: regle4(10, 99), 2: regle4(10, 599) },
    },
    tirer: (alea, regles) => tirerComparaison(alea, regles, grand),
    estValide: ({ a, b, c, d }) => new Set([a, b, c, d]).size === 4,
    calculer: ({ a, b, c, d }) => (grand ? Math.max(a, b, c, d) : Math.min(a, b, c, d)),
    erreursTypiques: ({ a, b, c, d }) => {
      const r = grand ? Math.max(a, b, c, d) : Math.min(a, b, c, d);
      const inverse = Number(String(r).split('').reverse().join(''));
      return [a, b, c, d]
        .filter((v) => v !== r)
        .map((valeur) => ({
          valeur,
          erreur:
            valeur === inverse
              ? 'mêmes chiffres dans un autre ordre'
              : 'chiffre des unités comparé avant celui des dizaines',
        }));
    },
    histoires: [
      ({ a, b, c, d }, r) => ({
        enonce: `Voici quatre nombres\u00a0: ${nb(a)}, ${nb(b)}, ${nb(c)} et ${nb(d)}.`,
        question: `Quel est le plus ${mot}\u00a0?`,
        indice: `Compare d’abord le chiffre le plus à gauche. S’il est pareil, regarde le chiffre suivant.`,
        explication: `${nb(r)} est le plus ${mot}\u00a0: on compare d’abord le chiffre le plus à gauche, puis le suivant.`,
        facile: {
          enonce: `Voici quatre nombres\u00a0: ${nb(a)}, ${nb(b)}, ${nb(c)} et ${nb(d)}.`,
          question: `Quel est le plus ${mot}\u00a0?`,
          indice: 'Regarde d’abord le chiffre de gauche.',
          explication: `Le plus ${mot} est ${nb(r)}.`,
        },
      }),
      ({ a, b, c, d }, r) => ({
        enonce: `Quatre enfants ont compté leurs billes\u00a0: Lou en a ${nb(a)}, Noé ${nb(b)}, Lina ${nb(c)} et Sam ${nb(d)}.`,
        question: grand
          ? 'Quel est le plus grand nombre de billes\u00a0?'
          : 'Quel est le plus petit nombre de billes\u00a0?',
        indice: 'Range les nombres\u00a0: regarde d’abord le chiffre le plus à gauche de chacun.',
        explication: `${nb(r)} est le plus ${mot} des quatre nombres.`,
        facile: {
          enonce: `Lou a ${nb(a)} billes. Noé a ${nb(b)} billes. Lina a ${nb(c)} billes. Sam a ${nb(d)} billes.`,
          question: `Quel est le plus ${mot} nombre\u00a0?`,
          indice: 'Regarde d’abord le chiffre de gauche.',
          explication: `Le plus ${mot} est ${nb(r)}.`,
        },
      }),
    ],
  });
}

export const plusGrand = comparer('plus-grand', true);
export const plusPetit = comparer('plus-petit', false);

// --- Dénombrer une collection organisée ---

type Collection = { boites: number; paquets: number; seuls: number };
const regleCollection = (b: [number, number], p: [number, number], s: [number, number]): ReglesClasse<Collection> => ({
  donnees: { boites: { min: b[0], max: b[1] }, paquets: { min: p[0], max: p[1] }, seuls: { min: s[0], max: s[1] } },
  reponse: { min: b[0] * 100 + p[0] * 10 + s[0], max: b[1] * 100 + p[1] * 10 + s[1] },
});

export const denombrer = definirModele<Collection>({
  id: 'denombrer',
  titre: 'Boîtes, paquets et objets seuls',
  domaine: 'denombrer',
  competence:
    'Dénombrer une collection organisée en centaines, dizaines et unités, y compris quand il y a plus de 9 paquets de dix.',
  operations: ['+'],
  regles: {
    // +++ : plus de 9 paquets de dix (14 paquets, c'est 1 centaine et 4 dizaines).
    CE1: regleCollection([1, 8], [10, 19], [1, 9]),
    CE2: regleCollection([1, 9], [10, 29], [10, 19]),
  },
  reglesAccessibles: {
    CE1: { 1: regleCollection([1, 2], [1, 9], [1, 9]), 2: regleCollection([1, 9], [1, 9], [1, 9]) },
    CE2: { 1: regleCollection([1, 9], [1, 9], [1, 9]), 2: regleCollection([1, 9], [10, 19], [1, 9]) },
  },
  calculer: ({ boites, paquets, seuls }) => boites * 100 + paquets * 10 + seuls,
  erreursTypiques: ({ boites: b, paquets: p, seuls: s }) => [
    { valeur: Number(`${b}${p}${s}`), erreur: 'nombres d’objets écrits côte à côte' },
    { valeur: b + p + s, erreur: 'boîtes et paquets comptés comme des objets seuls' },
    { valeur: b * 100 + p + s * 10, erreur: 'paquets et objets seuls confondus' },
    { valeur: Number(`${s}${p}${b}`), erreur: 'écrit dans l’ordre de l’énoncé' },
  ],
  histoires: [
    ({ boites: b, paquets: p, seuls: s }, r) => ({
      enonce: `Dans la réserve de la classe, il y a ${compte(b, 'boîte', 'boîtes')} de 100 crayons, ${compte(p, 'paquet', 'paquets')} de 10 crayons et ${compte(s, 'crayon seul', 'crayons seuls')}.`,
      question: 'Combien de crayons y a-t-il en tout\u00a0?',
      indice:
        'Une boîte, c’est cent crayons\u00a0; un paquet, c’est dix crayons. Compte d’abord les boîtes, puis les paquets, puis les crayons seuls.',
      explication: `${compte(b, 'boîte', 'boîtes')}, c’est ${nb(b * 100)} crayons. ${compte(p, 'paquet', 'paquets')}, c’est ${nb(p * 10)} crayons. ${nb(b * 100)}\u00a0+\u00a0${nb(p * 10)}\u00a0+\u00a0${s}\u00a0=\u00a0${nb(r)} crayons.`,
      facile: {
        enonce: `Il y a ${compte(b, 'boîte', 'boîtes')} de 100 crayons. Il y a ${compte(p, 'paquet', 'paquets')} de 10 crayons. Il y a ${compte(s, 'crayon seul', 'crayons seuls')}.`,
        question: 'Combien de crayons en tout\u00a0?',
        indice: 'Une boîte, c’est cent. Un paquet, c’est dix.',
        explication: `${nb(b * 100)}\u00a0+\u00a0${nb(p * 10)}\u00a0+\u00a0${s}\u00a0=\u00a0${nb(r)}.`,
      },
    }),
    ({ boites: b, paquets: p, seuls: s }, r) => ({
      enonce: `Lina range ses perles\u00a0: ${compte(s, 'perle seule', 'perles seules')}, ${compte(p, 'collier', 'colliers')} de 10 perles et ${compte(b, 'sachet', 'sachets')} de 100 perles.`,
      question: 'Combien de perles a-t-elle en tout\u00a0?',
      indice:
        'Attention à l’ordre\u00a0: commence par les sachets de cent, puis les colliers de dix, puis les perles seules.',
      explication: `${compte(b, 'sachet', 'sachets')}, c’est ${nb(b * 100)} perles. ${compte(p, 'collier', 'colliers')}, c’est ${nb(p * 10)} perles. ${nb(b * 100)}\u00a0+\u00a0${nb(p * 10)}\u00a0+\u00a0${s}\u00a0=\u00a0${nb(r)} perles.`,
      facile: {
        enonce: `Lina a ${compte(s, 'perle seule', 'perles seules')}. Elle a ${compte(p, 'collier', 'colliers')} de 10 perles. Elle a ${compte(b, 'sachet', 'sachets')} de 100 perles.`,
        question: 'Combien de perles en tout\u00a0?',
        indice: 'Commence par les sachets. Un sachet, c’est cent.',
        explication: `${nb(b * 100)}\u00a0+\u00a0${nb(p * 10)}\u00a0+\u00a0${s}\u00a0=\u00a0${nb(r)}.`,
      },
    }),
  ],
});

// --- Reconnaître un nombre d'après sa décomposition (avec un rang vide) ---

type Decompose = { milliers: number; centaines: number; unites: number };
const regleDecompose = (max: number): ReglesClasse<Decompose> => ({
  donnees: { milliers: { min: 1, max }, centaines: { min: 1, max: 9 }, unites: { min: 1, max: 9 } },
  reponse: { min: 1101, max: max * 1000 + 909 },
});

export const decomposer = definirModele<Decompose>({
  id: 'decomposer',
  titre: 'Le rang vide',
  domaine: 'reconnaitre-nombres',
  competence: 'Reconnaître un nombre donné par sa décomposition en milliers, centaines et unités, avec un rang vide.',
  operations: [],
  regles: { CE2: regleDecompose(9), CM1: regleDecompose(99) },
  reglesAccessibles: {
    CE2: { 1: regleDecompose(3), 2: regleDecompose(6) },
    CM1: { 1: regleDecompose(9), 2: regleDecompose(30) },
  },
  calculer: ({ milliers, centaines, unites }) => milliers * 1000 + centaines * 100 + unites,
  erreursTypiques: ({ milliers: m, centaines: c, unites: u }) => [
    { valeur: Number(`${m}${c}${u}`), erreur: 'zéro des dizaines oublié' },
    { valeur: m * 1000 + c * 100 + u * 10, erreur: 'unités placées aux dizaines' },
    { valeur: m * 1000 + c * 10 + u, erreur: 'centaines placées aux dizaines' },
    { valeur: Number(`${u}${c}${m}`), erreur: 'écrit dans l’ordre de l’énoncé' },
  ],
  histoires: [
    ({ milliers: m, centaines: c, unites: u }, r) => ({
      enonce: `Capy pense à un nombre\u00a0: ${compte(m, 'millier', 'milliers')}, ${compte(c, 'centaine', 'centaines')} et ${compte(u, 'unité', 'unités')}.`,
      question: 'Quel est ce nombre\u00a0?',
      indice:
        'Écris un chiffre par rang\u00a0: milliers, centaines, dizaines, unités. Un rang dont on ne parle pas est vide\u00a0: il faut y mettre un zéro.',
      explication: `${compte(m, 'millier', 'milliers')}, ${compte(c, 'centaine', 'centaines')}, 0 dizaine et ${compte(u, 'unité', 'unités')}\u00a0: ${nb(r)}.`,
      facile: {
        enonce: `Le nombre a ${compte(m, 'millier', 'milliers')}, ${compte(c, 'centaine', 'centaines')} et ${compte(u, 'unité', 'unités')}.`,
        question: 'Quel est ce nombre\u00a0?',
        indice: 'Écris un chiffre par rang. Un rang vide, c’est un zéro.',
        explication: `Il n’y a pas de dizaine\u00a0: on écrit ${nb(r)}.`,
      },
    }),
    ({ milliers: m, centaines: c, unites: u }, r) => ({
      enonce: `Capy pense à un nombre\u00a0: ${compte(u, 'unité', 'unités')}, ${compte(m, 'millier', 'milliers')} et ${compte(c, 'centaine', 'centaines')}.`,
      question: 'Quel est ce nombre\u00a0?',
      indice:
        'Les rangs ne sont pas dans l’ordre\u00a0! Range-les\u00a0: milliers, centaines, dizaines, unités. Le rang dont on ne parle pas a un zéro.',
      explication: `On range\u00a0: ${compte(m, 'millier', 'milliers')}, ${compte(c, 'centaine', 'centaines')}, 0 dizaine et ${compte(u, 'unité', 'unités')}\u00a0: ${nb(r)}.`,
      facile: {
        enonce: `Le nombre a ${compte(u, 'unité', 'unités')}, ${compte(m, 'millier', 'milliers')} et ${compte(c, 'centaine', 'centaines')}.`,
        question: 'Quel est ce nombre\u00a0?',
        indice: 'Range les rangs dans l’ordre. Un rang vide, c’est un zéro.',
        explication: `On range dans l’ordre\u00a0: ${nb(r)}.`,
      },
    }),
  ],
});

// --- Compter des objets dessinés (CP) ---

const OBJETS_A_COMPTER = [
  { objet: 'fraise', nom: 'fraises', lieu: 'dans le panier' },
  { objet: 'pomme', nom: 'pommes', lieu: 'sur la table' },
  { objet: 'etoile', nom: 'étoiles', lieu: 'dans le ciel' },
] as const;

export const compterObjets = definirModele<{ nombre: number }>({
  id: 'compter-objets',
  titre: 'Compter des objets',
  domaine: 'compter-objets',
  competence: 'Dénombrer une collection dessinée (jusqu’à 30), en s’aidant des rangées de cinq ou de dix.',
  operations: [],
  regles: { CP: regle(10, 30) },
  reglesAccessibles: {
    // + : jusqu'à 10 ; ++ : jusqu'à 20.
    CP: { 1: regle(3, 10), 2: regle(6, 20) },
  },
  calculer: ({ nombre }) => nombre,
  erreursTypiques: ({ nombre: n }) => [
    { valeur: n - 1, erreur: 'un objet oublié' },
    { valeur: n + 1, erreur: 'un objet compté deux fois' },
    {
      valeur: n + (n > 10 ? 10 : 2),
      erreur: n > 10 ? 'une rangée comptée deux fois' : 'deux objets comptés deux fois',
    },
    { valeur: n - (n > 10 ? 10 : 2), erreur: n > 10 ? 'une rangée oubliée' : 'deux objets oubliés' },
  ],
  histoires: OBJETS_A_COMPTER.map(({ objet, nom, lieu }) => ({ nombre }: { nombre: number }, r: number) => ({
    enonce: `Compte les ${nom} ${lieu}.`,
    question: `Combien y a-t-il de ${nom}\u00a0?`,
    illustration: { type: 'objets' as const, objet, nombre, parDix: nombre > 10 },
    indice:
      nombre > 10
        ? 'Compte d’abord les rangées pleines de dix, puis les objets qui restent.'
        : 'Montre chaque objet du doigt en comptant, une seule fois chacun.',
    explication:
      nombre > 10
        ? `${Math.floor(r / 10)} ${r >= 20 ? 'rangées' : 'rangée'} de dix et ${r % 10} de plus\u00a0: il y a ${nb(r)} ${nom}.`
        : `Il y a ${nb(r)} ${nom}.`,
    facile: {
      enonce: `Compte les ${nom}.`,
      question: `Combien de ${nom}\u00a0?`,
      indice: 'Touche chaque objet une seule fois.',
      explication: `Il y a ${nb(r)} ${nom}.`,
    },
  })),
});
