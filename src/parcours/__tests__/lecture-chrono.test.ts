import { CLASSES } from '@/config/classes';
import { TEXTES_LECTURE, textesDe } from '@/contenu/textesLecture';
import { phraseVitesse, tendanceVitesse } from '@/parents/vitesse';
import { resumeSemaine } from '@/parents/semaine';
import { fusionnerProgression } from '@/serveur/fusion';
import { appliquerFiche, valeurDe } from '@/toile/niveaux';

import { calculDuChrono, messageChrono, themesChrono } from '../chrono';
import {
  derniereLecture,
  messageLecture,
  mesurerLecture,
  morceauxDuTexte,
  nombreDeMots,
  texteConseille,
} from '../lecture';
import {
  enregistrerChrono,
  enregistrerLecture,
  mediane,
  noterVitesse,
  progressionVide,
  type ProgressionEnfant,
} from '../progression';

const LUNDI = new Date(2026, 10, 2, 17, 0);
const jour = (n: number) => new Date(2026, 10, n, 17, 0);

describe('Lire à deux', () => {
  it('a des textes pour chaque classe, plus longs d’année en année', () => {
    for (const classe of CLASSES) expect(textesDe(classe).length).toBeGreaterThanOrEqual(2);
    const moyenne = (c: (typeof CLASSES)[number]) =>
      textesDe(c).reduce((s, t) => s + nombreDeMots(t.texte), 0) / textesDe(c).length;
    expect(moyenne('CE1')).toBeGreaterThan(110);
    expect(moyenne('CE2')).toBeGreaterThan(moyenne('CE1'));
    expect(moyenne('CM1')).toBeGreaterThan(moyenne('CE2'));
    expect(moyenne('CM2')).toBeGreaterThan(moyenne('CM1'));
    expect(new Set(TEXTES_LECTURE.map((t) => t.id)).size).toBe(TEXTES_LECTURE.length);
    for (const t of TEXTES_LECTURE) expect(t.texte).not.toMatch(/ {2}|undefined/);
  });

  it('compte les mots bien lus en une minute, sans la ponctuation seule ni les erreurs après le dernier mot', () => {
    const texte = 'Le chat dort : il rêve de souris.';
    expect(morceauxDuTexte(texte)).toHaveLength(8);
    expect(nombreDeMots(texte)).toBe(7);
    // Lu jusqu'à « rêve » (morceau 5), une erreur sur « dort », une autre après le dernier mot.
    expect(mesurerLecture(texte, 5, new Set([2, 7]), 60)).toEqual({ motsParMinute: 4, erreurs: 1, motsLus: 5 });
    // Texte fini en 30 secondes : on ramène à une minute.
    expect(mesurerLecture(texte, 7, new Set(), 30).motsParMinute).toBe(14);
  });

  it('propose de relire le même texte trois fois, puis un nouveau', () => {
    const [premier, second] = textesDe('CE1');
    let p = progressionVide();
    expect(texteConseille('CE1', p, '2026-11-02')?.id).toBe(premier.id);
    for (let n = 2; n <= 3; n++) {
      p = enregistrerLecture(p, premier.id, { motsParMinute: 40 + n, erreurs: 2 }, 60, jour(n));
      expect(texteConseille('CE1', p, `2026-11-0${n}`)?.id).toBe(premier.id);
    }
    p = enregistrerLecture(p, premier.id, { motsParMinute: 50, erreurs: 1 }, 60, jour(4));
    expect(texteConseille('CE1', p, '2026-11-04')?.id).toBe(second.id);
    expect(derniereLecture(p)?.mesure.motsParMinute).toBe(50);
    // La lecture compte comme un jour d'activité.
    expect(p.jours).toContain('2026-11-04');
    expect(Object.keys(p.etapes)).toEqual([]);
  });

  it('se compare seulement aux lectures précédentes, sans reproche', () => {
    const m = (motsParMinute: number) => ({ jour: '2026-11-02', motsParMinute, erreurs: 0 });
    expect(messageLecture([m(40)], 'Lou')).toMatch(/Relis ce texte demain/);
    expect(messageLecture([m(40), m(48)], 'Lou')).toMatch(/8 mots de plus/);
    expect(messageLecture([m(48), m(40)], 'Lou')).toMatch(/c’est normal/);
  });
});

