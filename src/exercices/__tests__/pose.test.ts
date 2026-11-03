import { MODELES } from '../modeles';
import { grillePose, ligneRemplie, nomColonne, poseDonnee, problemePose, verifierLigne } from '../pose';

const cases = (texte: string) => [...texte].map((c) => (c === ' ' ? '' : c));

describe('poser une opération en colonnes', () => {
  it('aligne les nombres sur la droite, avec une colonne par chiffre', () => {
    const g = grillePose('+', 347, 285);
    expect(g.colonnes).toBe(3);
    expect(g.resultat).toEqual({ chiffres: '632', decalage: 0 });
    expect(grillePose('+', 999, 1).colonnes).toBe(4);
    expect(grillePose('−', 1000, 1).resultat.chiffres).toBe('999');
  });

  it('ajoute une ligne par chiffre du multiplicateur, avec les zéros de décalage', () => {
    const g = grillePose('×', 234, 56);
    expect(g.partiels).toEqual([
      { chiffres: '1404', decalage: 0 },
      { chiffres: '1170', decalage: 1 },
    ]);
    expect(g.resultat.chiffres).toBe('13104');
    expect(g.colonnes).toBe(5);
    expect(grillePose('×', 234, 6).partiels).toEqual([]);
  });

  it('vérifie case par case : les cases vides ou les zéros à gauche ne comptent pas', () => {
    const g = grillePose('+', 347, 285);
    expect(verifierLigne(cases('632'), g.resultat, 3)).toEqual([true, true, true]);
    expect(verifierLigne(cases('622'), g.resultat, 3)).toEqual([true, false, true]);
    const large = grillePose('+', 47, 25);
    expect(verifierLigne(cases(' 72'), large.resultat, 3)).toEqual([true, true, true]);
    expect(verifierLigne(cases('072'), large.resultat, 3)).toEqual([true, true, true]);
    expect(ligneRemplie(cases(' 7 '), large.resultat, 3)).toBe(false);
    // Ligne décalée : on ne saisit pas le zéro déjà écrit à droite.
    const m = grillePose('×', 234, 56);
    expect(verifierLigne(cases('1170'), m.partiels[1], 5)).toEqual([true, true, true, true]);
  });

  it('refuse ce qui ne se pose pas', () => {
    expect(problemePose('−', 12, 30)).toBe('soustraction-impossible');
    expect(problemePose('×', 12, 1234)).toBe('multiplicateur-trop-long');
    expect(problemePose('+', 9_999_999, 1)).toBe('trop-grand');
    expect(problemePose('+', 12, 30)).toBeNull();
  });

  it('nomme les colonnes pour le lecteur d’écran', () => {
    expect(nomColonne(4, 3)).toBe('unités');
    expect(nomColonne(4, 0)).toBe('unités de mille');
  });

  it('pose d’office les opérations de « Poser et calculer », jamais les problèmes', () => {
    for (const id of ['addition-posee', 'soustraction-posee', 'multiplication-posee']) {
      const m = MODELES.find((x) => x.id === id)!;
      for (const classe of m.classes) {
        for (let g = 0; g < 100; g++) {
          const ex = m.generer(classe, g, { niveau: ((g % 3) + 1) as 1 | 2 | 3 });
          const pose = poseDonnee(ex)!;
          expect(pose).not.toBeNull();
          expect(grillePose(pose.operation, pose.a, pose.b).resultat.chiffres).toBe(String(ex.reponse));
        }
      }
    }
    expect(poseDonnee(MODELES.find((x) => x.id === 'ajout')!.generer('CE2', 1))).toBeNull();
  });
});
