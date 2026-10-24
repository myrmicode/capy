/* global it, expect, __dirname */
// Aucune donnée de santé dans les tables Supabase : les migrations SQL n'ont aucune
// colonne de ce genre (les commentaires peuvent expliquer la règle, le code non).
const fs = require('node:fs');
const path = require('node:path');

const MOTS_DE_SANTE = /diagnos|dyslex|dyscalc|dyspra|dysortho|tdah|trouble|handicap|sant[eé]|patholog|m[eé]dic|maladie|th[eé]rap/i;

it('aucune colonne liée à la santé dans les tables Supabase', () => {
  const dossier = path.join(__dirname, '../../../supabase/migrations');
  const fichiers = fs.readdirSync(dossier).filter((f) => f.endsWith('.sql'));
  expect(fichiers.length).toBeGreaterThan(0);
  for (const fichier of fichiers) {
    const sql = fs
      .readFileSync(path.join(dossier, fichier), 'utf8')
      .split('\n')
      .filter((l) => !l.trim().startsWith('--'))
      .join('\n');
    expect(sql).not.toMatch(MOTS_DE_SANTE);
  }
});
