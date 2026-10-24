import { domainesDe } from '@/config/domaines';

import { analyserPhoto, interpreterReponse, SEUIL_CONFIANCE } from '../analyse';
import { cadreDansLaVue, cadreVersPhoto } from '../cadrage';

const domaines = domainesDe('CE2', 'mathematiques');
const complet = (confiance: number) => ({
  domaines: domaines.map((d, i) => ({ id: d.id, niveau: [0.3, 0.7, 0.95][i % 3] })),
  confiance,
});
const APPAREIL = 'abcd1234-efgh5678-ijkl9012';
const config = { url: 'https://exemple.supabase.co/', clePublique: 'sb_publishable_test' };

describe('interprétation de la réponse', () => {
  it('accepte une lecture complète et sûre, ramenée aux symboles + / ++ / +++', () => {
    const r = interpreterReponse(complet(0.9), domaines);
    expect(r).toMatchObject({ ok: true, confiance: 0.9 });
    if (r.ok) {
      const [premier, deuxieme, troisieme] = domaines;
      expect(r.niveaux[premier.id]).toBe(0.33);
      expect(r.niveaux[deuxieme.id]).toBe(0.67);
      expect(r.niveaux[troisieme.id]).toBe(1);
    }
  });

  it('bascule sur la saisie à la main si la confiance est basse', () => {
    expect(interpreterReponse(complet(SEUIL_CONFIANCE - 0.01), domaines)).toEqual({ ok: false, raison: 'peu_sur' });
  });

  it('refuse un JSON invalide ou incomplet', () => {
    expect(interpreterReponse({ confiance: 0.9 }, domaines)).toEqual({ ok: false, raison: 'illisible' });
    expect(interpreterReponse('du texte', domaines)).toEqual({ ok: false, raison: 'illisible' });
    const manque = complet(0.9);
    manque.domaines.pop();
    expect(interpreterReponse(manque, domaines)).toEqual({ ok: false, raison: 'illisible' });
    const horsBornes = complet(0.9);
    horsBornes.domaines[0].niveau = 1.5;
    expect(interpreterReponse(horsBornes, domaines)).toEqual({ ok: false, raison: 'illisible' });
  });

  it('ignore un domaine inconnu', () => {
    const r = interpreterReponse({ ...complet(0.9), domaines: [...complet(0.9).domaines, { id: 'nom-ecole', niveau: 1 }] }, domaines);
    expect(r.ok && Object.keys(r.niveaux)).toHaveLength(domaines.length);
  });
});

describe('appel au serveur', () => {
  it('n’envoie que l’image recadrée et les domaines, avec la clé publique', async () => {
    const envoyer = jest.fn(async () => new Response(JSON.stringify(complet(0.8)), { status: 200 }));
    const r = await analyserPhoto('QUJD', domaines, 'mathematiques', APPAREIL, config, envoyer as unknown as typeof fetch);
    expect(r.ok).toBe(true);
    const [url, options] = envoyer.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://exemple.supabase.co/functions/v1/analyser-toile');
    expect((options.headers as Record<string, string>).apikey).toBe('sb_publishable_test');
    expect((options.headers as Record<string, string>)['x-capy-appareil']).toBe(APPAREIL);
    const corps = JSON.parse(options.body as string);
    expect(Object.keys(corps).sort()).toEqual(['domaines', 'image', 'matiere', 'typeImage']);
    expect(corps.matiere).toBe('mathematiques');
    expect(corps.domaines[0]).toEqual({ id: domaines[0].id, libelle: domaines[0].libelle });
  });

  it('se rabat sur la saisie à la main sans configuration, sans réseau ou en cas d’erreur', async () => {
    expect(await analyserPhoto('QUJD', domaines, 'mathematiques', APPAREIL, null)).toEqual({ ok: false, raison: 'indisponible' });
    const enPanne = jest.fn(async () => {
      throw new Error('hors ligne');
    });
    expect(await analyserPhoto('QUJD', domaines, 'mathematiques', APPAREIL, config, enPanne as unknown as typeof fetch)).toEqual({ ok: false, raison: 'reseau' });
    const limite = jest.fn(async () => new Response('{}', { status: 429 }));
    expect(await analyserPhoto('QUJD', domaines, 'mathematiques', APPAREIL, config, limite as unknown as typeof fetch)).toEqual({ ok: false, raison: 'quota' });
    const erreur = jest.fn(async () => new Response('{}', { status: 502 }));
    expect(await analyserPhoto('QUJD', domaines, 'mathematiques', APPAREIL, config, erreur as unknown as typeof fetch)).toEqual({ ok: false, raison: 'serveur' });
  });
});

describe('cadrage', () => {
  it('place un carré centré dans la vue', () => {
    expect(cadreDansLaVue({ largeur: 400, hauteur: 700 })).toEqual({ x: 24, y: 174, largeur: 352, hauteur: 352 });
  });

  it('retrouve la zone du cadre dans une photo plus grande que la vue', () => {
    // Vue 400 × 800, photo 3000 × 4000 : agrandissement 0,2, 100 px rognés de chaque côté en largeur.
    const vue = { largeur: 400, hauteur: 800 };
    const cadre = cadreDansLaVue(vue);
    const zone = cadreVersPhoto(vue, { largeur: 3000, hauteur: 4000 }, cadre);
    expect(zone).toEqual({ x: 620, y: 1120, largeur: 1760, hauteur: 1760 });
  });

  it('ne sort jamais de la photo', () => {
    const zone = cadreVersPhoto({ largeur: 400, hauteur: 400 }, { largeur: 1000, hauteur: 800 }, { x: -50, y: -50, largeur: 600, hauteur: 600 });
    expect(zone.x).toBeGreaterThanOrEqual(0);
    expect(zone.y).toBeGreaterThanOrEqual(0);
    expect(zone.x + zone.largeur).toBeLessThanOrEqual(1000);
    expect(zone.y + zone.hauteur).toBeLessThanOrEqual(800);
  });
});
