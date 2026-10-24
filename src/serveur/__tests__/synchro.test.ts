import type { SupabaseClient } from '@supabase/supabase-js';

import { REGLAGES_PAR_DEFAUT } from '@/accessibilite/reglages';
import { progressionVide } from '@/parcours/progression';
import { useProfils } from '@/store/profils';

import { synchroniser } from '../synchro';

interface Ligne {
  id: string;
  prenom: string;
  classe: string;
  progression: ReturnType<typeof progressionVide>;
  toile: null;
  reglages?: unknown;
  modifie_le: string;
}

/** Faux serveur Supabase : une table en mémoire, et le relevé des appels. */
function fauxServeur(lignes: Ligne[], connecte = true) {
  const table = new Map(lignes.map((l) => [l.id, l]));
  const appels = { envois: [] as Ligne[][], effacements: [] as string[][] };
  const client = {
    auth: { getSession: async () => ({ data: { session: connecte ? { user: { email: 'parent@exemple.fr' } } : null } }) },
    from: () => ({
      select: async () => ({ data: [...table.values()], error: null }),
      upsert: async (envoi: Ligne[]) => {
        appels.envois.push(envoi);
        envoi.forEach((l) => table.set(l.id, l));
        return { error: null };
      },
      delete: () => ({
        in: async (_colonne: string, ids: string[]) => {
          appels.effacements.push(ids);
          ids.forEach((id) => table.delete(id));
          return { error: null };
        },
      }),
    }),
  };
  return { client: client as unknown as SupabaseClient, table, appels };
}

const ligne = (id: string, prenom: string): Ligne => ({
  id,
  prenom,
  classe: 'CE2',
  progression: progressionVide(),
  toile: null,
  modifie_le: '2026-10-20T10:00:00.000Z',
});

beforeEach(() => {
  useProfils.setState({ profils: [], profilActifId: null, suppressionsEnAttente: [] });
});

it('ne fait rien sans compte connecté', async () => {
  const { client, appels } = fauxServeur([], false);
  useProfils.getState().ajouterProfil('Lou', 'CE2');
  expect(await synchroniser(client)).toEqual({ ok: false, raison: 'non_connecte' });
  expect(appels.envois).toHaveLength(0);
});

it('envoie les profils de l’appareil et récupère ceux d’un autre appareil', async () => {
  const { client, table } = fauxServeur([ligne('tablette', 'Tim')]);
  const lou = useProfils.getState().ajouterProfil('Lou', 'CE2');
  expect(await synchroniser(client)).toEqual({ ok: true });

  expect(table.get(lou.id)).toMatchObject({ prenom: 'Lou', classe: 'CE2', toile: null });
  // Seules les colonnes prévues partent au serveur.
  expect(Object.keys(table.get(lou.id)!).sort()).toEqual(['classe', 'id', 'modifie_le', 'prenom', 'progression', 'reglages', 'toile']);
  // Les réglages ne contiennent que des réglages d'affichage et de jeu, jamais leur raison.
  expect(Object.keys(table.get(lou.id)!.reglages as object).sort()).toEqual(Object.keys(REGLAGES_PAR_DEFAUT).sort());
  const profils = useProfils.getState().profils;
  expect(profils.map((p) => p.prenom).sort()).toEqual(['Lou', 'Tim']);
  expect(profils.every((p) => p.synchroniseLe)).toBe(true);
});

it('efface du serveur un profil supprimé sur l’appareil', async () => {
  const { client, table, appels } = fauxServeur([]);
  const lou = useProfils.getState().ajouterProfil('Lou', 'CE2');
  await synchroniser(client);
  useProfils.getState().supprimerProfil(lou.id);
  await synchroniser(client);
  expect(appels.effacements).toEqual([[lou.id]]);
  expect(table.has(lou.id)).toBe(false);
  expect(useProfils.getState().suppressionsEnAttente).toEqual([]);
});

it('n’envoie rien quand tout est déjà à jour', async () => {
  const { client, appels } = fauxServeur([]);
  useProfils.getState().ajouterProfil('Lou', 'CE2');
  await synchroniser(client);
  await synchroniser(client);
  expect(appels.envois).toHaveLength(1);
});
