import { motsCles, plagesMotsCles, relireLaQuestion } from '@/accessibilite/motsCles';
import { aideApresErreur } from '@/parcours/aide';

import { conseilPhrase, PHRASES_DICTEE, phraseFautive, phraseJuste } from '../francais/phrasesDictees';
import { modeleParId, modeleTexteParId } from '../modeles';
import { cheminDansLaGrille, deplacer, lireChemin, leNom, memeCase, nomCase } from '../modeles/quadrillage';
import { NIVEAUX, type ExerciceTexte, type IllustrationGraphique, type IllustrationQuadrillage } from '../types';

const LETTRE = /[\p{L}]/u;
const occurrences = (phrase: string, mot: string) =>
  [...phrase.matchAll(new RegExp(mot, 'gu'))].filter(
    (m) => !LETTRE.test(phrase[m.index - 1] ?? '') && !LETTRE.test(phrase[m.index + mot.length] ?? ''),
  ).length;

const tirages = (id: string, classe: 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2', n = 300) =>
  NIVEAUX.flatMap((niveau) =>
    Array.from({ length: n }, (_, g) => modeleTexteParId(id)!.generer(classe, g, { niveau })),
  );

const grille = (ex: ExerciceTexte) => ex.illustration as IllustrationQuadrillage;
const objetEn = (g: IllustrationQuadrillage, c: { colonne: number; ligne: number }) =>
  g.objets.find((o) => memeCase(o, c))?.objet;

describe('lire des données', () => {
  it('répond avec les nombres du dessin : la valeur lue, le plus, l’écart, le total', () => {
    for (const classe of ['CE1', 'CE2', 'CM1', 'CM2'] as const) {
      for (const ex of tirages('lire-graphique', classe)) {
        const g = ex.illustration as IllustrationGraphique;
        expect(g.type).toBe('graphique');
        const valeurs = g.lignes.map((l) => l.valeur);
        expect(new Set(valeurs).size).toBe(valeurs.length);
        // L'axe a au plus 11 graduations, et chaque barre tombe sur une graduation ou au milieu.
        for (const v of valeurs) expect((2 * v) % g.pas).toBe(0);
        expect(Math.max(...valeurs) / g.pas).toBeLessThanOrEqual(10);
        const nombre = Number(ex.reponse.replace(/ /g, ''));
        const noms = g.lignes.map((l) => l.nom);
        if (noms.includes(ex.reponse)) {
          const v = g.lignes.find((l) => l.nom === ex.reponse)!.valeur;
          expect([Math.max(...valeurs), Math.min(...valeurs)]).toContain(v);
        } else {
          const sommes = valeurs.flatMap((a) => valeurs.flatMap((b) => (a === b ? [] : [a + b, a - b])));
          expect([...valeurs, ...sommes]).toContain(nombre);
        }
      }
    }
  });

  it('ne met des barres entre deux graduations qu’au CM, au niveau +++', () => {
    const entre = (classe: 'CE2' | 'CM1', niveau: 1 | 2 | 3) =>
      Array.from({ length: 400 }, (_, g) => modeleTexteParId('lire-graphique')!.generer(classe, g, { niveau })).some(
        (ex) => {
          const g = ex.illustration as IllustrationGraphique;
          return g.forme === 'barres' && g.lignes.some((l) => l.valeur % g.pas !== 0);
        },
      );
    expect(entre('CE2', 3)).toBe(false);
    expect(entre('CM1', 2)).toBe(false);
    expect(entre('CM1', 3)).toBe(true);
  });
});

describe('proportionnalité', () => {
  it('propose l’erreur typique : ajouter l’écart au lieu de multiplier', () => {
    const m = modeleParId('proportionnalite')!;
    for (let g = 0; g < 300; g++) {
      const ex = m.generer('CM1', g, { niveau: 2 });
      const { quantite, prix, autre } = ex.donnees;
      expect(ex.reponse).toBe((prix / quantite) * autre);
      const additive = prix + (autre - quantite);
      if (additive > 0 && additive !== ex.reponse) expect(ex.choix).toContain(additive);
    }
  });

  it('passe par la valeur d’un seul au niveau +++, par « fois plus » avant', () => {
    const m = modeleParId('proportionnalite')!;
    const multiples = (niveau: 1 | 2 | 3) =>
      Array.from({ length: 300 }, (_, g) => m.generer('CM2', g, { niveau })).filter(
        (ex) => ex.donnees.autre % ex.donnees.quantite === 0,
      ).length;
    expect(multiples(1)).toBe(300);
    expect(multiples(2)).toBe(300);
    expect(multiples(3)).toBeLessThan(100);
  });
});

describe('le quadrillage', () => {
  it('se déplace et nomme les cases', () => {
    expect(deplacer({ colonne: 1, ligne: 1 }, ['→', '→', '↑'])).toEqual({ colonne: 3, ligne: 0 });
    expect(nomCase({ colonne: 2, ligne: 1 })).toBe('C2');
    expect(cheminDansLaGrille({ colonne: 0, ligne: 0 }, ['←'], 4, 4)).toBe(false);
    expect(lireChemin('→ → ↑')).toEqual(['→', '→', '↑']);
    expect(leNom('pomme')).toBe('la pomme');
    expect(leNom('ballon')).toBe('le ballon');
  });

  it('« Suivre les flèches » : la réponse est l’objet de la case d’arrivée, les autres viennent d’erreurs typiques', () => {
    for (const classe of ['CP', 'CE1', 'CM2'] as const) {
      for (const ex of tirages('suivre-chemin', classe)) {
        const g = grille(ex);
        const chemin = lireChemin(ex.enonce.split(':').pop()!.replace('.', '').trim());
        expect(cheminDansLaGrille(g.depart!, chemin, g.colonnes, g.lignes)).toBe(true);
        expect(leNom(objetEn(g, deplacer(g.depart!, chemin))!)).toBe(ex.reponse);
        expect(new Set(g.objets.map((o) => `${o.colonne},${o.ligne}`)).size).toBe(g.objets.length);
        expect(g.objets.some((o) => memeCase(o, g.depart!))).toBe(false);
      }
    }
  });

  it('« Écrire le chemin » : la réponse mène à l’objet, les mauvaises réponses mènent ailleurs', () => {
    for (const ex of tirages('coder-chemin', 'CM1')) {
      const g = grille(ex);
      const arrivee = deplacer(g.depart!, lireChemin(ex.reponse));
      expect(ex.enonce).toContain(leNom(objetEn(g, arrivee)!));
      for (const d of ex.distracteurs) expect(memeCase(deplacer(g.depart!, lireChemin(d.valeur)), arrivee)).toBe(false);
    }
  });

  it('« Repérer une case » : la case nommée contient bien l’objet', () => {
    for (const ex of tirages('reperer-case', 'CE2')) {
      const g = grille(ex);
      expect(g.reperes).toBe(true);
      if (/^[A-H]\d$/.test(ex.reponse)) {
        const c = { colonne: ex.reponse.charCodeAt(0) - 65, ligne: Number(ex.reponse.slice(1)) - 1 };
        expect(ex.question).toContain(leNom(objetEn(g, c)!));
      } else {
        const nom = /case ([A-H]\d)/.exec(ex.question)![1];
        const c = { colonne: nom.charCodeAt(0) - 65, ligne: Number(nom.slice(1)) - 1 };
        expect(ex.reponse.toLowerCase()).toBe(leNom(objetEn(g, c)!));
      }
    }
  });
});

describe('la dictée de phrases', () => {
  it('a des pièges dont le mot est dans la phrase une seule fois, et des phrases à chaque degré', () => {
    for (const p of PHRASES_DICTEE) {
      expect(p.phrase).toMatch(/^\p{Lu}.*\.$/u);
      expect(p.pieges.length).toBeGreaterThanOrEqual(2);
      for (const x of p.pieges) {
        expect(occurrences(p.phrase, x.mot)).toBe(1);
        expect(x.faute).not.toBe(x.mot);
        expect(phraseFautive(p.phrase, x)).not.toBe(p.phrase);
      }
    }
    for (const degre of [1, 2, 3, 4, 5])
      expect(PHRASES_DICTEE.filter((p) => p.degre === degre).length).toBeGreaterThanOrEqual(8);
    expect(new Set(PHRASES_DICTEE.map((p) => p.phrase)).size).toBe(PHRASES_DICTEE.length);
  });

  it('accepte la phrase sans la majuscule ni le point, pas sans les accords', () => {
    expect(phraseJuste('les chats dorment', 'Les chats dorment.')).toBe(true);
    expect(phraseJuste('Ce matin Lou a mangé une pomme', 'Ce matin, Lou a mangé une pomme.')).toBe(true);
    expect(phraseJuste('Les chat dorment.', 'Les chats dorment.')).toBe(false);
  });

  it('montre le mot à revoir avec la règle, sans écrire le bon mot', () => {
    expect(conseilPhrase('Les chat dorment.', 'Les chats dorment.')).toBe('Relis « chat » : Il y en a plusieurs ?');
    expect(conseilPhrase('Lou à un vélo.', 'Lou a un vélo.')).toMatch(/« à ».*avait/);
    expect(conseilPhrase('Les chats', 'Les chats dorment.')).toMatch(/Il manque un mot/);
    expect(conseilPhrase('Les chatts dorment.', 'Les chats dorment.')).toBe(
      'Relis « chatts » : Il y a une lettre en trop.',
    );
  });

  it('va du degré 1 au CE1 jusqu’au degré 5 au CM', () => {
    const degres = (classe: 'CE1' | 'CM2', niveau: 1 | 2 | 3) =>
      Array.from(
        { length: 200 },
        (_, g) =>
          PHRASES_DICTEE.find(
            (p) => p.phrase === modeleTexteParId('dictee-phrase')!.generer(classe, g, { niveau }).reponse,
          )!.degre,
      );
    expect(Math.max(...degres('CE1', 1))).toBe(1);
    expect(Math.max(...degres('CM2', 3))).toBe(5);
  });
});

describe('les mots importants des consignes', () => {
  it('trouve les mots entiers, les expressions longues d’abord', () => {
    expect(motsCles('Quel fruit est le plus grand ?')).toEqual(['le plus grand']);
    expect(motsCles('Combien en tout ?')).toEqual(['Combien', 'en tout']);
    expect(motsCles('Il passe le pont.')).toEqual([]);
    expect(motsCles('Qui ne mange pas ?')).toEqual(['pas']);
    expect(plagesMotsCles('Touche la bonne réponse.')).toEqual([{ debut: 0, fin: 6 }]);
  });

  it('fait relire la question après une erreur, seulement quand elle a des mots importants', () => {
    expect(relireLaQuestion('Combien de billes en tout ?')).toBe(
      'Relis bien la question. Le mot « en tout » est important.',
    );
    expect(relireLaQuestion('Combien de billes a-t-il ?')).toBeNull();
    const aide = aideApresErreur(1, {
      indice: 'Ajoute.',
      explication: '',
      peutReduire: false,
      question: 'Combien en tout ?',
    });
    expect(aide.indice).toBe('Relis bien la question. Le mot « en tout » est important. Ajoute.');
    expect(aideApresErreur(1, { indice: 'Ajoute.', explication: '', peutReduire: false }).indice).toBe('Ajoute.');
  });
});
