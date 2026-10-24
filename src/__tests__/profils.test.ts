import { useProfils } from '@/store/profils';

beforeEach(() => {
  useProfils.setState({ profils: [], profilActifId: null });
});

describe('profils enfants', () => {
  it('gère plusieurs enfants dans une famille', () => {
    const { ajouterProfil } = useProfils.getState();
    const lou = ajouterProfil('Lou', 'CE2');
    const tim = ajouterProfil('Tim', 'CP');
    expect(useProfils.getState().profils).toEqual([lou, tim]);
    expect(lou.id).not.toBe(tim.id);
  });

  it('ne stocke que le prénom, la classe et la progression (plus la date de modification)', () => {
    const profil = useProfils.getState().ajouterProfil('Lou', 'CE2');
    expect(Object.keys(profil).sort()).toEqual(['classe', 'id', 'modifieLe', 'prenom', 'progression']);
    expect(Object.keys(profil.progression).sort()).toEqual(['coffresOuverts', 'etapes', 'jours', 'tempsParJour']);
  });

  it('enregistre une étape et un coffre pour le bon enfant seulement', () => {
    const { ajouterProfil, enregistrerEtape, ouvrirCoffre } = useProfils.getState();
    const lou = ajouterProfil('Lou', 'CE2');
    const tim = ajouterProfil('Tim', 'CE2');
    const resultat = { domaine: 'resoudre-problemes' as const, reussiesPremierCoup: 5, nombreQuestions: 5, dureeSecondes: 90 };
    enregistrerEtape(lou.id, 'ce2-rp-1', resultat, new Date(2026, 9, 24));
    ouvrirCoffre(lou.id, 'ce2-rp-u1-coffre');
    const [l, t] = useProfils.getState().profils;
    expect(l.progression.etapes['ce2-rp-1']).toEqual({ etoiles: 3, fois: 1 });
    expect(l.progression.jours).toEqual(['2026-10-24']);
    expect(l.progression.coffresOuverts).toEqual(['ce2-rp-u1-coffre']);
    expect(t.progression).toEqual(tim.progression);
  });

  it('fait évoluer la toile du jour après une étape, sans toucher à celle de septembre', () => {
    const { ajouterProfil, enregistrerToile, enregistrerEtape } = useProfils.getState();
    const lou = ajouterProfil('Lou', 'CE2');
    enregistrerToile(lou.id, 'mathematiques', { 'resoudre-problemes': 0.33, denombrer: 1 }, new Date(2026, 8, 20));
    const resultat = { domaine: 'resoudre-problemes' as const, reussiesPremierCoup: 5, nombreQuestions: 5, dureeSecondes: 60 };
    enregistrerEtape(lou.id, 'ce2-rp-1', resultat);
    const toile = useProfils.getState().profils[0].toile!;
    expect(toile.saisieLe).toEqual({ mathematiques: '2026-09-20' });
    expect(toile.septembre['resoudre-problemes']).toBe(0.33);
    expect(toile.actuelle['resoudre-problemes']).toBe(0.46);
    expect(toile.actuelle.denombrer).toBe(1);
  });

  it('ajoute une progression vide aux profils enregistrés avant la phase 4', async () => {
    const migrer = useProfils.persist.getOptions().migrate!;
    const ancien = { profils: [{ id: 'a', prenom: 'Lou', classe: 'CE2' }], profilActifId: 'a' };
    const migre = (await migrer(ancien, 1)) as { profils: { progression: unknown }[] };
    expect(migre.profils[0].progression).toEqual({ etapes: {}, coffresOuverts: [], jours: [], tempsParJour: {} });
  });

  it('ajoute une date de modification aux profils enregistrés avant la phase 7, sans rien perdre', async () => {
    const migrer = useProfils.persist.getOptions().migrate!;
    // Toile au format d'avant les deux matières : « nombres » n'est plus un axe de CE2.
    const toile = {
      septembre: { nombres: 0.4, 'resoudre-problemes': 0.3 },
      actuelle: { nombres: 0.5, 'resoudre-problemes': 0.4 },
      saisieLe: '2026-09-20',
    };
    const progression = { etapes: { 'ce2-rp-1': { etoiles: 2, fois: 1 } }, coffresOuverts: [], jours: ['2026-10-24'], tempsParJour: {} };
    const ancien = { profils: [{ id: 'a', prenom: 'Lou', classe: 'CE2', progression, toile }], profilActifId: 'a' };
    const migre = (await migrer(ancien, 2)) as { profils: Record<string, unknown>[]; suppressionsEnAttente: string[] };
    expect(migre.profils[0]).toMatchObject({
      id: 'a',
      prenom: 'Lou',
      progression,
      toile: {
        septembre: { 'resoudre-problemes': 0.3 },
        actuelle: { 'resoudre-problemes': 0.4 },
        saisieLe: { mathematiques: '2026-09-20' },
      },
    });
    expect(typeof migre.profils[0].modifieLe).toBe('string');
    expect(migre.suppressionsEnAttente).toEqual([]);
  });

  it('retient la suppression d’un profil déjà synchronisé, pour l’effacer aussi du serveur', () => {
    const { ajouterProfil, supprimerProfil, appliquerSynchro } = useProfils.getState();
    const lou = ajouterProfil('Lou', 'CE2');
    const tim = ajouterProfil('Tim', 'CP');
    appliquerSynchro([{ ...lou, synchroniseLe: '2026-10-24T10:00:00.000Z' }, tim], []);
    supprimerProfil(lou.id);
    supprimerProfil(tim.id);
    expect(useProfils.getState().suppressionsEnAttente).toEqual([lou.id]);
    appliquerSynchro([], [lou.id]);
    expect(useProfils.getState().suppressionsEnAttente).toEqual([]);
  });

  it('choisit, modifie et supprime un profil', () => {
    const { ajouterProfil, choisirProfil, modifierProfil, supprimerProfil } = useProfils.getState();
    const lou = ajouterProfil('Lou', 'CE2');
    const tim = ajouterProfil('Tim', 'CP');
    choisirProfil(lou.id);
    modifierProfil(lou.id, { classe: 'CM1' });
    expect(useProfils.getState().profils[0].classe).toBe('CM1');

    supprimerProfil(lou.id);
    const etat = useProfils.getState();
    expect(etat.profils).toEqual([tim]);
    expect(etat.profilActifId).toBeNull();
  });

  it('garde le profil actif quand on supprime un autre enfant', () => {
    const { ajouterProfil, choisirProfil, supprimerProfil } = useProfils.getState();
    const lou = ajouterProfil('Lou', 'CE2');
    const tim = ajouterProfil('Tim', 'CP');
    choisirProfil(lou.id);
    supprimerProfil(tim.id);
    expect(useProfils.getState().profilActifId).toBe(lou.id);
  });
});
