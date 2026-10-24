import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { configServeur } from './config';

let client: SupabaseClient | null | undefined;

/**
 * Client Supabase du compte parent optionnel, ou null si l'appli n'est pas
 * reliée à un projet (elle fonctionne alors entièrement sans compte).
 * La session est gardée sur l'appareil.
 */
export function supabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const config = configServeur();
  client = config
    ? createClient(config.url, config.clePublique, {
        auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
      })
    : null;
  return client;
}
