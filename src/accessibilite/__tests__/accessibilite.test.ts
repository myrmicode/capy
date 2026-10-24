import { MOTS_PAR_PHRASE_FALC, phrasesTropLongues } from '../falc';
import { adapterExercice, nombreDeQuestions } from '../adaptation';
import { rapportContraste } from '../contraste';
import {
  aideALaLectureActive,
  appliquerRaccourci,
  COULEURS_SYLLABES,
  FONDS,
  lireReglages,
  RACCOURCIS,
  REGLAGES_PAR_DEFAUT,
  sontParDefaut,
  type CouleursSyllabes,
} from '../reglages';
import { decouperMot, lireNotation, motDeNotation } from '../syllabes';
import { COULEURS_FOND, deriverTheme } from '../theme';
import { OPTIONS } from '../options';
import { motsDuContenu, textesDesJeux } from '@/contenu/motsAffiches';
import { MOTS_EXPLIQUES } from '@/contenu/motsExpliques';
import { SYLLABES } from '@/contenu/syllabes';
import { MODELES_FRANCAIS } from '@/exercices/francais';
import { MODELES } from '@/exercices/modeles';
import { nb, NIVEAUX } from '@/exercices';
import { useProfils } from '@/store/profils';
import { couleurs, typo } from '@/theme';

/** Mots qui trahiraient une donnée de santé : jamais dans les réglages, le stockage ou le serveur. */
const MOTS_DE_SANTE = /diagnos|dyslex|dyscalc|dyspra|dysortho|tdah|trouble|handicap|sant[eé]|patholog|m[eé]dic|maladie|th[eé]rap/i;

describe('réglages de lecture et de jeu', () => {
  it('relit des réglages abîmés ou incomplets sans erreur, et ignore toute autre donnée', () => {
    expect(lireReglages(undefined)).toEqual(REGLAGES_PAR_DEFAUT);
    const r = lireReglages({ police: 'luciole', taille: 'énorme', diagnostic: 'dyslexie', nombreChoix: 3 });
    expect(r.police).toBe('luciole');
    expect(r.taille).toBe('normale');
    expect(r.nombreChoix).toBe(3);
    expect(Object.keys(r)).not.toContain('diagnostic');
    expect(Object.keys(r).sort()).toEqual(Object.keys(REGLAGES_PAR_DEFAUT).sort());
  });

  it('n’a aucun champ lié à la santé, et les raccourcis ne sont pas enregistrés', () => {
    for (const cle of Object.keys(REGLAGES_PAR_DEFAUT)) expect(cle).not.toMatch(MOTS_DE_SANTE);
    for (const raccourci of RACCOURCIS) {
      const r = appliquerRaccourci(REGLAGES_PAR_DEFAUT, raccourci);
      expect(Object.keys(r).sort()).toEqual(Object.keys(REGLAGES_PAR_DEFAUT).sort());
      expect(sontParDefaut(r)).toBe(false);
    }
  });

  it('chaque option a une explication d’une ligne, et chaque réglage a son option', () => {
    for (const o of OPTIONS) {
      expect(o.explication.length).toBeGreaterThan(10);
      expect(o.explication.length).toBeLessThan(110);
    }
    expect(OPTIONS.map((o) => o.cle).sort()).toEqual(Object.keys(REGLAGES_PAR_DEFAUT).sort());
  });

  it('masque le manuscrit dès qu’une aide à la lecture est active', () => {
    expect(aideALaLectureActive(REGLAGES_PAR_DEFAUT)).toBe(false);
    expect(deriverTheme(REGLAGES_PAR_DEFAUT).manuscritVisible).toBe(true);
    expect(deriverTheme({ ...REGLAGES_PAR_DEFAUT, syllabes: true }).manuscritVisible).toBe(false);
  });
});

describe('aucune donnée de santé nulle part', () => {
  // Les tables Supabase sont vérifiées par aucuneSante.test.js (lecture des fichiers SQL).
  it('ni dans le stockage local des profils', () => {
    const { ajouterProfil, modifierReglages } = useProfils.getState();
    const p = ajouterProfil('Lou', 'CE2');
    for (const raccourci of RACCOURCIS) modifierReglages(p.id, appliquerRaccourci(REGLAGES_PAR_DEFAUT, raccourci));
    const stocke = JSON.stringify(useProfils.getState().profils);
    expect(stocke).not.toMatch(MOTS_DE_SANTE);
  });
});

