import { NIVEAUX } from '../../types';
import { conjuguer, PERSONNES, TEMPS, VERBES_PREMIER_GROUPE } from '../conjugaison';
import { MODELES_FRANCAIS } from '../index';
import { ADJECTIFS, FAMILLES, NOMS, SYNONYMES } from '../lexique';
import { phrase } from '../moteur';

const TIRAGES = 10_000;
const MOTS_INTERDITS = /\b(faux|fausse|note|score|nul|raté)\b/i;
const LETTRE = /[\p{L}]/u;

/** Le mot (ou groupe) apparaît-il tel quel dans le texte, entouré de non-lettres ? */
function contientMot(texte: string, mot: string): boolean {
  const t = texte.toLowerCase();
  const m = mot.toLowerCase();
  for (let i = t.indexOf(m); i >= 0; i = t.indexOf(m, i + 1)) {
    const avant = i === 0 ? '' : t[i - 1];
    const apres = t[i + m.length] ?? '';
    if (!LETTRE.test(avant) && !LETTRE.test(apres)) return true;
  }
  return false;
}

describe('conjugaison', () => {
  it('conjugue un verbe du 1er groupe aux trois temps', () => {
    expect(PERSONNES.map((p) => conjuguer('chanter', 'present', p))).toEqual(['chante', 'chantes', 'chante', 'chantons', 'chantez', 'chantent']);
    expect(PERSONNES.map((p) => conjuguer('chanter', 'imparfait', p))).toEqual([
      'chantais',
      'chantais',
      'chantait',
      'chantions',
      'chantiez',
      'chantaient',
    ]);
    expect(PERSONNES.map((p) => conjuguer('chanter', 'futur', p))).toEqual([
      'chanterai',
      'chanteras',
      'chantera',
      'chanterons',
      'chanterez',
      'chanteront',
    ]);
  });

  it('connaît être et avoir', () => {
    expect(conjuguer('être', 'present', 3)).toBe('sommes');
    expect(conjuguer('être', 'imparfait', 5)).toBe('étaient');
    expect(conjuguer('avoir', 'futur', 0)).toBe('aurai');
    expect(conjuguer('avoir', 'present', 5)).toBe('ont');
  });

  it('ne retient que des verbes réguliers commençant par une consonne', () => {
    for (const v of VERBES_PREMIER_GROUPE) {
      expect(v.infinitif).toMatch(/^[bcdfghjklmnpqrstvwxz].*[^gc]er$/);
      for (const t of TEMPS) for (const p of PERSONNES) expect(conjuguer(v.infinitif, t, p)).toMatch(/^\p{L}+$/u);
    }
  });
});

describe('lexique', () => {
  it('a des adjectifs aux quatre formes toutes différentes', () => {
    for (const a of ADJECTIFS) expect(new Set([a.ms, a.fs, a.mp, a.fp]).size).toBe(4);
  });

  it('n’a que des noms qui commencent par une consonne (pas d’élision)', () => {
    for (const n of NOMS) expect(n.singulier).toMatch(/^[bcdfgjklmnpqrstvwxz]/);
  });

  it('a des familles dont le piège n’est pas un membre', () => {
    for (const f of FAMILLES) {
      expect(f.membres).not.toContain(f.mot);
      if (f.piege) expect([f.mot, ...f.membres]).not.toContain(f.piege);
    }
  });

  it('a des paires de synonymes distinctes', () => {
    for (const p of SYNONYMES) {
      expect(p.mot).not.toBe(p.synonyme);
      expect(p.contraire).not.toBe(p.synonyme);
    }
  });
});

