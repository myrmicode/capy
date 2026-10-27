/**
 * Histoires des problèmes en CM1 et en CM2 : les nombres y deviennent grands
 * (jusqu'à 100 000), alors on choisit des contextes où ils ont du sens
 * (habitants, spectateurs, kilomètres, gros achats) plutôt que les billes et
 * les noisettes du CE2. Mêmes règles d'écriture : un indice qui guide sans
 * donner la réponse, une explication de la méthode, une version FALC.
 *
 * À FAIRE RELIRE PAR UN ENSEIGNANT, comme le reste du contenu.
 */
import { nb } from '../moteur';
import type { Histoire } from '../types';

const euros = (n: number) => `${nb(n)}\u00a0€`;

export const HISTOIRES_AJOUT_CM: readonly Histoire<{ depart: number; ajout: number }>[] = [
  ({ depart: a, ajout: b }, r) => ({
    enonce: `Le stade de la ville accueille ${nb(a)} spectateurs avant le match. Pendant la première mi-temps, ${nb(b)} spectateurs de plus arrivent.`,
    question: 'Combien de spectateurs y a-t-il dans le stade maintenant\u00a0?',
    autresQuestions: [
      'Combien de places le stade compte-t-il en tout\u00a0?',
      'Combien coûte une place pour le match\u00a0?',
    ],
    indice:
      'De nouveaux spectateurs arrivent\u00a0: y en a-t-il plus ou moins qu’avant\u00a0? Pose l’opération en alignant bien les chiffres.',
    explication: `Les spectateurs s’ajoutent\u00a0: ${nb(a)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. Il y a ${nb(r)} spectateurs dans le stade.`,
    facile: {
      enonce: `Il y a ${nb(a)} spectateurs dans le stade. Puis ${nb(b)} spectateurs arrivent.`,
      question: 'Combien de spectateurs y a-t-il maintenant\u00a0?',
      indice: 'Des spectateurs arrivent. Il y en a plus. Il faut ajouter.',
      explication: `${nb(a)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. Il y a ${nb(r)} spectateurs.`,
    },
  }),
  ({ depart: a, ajout: b }, r) => ({
    enonce: `Pendant les vacances, la famille de Lina roule ${nb(a)} km la première semaine, puis ${nb(b)} km la deuxième semaine.`,
    question: 'Combien de kilomètres la famille a-t-elle parcourus en tout\u00a0?',
    autresQuestions: [
      'Combien de litres d’essence la voiture a-t-elle utilisés\u00a0?',
      'Combien de jours les vacances ont-elles duré\u00a0?',
    ],
    indice: 'On cherche la distance totale des deux semaines. Quelle opération réunit deux distances\u00a0?',
    explication: `On réunit les deux distances\u00a0: ${nb(a)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. La famille a parcouru ${nb(r)} km.`,
    facile: {
      enonce: `La famille roule ${nb(a)} km. Puis elle roule ${nb(b)} km.`,
      question: 'Combien de kilomètres en tout\u00a0?',
      indice: 'En tout veut dire\u00a0: les deux distances ensemble. Il faut ajouter.',
      explication: `${nb(a)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. La famille a roulé ${nb(r)} km.`,
    },
  }),
];

export const HISTOIRES_RETRAIT_CM: readonly Histoire<{ depart: number; retrait: number }>[] = [
  ({ depart: a, retrait: b }, r) => ({
    enonce: `Une imprimerie doit livrer ${nb(a)} journaux. Le matin, le camion en a déjà livré ${nb(b)}.`,
    question: 'Combien de journaux reste-t-il à livrer\u00a0?',
    autresQuestions: ['Combien de pages a chaque journal\u00a0?', 'À quelle heure le camion est-il parti\u00a0?'],
    indice: 'Une partie des journaux est déjà livrée. Reste-t-il plus ou moins de journaux qu’au départ\u00a0?',
    explication: `On enlève les journaux déjà livrés\u00a0: ${nb(a)}\u00a0−\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. Il reste ${nb(r)} journaux à livrer.`,
    facile: {
      enonce: `Il faut livrer ${nb(a)} journaux. Le camion en a déjà livré ${nb(b)}.`,
      question: 'Combien de journaux reste-t-il\u00a0?',
      indice: 'Des journaux sont déjà partis. Il en reste moins. Il faut enlever.',
      explication: `${nb(a)}\u00a0−\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. Il reste ${nb(r)} journaux.`,
    },
  }),
  ({ depart: a, retrait: b }, r) => ({
    enonce: `Un festival a vendu ${nb(a)} billets. ${nb(b)} billets ont été vendus pour le samedi, tous les autres pour le dimanche.`,
    question: 'Combien de billets ont été vendus pour le dimanche\u00a0?',
    autresQuestions: [
      'Combien coûte un billet pour le festival\u00a0?',
      'Combien de musiciens jouent le dimanche\u00a0?',
    ],
    indice:
      'Les billets du samedi font partie de tous les billets. Que faut-il enlever pour trouver ceux du dimanche\u00a0?',
    explication: `On enlève les billets du samedi\u00a0: ${nb(a)}\u00a0−\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. ${nb(r)} billets ont été vendus pour le dimanche.`,
    facile: {
      enonce: `Le festival a vendu ${nb(a)} billets. ${nb(b)} billets sont pour le samedi. Les autres sont pour le dimanche.`,
      question: 'Combien de billets pour le dimanche\u00a0?',
      indice: 'On enlève les billets du samedi.',
      explication: `${nb(a)}\u00a0−\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. ${nb(r)} billets sont pour le dimanche.`,
    },
  }),
];

