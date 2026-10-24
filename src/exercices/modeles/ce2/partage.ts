/**
 * Compétence visée : résoudre des problèmes de partage équitable en une étape
 * (recherche de la valeur d'une part), en s'appuyant sur les tables de
 * multiplication de 2 à 5. Sens de la division, quotient exact.
 * Attendus de fin de cycle 2 (CE2).
 */
import { definirModele, nb } from '../../moteur';

export const partage = definirModele<{ total: number; parts: number }>({
  id: 'partage',
  titre: 'Partager en parts égales',
  domaine: 'resoudre-problemes',
  competence: 'Résoudre un problème de partage équitable (valeur d’une part), quotient exact, tables de 2 à 5.',
  operations: ['÷'],
  regles: {
    CE2: {
      donnees: { total: { min: 4, max: 50 }, parts: { min: 2, max: 5 } },
      reponse: { min: 2, max: 10 },
    },
  },
  reglesAccessibles: {
    CE2: {
      // + : partager en 2 ou 3, petites parts.
      1: { donnees: { total: { min: 4, max: 15 }, parts: { min: 2, max: 3 } }, reponse: { min: 2, max: 5 } },
      // ++ : partager jusqu'en 4.
      2: { donnees: { total: { min: 4, max: 32 }, parts: { min: 2, max: 4 } }, reponse: { min: 2, max: 8 } },
    },
  },
  // On tire le nombre de parts et la valeur d'une part : le partage tombe toujours juste.
  tirer: (alea, regles) => {
    const parts = alea.entier(regles.donnees.parts.min, regles.donnees.parts.max);
    const part = alea.entier(regles.reponse.min, regles.reponse.max);
    return { total: parts * part, parts };
  },
  estValide: ({ total, parts }) => total % parts === 0,
  calculer: ({ total, parts }) => total / parts,
  erreursTypiques: ({ total: n, parts: p }) => [
    { valeur: n - p, erreur: 'soustraction au lieu d’un partage' },
    { valeur: n / p + 1, erreur: 'partage inégal (une part de trop)' },
    { valeur: n / p - 1, erreur: 'partage inégal (une part en moins)' },
    { valeur: n * p, erreur: 'multiplication au lieu d’un partage' },
  ],
  histoires: [
    ({ total: n, parts: p }, r) => ({
      enonce: `Capy a ${nb(n)} noisettes. Il les partage entre ${nb(p)} amis, et chacun en reçoit autant.`,
      question: 'Combien de noisettes chaque ami reçoit-il ?',
      autresQuestions: ['Combien de noisettes Capy a-t-il mangées hier ?', 'Combien pèse une noisette ?'],
      indice: `Distribue les noisettes une par une à chacun des ${nb(p)} amis. La table de ${nb(p)} peut t’aider.`,
      explication: `On partage ${nb(n)} noisettes en ${nb(p)} parts égales. Comme ${nb(p)} × ${nb(r)} = ${nb(n)}, chaque ami reçoit ${nb(r)} noisettes. On écrit ${nb(n)} : ${nb(p)} = ${nb(r)}.`,
      facile: {
        enonce: `Capy a ${nb(n)} noisettes. Il les donne à ${nb(p)} amis. Chaque ami a le même nombre.`,
        question: 'Combien de noisettes a chaque ami ?',
        indice: 'Donne une noisette à chaque ami. Puis recommence.',
        explication: `${nb(p)} × ${nb(r)} = ${nb(n)}. Chaque ami a ${nb(r)} noisettes.`,
      },
    }),
    ({ total: n, parts: p }, r) => ({
      enonce: `La maîtresse range ${nb(n)} crayons dans ${nb(p)} pots. Chaque pot contient le même nombre de crayons.`,
      question: 'Combien de crayons y a-t-il dans chaque pot ?',
      autresQuestions: ['Combien de crayons sont rouges ?', 'Combien d’élèves y a-t-il dans la classe ?'],
      indice: `Cherche le nombre qui, multiplié par ${nb(p)}, donne ${nb(n)}.`,
      explication: `${nb(p)} × ${nb(r)} = ${nb(n)}, donc il y a ${nb(r)} crayons dans chaque pot. On écrit ${nb(n)} : ${nb(p)} = ${nb(r)}.`,
      facile: {
        enonce: `Il y a ${nb(n)} crayons. On les range dans ${nb(p)} pots. Chaque pot a le même nombre.`,
        question: 'Combien de crayons y a-t-il dans un pot ?',
        indice: `Cherche le nombre qui, fois ${nb(p)}, donne ${nb(n)}.`,
        explication: `${nb(p)} × ${nb(r)} = ${nb(n)}. Il y a ${nb(r)} crayons par pot.`,
      },
    }),
    ({ total: n, parts: p }, r) => ({
      enonce: `Pour un jeu, ${nb(n)} enfants forment ${nb(p)} équipes de même taille.`,
      question: 'Combien d’enfants y a-t-il dans chaque équipe ?',
      autresQuestions: ['Quelle équipe va gagner le jeu ?', 'Combien de temps dure le jeu ?'],
      indice: `Imagine ${nb(p)} équipes. Ajoute un enfant dans chaque équipe, chacun son tour, jusqu’à ce qu’il n’en reste plus.`,
      explication: `${nb(n)} enfants en ${nb(p)} équipes égales : ${nb(p)} × ${nb(r)} = ${nb(n)}. Il y a ${nb(r)} enfants par équipe. On écrit ${nb(n)} : ${nb(p)} = ${nb(r)}.`,
      facile: {
        enonce: `Il y a ${nb(n)} enfants. Ils font ${nb(p)} équipes. Les équipes ont la même taille.`,
        question: 'Combien d’enfants y a-t-il dans une équipe ?',
        indice: 'Mets un enfant dans chaque équipe. Puis recommence.',
        explication: `${nb(p)} × ${nb(r)} = ${nb(n)}. Il y a ${nb(r)} enfants par équipe.`,
      },
    }),
  ],
});