describe('thème adapté', () => {
  it('grandit le texte de 50 % sans perdre l’interligne, et espace lettres et lignes (WCAG 1.4.12)', () => {
    const t = deriverTheme({ ...REGLAGES_PAR_DEFAUT, taille: 'tresGrande', espacements: true, police: 'andika' });
    expect(t.typo.enonce.fontSize).toBe(27);
    expect(t.typo.enonce.lineHeight).toBe(54);
    expect(t.typo.enonce.letterSpacing).toBeCloseTo(27 * 0.12, 0);
    expect(t.typo.enonce.fontFamily).toBe('Andika_700Bold');
    expect(t.typo.texte.fontFamily).toBe('Andika_400Regular');
    const g = deriverTheme({ ...REGLAGES_PAR_DEFAUT, taille: 'grande', espacements: true });
    expect(g.typo.texte.lineHeight! / g.typo.texte.fontSize!).toBeGreaterThanOrEqual(1.5);
  });

  it('ne change rien sans réglage', () => {
    const t = deriverTheme(REGLAGES_PAR_DEFAUT);
    expect(t.typo.enonce).toEqual(typo.enonce);
    expect(t.cible).toBe(44);
    expect(t.fond).toBe(couleurs.fondPage);
  });

  it('agrandit les cibles à 64 px et réduit les animations en mode calme ou sur demande du système', () => {
    expect(deriverTheme({ ...REGLAGES_PAR_DEFAUT, grandesCibles: true }).cible).toBe(64);
    expect(deriverTheme({ ...REGLAGES_PAR_DEFAUT, modeCalme: true }).animationsReduites).toBe(true);
    expect(deriverTheme(REGLAGES_PAR_DEFAUT, true).animationsReduites).toBe(true);
  });

  it.each(FONDS)('garde un contraste de 4,5:1 pour les syllabes et les lettres muettes sur le fond « %s »', (fond) => {
    for (const palette of Object.keys(COULEURS_SYLLABES) as CouleursSyllabes[]) {
      const t = deriverTheme({ ...REGLAGES_PAR_DEFAUT, fond, couleursSyllabes: palette });
      for (const surface of [COULEURS_FOND[fond], couleurs.blanc, couleurs.menthe[100], couleurs.brun[100]]) {
        for (const c of [...t.couleursSyllabes, t.couleurMuette]) expect(rapportContraste(c, surface)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('garde les couleurs demandées quand elles sont déjà assez contrastées', () => {
    expect(deriverTheme({ ...REGLAGES_PAR_DEFAUT, couleursSyllabes: 'bleuRouge' }).couleursSyllabes).toEqual(COULEURS_SYLLABES.bleuRouge);
  });
});

describe('coloration syllabique', () => {
  it('lit la notation : syllabes, lettres muettes', () => {
    expect(lireNotation('lu-nett(es)')).toEqual([
      { texte: 'lu', syllabe: 0, muette: false },
      { texte: 'nett', syllabe: 1, muette: false },
      { texte: 'es', syllabe: 1, muette: true },
    ]);
    expect(decouperMot('Capy')!.map((m) => m.texte)).toEqual(['Ca', 'py']);
    expect(decouperMot('motinconnu')).toBeNull();
  });

  it('a des découpages qui recomposent exactement chaque mot', () => {
    const erreurs = Object.entries(SYLLABES).filter(([mot, notation]) => motDeNotation(notation) !== mot);
    expect(erreurs).toEqual([]);
    for (const notation of Object.values(SYLLABES)) expect(notation).toMatch(/^[\p{L}()-]+$/u);
  });

  it('couvre chaque mot affiché avec coloration (exercices, versions faciles, consignes)', () => {
    const manquants = [...motsDuContenu(1500)].filter((m) => !SYLLABES[m]);
    expect(manquants).toEqual([]);
  });
});

/** Le mot (ou nombre) apparaît-il tel quel dans le texte, entouré de non-lettres ? */
function contient(texte: string, mot: string): boolean {
  const t = texte.toLowerCase();
  const m = mot.toLowerCase();
  for (let i = t.indexOf(m); i >= 0; i = t.indexOf(m, i + 1)) {
    if (!/[\p{L}\d]/u.test(t[i - 1] ?? '') && !/[\p{L}\d]/u.test(t[i + m.length] ?? '')) return true;
  }
  return false;
}

describe('FALC : tout le contenu a une version facile', () => {
  const modeles = [...MODELES, ...MODELES_FRANCAIS].map((m) => [m.id, m] as const);
  it.each(modeles)('« %s » : phrases courtes, réponse dans l’explication, jamais dans l’indice', (_id, modele) => {
    const problemes: string[] = [];
    for (const niveau of NIVEAUX) {
      for (let g = 0; g < 400; g++) {
        const ex = modele.generer('CE2', g, { niveau });
        const f = ex.facile;
        for (const t of [f.enonce, f.question, f.indice, f.explication]) if (!t.trim()) problemes.push(`texte facile vide (${g})`);
        const textes = ex.nature === 'nombre' ? [f.enonce, f.question, f.indice, f.explication] : [f.question, f.indice, f.explication];
        for (const t of textes) for (const p of phrasesTropLongues(t)) problemes.push(`phrase de plus de ${MOTS_PAR_PHRASE_FALC} mots : ${p}`);
        const reponse = ex.nature === 'nombre' ? nb(ex.reponse) : ex.reponse;
        if (!contient(f.explication, reponse)) problemes.push(`l’explication facile ne cite pas « ${reponse} » : ${f.explication}`);
        if (ex.nature === 'texte' && !ex.categories && contient(f.indice, reponse)) problemes.push(`l’indice facile donne « ${reponse} »`);
        if (ex.nature === 'texte' && f.enonce !== ex.enonce) problemes.push('l’énoncé étudié a changé');
        if (problemes.length > 10) break;
      }
    }
    expect([...new Set(problemes)]).toEqual([]);
  });

  it('les consignes des jeux ont une version facile en phrases courtes', () => {
    for (const t of textesDesJeux({ faciles: true })) expect(phrasesTropLongues(t)).toEqual([]);
  });

  it('remplace les textes par leur version facile, sans changer la réponse', () => {
    const ex = MODELES.find((m) => m.id === 'ajout')!.generer('CE2', 3);
    const facile = adapterExercice(ex, { ...REGLAGES_PAR_DEFAUT, falc: true });
    expect(facile.enonce).toBe(ex.facile.enonce);
    expect(facile.question).toBe(ex.facile.question);
    expect(facile.reponse).toBe(ex.reponse);
    expect(facile.choix).toEqual(ex.choix);
  });

  it('garde la bonne question de « La question perdue », même en FALC', () => {
    const ex = MODELES.find((m) => m.id === 'retrait')!.generer('CE2', 2);
    const facile = adapterExercice(ex, { ...REGLAGES_PAR_DEFAUT, falc: true, nombreChoix: 2 }, 'questionPerdue');
    expect(facile.nature === 'nombre' && facile.questionsAuChoix).toContain(facile.question);
    expect(facile.nature === 'nombre' && facile.questionsAuChoix).toHaveLength(2);
  });
});

describe('aides en calcul et attention', () => {
  it('garde la bonne réponse et les erreurs typiques quand on propose moins de choix', () => {
    for (let g = 0; g < 200; g++) {
      const ex = MODELES.find((m) => m.id === 'ecart')!.generer('CE2', g);
      for (const n of [2, 3] as const) {
        const a = adapterExercice(ex, { ...REGLAGES_PAR_DEFAUT, nombreChoix: n });
        expect(a.choix).toHaveLength(n);
        expect(a.choix).toContain(ex.reponse);
      }
    }
  });

  it('ne touche ni aux paniers ni aux phrases à toucher : c’est le contenu étudié', () => {
    const paniers = MODELES_FRANCAIS.find((m) => m.id === 'nature-du-mot')!.generer('CE2', 1);
    expect(adapterExercice(paniers, { ...REGLAGES_PAR_DEFAUT, nombreChoix: 2 }).choix).toEqual(paniers.choix);
  });

  it('raccourcit les étapes à 3 questions', () => {
    expect(nombreDeQuestions(7, { ...REGLAGES_PAR_DEFAUT, sessionsCourtes: true })).toBe(3);
    expect(nombreDeQuestions(7, REGLAGES_PAR_DEFAUT)).toBe(7);
  });

  it('explique simplement les mots de maths, en phrases courtes', () => {
    for (const [mot, explication] of Object.entries(MOTS_EXPLIQUES)) {
      expect(mot).toBe(mot.toLowerCase());
      expect(phrasesTropLongues(explication)).toEqual([]);
    }
  });
});
