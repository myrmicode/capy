import { creerAlea, graineDepuisTexte } from '../alea';
import { additionSansRetenue, soustractionPetitDuGrand } from '../erreurs';
import { choisirDistracteurs, nb } from '../moteur';

describe('générateur avec graine', () => {
  it('redonne la même suite avec la même graine', () => {
    const a = creerAlea(42);
    const b = creerAlea(42);
    for (let i = 0; i < 100; i++) expect(a.suivant()).toBe(b.suivant());
  });

  it('donne des suites différentes avec des graines différentes', () => {
    expect(creerAlea(1).suivant()).not.toBe(creerAlea(2).suivant());
  });

  it('tire des entiers dans les bornes, toutes les valeurs finissant par sortir', () => {
    const alea = creerAlea(7);
    const vus = new Set<number>();
    for (let i = 0; i < 5000; i++) {
      const n = alea.entier(2, 9);
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(9);
      vus.add(n);
    }
    expect(vus.size).toBe(8);
  });

  it('mélange sans perdre ni ajouter d’élément', () => {
    const melange = creerAlea(3).melanger([1, 2, 3, 4, 5]);
    expect([...melange].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('fabrique une graine stable à partir d’un texte', () => {
    expect(graineDepuisTexte('lou:etape:3')).toBe(graineDepuisTexte('lou:etape:3'));
    expect(graineDepuisTexte('lou:etape:3')).not.toBe(graineDepuisTexte('lou:etape:4'));
  });
});

describe('erreurs typiques', () => {
  it('addition en oubliant les retenues', () => {
    expect(additionSansRetenue(47, 38)).toBe(75);
    expect(additionSansRetenue(195, 7)).toBe(192);
    expect(additionSansRetenue(123, 456)).toBe(579);
  });

  it('soustraction « le plus petit ôté du plus grand »', () => {
    expect(soustractionPetitDuGrand(52, 38)).toBe(26);
    expect(soustractionPetitDuGrand(403, 127)).toBe(324);
    expect(soustractionPetitDuGrand(987, 654)).toBe(333);
  });
});

describe('choix des distracteurs', () => {
  it('écarte les valeurs négatives, nulles, décimales, en double ou égales à la réponse', () => {
    const retenus = choisirDistracteurs(
      10,
      [
        { valeur: -4, erreur: 'a' },
        { valeur: 0, erreur: 'b' },
        { valeur: 2.5, erreur: 'c' },
        { valeur: 10, erreur: 'd' },
        { valeur: 12, erreur: 'e' },
        { valeur: 12, erreur: 'f' },
      ],
      creerAlea(1),
    );
    const valeurs = retenus.map((r) => r.valeur);
    expect(valeurs[0]).toBe(12);
    expect(valeurs).toHaveLength(3);
    expect(new Set(valeurs).size).toBe(3);
    valeurs.forEach((v) => expect(v > 0 && v !== 10 && Number.isInteger(v)).toBe(true));
  });

  it('complète même quand la réponse est 1', () => {
    const valeurs = choisirDistracteurs(1, [], creerAlea(5)).map((r) => r.valeur);
    expect(valeurs).toHaveLength(3);
    valeurs.forEach((v) => expect(v).toBeGreaterThan(0));
  });
});

it('écrit les nombres à la française', () => {
  expect(nb(7)).toBe('7');
  expect(nb(999)).toBe('999');
  expect(nb(1000)).toBe('1 000');
  expect(nb(1234567)).toBe('1 234 567');
});
