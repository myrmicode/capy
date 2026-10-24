import { MODELES } from '../modeles';
import { nb } from '../moteur';
import type { Donnees, Exercice } from '../types';

const TIRAGES = 10_000;

/**
 * Calcul de la bonne réponse, réécrit ici indépendamment des modèles :
 * si un modèle se trompe dans son calcul, le test le voit.
 */
const ORACLES: Record<string, (d: Donnees) => number> = {
  groupements: (d) => d.groupes * d.parGroupe,
  ajout: (d) => d.depart + d.ajout,
  retrait: (d) => d.depart - d.retrait,
  ecart: (d) => d.grand - d.petit,
  partage: (d) => d.total / d.parts,
  'deux-etapes': (d) => d.depart - (d.premier + d.second),
};

/** Nombres écrits dans un texte (avec l'espace fine des milliers). */
function nombresDans(texte: string): number[] {
  return (texte.match(/\d+(?: \d{3})*/g) ?? []).map((n) => Number(n.replace(/ /g, '')));
}

const MOTS_INTERDITS = /\b(faux|fausse|note|score|nul|raté)\b/i;

describe.each(MODELES.map((m) => [m.id, m] as const))('modèle « %s »', (id, modele) => {
  it('a un oracle de test et une compétence documentée', () => {
    expect(ORACLES[id]).toBeDefined();
    expect(modele.competence.length).toBeGreaterThan(20);
    expect(modele.classes.length).toBeGreaterThan(0);
  });

  it.each(modele.classes)(`reste juste sur ${TIRAGES} tirages en %s`, (classe) => {
    const regles = modele.regles(classe);
    const oracle = ORACLES[id];
    const enonces = new Set<string>();
    // Les anomalies sont collectées puis vérifiées en une fois : c'est bien plus
    // rapide que des milliers d'expect, et le message liste les graines fautives.
    const problemes: string[] = [];

    for (let graine = 0; graine < TIRAGES && problemes.length < 20; graine++) {
      const ex: Exercice = modele.generer(classe, graine);
      const signaler = (message: string) => problemes.push(`graine ${graine} : ${message}`);

      // Réponse juste, entière et dans les bornes de la classe.
      if (ex.reponse !== oracle(ex.donnees)) signaler(`réponse ${ex.reponse} au lieu de ${oracle(ex.donnees)}`);
      if (!Number.isInteger(ex.reponse)) signaler(`réponse non entière ${ex.reponse}`);
      if (ex.reponse < regles.reponse.min || ex.reponse > regles.reponse.max) {
        signaler(`réponse ${ex.reponse} hors bornes`);
      }

      // Chaque nombre de l'histoire est entier et dans ses bornes, et apparaît dans l'énoncé.
      const nombresEnonce = nombresDans(ex.enonce);
      for (const [nom, valeur] of Object.entries(ex.donnees)) {
        const bornes = regles.donnees[nom];
        if (!bornes) signaler(`« ${nom} » n'a pas de bornes`);
        else if (!Number.isInteger(valeur) || valeur < bornes.min || valeur > bornes.max) {
          signaler(`« ${nom} » = ${valeur} hors bornes`);
        }
        if (!nombresEnonce.includes(valeur)) signaler(`« ${nom} » = ${valeur} absent de l'énoncé`);
      }

      // Trois distracteurs : entiers, positifs, distincts entre eux et de la réponse.
      const valeurs = ex.distracteurs.map((x) => x.valeur);
      if (valeurs.length !== 3) signaler(`${valeurs.length} distracteurs`);
      if (new Set(valeurs).size !== valeurs.length) signaler(`distracteurs en double ${valeurs}`);
      for (const v of valeurs) {
        if (!Number.isInteger(v) || v <= 0 || v === ex.reponse) signaler(`distracteur invalide ${v}`);
      }
      const choixTries = [...ex.choix].sort((a, b) => a - b).join();
      if (choixTries !== [ex.reponse, ...valeurs].sort((a, b) => a - b).join()) signaler('choix incohérents');

      // L'indice guide sans donner la réponse : il ne cite que des nombres de l'histoire.
      const donnees = Object.values(ex.donnees);
      for (const n of nombresDans(ex.indice)) {
        if (!donnees.includes(n)) signaler(`l'indice cite ${n}`);
      }

      // L'explication de la méthode mène bien à la réponse.
      if (!ex.explication.includes(nb(ex.reponse))) signaler("l'explication ne donne pas la réponse");

      // Jamais de vocabulaire punitif.
      if (MOTS_INTERDITS.test(`${ex.enonce} ${ex.question} ${ex.indice} ${ex.explication}`)) {
        signaler('vocabulaire interdit');
      }

      enonces.add(ex.enonce);
    }

    expect(problemes).toEqual([]);
    // Les tirages sont variés.
    expect(enonces.size).toBeGreaterThan(Math.min(50, TIRAGES / 10));
  });

  it('redonne exactement le même exercice avec la même graine', () => {
    for (const classe of modele.classes) {
      expect(modele.generer(classe, 1234)).toEqual(modele.generer(classe, 1234));
    }
  });

  it('propose surtout des distracteurs issus d’erreurs typiques', () => {
    const classe = modele.classes[0];
    let typiques = 0;
    let total = 0;
    for (let graine = 0; graine < 1000; graine++) {
      for (const d of modele.generer(classe, graine).distracteurs) {
        total++;
        if (d.erreur !== 'valeur proche') typiques++;
      }
    }
    expect(typiques / total).toBeGreaterThan(0.9);
  });
});

it('refuse de générer pour une classe sans règles', () => {
  const groupements = MODELES.find((m) => m.id === 'groupements')!;
  expect(() => groupements.generer('CP', 1)).toThrow(/pas de règles/);
});
