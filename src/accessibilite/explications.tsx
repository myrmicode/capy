// Mots expliqués au toucher : l'écran d'étape fournit le glossaire et ce qu'il
// faut faire quand l'enfant touche un mot (le montrer et le lire).
import { createContext, useContext } from 'react';

export interface Explications {
  mots: Readonly<Record<string, string>>;
  onExpliquer: (mot: string, explication: string) => void;
}

export const ContexteExplications = createContext<Explications | null>(null);

export function useExplications(): Explications | null {
  return useContext(ContexteExplications);
}