export const HISTOIRES_ECART_CM: readonly Histoire<{ grand: number; petit: number }>[] = [
  ({ grand: a, petit: b }, r) => ({
    enonce: `La ville de Lina compte ${nb(a)} habitants. Le village voisin en compte ${nb(b)}.`,
    question: 'Combien d’habitants la ville a-t-elle de plus que le village\u00a0?',
    autresQuestions: [
      'Combien d’habitants les deux communes ont-elles ensemble\u00a0?',
      'Combien d’écoles y a-t-il dans la ville\u00a0?',
    ],
    indice:
      'On ne cherche pas le total, mais la différence entre les deux nombres. Quelle opération donne un écart\u00a0?',
    explication: `On cherche l’écart\u00a0: ${nb(a)}\u00a0−\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. La ville a ${nb(r)} habitants de plus que le village.`,
    facile: {
      enonce: `La ville a ${nb(a)} habitants. Le village a ${nb(b)} habitants.`,
      question: 'Combien d’habitants la ville a-t-elle de plus\u00a0?',
      indice: 'On cherche la différence. Il faut enlever le petit nombre du grand.',
      explication: `${nb(a)}\u00a0−\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. La ville a ${nb(r)} habitants de plus.`,
    },
  }),
  ({ grand: a, petit: b }, r) => ({
    enonce: `Une montagne mesure ${nb(a)} m de haut. Le refuge est construit à ${nb(b)} m d’altitude.`,
    question: 'Combien de mètres faut-il encore monter depuis le refuge pour arriver au sommet\u00a0?',
    autresQuestions: [
      'Combien de temps faut-il pour monter au refuge\u00a0?',
      'Combien de personnes dorment au refuge\u00a0?',
    ],
    indice: 'On cherche ce qui manque pour aller de la hauteur du refuge à celle du sommet.',
    explication: `Il manque ${nb(a)}\u00a0−\u00a0${nb(b)}\u00a0=\u00a0${nb(r)} m. Il faut encore monter ${nb(r)} m.`,
    facile: {
      enonce: `Le sommet est à ${nb(a)} m. Le refuge est à ${nb(b)} m.`,
      question: 'Combien de mètres faut-il encore monter\u00a0?',
      indice: 'On cherche ce qui manque. Il faut enlever le petit nombre du grand.',
      explication: `${nb(a)}\u00a0−\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. Il faut monter ${nb(r)} m.`,
    },
  }),
];

