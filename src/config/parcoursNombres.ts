// Thèmes de numération et de calcul posé, du CE1 au CM2 (le CP a les siens) :
// lire, écrire, comparer, dénombrer, reconnaître des nombres, poser et calculer,
// fractions et nombres à virgule. Ajoutés après les autres thèmes de chaque
// classe : la progression des enfants qui ont déjà commencé ne bouge pas.
import type { Classe } from './classes';
import type { DomaineId } from './domaines';
import type { Theme } from './parcours';
import { unite, type EtapeCourte } from './unites';

const JEUX = ['reponses', 'lucioles'] as const;

function theme(
  classe: Classe,
  code: string,
  domaine: DomaineId,
  textes: { titre: string; description: string; exemple: string },
  u: { titre: string; objectif: string; etapes: readonly EtapeCourte[] },
): Theme {
  const id = `${classe.toLowerCase()}-${code}`;
  return { id, domaine, classe, ...textes, unites: [unite(`${id}-u1`, u.titre, u.objectif, u.etapes)] };
}

const lire = (classe: Classe) =>
  theme(
    classe,
    'lire-nombres',
    'lire-nombres',
    { titre: 'Lire des nombres', description: 'Lire un nombre écrit en lettres.', exemple: 'quarante-deux\u00a0: 42' },
    {
      titre: 'Les étiquettes de Capy',
      objectif: 'Lire un nombre en lettres et l’écrire en chiffres.',
      etapes: [
        ['Les petits nombres', ['lire-nombre'], JEUX, 5],
        ['Les grands nombres', ['lire-nombre'], JEUX, 5],
        ['Révision', ['lire-nombre'], JEUX, 6],
      ],
    },
  );

const ecrire = (classe: Classe, exemple: string) =>
  theme(
    classe,
    'ecrire-nombres',
    'ecrire-nombres',
    { titre: 'Écrire des nombres', description: 'Écouter un nombre et l’écrire en chiffres.', exemple },
    {
      titre: 'La dictée de nombres',
      objectif: 'Écouter un nombre, sans oublier les zéros.',
      etapes: [
        ['J’écoute, j’écris', ['ecrire-nombre'], JEUX, 5],
        ['Attention aux zéros', ['ecrire-nombre'], JEUX, 5],
        ['Révision', ['ecrire-nombre'], JEUX, 6],
      ],
    },
  );

const comparer = (classe: Classe) =>
  theme(
    classe,
    'comparer-nombres',
    'comparer-nombres',
    {
      titre: 'Comparer des nombres',
      description: 'Trouver le plus grand ou le plus petit nombre.',
      exemple: '47 ou 74\u00a0?',
    },
    {
      titre: 'La course des nombres',
      objectif: 'Comparer en regardant d’abord le chiffre de gauche.',
      etapes: [
        ['Le plus grand', ['plus-grand'], JEUX, 5],
        ['Le plus petit', ['plus-petit'], JEUX, 5],
        ['Révision', ['plus-grand', 'plus-petit'], JEUX, 6],
      ],
    },
  );

const denombrer = (classe: Classe) =>
  theme(
    classe,
    'denombrer',
    'denombrer',
    {
      titre: 'Dénombrer',
      description: 'Compter vite avec des paquets de dix et de cent.',
      exemple: '3 boîtes, 4 paquets, 2 seuls',
    },
    {
      titre: 'La réserve de la classe',
      objectif: 'Compter les boîtes de cent, les paquets de dix et les objets seuls.',
      etapes: [
        ['Boîtes et paquets', ['denombrer'], JEUX, 5],
        ['Plus de dix paquets', ['denombrer'], JEUX, 5],
        ['Révision', ['denombrer'], JEUX, 6],
      ],
    },
  );

const reconnaitre = (classe: Classe) =>
  theme(
    classe,
    'reconnaitre-nombres',
    'reconnaitre-nombres',
    {
      titre: 'Reconnaître des nombres',
      description: 'Retrouver un nombre d’après ses milliers et centaines.',
      exemple: '4 milliers et 7 unités\u00a0: 4\u202f007',
    },
    {
      titre: 'Le rang vide',
      objectif: 'Un chiffre par rang, et un zéro quand le rang est vide.',
      etapes: [
        ['Dans l’ordre', ['decomposer'], JEUX, 5],
        ['Dans le désordre', ['decomposer'], JEUX, 5],
        ['Révision', ['decomposer'], JEUX, 6],
      ],
    },
  );

const poser = (classe: Classe) =>
  theme(
    classe,
    'poser-calculer',
    'poser-calculer',
    {
      titre: 'Poser et calculer',
      description: 'Poser une opération en colonnes et la calculer.',
      exemple: '347\u00a0+\u00a0285\u00a0=\u00a0632',
    },
    {
      titre: 'L’atelier des colonnes',
      objectif: 'Additionner, soustraire et multiplier en colonnes, avec les retenues.',
      etapes: [
        ['L’addition', ['addition-posee'], JEUX, 5],
        ['La soustraction', ['soustraction-posee'], JEUX, 5],
        ['La multiplication', ['multiplication-posee'], JEUX, 5],
        ['Révision', ['addition-posee', 'soustraction-posee', 'multiplication-posee'], JEUX, 6],
      ],
    },
  );

export const THEMES_NOMBRES: readonly Theme[] = [
  // CE1
  lire('CE1'),
  ecrire('CE1', 'trois cent cinq\u00a0: 305'),
  comparer('CE1'),
  denombrer('CE1'),
  // CE2
  denombrer('CE2'),
  ecrire('CE2', 'deux mille huit\u00a0: 2\u202f008'),
  reconnaitre('CE2'),
  poser('CE2'),
  theme(
    'CE2',
    'fractions',
    'fractions',
    {
      titre: 'Les fractions',
      description: 'Partager en parts égales et nommer les parts.',
      exemple: 'le quart de 20\u00a0: 5',
    },
    {
      titre: 'Le goûter partagé',
      objectif: 'La moitié, le tiers, le quart, et écrire une fraction.',
      etapes: [
        ['Quelle part\u00a0?', ['fraction-partie'], JEUX, 5],
        ['La part de chacun', ['fraction-de'], JEUX, 5],
        ['Révision', ['fraction-partie', 'fraction-de'], JEUX, 6],
      ],
    },
  ),
  // CM1
  ecrire('CM1', 'cent mille deux\u00a0: 100\u202f002'),
  reconnaitre('CM1'),
  poser('CM1'),
  // CM2
  ecrire('CM2', 'un million cinq\u00a0: 1\u202f000\u202f005'),
  theme(
    'CM2',
    'decimaux',
    'representations-nombres',
    {
      titre: 'Les nombres à virgule',
      description: 'Dixièmes, centièmes et fractions décimales.',
      exemple: '47/10\u00a0=\u00a04,7',
    },
    {
      titre: 'Après la virgule',
      objectif: 'Écrire un nombre à virgule de plusieurs façons.',
      etapes: [
        ['Les dixièmes', ['decimaux'], JEUX, 5],
        ['Les centièmes', ['decimaux'], JEUX, 5],
        ['Révision', ['decimaux'], JEUX, 6],
      ],
    },
  ),
  poser('CM2'),
];
