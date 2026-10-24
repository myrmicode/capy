// Compte parent optionnel : connexion par un code reçu par e-mail (pas de mot de
// passe à retenir), déconnexion et suppression complète.
import { AppState } from 'react-native';

import { useCompte } from '@/store/compte';
import { useProfils } from '@/store/profils';

import { supabase } from './supabase';
import { appliqueUneSynchro, synchroniser } from './synchro';

const DELAI_SYNCHRO_MS = 4000;

export function emailValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export async function envoyerCode(email: string): Promise<boolean> {
  const client = supabase();
  if (!client) return false;
  const { error } = await client.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
  return !error;
}

export async function verifierCode(email: string, code: string): Promise<boolean> {
  const client = supabase();
  if (!client) return false;
  const { error } = await client.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
  return !error;
}

/** Déconnexion : les profils restent sur l'appareil, simplement détachés du compte. */
export async function seDeconnecter(): Promise<void> {
  await supabase()?.auth.signOut({ scope: 'local' });
  useProfils.getState().oublierSynchro();
}

/** Supprime le compte et toutes les données du serveur. Les profils restent sur l'appareil. */
export async function supprimerCompte(): Promise<boolean> {
  const client = supabase();
  if (!client) return false;
  const { error } = await client.functions.invoke('supprimer-compte', { method: 'POST' });
  if (error) return false;
  await seDeconnecter();
  return true;
}

/**
 * Branche le compte au démarrage de l'appli : suit la session, rafraîchit le
 * jeton quand l'appli est au premier plan, et synchronise après chaque changement.
 * Renvoie une fonction de nettoyage.
 */
export function demarrerCompte(): () => void {
  const client = supabase();
  useCompte.getState().definirDisponible(client !== null);
  if (!client) return () => {};

  const { data: abonnementAuth } = client.auth.onAuthStateChange((evenement, session) => {
    useCompte.getState().majSession(session?.user.email ?? null);
    if (session && (evenement === 'SIGNED_IN' || evenement === 'INITIAL_SESSION')) {
      // Hors du rappel : supabase-js déconseille d'y attendre d'autres appels.
      setTimeout(() => void synchroniser(client), 0);
    }
  });

  const majPremierPlan = (etat: string) => {
    if (etat === 'active') client.auth.startAutoRefresh();
    else client.auth.stopAutoRefresh();
  };
  majPremierPlan(AppState.currentState ?? 'active');
  const abonnementAppli = AppState.addEventListener('change', majPremierPlan);

  let minuterie: ReturnType<typeof setTimeout> | null = null;
  const abonnementProfils = useProfils.subscribe((etat, avant) => {
    if (etat.profils === avant.profils && etat.suppressionsEnAttente === avant.suppressionsEnAttente) return;
    // Les changements apportés par la synchronisation elle-même ne relancent rien.
    if (appliqueUneSynchro()) return;
    if (!useCompte.getState().email) return;
    if (minuterie) clearTimeout(minuterie);
    minuterie = setTimeout(() => void synchroniser(client), DELAI_SYNCHRO_MS);
  });

  return () => {
    abonnementAuth.subscription.unsubscribe();
    abonnementAppli.remove();
    abonnementProfils();
    if (minuterie) clearTimeout(minuterie);
  };
}
