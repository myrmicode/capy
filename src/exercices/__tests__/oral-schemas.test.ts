import { IMAGIER, motImagier } from '@/contenu/imagier';
import { TOUTES_LES_SYLLABES_DICTEES } from '@/contenu/syllabesDictees';
import { THEMES } from '@/config/parcours';
import { JEUX } from '@/jeux/registre';
import { genererEtape } from '@/parcours/etape';

import { MODELES_FRANCAIS } from '../francais';
import { objetsSansDessin } from '../francais/modeles/oral';
import { fautesSyllabe } from '../francais/modeles/syllabes';
import { MODELES } from '../modeles';
import { decrireSchema, longueurs, MODELES_AVEC_SCHEMA, schemaDe, schemasAuChoix } from '../schemas';
import { NIVEAUX, type ExerciceTexte } from '../types';

const modeleTexte = (id: string) => MODELES_FRANCAIS.find((m) => m.id === id)!;

describe('l’imagier', () => {
  it('a des mots tous différents, chacun avec son dessin', () => {
    expect(new Set(IMAGIER.map((i) => i.mot)).size).toBe(IMAGIER.length);
    expect(new Set(IMAGIER.map((i) => i.image)).size).toBe(IMAGIER.length);
    for (const niveau of [1, 2, 3]) expect(IMAGIER.filter((i) => i.niveau === niveau).length).toBeGreaterThan(20);
  });

  it('dessine chaque objet des scènes', () => {
    expect(objetsSansDessin()).toEqual([]);
  });
});

describe('« Comprendre des mots »', () => {
  const tirages = (niveau: 1 | 2 | 3) =>
    Array.from({ length: 300 }, (_, g) => modeleTexte('comprendre-mot').generer('CP', g, { niveau }));
  const memeFamille = (ex: ExerciceTexte) =>
    ex.choix.filter((c) => c !== ex.reponse && motImagier(c)?.categorie === motImagier(ex.reponse)?.categorie).length;

  it('montre des images, et Capy dit le mot sans qu’il soit écrit', () => {
    for (const ex of tirages(2)) {
      expect(ex.images).toBe('imagier');
      for (const c of ex.choix) expect(motImagier(c)).toBeDefined();
      expect(ex.lecture?.toLowerCase()).toContain(ex.reponse);
      expect(ex.enonce).not.toContain(ex.reponse);
    }
  });

  it('rapproche les dessins avec le niveau : aucun de la même famille au +, tous au +++', () => {
    expect(tirages(1).every((ex) => memeFamille(ex) === 0)).toBe(true);
    expect(tirages(3).filter((ex) => memeFamille(ex) === 3).length).toBeGreaterThan(250);
    expect(tirages(3).every((ex) => motImagier(ex.reponse)?.niveau === 3)).toBe(true);
  });
});

describe('« Comprendre des phrases »', () => {
  it('a une scène pour chaque choix, toutes différentes, et Capy dit la bonne phrase', () => {
    for (const classe of ['CP', 'CE1'] as const) {
      for (const niveau of NIVEAUX) {
        for (let g = 0; g < 400; g++) {
          const ex = modeleTexte('comprendre-phrase').generer(classe, g, { niveau });
          expect(ex.images).toBe('scenes');
          expect(ex.lecture).toBe(ex.reponse);
          const scenes = ex.choix.map((c) => ex.scenes?.[c]);
          expect(scenes.every((s) => s !== undefined && s.length > 0)).toBe(true);
          expect(new Set(scenes.map((s) => JSON.stringify(s))).size).toBe(ex.choix.length);
          for (const s of scenes) for (const e of s!) expect(motImagier(e.objet)).toBeDefined();
        }
      }
    }
  });

  it('garde la négation et la relative pour le niveau +++', () => {
    const phrases = (niveau: 1 | 2 | 3) =>
      Array.from({ length: 300 }, (_, g) => modeleTexte('comprendre-phrase').generer('CP', g, { niveau }).reponse);
    const difficiles = /pas de| qui est |dessous/;
    expect(phrases(1).some((p) => difficiles.test(p))).toBe(false);
    expect(phrases(3).filter((p) => difficiles.test(p)).length).toBeGreaterThan(150);
  });
});