describe.each(MODELES_FRANCAIS.map((m) => [m.id, m] as const))('modèle « %s »', (_id, modele) => {
  it('a une compétence documentée', () => {
    expect(modele.competence.length).toBeGreaterThan(20);
  });

  const cas = modele.classes.flatMap((classe) => NIVEAUX.map((niveau) => [classe, niveau] as const));
  it.each(cas)(`reste juste sur ${TIRAGES} tirages en %s, niveau %i`, (classe, niveau) => {
    const problemes: string[] = [];
    const enonces = new Set<string>();
    for (let graine = 0; graine < TIRAGES && problemes.length < 20; graine++) {
      const ex = modele.generer(classe, graine, { niveau });
      const signaler = (message: string) => problemes.push(`graine ${graine} : ${message}`);
      const textes = [ex.enonce, ex.question, ex.reponse, ex.indice, ex.explication, ...ex.choix];

      if (!ex.reponse.trim()) signaler('réponse vide');
      if (!ex.choix.includes(ex.reponse)) signaler('la réponse n’est pas proposée');
      if (new Set(ex.choix).size !== ex.choix.length) signaler(`choix en double ${ex.choix}`);
      // Au niveau +, le jeu des paniers peut n'avoir que deux paniers (nom, verbe).
      if (ex.choix.length < (ex.categories ? 2 : 3)) signaler(`${ex.choix.length} choix seulement`);
      if (ex.niveau !== niveau) signaler(`niveau ${ex.niveau} au lieu de ${niveau}`);
      for (const d of ex.distracteurs) if (d.valeur === ex.reponse) signaler(`distracteur = réponse (${d.valeur})`);
      for (const t of textes) {
        if (/undefined|null|NaN/.test(t)) signaler(`texte cassé : ${t}`);
        if (/ {2}|^\s|\s$/.test(t)) signaler(`espaces en trop : « ${t} »`);
      }
      if (MOTS_INTERDITS.test(textes.join(' '))) signaler('vocabulaire interdit');

      // L'explication mène à la réponse ; l'indice ne la donne pas.
      if (!contientMot(ex.explication, ex.reponse)) signaler(`l’explication ne cite pas « ${ex.reponse} »`);
      if (!ex.categories && contientMot(ex.indice, ex.reponse)) signaler(`l’indice donne la réponse « ${ex.reponse} »`);

      // Phrase découpée : elle se recolle à l'identique, et la réponse est un seul wagon.
      if (ex.segments) {
        if (phrase(ex.segments) !== ex.enonce) signaler(`segments ≠ énoncé : ${ex.enonce}`);
        if (!ex.categories && ex.segments.filter((s) => s.texte === ex.reponse).length !== 1) {
          signaler(`réponse « ${ex.reponse} » pas unique dans ${ex.enonce}`);
        }
        if (!/^\p{Lu}/u.test(ex.enonce)) signaler(`pas de majuscule : ${ex.enonce}`);
      }
      if (ex.categories && ex.segments?.filter((s) => s.surligne).length !== 1) signaler('il faut un seul mot en couleur');

      enonces.add(`${ex.enonce} ${ex.question} ${ex.reponse}`);
    }
    expect(problemes).toEqual([]);
    expect(enonces.size).toBeGreaterThan(niveau === 3 ? 15 : 8);
  });

  it('redonne exactement le même exercice avec la même graine', () => {
    for (const classe of modele.classes) expect(modele.generer(classe, 77)).toEqual(modele.generer(classe, 77));
  });
});

it('refuse de générer pour une classe sans règles', () => {
  expect(() => MODELES_FRANCAIS[0].generer('CP', 1)).toThrow(/pas de règles/);
});

describe('progression de la difficulté en français', () => {
  const modele = (id: string) => MODELES_FRANCAIS.find((m) => m.id === id)!;
  const tirages = (id: string, niveau: 1 | 2 | 3, n = 500) =>
    Array.from({ length: n }, (_, g) => modele(id).generer('CE2', g, { niveau }));

  it('accord : singulier seulement au niveau +, pluriels irréguliers seulement au niveau +++', () => {
    expect(tirages('accord-adjectif', 1).every((e) => !/\b(les|des)\b/i.test(e.enonce + e.reponse))).toBe(true);
    const irreguliers = (n: 1 | 2 | 3) => tirages('accord-adjectif', n, 3000).some((e) => /(chevaux|bateaux|chapeaux|gâteaux|manteaux)/.test(e.enonce + e.reponse));
    expect(irreguliers(2)).toBe(false);
    expect(irreguliers(3)).toBe(true);
  });

  it('nature : 2 paniers, puis 3, puis 4', () => {
    expect(tirages('nature-du-mot', 1, 1)[0].categories).toEqual(['Nom', 'Verbe']);
    expect(tirages('nature-du-mot', 2, 1)[0].categories).toEqual(['Nom', 'Verbe', 'Adjectif']);
    expect(tirages('nature-du-mot', 3, 1)[0].categories).toHaveLength(4);
  });

  it('sujet et verbe : pas de complément en tête avant le niveau +++', () => {
    const enTete = (n: 1 | 2 | 3) => tirages('sujet-et-verbe', n).some((e) => e.segments![0].texte.endsWith(','));
    expect(enTete(1)).toBe(false);
    expect(enTete(2)).toBe(false);
    expect(enTete(3)).toBe(true);
  });

  it('synonymes et familles : pas de piège au niveau +', () => {
    expect(tirages('synonymes', 1).every((e) => !e.distracteurs.some((d) => d.erreur === 'mot de sens contraire'))).toBe(true);
    expect(tirages('meme-famille', 1).every((e) => !e.distracteurs.some((d) => d.erreur.startsWith('mot qui ressemble')))).toBe(true);
    expect(tirages('synonymes', 2).some((e) => e.distracteurs.some((d) => d.erreur === 'mot de sens contraire'))).toBe(true);
  });

  it('conjugaison : être et avoir à partir du niveau ++', () => {
    const avecEtreAvoir = (n: 1 | 2 | 3) => tirages('conjugaison', n).some((e) => /« (être|avoir) »/.test(e.question));
    expect(avecEtreAvoir(1)).toBe(false);
    expect(avecEtreAvoir(2)).toBe(true);
  });
});
