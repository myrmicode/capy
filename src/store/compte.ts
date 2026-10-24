import { create } from 'zustand';

export type EtatSynchro = 'inactive' | 'en_cours' | 'ok' | 'erreur';

/** État du compte parent (non enregistré : la session est gérée par Supabase). */
interface EtatCompte {
  disponible: boolean;
  email: string | null;
  synchro: EtatSynchro;
  derniereSynchro: string | null;
  majSession: (email: string | null) => void;
  majSynchro: (synchro: EtatSynchro, date?: string) => void;
  definirDisponible: (disponible: boolean) => void;
}

export const useCompte = create<EtatCompte>()((set) => ({
  disponible: false,
  email: null,
  synchro: 'inactive',
  derniereSynchro: null,
  majSession: (email) => set(email ? { email } : { email: null, synchro: 'inactive', derniereSynchro: null }),
  majSynchro: (synchro, date) => set(date ? { synchro, derniereSynchro: date } : { synchro }),
  definirDisponible: (disponible) => set({ disponible }),
}));
