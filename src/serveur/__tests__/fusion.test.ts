import { progressionVide } from '@/parcours/progression';
import type { ProfilEnfant } from '@/store/profils';

import { fusionnerProgression, fusionnerProfil, planifierSynchro } from '../fusion';

const MAINTENANT = '2026-10-24T12:00:00.000Z';

function profil(id: string, modifs: Partial<ProfilEnfant> = {}): ProfilEnfant {
  return { id, prenom: 'Lou', classe: 'CE2', progression: progressionVide(), modifieLe: '2026-10-20T10:00:00.000Z', ...modifs };
}

describe('fusion de deux progressions', () => {
  it('garde le meilleur de chaque appareil, sans doubler le temps', () => {
    const a = {
      etapes: { e1: { etoiles: 3, fois: 1 }, e2: { etoiles: 1, fois: 2 } },
      coffresOuverts: ['c1'],
      jours: ['2026-10-20'],
      tempsParJour: { '2026-10-20': 300 },
    };
    const b = {
      etapes: { e2: { etoiles: 2, fois: 1 }, e3: { etoiles: 1, fois: 1 } },
      coffresOuverts: ['c1', 'c2'],
      jours: ['2026-10-21', '2026-10-20'],
      tempsParJour: { '2026-10-20': 300, '2026-10-21': 120 },
    };
    expect(fusionnerProgression(a, b)).toEqual({
      etapes: { e1: { etoiles: 3, fois: 1 }, e2: { etoiles: 2, fois: 2 }, e3: { etoiles: 1, fois: 1 } },
      coffresOuverts: ['c1', 'c2'],
      jours: ['2026-10-20', '2026-10-21'],
      tempsParJour: { '2026-10-20': 300, '2026-10-21': 120 },
      entrainement: {},
    });
  });
});

describe('fusion de deux profils', () => {
  it('prend le prénom, la classe et la toile de la modification la plus récente', () => {
    const local = profil('a', { prenom: 'Lou', modifieLe: '2026-10-22T10:00:00.000Z' });
    const distant = profil('a', { prenom: 'Louise', classe: 'CM1', modifieLe: '2026-10-23T10:00:00.000Z' });
    expect(fusionnerProfil(local, distant)).toMatchObject({ prenom: 'Louise', classe: 'CM1', modifieLe: distant.modifieLe });
    expect(fusionnerProfil({ ...local, modifieLe: '2026-10-24T10:00:00.000Z' }, distant).prenom).toBe('Lou');
  });
});

describe('plan de synchronisation', () => {
  it('envoie un nouveau profil local et récupère un profil créé ailleurs', () => {
    const plan = planifierSynchro([profil('ici')], [profil('ailleurs')], [], MAINTENANT);
    expect(plan.aEnvoyer.map((p) => p.id)).toEqual(['ici']);
    expect(plan.aEnvoyer[0]).not.toHaveProperty('synchroniseLe');
    expect(plan.locaux.map((p) => p.id).sort()).toEqual(['ailleurs', 'ici']);
    expect(plan.locaux.every((p) => p.synchroniseLe === MAINTENANT)).toBe(true);
  });

  it('n’envoie rien quand les deux côtés sont identiques', () => {
    const p = profil('a', { synchroniseLe: '2026-10-23T00:00:00.000Z' });
    const { synchroniseLe: _s, ...distant } = p;
    expect(planifierSynchro([p], [distant], [], MAINTENANT).aEnvoyer).toEqual([]);
  });

  it('renvoie au serveur un profil qui a avancé sur cet appareil', () => {
    const distant = profil('a');
    const local = profil('a', {
      synchroniseLe: '2026-10-21T00:00:00.000Z',
      modifieLe: '2026-10-22T00:00:00.000Z',
      progression: { ...progressionVide(), etapes: { e1: { etoiles: 3, fois: 1 } } },
    });
    const plan = planifierSynchro([local], [distant], [], MAINTENANT);
    expect(plan.aEnvoyer).toHaveLength(1);
    expect(plan.aEnvoyer[0].progression.etapes.e1).toEqual({ etoiles: 3, fois: 1 });
  });

  it('efface du serveur un profil supprimé sur cet appareil', () => {
    const plan = planifierSynchro([], [profil('a'), profil('b')], ['a'], MAINTENANT);
    expect(plan.aEffacer).toEqual(['a']);
    expect(plan.locaux.map((p) => p.id)).toEqual(['b']);
  });

  it('retire ici un profil supprimé depuis un autre appareil', () => {
    const dejaSynchronise = profil('a', { synchroniseLe: '2026-10-23T00:00:00.000Z' });
    const jamaisSynchronise = profil('b');
    const plan = planifierSynchro([dejaSynchronise, jamaisSynchronise], [], [], MAINTENANT);
    expect(plan.locaux.map((p) => p.id)).toEqual(['b']);
    expect(plan.aEnvoyer.map((p) => p.id)).toEqual(['b']);
  });
});
