import { MODELES } from '../modeles';
import { nb } from '../moteur';
import { NIVEAUX, type Donnees, type Exercice } from '../types';

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
  tables: (d) => d.a * d.b,
  doubles: (d) => d.nombre + d.nombre,
  'complement-cent': (d) => 100 - d.depart,
  'ajouter-dizaines': (d) => d.nombre + d.dizaines,
  'placer-petits-pas': (d) => d.cible,
  'placer-grands-pas': (d) => d.cible,
  'lire-petits-pas': (d) => d.debut + d.rang * d.pas,
  'lire-grands-pas': (d) => d.debut + d.rang * d.pas,
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

  const cas = modele.classes.flatMap((classe) => NIVEAUX.map((niveau) => [classe, niveau] as const));
  it.each(cas)(`reste juste sur ${TIRAGES} tirages en %s, niveau %i`, (classe, niveau) => {
    const regles = modele.regles(classe, niveau);
    const oracle = ORACLES[id];
    const enonces = new Set<string>();
    // Les anomalies sont collectées puis vérifiées en une fois : c'est bien plus
    // rapide que des milliers d'expect, et le message liste les graines fautives.
    const problemes: string[] = [];

    for (let graine = 0; graine < TIRAGES && problemes.length < 20; graine++) {
      const ex: Exercice = modele.generer(classe, graine, { niveau });
      if (ex.niveau !== niveau) problemes.push(`graine ${graine} : niveau ${ex.niveau} au lieu de ${niveau}`);
      const signaler = (message: string) => problemes.push(`graine ${graine} : ${message}`);

      // Réponse juste, entière et dans les bornes de la classe.
      if (ex.reponse !== oracle(ex.donnees)) signaler(`réponse ${ex.reponse} au lieu de ${oracle(ex.donnees)}`);
      if (!Number.isInteger(ex.reponse)) signaler(`réponse non entière ${ex.reponse}`);
      if (ex.reponse < regles.reponse.min || ex.reponse > regles.reponse.max) {
        signaler(`réponse ${ex.reponse} hors bornes`);
      }

      // Chaque nombre de l'histoire est entier et dans ses bornes, et apparaît dans l'énoncé ou la question.
      const nombresEnonce = nombresDans(`${ex.enonce} ${ex.question}`);
      for (const [nom, valeur] of Object.entries(ex.donnees)) {
        const bornes = regles.donnees[nom];
        if (!bornes) signaler(`« ${nom} » n'a pas de bornes`);
        else if (!Number.isInteger(valeur) || valeur < bornes.min || valeur > bornes.max) {
          signaler(`« ${nom} » = ${valeur} hors bornes`);
        }
        if (!nombresEnonce.includes(valeur)) signaler(`« ${nom} » = ${valeur} absent de l'énoncé et de la question`);
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

      // La question perdue : la bonne question et deux autres, toutes différentes.
      if (ex.questionsAuChoix) {
        if (ex.questionsAuChoix.length !== 3 || new Set(ex.questionsAuChoix).size !== 3) signaler('questions au choix invalides');
        if (!ex.questionsAuChoix.includes(ex.question)) signaler('la bonne question manque');
      }

      enonces.add(`${ex.enonce} ${ex.question}`);
    }

    expect(problemes).toEqual([]);
    // Les tirages sont variés (moins aux niveaux accessibles : il y a moins de combinaisons, par construction).
    expect(enonces.size).toBeGreaterThan(niveau === 3 ? 50 : 5);
  });

  it('monte en difficulté du niveau + au niveau +++', () => {
    for (const classe of modele.classes) {
      const max = NIVEAUX.map((n) => modele.regles(classe, n).reponse.max);
      expect(max[0]).toBeLessThanOrEqual(max[1]);
      expect(max[1]).toBeLessThanOrEqual(max[2]);
      // Le niveau + est vraiment plus accessible que le niveau visé.
      const facile = new Set<number>();
      const vise = new Set<number>();
      for (let g = 0; g < 2000; g++) {
        facile.add(modele.generer(classe, g, { niveau: 1 }).reponse);
        vise.add(modele.generer(classe, g, { niveau: 3 }).reponse);
      }
      expect(Math.max(...facile)).toBeLessThanOrEqual(Math.max(...vise));
      expect(facile).not.toEqual(vise);
    }
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
