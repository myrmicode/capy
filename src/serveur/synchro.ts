// Synchronisation des profils avec le compte parent (facultatif).
// L'appareil reste la référence : sans compte ou sans réseau, rien ne change.
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { lireReglages } from '@/accessibilite/reglages';
import { TOUS_LES_OBJETS, type ObjetId } from '@/collection/objets';
import { CLASSES } from '@/config/classes';
import type { DomaineId } from '@/config/domaines';
import { JEUX, type JeuId } from '@/jeux/registre';
import { useCompte } from '@/store/compte';
import { useProfils } from '@/store/profils';
import { migrerToile } from '@/toile/niveaux';

import { planifierSynchro, type ProfilDistant } from './fusion';
import { supabase } from './supabase';

const TABLE = 'profils_enfants';
const IDS_OBJETS = TOUS_LES_OBJETS.map((o) => o.id) as [ObjetId, ...ObjetId[]];

/** Une ligne de la table, telle que renvoyée par le serveur. */
const Ligne = z.object({
  id: z.string(),
  prenom: z.string(),
  classe: z.enum(CLASSES),
  progression: z.object({
    etapes: z.record(z.string(), z.object({ etoiles: z.number(), fois: z.number() })),
    coffresOuverts: z.array(z.string()),
    jours: z.array(z.string()),
    tempsParJour: z.record(z.string(), z.number()),
    entrainement: z.record(z.string(), z.object({ etoiles: z.number(), series: z.number() })).optional(),
    defis: z.record(z.string(), z.number()).optional(),
    histoires: z.record(z.string(), z.number()).optional(),
    tenue: z
      .object({
        tete: z.enum(IDS_OBJETS).optional(),
        yeux: z.enum(IDS_OBJETS).optional(),
        cou: z.enum(IDS_OBJETS).optional(),
      })
      .optional(),
    aRevoir: z
      .record(
        z.string(),
        z.object({
          modeleId: z.string(),
          jeu: z.enum(Object.keys(JEUX) as [JeuId, ...JeuId[]]),
          domaine: z.string() as z.ZodType<DomaineId>,
          niveau: z.union([z.literal(1), z.literal(2), z.literal(3)]),
          revoirLe: z.string(),
          palier: z.number(),
        }),
      )
      .optional(),
    vitesse: z.record(z.string(), z.array(z.object({ jour: z.string(), secondes: z.number() }))).optional(),
    chronos: z
      .record(
        z.string(),
        z.object({
          record: z.number(),
          series: z.number(),
          derniers: z.array(z.object({ jour: z.string(), justes: z.number() })),
        }),
      )
      .optional(),
    lectures: z
      .record(z.string(), z.array(z.object({ jour: z.string(), motsParMinute: z.number(), erreurs: z.number() })))
      .optional(),
  }),
  // Vérifiée et remise au format actuel par migrerToile (anciennes toiles comprises).
  toile: z.unknown().nullable(),
  // Relus champ par champ par lireReglages : aucune autre donnée ne peut s'y glisser.
  reglages: z.unknown().nullable().optional(),
  modifie_le: z.string(),
});

function versProfil(ligne: z.infer<typeof Ligne>): ProfilDistant {
  return {
    id: ligne.id,
    prenom: ligne.prenom,
    classe: ligne.classe,
    progression: ligne.progression,
    toile: migrerToile(ligne.toile, ligne.classe),
    reglages: lireReglages(ligne.reglages),
    modifieLe: new Date(ligne.modifie_le).toISOString(),
  };
}

function versLigne(p: ProfilDistant) {
  return {
    id: p.id,
    prenom: p.prenom,
    classe: p.classe,
    progression: p.progression,
    toile: p.toile ?? null,
    reglages: lireReglages(p.reglages),
    modifie_le: p.modifieLe,
  };
}

export type ResultatSynchro = { ok: true } | { ok: false; raison: 'indisponible' | 'non_connecte' | 'reseau' };

let enCours: Promise<ResultatSynchro> | null = null;
let enApplication = false;

/** Vrai pendant que la synchronisation met à jour les profils de l'appareil. */
export function appliqueUneSynchro(): boolean {
  return enApplication;
}

/** Synchronise maintenant ; un seul appel à la fois. */
export function synchroniser(client: SupabaseClient | null = supabase()): Promise<ResultatSynchro> {
  enCours ??= executer(client).finally(() => {
    enCours = null;
  });
  return enCours;
}

async function executer(client: SupabaseClient | null): Promise<ResultatSynchro> {
  if (!client) return { ok: false, raison: 'indisponible' };
  const { data: session } = await client.auth.getSession();
  if (!session.session) return { ok: false, raison: 'non_connecte' };

  useCompte.getState().majSynchro('en_cours');
  try {
    const { data, error } = await client
      .from(TABLE)
      .select('id, prenom, classe, progression, toile, reglages, modifie_le');
    if (error || !data) throw new Error('lecture');
    // Une ligne illisible est ignorée plutôt que de casser la synchronisation.
    const distants = data.flatMap((ligne) => {
      const lue = Ligne.safeParse(ligne);
      return lue.success ? [versProfil(lue.data)] : [];
    });

    const avant = useProfils.getState();
    const plan = planifierSynchro(avant.profils, distants, avant.suppressionsEnAttente, new Date().toISOString());

    if (plan.aEnvoyer.length > 0) {
      const { error: erreurEnvoi } = await client.from(TABLE).upsert(plan.aEnvoyer.map(versLigne));
      if (erreurEnvoi) throw new Error('envoi');
    }
    if (plan.aEffacer.length > 0) {
      const { error: erreurEffacement } = await client.from(TABLE).delete().in('id', plan.aEffacer);
      if (erreurEffacement) throw new Error('effacement');
    }

    // Si l'enfant a joué pendant la synchronisation, on recommencera : rien n'est écrasé.
    const apres = useProfils.getState();
    if (apres.profils === avant.profils) {
      enApplication = true;
      try {
        apres.appliquerSynchro(plan.locaux, avant.suppressionsEnAttente);
      } finally {
        enApplication = false;
      }
    } else {
      setTimeout(() => void synchroniser(client), 0);
    }
    useCompte.getState().majSynchro('ok', new Date().toISOString());
    return { ok: true };
  } catch {
    useCompte.getState().majSynchro('erreur');
    return { ok: false, raison: 'reseau' };
  }
}