export const HISTOIRES_GROUPEMENTS_CM: readonly Histoire<{ groupes: number; parGroupe: number }>[] = [
  ({ groupes: a, parGroupe: b }, r) => ({
    enonce: `Pour la fête de l’école, on installe ${nb(a)} rangées de ${nb(b)} chaises.`,
    question: 'Combien de chaises installe-t-on en tout\u00a0?',
    autresQuestions: [
      'Combien de parents viennent à la fête\u00a0?',
      'Combien de chaises restent dans la réserve\u00a0?',
    ],
    indice: `Chaque rangée a ${nb(b)} chaises. Combien de fois faut-il compter ${nb(b)}\u00a0? Quelle opération fait cela d’un coup\u00a0?`,
    explication: `${nb(a)} rangées de ${nb(b)} chaises\u00a0: ${nb(a)}\u00a0×\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. On installe ${nb(r)} chaises.`,
    facile: {
      enonce: `Il y a ${nb(a)} rangées. Chaque rangée a ${nb(b)} chaises.`,
      question: 'Combien de chaises en tout\u00a0?',
      indice: `On compte ${nb(a)} fois ${nb(b)} chaises. Il faut multiplier.`,
      explication: `${nb(a)}\u00a0×\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. Il y a ${nb(r)} chaises.`,
    },
  }),
  ({ groupes: a, parGroupe: b }, r) => ({
    enonce: `Un camion livre ${nb(a)} cartons à la bibliothèque. Chaque carton contient ${nb(b)} livres.`,
    question: 'Combien de livres le camion livre-t-il en tout\u00a0?',
    autresQuestions: [
      'Combien pèse un carton de livres\u00a0?',
      'Combien de livres la bibliothèque avait-elle avant\u00a0?',
    ],
    indice: `Tous les cartons contiennent le même nombre de livres. Combien de fois y a-t-il ${nb(b)} livres\u00a0?`,
    explication: `${nb(a)} cartons de ${nb(b)} livres\u00a0: ${nb(a)}\u00a0×\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. Le camion livre ${nb(r)} livres.`,
    facile: {
      enonce: `Le camion livre ${nb(a)} cartons. Chaque carton a ${nb(b)} livres.`,
      question: 'Combien de livres en tout\u00a0?',
      indice: `On compte ${nb(a)} fois ${nb(b)} livres. Il faut multiplier.`,
      explication: `${nb(a)}\u00a0×\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. Le camion livre ${nb(r)} livres.`,
    },
  }),
];

export const HISTOIRES_PARTAGE_CM: readonly Histoire<{ total: number; parts: number }>[] = [
  ({ total: n, parts: p }, r) => ({
    enonce: `Une association a récolté ${nb(n)} cahiers. Elle les répartit de façon égale entre ${nb(p)} écoles.`,
    question: 'Combien de cahiers chaque école reçoit-elle\u00a0?',
    autresQuestions: ['Combien d’élèves y a-t-il dans chaque école\u00a0?', 'Combien coûte un cahier\u00a0?'],
    indice: 'Chaque école reçoit le même nombre de cahiers. Quelle opération partage en parts égales\u00a0?',
    explication: `On partage ${nb(n)} cahiers en ${nb(p)} parts égales\u00a0: ${nb(n)}\u00a0÷\u00a0${nb(p)}\u00a0=\u00a0${nb(r)}. Chaque école reçoit ${nb(r)} cahiers. On peut vérifier\u00a0: ${nb(p)}\u00a0×\u00a0${nb(r)}\u00a0=\u00a0${nb(n)}.`,
    facile: {
      enonce: `Il y a ${nb(n)} cahiers. On les donne à ${nb(p)} écoles. Chaque école a le même nombre.`,
      question: 'Combien de cahiers pour chaque école\u00a0?',
      indice: 'On partage en parts égales. Il faut diviser.',
      explication: `${nb(n)}\u00a0÷\u00a0${nb(p)}\u00a0=\u00a0${nb(r)}. Chaque école a ${nb(r)} cahiers.`,
    },
  }),
  ({ total: n, parts: p }, r) => ({
    enonce: `Un fermier range ${nb(n)} œufs dans ${nb(p)} grands cageots. Chaque cageot contient le même nombre d’œufs.`,
    question: 'Combien d’œufs y a-t-il dans chaque cageot\u00a0?',
    autresQuestions: ['Combien de poules le fermier a-t-il\u00a0?', 'Combien coûte un cageot d’œufs\u00a0?'],
    indice: `Les ${nb(n)} œufs sont partagés en ${nb(p)} parts égales. Tu peux chercher combien de fois ${nb(p)} il y a dans ${nb(n)}.`,
    explication: `${nb(n)}\u00a0÷\u00a0${nb(p)}\u00a0=\u00a0${nb(r)}. Chaque cageot contient ${nb(r)} œufs. On peut vérifier\u00a0: ${nb(p)}\u00a0×\u00a0${nb(r)}\u00a0=\u00a0${nb(n)}.`,
    facile: {
      enonce: `Il y a ${nb(n)} œufs. On les met dans ${nb(p)} cageots. Chaque cageot a le même nombre d’œufs.`,
      question: 'Combien d’œufs dans chaque cageot\u00a0?',
      indice: 'On partage en parts égales. Il faut diviser.',
      explication: `${nb(n)}\u00a0÷\u00a0${nb(p)}\u00a0=\u00a0${nb(r)}. Chaque cageot a ${nb(r)} œufs.`,
    },
  }),
];

