export const CLASSES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'] as const;

export type Classe = (typeof CLASSES)[number];

export function estClasse(valeur: unknown): valeur is Classe {
  return typeof valeur === 'string' && (CLASSES as readonly string[]).includes(valeur);
}
