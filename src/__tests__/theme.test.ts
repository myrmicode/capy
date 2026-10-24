import { rapportContraste } from '@/accessibilite/contraste';
import { couleurs, formes, pairesTexte } from '@/theme';

describe('charte graphique', () => {
  it('reprend exactement les valeurs de la charte', () => {
    expect(couleurs.sarcelle[400]).toBe('#36b69e');
    expect(couleurs.sarcelle[700]).toBe('#1f7a6d');
    expect(couleurs.brun[600]).toBe('#b25d34');
    expect(couleurs.jaune[400]).toBe('#fcc448');
    expect(couleurs.fondPage).toBe('#faf9f5');
    expect(couleurs.encre).toBe('#12404f');
    expect(formes.bouton).toEqual({ hauteur: 56, relief: 4 });
    expect(formes.etape).toEqual({ taille: 72, relief: 6 });
  });

  it.each(pairesTexte)('contraste ≥ 4,5:1 pour $usage', ({ texte, fond }) => {
    expect(rapportContraste(texte, fond)).toBeGreaterThanOrEqual(4.5);
  });

  it('confirme que le texte blanc est interdit sur sarcelle-400', () => {
    expect(rapportContraste(couleurs.blanc, couleurs.sarcelle[400])).toBeLessThan(4.5);
  });

  it('calcule le contraste maximal noir sur blanc', () => {
    expect(rapportContraste('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });
});