describe('« Écrire des syllabes »', () => {
  it('dit la syllabe sans jamais l’écrire, et propose des fautes typiques', () => {
    for (const niveau of NIVEAUX) {
      for (let g = 0; g < 300; g++) {
        const ex = modeleTexte('dictee-syllabes').generer('CE1', g, { niveau });
        expect(ex.enonce).not.toMatch(new RegExp(`(^|[^\\p{L}])${ex.reponse}([^\\p{L}]|$)`, 'u'));
        expect(ex.lecture).toContain(ex.reponse);
        expect(TOUTES_LES_SYLLABES_DICTEES).toContain(ex.reponse);
      }
    }
    expect(fautesSyllabe('bra').map((f) => f.valeur)).toEqual(expect.arrayContaining(['bar', 'ba', 'pra', 'bla']));
    expect(fautesSyllabe('chou').map((f) => f.valeur)).toEqual(expect.arrayContaining(['cho', 'chu']));
    expect(fautesSyllabe('ma').map((f) => f.valeur)).toEqual(expect.arrayContaining(['am', 'na']));
  });

  it('n’a que des syllabes qui s’écrivent d’une seule façon simple', () => {
    for (const s of TOUTES_LES_SYLLABES_DICTEES) expect(s).not.toMatch(/an|en|in|au|eau|ce|ci|ge|gi/);
  });
});

describe('les schémas en barres', () => {
  const avecSchema = MODELES.filter((m) => (MODELES_AVEC_SCHEMA as readonly string[]).includes(m.id));

  it('ont un schéma pour chaque problème qui en a un, et trois choix différents', () => {
    expect(avecSchema.map((m) => m.id).sort()).toEqual([...MODELES_AVEC_SCHEMA].sort());
    for (const m of avecSchema) {
      for (const classe of m.classes) {
        for (let g = 0; g < 200; g++) {
          const ex = m.generer(classe, g, { niveau: NIVEAUX[g % 3] });
          const s = schemaDe(ex)!;
          const choix = schemasAuChoix(ex)!;
          expect(choix.schemas).toHaveLength(3);
          expect(new Set(choix.schemas.map((x) => JSON.stringify(x))).size).toBe(3);
          expect(choix.schemas[choix.bon]).toEqual(s);
          // Le bon schéma cherche toujours un seul nombre : la réponse.
          const inconnues = JSON.stringify(s).match(/null/g) ?? [];
          expect(inconnues).toHaveLength(1);
          expect(decrireSchema(s)).toContain('à trouver');
        }
      }
    }
  });

  it('retrouvent la réponse : le tout est la somme des morceaux, les parts égales font le total', () => {
    for (const m of avecSchema) {
      for (let g = 0; g < 100; g++) {
        const ex = m.generer(m.classes[g % m.classes.length], g);
        const s = schemaDe(ex)!;
        if (s.type === 'parties') {
          const valeurs = [s.tout, ...s.parties].map((v) => v ?? ex.reponse);
          expect(valeurs[0]).toBe(valeurs.slice(1).reduce((a, b) => a + b, 0));
        } else if (s.type === 'comparaison') {
          expect((s.grand ?? 0) - (s.petit ?? 0)).toBe(ex.reponse);
        } else {
          expect(s.total ?? ex.reponse).toBe(s.nombre * (s.parGroupe ?? ex.reponse));
        }
      }
    }
  });

  it('gardent des morceaux assez larges pour y lire un nombre', () => {
    expect(longueurs([1000, null], 1005).every((l) => l >= 0.18)).toBe(true);
    expect(longueurs([30, 20], null)).toEqual([0.6, 0.4]);
  });
});

describe('les nouveaux thèmes', () => {
  it('composent des étapes jouables, dans chaque classe', () => {
    const nouveaux = THEMES.filter(
      (t) =>
        ['comprendre-mots', 'comprendre-phrases', 'ecrire-syllabes'].includes(t.domaine) ||
        t.unites.some((u) => u.id.endsWith('-rp-schemas')),
    );
    expect(nouveaux.filter((t) => t.domaine === 'comprendre-mots').map((t) => t.classe)).toEqual(['CE1', 'CP']);
    expect(nouveaux.filter((t) => t.unites.some((u) => u.id.endsWith('-rp-schemas'))).length).toBe(5);
    for (const theme of nouveaux) {
      for (const etape of theme.unites.flatMap((u) => u.etapes)) {
        for (let graine = 0; graine < 20; graine++) {
          const questions = genererEtape({ classe: theme.classe, domaine: theme.domaine, graine, ...etape });
          expect(questions).toHaveLength(etape.nombreQuestions);
          for (const q of questions) expect(JEUX[q.jeu].accepte(q.exercice)).toBe(true);
        }
      }
    }
  });
});