describe('vitesse de réponse', () => {
  const avecMesures = (secondes: number[]) =>
    secondes.reduce<ProgressionEnfant>(
      (p, s, i) => noterVitesse(p, 'tables-addition', s, jour(i + 1)),
      progressionVide(),
    );

  it('prend la médiane, garde les 30 dernières mesures', () => {
    expect(mediane([3, 100, 4])).toBe(4);
    expect(mediane([2, 4])).toBe(3);
    expect(avecMesures(Array.from({ length: 40 }, () => 5)).vitesse?.['tables-addition']).toHaveLength(30);
  });

  it('parle de tendance à partir de 4 étapes : plus rapide, stable ou plus lent', () => {
    expect(tendanceVitesse(avecMesures([9, 9, 9]).vitesse?.['tables-addition'])).toBeNull();
    expect(tendanceVitesse(avecMesures([12, 11, 12, 7, 6, 6]).vitesse?.['tables-addition'])?.sens).toBe('plusRapide');
    expect(tendanceVitesse(avecMesures([8, 8, 8, 8]).vitesse?.['tables-addition'])?.sens).toBe('stable');
    expect(phraseVitesse(avecMesures([12, 11, 12, 7, 6, 6]).vitesse?.['tables-addition'])).toMatch(
      /6\ss en moyenne, contre 12\ss au début/,
    );
  });

  it('apparaît dans le résumé de la semaine', () => {
    const p = { ...avecMesures([12, 11, 12, 7, 6, 6]), jours: ['2026-11-02'] };
    const phrases = resumeSemaine({ prenom: 'Lou', classe: 'CE2', progression: p }, LUNDI);
    expect(phrases.join(' ')).toMatch(/plus rapides qu’au début : connaître les tables d’addition/);
  });
});

describe('le chrono de Capy', () => {
  const toile = appliquerFiche(undefined, 'CE2', 'mathematiques', { 'calcul-mental': valeurDe('+') }, '2026-09-20');

  it('ne propose que les thèmes de calcul, une fois la fiche saisie', () => {
    expect(themesChrono('CE2', undefined)).toEqual([]);
    const themes = themesChrono('CE2', toile);
    expect(themes.length).toBeGreaterThan(0);
    for (const t of themes) expect(['calcul-mental', 'tables-addition', 'tables-multiplication']).toContain(t.domaine);
  });

  it('tire des calculs reproductibles, sans répéter deux fois de suite le même', () => {
    const theme = themesChrono('CE2', toile)[0];
    let precedent = calculDuChrono(theme, 'CE2', 1, 42, 0);
    expect(calculDuChrono(theme, 'CE2', 1, 42, 0)).toEqual(precedent);
    for (let n = 1; n < 60; n++) {
      const ex = calculDuChrono(theme, 'CE2', 1, 42, n, precedent);
      expect(ex.nature).toBe('nombre');
      expect(ex.enonce).not.toBe(precedent.enonce);
      precedent = ex;
    }
  });

  it('garde le record et les dernières séries, sans jamais d’échec', () => {
    let p = progressionVide();
    p = enregistrerChrono(p, 'ce2-calcul-mental', 12, 60, jour(2));
    p = enregistrerChrono(p, 'ce2-calcul-mental', 9, 60, jour(3));
    expect(p.chronos?.['ce2-calcul-mental']).toEqual({
      record: 12,
      series: 2,
      derniers: [
        { jour: '2026-11-02', justes: 12 },
        { jour: '2026-11-03', justes: 9 },
      ],
    });
    expect(p.tempsParJour['2026-11-03']).toBe(60);
    expect(messageChrono(13, p.chronos?.['ce2-calcul-mental'], 'Lou')).toMatch(/Nouveau record/);
    expect(messageChrono(5, p.chronos?.['ce2-calcul-mental'], 'Lou')).toMatch(/tu le battras/);
    expect(messageChrono(0, undefined, 'Lou')).not.toMatch(/raté|nul/);
  });
});

describe('synchronisation des nouvelles mesures', () => {
  it('réunit lectures, vitesse et chronos des deux appareils, sans doublon', () => {
    let a = progressionVide();
    a = enregistrerLecture(a, 'ce1-cabane', { motsParMinute: 40, erreurs: 3 }, 60, jour(2));
    a = noterVitesse(a, 'calcul-mental', 8, jour(2));
    a = enregistrerChrono(a, 'ce2-calcul-mental', 10, 60, jour(2));
    let b = enregistrerLecture(a, 'ce1-cabane', { motsParMinute: 46, erreurs: 2 }, 60, jour(3));
    b = enregistrerChrono(b, 'ce2-calcul-mental', 14, 60, jour(3));

    const fusion = fusionnerProgression(a, b);
    expect(fusion.lectures?.['ce1-cabane'].map((l) => l.motsParMinute)).toEqual([40, 46]);
    expect(fusion.vitesse?.['calcul-mental']).toHaveLength(1);
    expect(fusion.chronos?.['ce2-calcul-mental'].record).toBe(14);
    expect(fusion.chronos?.['ce2-calcul-mental'].derniers).toHaveLength(2);
    // Fusionner deux fois ne change plus rien.
    expect(fusionnerProgression(fusion, b)).toEqual(fusion);
    // Absentes des deux côtés, elles le restent.
    expect(fusionnerProgression(progressionVide(), progressionVide())).not.toHaveProperty('lectures');
  });
});
