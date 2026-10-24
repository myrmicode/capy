// Fusion des profils entre l'appareil et le serveur (compte parent optionnel).
// Fonctions pures, testées : aucune donnée n'est perdue quand deux appareils
// ont avancé chacun de leur côté.
import type { ProgressionEnfant } from '@/parcours/progression';
import type { ProfilEnfant } from '@/store/profils';

/** Profil tel qu'enregistré sur le serveur (sans les métadonnées propres à l'appareil). */
export type ProfilDistant = Omit<ProfilEnfant, 'synchroniseLe'>;

/** Réunit deux progressions : meilleures étoiles, coffres et jours de l'un ou de l'autre. */
export function fusionnerProgression(a: ProgressionEnfant, b: ProgressionEnfant): ProgressionEnfant {
  const etapes = { ...a.etapes };
  for (const [id, r] of Object.entries(b.etapes)) {
    const autre = etapes[id];
    etapes[id] = autre ? { etoiles: Math.max(autre.etoiles, r.etoiles), fois: Math.max(autre.fois, r.fois) } : r;
  }
  const tempsParJour = { ...a.tempsParJour };
  // Le maximum, pas la somme : le même temps revient souvent des deux côtés après une synchronisation.
  for (const [jour, s] of Object.entries(b.tempsParJour)) tempsParJour[jour] = Math.max(tempsParJour[jour] ?? 0, s);
  return {
    etapes,
    coffresOuverts: [...new Set([...a.coffresOuverts, ...b.coffresOuverts])].sort(),
    jours: [...new Set([...a.jours, ...b.jours])].sort(),
    tempsParJour,
  };
}

/** Le prénom, la classe, la toile et les réglages viennent de la modification la plus récente ; la progression est réunie. */
export function fusionnerProfil(local: ProfilEnfant, distant: ProfilDistant): ProfilEnfant {
  const recent = distant.modifieLe > local.modifieLe ? distant : local;
  return {
    id: local.id,
    prenom: recent.prenom,
    classe: recent.classe,
    toile: recent.toile,
    reglages: recent.reglages,
    progression: fusionnerProgression(local.progression, distant.progression),
    modifieLe: recent.modifieLe,
    synchroniseLe: local.synchroniseLe,
  };
}

function identiques(a: ProfilDistant, b: ProfilDistant): boolean {
  const sansMeta = ({ id, prenom, classe, toile, progression, modifieLe }: ProfilDistant) =>
    JSON.stringify({ id, prenom, classe, toile: toile ?? null, progression, modifieLe });
  return sansMeta(a) === sansMeta(b);
}

export interface PlanSynchro {
  /** Profils à créer ou mettre à jour sur le serveur. */
  aEnvoyer: ProfilDistant[];
  /** Profils à effacer du serveur (supprimés sur cet appareil). */
  aEffacer: string[];
  /** Nouvelle liste de profils de l'appareil, une fois la synchronisation faite. */
  locaux: ProfilEnfant[];
}

/**
 * Prépare une synchronisation.
 * - supprimé ici : effacé du serveur ;
 * - seulement ici : envoyé, sauf s'il avait déjà été synchronisé (il a donc été
 *   supprimé depuis un autre appareil, et on le retire ici aussi) ;
 * - seulement sur le serveur : créé depuis un autre appareil, on le récupère ;
 * - des deux côtés : fusionné, et renvoyé au serveur s'il a changé.
 */
export function planifierSynchro(
  locaux: readonly ProfilEnfant[],
  distants: readonly ProfilDistant[],
  supprimesIci: readonly string[],
  maintenant: string,
): PlanSynchro {
  const parId = new Map(distants.map((d) => [d.id, d]));
  const aEnvoyer: ProfilDistant[] = [];
  const resultat: ProfilEnfant[] = [];

  for (const local of locaux) {
    if (supprimesIci.includes(local.id)) continue;
    const distant = parId.get(local.id);
    if (!distant) {
      if (local.synchroniseLe) continue; // Supprimé depuis un autre appareil.
      aEnvoyer.push(sansMetadonnees(local));
      resultat.push({ ...local, synchroniseLe: maintenant });
      continue;
    }
    const fusion = fusionnerProfil(local, distant);
    if (!identiques(fusion, distant)) aEnvoyer.push(sansMetadonnees(fusion));
    resultat.push({ ...fusion, synchroniseLe: maintenant });
  }

  const connus = new Set(locaux.map((p) => p.id));
  for (const distant of distants) {
    if (!connus.has(distant.id) && !supprimesIci.includes(distant.id)) {
      resultat.push({ ...distant, synchroniseLe: maintenant });
    }
  }

  return {
    aEnvoyer,
    aEffacer: supprimesIci.filter((id) => parId.has(id)),
    locaux: resultat,
  };
}

function sansMetadonnees(p: ProfilEnfant): ProfilDistant {
  const { synchroniseLe: _ignore, ...reste } = p;
  return reste;
}
