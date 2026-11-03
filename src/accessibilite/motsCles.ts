// Les mots importants d'une consigne ou d'une question : ceux qui disent quoi
// faire (« touche », « écris »), ce qu'on cherche (« le plus », « en tout »,
// « de plus ») ou qui retournent le sens (« ne… pas », « sauf »). Beaucoup
// d'erreurs viennent d'une consigne mal lue : on les met en valeur, et Capy
// les rappelle après une erreur.
//
// On ne les cherche jamais dans le texte étudié (la phrase à comprendre) : ce
// serait souffler la réponse. Seulement dans la consigne et la question.

/** Les expressions, de la plus longue à la plus courte : « le plus grand » passe avant « le plus ». */
const EXPRESSIONS = [
  // Ce qu'on cherche
  'le plus grand',
  'le plus petit',
  'la plus grande',
  'la plus petite',
  'les plus nombreux',
  'les moins nombreux',
  'le plus',
  'le moins',
  'la plus',
  'la moins',
  'de plus',
  'de moins',
  'en tout',
  'chaque',
  'combien',
  'reste',
  'restent',
  'fois plus',
  // Ce qui retourne le sens
  'pas',
  'sauf',
  'aucun',
  'aucune',
  'jamais',
  // Ce qu'il faut faire
  'touche',
  'choisis',
  'écris',
  'glisse',
  'range',
  'relie',
  'trace',
  'avance',
  'pose',
  'compte',
  'écoute',
  'regarde',
  'valide',
] as const;

/**
 * Les verbes qui disent quoi faire, et « combien » (dans presque toutes les
 * questions) : soulignés, mais pas rappelés après une erreur.
 */
const PAS_RAPPELES = new Set<string>(['combien', ...EXPRESSIONS.slice(EXPRESSIONS.indexOf('touche'))]);

const LETTRE = /[\p{L}\d]/u;

export interface Plage {
  debut: number;
  fin: number;
}

/** Où sont les mots importants (sans chevauchement, dans l'ordre du texte). */
export function plagesMotsCles(texte: string): Plage[] {
  const bas = texte.toLowerCase().replace(/'/g, '’');
  const prises: Plage[] = [];
  for (const expression of EXPRESSIONS) {
    for (let i = bas.indexOf(expression); i >= 0; i = bas.indexOf(expression, i + 1)) {
      const fin = i + expression.length;
      // Un mot entier : « pas » n'est pas dans « passe », « reste » pas dans « restaurant ».
      if (LETTRE.test(bas[i - 1] ?? '') || LETTRE.test(bas[fin] ?? '')) continue;
      if (prises.some((p) => i < p.fin && fin > p.debut)) continue;
      prises.push({ debut: i, fin });
    }
  }
  return prises.sort((a, b) => a.debut - b.debut);
}

/** Les mots importants, tels qu'ils sont écrits. */
export function motsCles(texte: string): string[] {
  return plagesMotsCles(texte).map((p) => texte.slice(p.debut, p.fin));
}

/**
 * Après une erreur, Capy fait relire la question et montre ses mots
 * importants ; rien quand la question n'en a pas.
 */
export function relireLaQuestion(question: string): string | null {
  const mots = [...new Set(motsCles(question).map((m) => m.toLowerCase()))].filter((m) => !PAS_RAPPELES.has(m));
  if (mots.length === 0) return null;
  const liste = mots.map((m) => `« ${m} »`);
  const derniers = liste.length > 1 ? `${liste.slice(0, -1).join(', ')} et ${liste[liste.length - 1]}` : liste[0];
  return `Relis bien la question. ${liste.length > 1 ? 'Les mots' : 'Le mot'} ${derniers} ${liste.length > 1 ? 'sont importants' : 'est important'}.`;
}
