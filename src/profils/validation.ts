export const LONGUEUR_MAX_PRENOM = 20;

// Lettres (accents compris), espaces, traits d'union et apostrophes.
const CARACTERES_AUTORISES = /^[\p{L}][\p{L}\s'’-]*$/u;

export type ResultatPrenom = { ok: true; prenom: string } | { ok: false; message: string };

/** Nettoie et vérifie le prénom ou surnom saisi par le parent. */
export function validerPrenom(saisie: string): ResultatPrenom {
  const prenom = saisie.trim().replace(/\s+/g, ' ');
  if (prenom.length === 0) {
    return { ok: false, message: 'Indiquez un prénom ou un surnom.' };
  }
  if (prenom.length > LONGUEUR_MAX_PRENOM) {
    return { ok: false, message: `${LONGUEUR_MAX_PRENOM} caractères au plus, s'il vous plaît.` };
  }
  if (!CARACTERES_AUTORISES.test(prenom)) {
    return { ok: false, message: 'Utilisez seulement des lettres, espaces, tirets ou apostrophes.' };
  }
  return { ok: true, prenom };
}
