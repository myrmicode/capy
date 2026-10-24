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

  it('ne stocke que le prénom et la classe', () => {
    const profil = useProfils.getState().ajouterProfil('Lou', 'CE2');
    expect(Object.keys(profil).sort()).toEqual(['classe', 'id', 'prenom']);
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
