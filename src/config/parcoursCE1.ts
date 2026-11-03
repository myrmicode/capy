// Parcours du CE1 : les axes de la fiche que Capy sait faire travailler.
// « Lire à voix haute » se travaille hors du parcours, avec un adulte (« Lire à
// deux », dans l'espace parent) : Capy n'enregistre jamais la voix.
import { themesOraux } from './parcoursCP';
import type { Theme } from './parcours';
import { unite } from './unites';

export const THEMES_CE1: readonly Theme[] = [
  {
    id: 'ce1-resoudre-problemes',
    domaine: 'resoudre-problemes',
    classe: 'CE1',
    titre: 'Résoudre des problèmes',
    description: 'Lire une petite histoire et trouver le bon calcul.',
    exemple: '5 pommes, puis 3 de plus\u00a0: combien\u00a0?',
    unites: [
      unite('ce1-rp-u1', 'Au marché', 'Ajouter, enlever, faire des paquets.', [
        ['Les paquets', ['groupements'], ['marche', 'reponses'], 5],
        ['On en ajoute', ['ajout'], ['bonFil', 'reponses'], 5],
        ['On en enlève', ['retrait'], ['bonFil', 'reponses'], 5],
        ['Révision', ['groupements', 'ajout', 'retrait'], ['marche', 'bonFil', 'reponses'], 6],
      ]),
      unite('ce1-rp-u2', 'À la boutique', 'Payer, rendre la monnaie, comparer, partager.', [
        ['Payer ses achats', ['payer'], ['caisse', 'reponses'], 5],
        ['Rendre la monnaie', ['rendre-monnaie'], ['caisse', 'bonFil', 'reponses'], 5],
        ['Combien de plus\u00a0?', ['ecart'], ['bonFil', 'reponses'], 5],
        ['Partager', ['partage'], ['questionPerdue', 'reponses'], 5],
        ['L’heure qui passe', ['duree'], ['horloge', 'reponses'], 5],
        [
          'Révision',
          ['payer', 'rendre-monnaie', 'ecart', 'partage', 'deux-etapes'],
          ['caisse', 'bonFil', 'reponses'],
          6,
        ],
      ]),
    ],
  },
  {
    id: 'ce1-calcul-mental',
    domaine: 'calcul-mental',
    classe: 'CE1',
    titre: 'Calculer dans sa tête',
    description: 'Calculer vite, sans poser l’opération.',
    exemple: 'Le double de 15\u00a0: 30',
    unites: [
      unite('ce1-cm-u1', 'Le carnet de calcul', 'Les doubles, les dizaines, les tables de 2 à 5.', [
        ['Le double', ['doubles'], ['lucioles', 'reponses'], 5],
        ['De dizaine en dizaine', ['ajouter-dizaines'], ['lucioles', 'reponses'], 5],
        ['Les tables de 2 à 5', ['tables'], ['lucioles', 'reponses'], 6],
        ['Révision', ['doubles', 'ajouter-dizaines', 'tables'], ['lucioles', 'reponses'], 7],
      ]),
    ],
  },
  {
    id: 'ce1-tables-addition',
    domaine: 'tables-addition',
    classe: 'CE1',
    titre: 'Les tables d’addition',
    description: 'Trouver vite la somme de deux petits nombres.',
    exemple: '7\u00a0+\u00a08\u00a0=\u00a015',
    unites: [
      unite('ce1-ta-u1', 'Les lucioles des sommes', 'Les sommes jusqu’à 10, puis passer la dizaine.', [
        ['Jusqu’à 10', ['tables-addition'], ['lucioles', 'reponses'], 6],
        ['Passer la dizaine', ['tables-addition'], ['lucioles', 'reponses'], 6],
        ['Révision', ['tables-addition'], ['lucioles', 'reponses'], 7],
      ]),
    ],
  },
  {
    id: 'ce1-ligne-graduee',
    domaine: 'ligne-graduee',
    classe: 'CE1',
    titre: 'Placer des nombres sur une ligne',
    description: 'Trouver où va un nombre sur une ligne graduée.',
    exemple: '0, 10, 20… où va 15\u00a0?',
    unites: [
      unite('ce1-lg-u1', 'Le fil du funambule', 'Lire et placer des nombres sur une ligne.', [
        ['Petits pas', ['placer-petits-pas', 'lire-petits-pas'], ['funambule', 'reponses'], 5],
        ['Grands pas', ['placer-grands-pas', 'lire-grands-pas'], ['funambule', 'reponses'], 5],
        [
          'Révision',
          ['placer-petits-pas', 'placer-grands-pas', 'lire-petits-pas', 'lire-grands-pas'],
          ['funambule', 'reponses'],
          6,
        ],
      ]),
    ],
  },
  {
    id: 'ce1-dictee',
    domaine: 'ecrire-mots',
    classe: 'CE1',
    titre: 'Écrire des mots',
    description: 'Écouter un mot, puis l’écrire lettre par lettre.',
    exemple: 'un lapin, une tomate',
    unites: [
      unite('ce1-dic-u1', 'La dictée de Capy', 'Écouter un mot, puis bien l’écrire.', [
        ['Le mot bien écrit', ['dictee-mots'], ['reponses', 'dictee'], 5],
        ['J’écris les mots', ['dictee-mots'], ['dictee', 'reponses'], 5],
        ['Les petits mots', ['mots-outils'], ['dictee', 'reponses'], 5],
        ['Révision', ['dictee-mots', 'mots-outils'], ['dictee', 'reponses'], 6],
      ]),
    ],
  },
  {
    id: 'ce1-phrases-lues',
    domaine: 'comprendre-phrases-lues',
    classe: 'CE1',
    titre: 'Comprendre des phrases',
    description: 'Lire une phrase et dire qui fait quoi.',
    exemple: 'Le chien suit le chat\u00a0: qui suit\u00a0?',
    unites: [
      unite('ce1-phr-u1', 'Les phrases de Capy', 'Lire une phrase et dire qui fait quoi.', [
        ['Qui fait quoi\u00a0?', ['qui-fait-quoi', 'meme-sens'], ['reponses', 'passage'], 5],
        ['La phrase qui dit pareil', ['meme-sens', 'qui-fait-quoi'], ['passage', 'reponses'], 5],
        ['Révision', ['qui-fait-quoi', 'meme-sens'], ['reponses', 'passage'], 6],
      ]),
    ],
  },
  {
    id: 'ce1-texte-lu',
    domaine: 'comprendre-texte-lu',
    classe: 'CE1',
    titre: 'Comprendre un texte',
    description: 'Lire une petite histoire et répondre aux questions.',
    exemple: 'Où va Lou\u00a0? La réponse est dans l’histoire.',
    unites: [
      unite('ce1-txt-u1', 'Les histoires de Capy', 'Lire une histoire et répondre aux questions.', [
        ['Petites histoires', ['questions-texte', 'preuve-texte'], ['reponses', 'passage'], 4],
        ['La phrase qui le dit', ['preuve-texte', 'questions-texte'], ['passage', 'reponses'], 4],
        ['Révision', ['questions-texte', 'preuve-texte'], ['reponses', 'passage'], 5],
      ]),
    ],
  },
  {
    id: 'ce1-ecrire-syllabes',
    domaine: 'ecrire-syllabes',
    classe: 'CE1',
    titre: 'Écrire des syllabes',
    description: 'Écouter une syllabe, puis l’écrire.',
    exemple: 'bra, chou, moi',
    unites: [
      unite('ce1-syl-u1', 'Les syllabes de Capy', 'Écrire chaque son entendu, dans l’ordre.', [
        ['Consonne et voyelle', ['dictee-syllabes'], ['dictee', 'reponses'], 5],
        ['Les sons à deux lettres', ['dictee-syllabes'], ['dictee', 'reponses'], 5],
        ['Deux consonnes', ['dictee-syllabes'], ['dictee', 'reponses'], 5],
        ['Révision', ['dictee-syllabes'], ['dictee', 'reponses'], 6],
      ]),
    ],
  },
  ...themesOraux('CE1'),
];
