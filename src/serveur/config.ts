export interface ConfigServeur {
  url: string;
  clePublique: string;
}

/**
 * Adresse du projet Supabase et clé « publishable », lues au moment de la
 * compilation (fichier .env, voir .env.example). Ces deux valeurs sont publiques
 * par conception ; aucune clé secrète n'est jamais dans l'appli.
 */
export function configServeur(): ConfigServeur | null {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const clePublique = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
  return url && clePublique ? { url: url.replace(/\/$/, ''), clePublique } : null;
}
