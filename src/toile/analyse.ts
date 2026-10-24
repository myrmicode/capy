// Analyse de la toile par l'Edge Function Supabase « analyser-toile ».
// L'appli n'envoie que la zone recadrée de la toile et la liste des domaines ;
// elle ne reçoit que des niveaux. On ne fait jamais confiance aveuglément :
// le parent vérifie et corrige toujours avant de valider.
import { z } from 'zod';

import type { Domaine, DomaineId } from '@/config/domaines';

import { borner, type Niveaux } from './niveaux';

/** En dessous de cette confiance, on bascule sur la saisie à la main. */
export const SEUIL_CONFIANCE = 0.6;
const DELAI_MAX_MS = 60_000;

const ReponseAnalyse = z.object({
  domaines: z.array(z.object({ id: z.string(), niveau: z.number().min(0).max(1) })),
  confiance: z.number().min(0).max(1),
});

export type ResultatAnalyse =
  | { ok: true; niveaux: Niveaux; confiance: number }
  | { ok: false; raison: 'indisponible' | 'reseau' | 'serveur' | 'illisible' | 'peu_sur' };

/** Interprète la réponse du serveur : JSON validé, tous les domaines présents, confiance suffisante. */
export function interpreterReponse(donnees: unknown, domaines: readonly Domaine[]): ResultatAnalyse {
  const lu = ReponseAnalyse.safeParse(donnees);
  if (!lu.success) return { ok: false, raison: 'illisible' };

  const niveaux: Niveaux = {};
  for (const { id, niveau } of lu.data.domaines) {
    if (domaines.some((d) => d.id === id)) niveaux[id as DomaineId] = borner(Math.round(niveau * 10) / 10);
  }
  if (domaines.some((d) => niveaux[d.id] === undefined)) return { ok: false, raison: 'illisible' };
  if (lu.data.confiance < SEUIL_CONFIANCE) return { ok: false, raison: 'peu_sur' };
  return { ok: true, niveaux, confiance: lu.data.confiance };
}

export interface ConfigServeur {
  url: string;
  clePublique: string;
}

/** Configuration lue au moment de la compilation (fichier .env, voir .env.example). */
export function configServeur(): ConfigServeur | null {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const clePublique = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
  return url && clePublique ? { url, clePublique } : null;
}

export async function analyserPhoto(
  imageBase64: string,
  domaines: readonly Domaine[],
  config: ConfigServeur | null = configServeur(),
  envoyer: typeof fetch = fetch,
): Promise<ResultatAnalyse> {
  if (!config) return { ok: false, raison: 'indisponible' };

  const annulation = new AbortController();
  const minuterie = setTimeout(() => annulation.abort(), DELAI_MAX_MS);
  try {
    const reponse = await envoyer(`${config.url.replace(/\/$/, '')}/functions/v1/analyser-toile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: config.clePublique },
      body: JSON.stringify({
        image: imageBase64,
        typeImage: 'image/jpeg',
        domaines: domaines.map(({ id, libelle }) => ({ id, libelle })),
      }),
      signal: annulation.signal,
    });
    if (!reponse.ok) return { ok: false, raison: 'serveur' };
    return interpreterReponse(await reponse.json(), domaines);
  } catch {
    return { ok: false, raison: 'reseau' };
  } finally {
    clearTimeout(minuterie);
  }
}

/** Message pour les parents quand l'analyse n'aboutit pas. */
export function messageEchec(raison: Exclude<ResultatAnalyse, { ok: true }>['raison']): string {
  switch (raison) {
    case 'indisponible':
      return 'L’analyse de la photo n’est pas encore disponible. Vous pouvez recopier la toile à la main.';
    case 'reseau':
      return 'Pas de connexion pour analyser la photo. Vous pouvez recopier la toile à la main.';
    case 'peu_sur':
      return 'Capy n’est pas sûr d’avoir bien lu la toile. Recopiez-la à la main, ou reprenez une photo plus nette.';
    default:
      return 'Capy n’a pas réussi à lire cette photo. Vous pouvez recopier la toile à la main.';
  }
}
