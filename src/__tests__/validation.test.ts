import { validerPrenom } from '@/profils/validation';

describe('validerPrenom', () => {
  it.each(['Lou', 'Zoé', 'Marie-Anne', "N'Golo", 'Lili Rose', 'Élise'])('accepte « %s »', (prenom) => {
    expect(validerPrenom(prenom)).toEqual({ ok: true, prenom });
  });

  it('retire les espaces superflus', () => {
    expect(validerPrenom('  Lou   Anne ')).toEqual({ ok: true, prenom: 'Lou Anne' });
  });

  it.each(['', '   ', 'Lou2', 'lou@mail.fr', '-Lou', 'A'.repeat(21)])('refuse « %s »', (saisie) => {
    const resultat = validerPrenom(saisie);
    expect(resultat.ok).toBe(false);
  });
});
