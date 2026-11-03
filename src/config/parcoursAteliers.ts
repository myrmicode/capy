// Les ateliers : formes (géométrie) et mesures (grandeurs). Ces compétences ne
// sont sur aucune toile des évaluations Repères : on les joue en entraînement
// libre, en séries courtes, et la toile ne bouge pas.
import type { Classe } from './classes';
import type { Theme, Unite } from './parcours';
import { unite } from './unites';

const JEUX = ['reponses', 'lucioles'] as const;

/** L'unité « La règle », ajoutée après les autres dans les thèmes de la ligne graduée. */
export function uniteRegle(prefixe: string): Unite {
  return unite(`${prefixe}-lg-regle`, 'La règle', 'Mesurer un segment, même quand il ne part pas de zéro.', [
    ['Mesurer', ['mesurer-regle'], JEUX, 5],
    ['Le piège du zéro', ['mesurer-regle'], JEUX, 5],
    ['Révision', ['mesurer-regle', 'placer-petits-pas'], ['reponses', 'lucioles', 'funambule'], 6],
  ]);
}

/** Se repérer et se déplacer sur un quadrillage : au CP, suivre des flèches ; ensuite, aussi écrire le chemin et repérer une case. */
function uniteGrille(classe: Classe): Unite {
  const p = classe.toLowerCase();
  if (classe === 'CP') {
    return unite(`${p}-for-grille`, 'La grille de Capy', 'Suivre des flèches, case par case.', [
      ['Suivre les flèches', ['suivre-chemin'], JEUX, 5],
      ['Encore des flèches', ['suivre-chemin'], JEUX, 5],
    ]);
  }
  return unite(`${p}-for-grille`, 'La grille de Capy', 'Suivre et écrire un chemin, repérer une case.', [
    ['Suivre les flèches', ['suivre-chemin'], JEUX, 5],
    ['Écrire le chemin', ['coder-chemin'], ['chemin', 'reponses'], 5],
    ['Repérer une case', ['reperer-case'], JEUX, 5],
    ['Révision', ['suivre-chemin', 'coder-chemin', 'reperer-case'], ['reponses', 'chemin', 'lucioles'], 6],
  ]);
}

function formes(classe: Classe): Theme {
  const p = classe.toLowerCase();
  const avecSymetrie = classe === 'CE2' || classe === 'CM1' || classe === 'CM2';
  const avecCotes = classe === 'CP' || classe === 'CE1' || classe === 'CE2';
  return {
    id: `${p}-formes`,
    domaine: 'geometrie',
    classe,
    titre: 'Les formes',
    description: 'Reconnaître les figures, se repérer sur une grille.',
    exemple: 'Un carré a 4 côtés pareils.',
    unites: [
      unite(`${p}-for-u1`, 'L’atelier des formes', 'Nommer les figures et regarder comment elles sont faites.', [
        ['Le nom des figures', ['reconnaitre-figure'], JEUX, 5],
        ...(avecCotes ? ([['Côtés et sommets', ['compter-cotes'], JEUX, 5]] as const) : []),
        ...(avecSymetrie ? ([['Les axes de symétrie', ['axes-symetrie'], JEUX, 5]] as const) : []),
      ]),
      // Ajoutée après les autres : la progression des enfants qui ont déjà commencé ne bouge pas.
      uniteGrille(classe),
    ],
  };
}

function mesures(classe: 'CE2' | 'CM1' | 'CM2'): Theme {
  const p = classe.toLowerCase();
  const cm = classe !== 'CE2';
  return {
    id: `${p}-mesures`,
    domaine: 'grandeurs',
    classe,
    titre: 'Les mesures',
    description: 'Passer d’une unité à une autre.',
    exemple: '2\u00a0m\u00a0=\u00a0200\u00a0cm',
    unites: [
      unite(`${p}-mes-u1`, 'L’atelier des mesures', 'Les longueurs, les masses, les durées.', [
        ['Les longueurs', cm ? ['metres-en-cm', 'km-en-m'] : ['metres-en-cm'], JEUX, 5],
        ['Les masses', ['kg-en-g'], JEUX, 5],
        ...(cm ? ([['Les contenances', ['litres-en-cl'], JEUX, 5]] as const) : []),
        ['Les durées', ['heures-en-minutes'], JEUX, 5],
      ]),
    ],
  };
}

export const THEMES_ATELIERS: readonly Theme[] = [
  formes('CP'),
  formes('CE1'),
  formes('CE2'),
  mesures('CE2'),
  formes('CM1'),
  mesures('CM1'),
  formes('CM2'),
  mesures('CM2'),
];
