import { aideApresErreur } from '../aide';
import { derouler, etatInitial } from '../deroulement';
import { genererEtape } from '../etape';
import { fusionnerRevisions, noterRevisions, REVISIONS_MAX, revisionsDues, type QuestionRevisee } from '../revision';

const Q: QuestionRevisee = {
  modeleId: 'ajout',
  jeu: 'reponses',
  domaine: 'resoudre-problemes',
  niveau: 2,
  rate: true,
  revision: false,
};

describe('aide progressive après une erreur', () => {
  const textes = { indice: 'Relis la règle.', explication: '4 × 6 = 24.' };

  it('donne d’abord un indice seulement', () => {
    expect(aideApresErreur(1, { ...textes, peutReduire: true })).toEqual({
      indice: 'Relis la règle.',
      choixReduits: false,
    });
  });

  it('enlève ensuite des réponses, puis montre la méthode', () => {
    expect(aideApresErreur(2, { ...textes, peutReduire: true }).choixReduits).toBe(true);
    expect(aideApresErreur(3, { ...textes, peutReduire: true }).methode).toBe('4 × 6 = 24.');
  });

  it('montre la méthode dès le deuxième essai quand le jeu ne peut pas enlever de réponses', () => {
    expect(aideApresErreur(2, { ...textes, peutReduire: false })).toEqual({
      indice: 'Relis la règle.',
      choixReduits: false,
      methode: '4 × 6 = 24.',
    });
  });
});

describe('questions à revoir dans une étape', () => {
  it('retient une seule fois une question ratée plusieurs fois', () => {
    let etat = etatInitial(2);
    etat = derouler(etat, { type: 'repondre', juste: true });
    etat = derouler(etat, { type: 'continuer' });
    etat = derouler(etat, { type: 'repondre', juste: false });
    etat = derouler(etat, { type: 'reessayer' });
    etat = derouler(etat, { type: 'repondre', juste: false });
    expect(etat.aRevoir).toEqual([1]);
  });
});

describe('révisions espacées', () => {
  it('fait revenir une question ratée le lendemain', () => {
    const r = noterRevisions(undefined, [Q], '2026-10-25');
    expect(Object.values(r)).toEqual([
      expect.objectContaining({ modeleId: 'ajout', revoirLe: '2026-10-26', palier: 0 }),
    ]);
    expect(revisionsDues(r, 'resoudre-problemes', '2026-10-25')).toEqual([]);
    expect(revisionsDues(r, 'resoudre-problemes', '2026-10-26')).toHaveLength(1);
    expect(revisionsDues(r, 'calcul-mental', '2026-10-26')).toEqual([]);
  });

  it('espace les révisions réussies (3 jours, puis 7), puis les oublie', () => {
    let r = noterRevisions(undefined, [Q], '2026-10-25');
    const reussie = { ...Q, rate: false, revision: true };
    r = noterRevisions(r, [reussie], '2026-10-26');
    expect(Object.values(r)[0]).toMatchObject({ revoirLe: '2026-10-29', palier: 1 });
    r = noterRevisions(r, [reussie], '2026-10-29');
    expect(Object.values(r)[0]).toMatchObject({ revoirLe: '2026-11-05', palier: 2 });
    r = noterRevisions(r, [reussie], '2026-11-05');
    expect(r).toEqual({});
  });

  it('repart du début quand la révision demande encore plusieurs essais', () => {
    let r = noterRevisions(undefined, [Q], '2026-10-25');
    r = noterRevisions(r, [{ ...Q, rate: false, revision: true }], '2026-10-26');
    r = noterRevisions(r, [{ ...Q, revision: true }], '2026-10-29');
    expect(Object.values(r)[0]).toMatchObject({ revoirLe: '2026-10-30', palier: 0 });
  });

  it('ne garde pas plus de révisions que la limite, en oubliant les plus anciennes', () => {
    const questions = Array.from({ length: REVISIONS_MAX + 5 }, (_, i) => ({ ...Q, modeleId: `m${i}` }));
    const r = noterRevisions(undefined, questions, '2026-10-25');
    expect(Object.keys(r)).toHaveLength(REVISIONS_MAX);
    expect(Object.values(r).some((x) => x.modeleId === 'm0')).toBe(false);
  });

  it('réunit deux appareils en gardant la révision la plus proche', () => {
    const a = noterRevisions(undefined, [Q], '2026-10-25');
    const b = noterRevisions(undefined, [Q], '2026-10-20');
    expect(Object.values(fusionnerRevisions(a, b))[0].revoirLe).toBe('2026-10-21');
  });
});

describe('étape avec un petit rappel', () => {
  const BASE = {
    classe: 'CE2',
    domaine: 'resoudre-problemes',
    jeux: ['marche', 'bonFil', 'reponses'],
    graine: 7,
  } as const;

  it('pose la révision en premier, avec un nouvel exercice du même modèle', () => {
    const etape = genererEtape({ ...BASE, revision: { modeleId: 'retrait', jeu: 'reponses', niveau: 2 } });
    expect(etape[0]).toMatchObject({ jeu: 'reponses', revision: true });
    expect(etape[0].exercice.modeleId).toBe('retrait');
    expect(etape).toHaveLength(5);
    expect(etape.slice(1).every((q) => !q.revision)).toBe(true);
  });

  it('ignore une révision dont le modèle n’existe pas pour la classe', () => {
    const etape = genererEtape({ ...BASE, revision: { modeleId: 'inconnu', jeu: 'reponses', niveau: 2 } });
    expect(etape.some((q) => q.revision)).toBe(false);
  });
});
