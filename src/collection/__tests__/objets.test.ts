import { CARNET, pagesDuCarnet } from '@/contenu/carnet';
import { THEMES } from '@/config/parcours';
import { enregistrerEtape, ouvrirCoffre, progressionVide, type ProgressionEnfant } from '@/parcours/progression';

import {
  DEFIS_PAR_OBJET,
  DEFIS_PAR_OBJET_SAISON,
  nombreDeTresors,
  nouvelObjet,
  OBJETS,
  objetsGagnes,
  tenueValide,
  TOUS_LES_OBJETS,
} from '../objets';

const avecCoffres = (n: number): ProgressionEnfant =>
  Array.from({ length: n }, (_, i) => `c${i}`).reduce(ouvrirCoffre, progressionVide());

describe('trésors de Capy', () => {
  it('donne un objet par coffre ouvert, dans l’ordre', () => {
    expect(objetsGagnes(progressionVide())).toEqual([]);
    expect(objetsGagnes(avecCoffres(2)).map((o) => o.id)).toEqual(['echarpe', 'chapeauPaille']);
    expect(objetsGagnes(avecCoffres(50))).toHaveLength(OBJETS.length);
  });

  it(`donne aussi un objet tous les ${DEFIS_PAR_OBJET} défis du jour`, () => {
    const defis = Object.fromEntries(Array.from({ length: DEFIS_PAR_OBJET }, (_, i) => [`2026-10-0${i + 1}`, 2]));
    expect(nombreDeTresors({ ...progressionVide(), defis })).toBe(1);
  });

  it('annonce l’objet trouvé dans un coffre, et rien quand tout est gagné', () => {
    expect(nouvelObjet(avecCoffres(0), avecCoffres(1))?.id).toBe('echarpe');
    expect(nouvelObjet(avecCoffres(1), avecCoffres(1))).toBeNull();
    expect(nouvelObjet(avecCoffres(OBJETS.length), avecCoffres(OBJETS.length + 1))).toBeNull();
  });

  it('ne fait porter que des objets gagnés, chacun à sa place', () => {
    const p = avecCoffres(2);
    expect(tenueValide({ cou: 'echarpe', tete: 'chapeauPaille' }, p)).toEqual({
      cou: 'echarpe',
      tete: 'chapeauPaille',
    });
    expect(tenueValide({ yeux: 'lunettesRondes' }, p)).toEqual({});
    expect(tenueValide({ tete: 'echarpe' }, p)).toEqual({});
  });

  it('a des objets aux noms uniques', () => {
    expect(new Set(TOUS_LES_OBJETS.map((o) => o.id)).size).toBe(TOUS_LES_OBJETS.length);
  });

  it(`donne le trésor d’une saison après ${DEFIS_PAR_OBJET_SAISON} défis réussis pendant cette saison`, () => {
    // Deux défis en hiver, puis un troisième : les cache-oreilles.
    const hiver = { ...progressionVide(), defis: { '2026-12-03': 3, '2027-01-10': 2 } };
    const apres = { ...hiver, defis: { ...hiver.defis, '2027-02-01': 1 } };
    expect(objetsGagnes(hiver).some((o) => o.saison)).toBe(false);
    expect(nouvelObjet(hiver, apres)?.id).toBe('cacheOreilles');
    // Un défi raté (0 étoile) ne compte pas, ni un défi d'une autre saison.
    const autre = { ...hiver, defis: { ...hiver.defis, '2027-01-11': 0, '2027-03-15': 3 } };
    expect(nouvelObjet(hiver, autre)).toBeNull();
    expect(tenueValide({ tete: 'cacheOreilles' }, apres)).toEqual({ tete: 'cacheOreilles' });
    expect(tenueValide({ tete: 'cacheOreilles' }, hiver)).toEqual({});
  });
});

describe('carnet de Capy', () => {
  it('a une page pour chaque thème, dans toutes les classes', () => {
    for (const t of THEMES) expect(CARNET[t.domaine]).toBeDefined();
  });

  it('ajoute une page dès la première étape finie du thème', () => {
    const theme = THEMES.find((t) => t.classe === 'CE2')!;
    const etape = theme.unites[0].etapes[0].id;
    expect(pagesDuCarnet('CE2', progressionVide()).every((e) => !e.decouverte)).toBe(true);
    const p = enregistrerEtape(progressionVide(), etape, 3, 5, 60, new Date(2026, 9, 25));
    const pages = pagesDuCarnet('CE2', p);
    expect(pages.filter((e) => e.decouverte).map((e) => e.theme.id)).toEqual([theme.id]);
  });

  it('reste bienveillant et court', () => {
    for (const page of Object.values(CARNET)) {
      const textes = [page!.titre, page!.regle, page!.astuce, ...page!.exemples];
      for (const t of textes) expect(t).not.toMatch(/faux|note|score/i);
      expect(page!.regle.length).toBeLessThan(260);
      expect(page!.exemples.length).toBeGreaterThan(0);
    }
  });
});
