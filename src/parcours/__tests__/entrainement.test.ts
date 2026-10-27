import { THEMES } from '@/config/parcours';
import { cleIllustration } from '@/exercices/types';
import { fusionnerProgression } from '@/serveur/fusion';
import { useProfils } from '@/store/profils';
import { appliquerFiche, valeurDe } from '@/toile/niveaux';

import { genererEtape } from '../etape';
import { enregistrerEntrainement, progressionVide, totalEtoiles } from '../progression';
import {
  QUESTIONS_SERIE,
  serieEntrainement,
  themeEnEntrainement,
  themesEntrainement,
  themesProposes,
} from '../selection';

const maths = appliquerFiche(
  undefined,
  'CE2',
  'mathematiques',
  { 'resoudre-problemes': valeurDe('+++'), 'calcul-mental': valeurDe('++'), 'ligne-graduee': valeurDe('+++') },
  '2026-09-20',
);
const LE_20 = new Date(2026, 9, 20, 17);

describe('entraînement libre', () => {
  it('ne propose que les compétences à +++ sur la fiche, et rien sans fiche', () => {
    expect(themesEntrainement('CE2', undefined)).toEqual([]);
    const ids = themesEntrainement('CE2', maths).map((t) => t.domaine);
    // Et les ateliers (formes, mesures), qui ne sont sur aucune toile.
    expect(ids.sort()).toEqual(['geometrie', 'grandeurs', 'ligne-graduee', 'resoudre-problemes']);
    // Elles ne sont pas dans le parcours principal, et inversement.
    const parcours = themesProposes('CE2', maths).map((t) => t.id);
    for (const t of themesEntrainement('CE2', maths)) expect(parcours).not.toContain(t.id);
    expect(themeEnEntrainement('CE2', maths, 'ce2-resoudre-problemes')).toBe(true);
    expect(themeEnEntrainement('CE2', maths, 'ce2-calcul-mental')).toBe(false);
  });

  it.each(THEMES.map((t) => [t.id, t] as const))('le thème « %s » donne une série courte, rejouable', (_id, theme) => {
    const serie = serieEntrainement(theme);
    expect(serie.nombreQuestions).toBe(QUESTIONS_SERIE);
    for (const graine of [1, 2, 3]) {
      const questions = genererEtape({ classe: theme.classe, domaine: theme.domaine, graine, ...serie, niveau: 3 });
      expect(questions).toHaveLength(QUESTIONS_SERIE);
    }
    // Deux séries de suite ne se ressemblent pas (pour un texte entendu, c'est le texte dit qui change).
    const cle = (q: (typeof a)[number]) =>
      q.exercice.lecture ??
      `${q.exercice.enonce} ${q.exercice.illustration ? cleIllustration(q.exercice.illustration) : ''}`;
    const a = genererEtape({ classe: theme.classe, domaine: theme.domaine, graine: 1, ...serie, niveau: 3 });
    const b = genererEtape({ classe: theme.classe, domaine: theme.domaine, graine: 2, ...serie, niveau: 3 });
    expect(a.map(cle)).not.toEqual(b.map(cle));
  });

  it('rapporte des étoiles à chaque série, qui s’ajoutent au trésor', () => {
    let p = progressionVide();
    p = enregistrerEntrainement(p, 'ce2-ligne-graduee', 5, 5, 120, LE_20);
    p = enregistrerEntrainement(p, 'ce2-ligne-graduee', 2, 5, 120, LE_20);
    expect(p.entrainement!['ce2-ligne-graduee']).toEqual({ etoiles: 3 + 1, series: 2 });
    expect(totalEtoiles(p)).toBe(4);
    // Pas d'étape fictive dans le parcours ; le jour et le temps comptent.
    expect(p.etapes).toEqual({});
    expect(p.jours).toEqual(['2026-10-20']);
    expect(p.tempsParJour['2026-10-20']).toBe(240);
  });

  it('fait évoluer la toile du jour, jamais la fiche de septembre', () => {
    useProfils.setState({ profils: [], profilActifId: null, suppressionsEnAttente: [] });
    const { ajouterProfil, enregistrerToile, enregistrerEntrainement: enregistrer } = useProfils.getState();
    const lou = ajouterProfil('Lou', 'CE2');
    enregistrerToile(lou.id, 'mathematiques', maths.septembre, LE_20);
    for (let i = 0; i < 3; i++) {
      enregistrer(lou.id, 'ce2-resoudre-problemes', {
        domaine: 'resoudre-problemes',
        reussiesPremierCoup: 0,
        nombreQuestions: 5,
        dureeSecondes: 60,
      });
    }
    const toile = useProfils.getState().profils[0].toile!;
    expect(toile.septembre['resoudre-problemes']).toBe(valeurDe('+++'));
    expect(toile.actuelle['resoudre-problemes']).toBeLessThan(valeurDe('+++'));
  });

  it('garde les étoiles d’entraînement quand deux appareils se synchronisent', () => {
    const a = enregistrerEntrainement(progressionVide(), 'ce2-ligne-graduee', 5, 5, 60, LE_20);
    const b = enregistrerEntrainement(progressionVide(), 'ce2-resoudre-problemes', 5, 5, 60, LE_20);
    const f = fusionnerProgression(a, b);
    expect(Object.keys(f.entrainement!).sort()).toEqual(['ce2-ligne-graduee', 'ce2-resoudre-problemes']);
    // Un ancien profil, sans entraînement, se fusionne sans erreur.
    const { entrainement: _sans, ...ancien } = progressionVide();
    expect(fusionnerProgression(ancien, a).entrainement).toEqual(a.entrainement);
  });
});