export const HISTOIRES_DEUX_ETAPES_CM: readonly Histoire<{ depart: number; premier: number; second: number }>[] = [
  ({ depart: a, premier: b, second: c }, r) => ({
    enonce: `La salle de concert a ${nb(a)} places. ${nb(b)} places sont vendues le premier jour, puis ${nb(c)} le deuxième jour.`,
    question: 'Combien de places reste-t-il à vendre\u00a0?',
    autresQuestions: ['Combien coûte une place de concert\u00a0?', 'Combien de musiciens jouent ce soir-là\u00a0?'],
    indice: 'Il y a deux ventes. Tu peux enlever les deux ventes l’une après l’autre, ou les réunir d’abord.',
    explication: `Places vendues\u00a0: ${nb(b)}\u00a0+\u00a0${nb(c)}\u00a0=\u00a0${nb(b + c)}. Places restantes\u00a0: ${nb(a)}\u00a0−\u00a0${nb(b + c)}\u00a0=\u00a0${nb(r)}. Il reste ${nb(r)} places.`,
    facile: {
      enonce: `La salle a ${nb(a)} places. On vend ${nb(b)} places. Puis on vend ${nb(c)} places.`,
      question: 'Combien de places reste-t-il\u00a0?',
      indice: 'Ajoute les places vendues. Puis enlève-les de toutes les places.',
      explication: `${nb(b)}\u00a0+\u00a0${nb(c)}\u00a0=\u00a0${nb(b + c)}. ${nb(a)}\u00a0−\u00a0${nb(b + c)}\u00a0=\u00a0${nb(r)}. Il reste ${nb(r)} places.`,
    },
  }),
  ({ depart: a, premier: b, second: c }, r) => ({
    enonce: `Le club de sport a ${euros(a)} pour l’année. Il achète des maillots pour ${euros(b)}, puis des ballons pour ${euros(c)}.`,
    question: 'Combien d’euros reste-t-il au club\u00a0?',
    autresQuestions: ['Combien de joueurs y a-t-il dans le club\u00a0?', 'Combien coûte un seul ballon\u00a0?'],
    indice: 'Le club fait deux achats. Combien a-t-il dépensé en tout\u00a0? Que lui reste-t-il ensuite\u00a0?',
    explication: `Dépenses\u00a0: ${nb(b)}\u00a0+\u00a0${nb(c)}\u00a0=\u00a0${nb(b + c)}. Il reste ${nb(a)}\u00a0−\u00a0${nb(b + c)}\u00a0=\u00a0${euros(r)}.`,
    facile: {
      enonce: `Le club a ${euros(a)}. Il paie ${euros(b)} pour des maillots. Il paie ${euros(c)} pour des ballons.`,
      question: 'Combien d’euros reste-t-il\u00a0?',
      indice: 'Ajoute les deux achats. Puis enlève-les de l’argent du club.',
      explication: `${nb(b)}\u00a0+\u00a0${nb(c)}\u00a0=\u00a0${nb(b + c)}. ${nb(a)}\u00a0−\u00a0${nb(b + c)}\u00a0=\u00a0${nb(r)}. Il reste ${euros(r)}.`,
    },
  }),
];

const GROS_ACHATS = [
  ['un vélo', 'un casque'],
  ['une tente', 'un sac de couchage'],
  ['une trottinette', 'un sac à dos'],
] as const;

export const HISTOIRES_PAYER_CM: readonly Histoire<{ prixA: number; prixB: number }>[] = GROS_ACHATS.map(
  ([articleA, articleB]) =>
    ({ prixA: a, prixB: b }: { prixA: number; prixB: number }, r: number) => ({
      enonce: `Au magasin de sport, la famille de Noé achète ${articleA} à ${euros(a)} et ${articleB} à ${euros(b)}.`,
      question: 'Combien d’euros la famille doit-elle payer en tout\u00a0?',
      autresQuestions: [
        'Combien d’euros la famille a-t-elle sur son compte\u00a0?',
        'Combien d’articles le magasin vend-il\u00a0?',
      ],
      indice: 'On cherche le prix des deux achats ensemble. Pose l’opération en alignant bien les chiffres.',
      explication: `On ajoute les deux prix\u00a0: ${nb(a)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. La famille paie ${euros(r)}.`,
      facile: {
        enonce: `La famille achète ${articleA} à ${euros(a)}. Elle achète aussi ${articleB} à ${euros(b)}.`,
        question: 'Combien d’euros en tout\u00a0?',
        indice: 'En tout veut dire\u00a0: les deux prix ensemble. Il faut ajouter.',
        explication: `${nb(a)}\u00a0+\u00a0${nb(b)}\u00a0=\u00a0${nb(r)}. La famille paie ${euros(r)}.`,
      },
    }),
);
