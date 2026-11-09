// Les tables de Capy : l'enfant choisit une table (ou toutes), et répond à
// 10 multiplications avec 7 secondes pour chacune. Temps dépassé ou réponse
// fausse : Capy montre la bonne réponse et on passe à la suivante. À la fin, le
// taux de réussite, les calculs à revoir, et « Rejouer mes erreurs ».
// En mode calme, pas de minuteur : on répond à son rythme.
import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { BulleCapy, Bouton, CapyAnime, Ecran, SurfaceEnRelief } from '@/composants';
import { celebrer, feliciter, lireAVoixHaute } from '@/jeux/retours';
import { graineDePartie, type ResultatChrono } from '@/parcours/progression';
import {
  cleTables,
  DELAI_TABLES_SECONDES,
  libelleTables,
  messageTables,
  questionsTables,
  QUESTIONS_TABLES,
  resultat,
  TABLES,
  tablesOuvertes,
  tauxReussite,
  type ChoixTables,
  type QuestionTable,
} from '@/parcours/tables';
import { useProfilActif, useProfils } from '@/store/profils';
import { couleurs, espaces, formes, polices } from '@/theme';

/** Le temps de lire la bonne réponse après une erreur ou un temps dépassé. */
const PAUSE_APRES_ERREUR_MS = 1800;
const PAUSE_APRES_REUSSITE_MS = 500;
/** Assez de chiffres pour 10 × 10. */
const CHIFFRES_MAX = 3;

interface Reponse {
  question: QuestionTable;
  /** Ce que l'enfant a écrit, ou null si le temps est dépassé. */
  donnee: number | null;
  juste: boolean;
}

type Phase = 'choix' | 'jeu' | 'fin';

function Tables() {
  const profil = useProfilActif();
  const enregistrerTables = useProfils((e) => e.enregistrerTables);
  const { typo, reglages, animationsReduites, cible } = useThemeEnfant();
  const avecMinuteur = !reglages.modeCalme;

  const [phase, setPhase] = useState<Phase>('choix');
  const [choix, setChoix] = useState<ChoixTables>(2);
  const [desordre, setDesordre] = useState(false);
  // Rejouer ses erreurs : une partie plus courte, qui ne compte pas pour le record.
  const [revision, setRevision] = useState(false);
  const [questions, setQuestions] = useState<QuestionTable[]>([]);
  const [numero, setNumero] = useState(0);
  const [saisie, setSaisie] = useState('');
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [corrigee, setCorrigee] = useState<Reponse | null>(null);
  const [recordAvant, setRecordAvant] = useState<ResultatChrono | undefined>(undefined);

  const debutPartie = useRef(0);
  const reponsesRef = useRef<Reponse[]>([]);
  // Bloque une double réponse (le temps qui finit pendant qu’on valide).
  const corrigeeRef = useRef<Reponse | null>(null);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suivant = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reste = useSharedValue(1);

  const arreterMinuteurs = () => {
    if (minuteur.current) clearTimeout(minuteur.current);
    if (suivant.current) clearTimeout(suivant.current);
    minuteur.current = null;
    suivant.current = null;
    cancelAnimation(reste);
  };
  useEffect(() => arreterMinuteurs, []); // eslint-disable-line react-hooks/exhaustive-deps

  const question = questions[numero];

  // Chaque question a ses 7 secondes : la barre se vide, puis on passe à la suite.
  useEffect(() => {
    if (phase !== 'jeu' || !question) return;
    if (reglages.lectureAuto) lireAVoixHaute(`${question.a} fois ${question.b}`, { lente: reglages.lectureLente });
    if (!avecMinuteur) return;
    reste.value = 1;
    reste.value = withTiming(0, { duration: DELAI_TABLES_SECONDES * 1000, easing: Easing.linear });
    minuteur.current = setTimeout(() => repondre(null), DELAI_TABLES_SECONDES * 1000);
    return () => {
      if (minuteur.current) clearTimeout(minuteur.current);
      cancelAnimation(reste);
    };
    // repondre lit l'état courant via les refs : seule la question relance le minuteur.
  }, [phase, numero, questions]); // eslint-disable-line react-hooks/exhaustive-deps

  const styleBarre = useAnimatedStyle(() => ({ width: `${reste.value * 100}%` }));

  // La partie est enregistrée une fois, à la fin (pas les révisions d'erreurs).
  const enregistree = useRef(false);
  useEffect(() => {
    if (phase !== 'fin' || !profil || enregistree.current) return;
    enregistree.current = true;
    celebrer('fin', { silencieux: animationsReduites });
    if (revision) return;
    const justes = reponsesRef.current.filter((r) => r.juste).length;
    const duree = Math.max(1, Math.round((Date.now() - debutPartie.current) / 1000));
    enregistrerTables(profil.id, cleTables(choix), justes, duree);
  }, [phase, profil, revision, choix, enregistrerTables, animationsReduites]);

  if (!profil) return <Redirect href="/" />;
  if (!tablesOuvertes(profil.classe)) return <Redirect href="/enfant" />;

  const lireRecord = (c: ChoixTables) => profil.progression.tables?.[cleTables(c)];

  const lancer = (c: ChoixTables, liste: QuestionTable[], enRevision: boolean) => {
    arreterMinuteurs();
    setChoix(c);
    setRevision(enRevision);
    setRecordAvant(lireRecord(c));
    setQuestions(liste);
    setNumero(0);
    setSaisie('');
    setCorrigee(null);
    reponsesRef.current = [];
    corrigeeRef.current = null;
    setReponses([]);
    enregistree.current = false;
    debutPartie.current = Date.now();
    setPhase('jeu');
  };

  const demarrer = (c: ChoixTables) => {
    const series = lireRecord(c)?.series ?? 0;
    const graine = graineDePartie(profil.id, `tables:${cleTables(c)}`, series + Date.now());
    lancer(c, questionsTables(c, desordre, graine), false);
  };

  function repondre(donnee: number | null) {
    const q = questions[numero];
    if (!q || corrigeeRef.current) return;
    arreterMinuteurs();
    const r: Reponse = { question: q, donnee, juste: donnee === resultat(q) };
    corrigeeRef.current = r;
    setCorrigee(r);
    reponsesRef.current = [...reponsesRef.current, r];
    setReponses(reponsesRef.current);
    if (r.juste) feliciter({ silencieux: true });
    suivant.current = setTimeout(
      () => {
        corrigeeRef.current = null;
        setCorrigee(null);
        setSaisie('');
        if (numero + 1 >= questions.length) setPhase('fin');
        else setNumero(numero + 1);
      },
      r.juste ? PAUSE_APRES_REUSSITE_MS : PAUSE_APRES_ERREUR_MS,
    );
  }

  if (phase === 'choix') {
    return (
      <Ecran pied={<Bouton titre="Retour" variante="secondaire" onPress={() => router.back()} />}>
        <Text style={typo.titre1} accessibilityRole="header">
          Les tables de Capy
        </Text>
        <BulleCapy
          pose="clinOeil"
          tailleCapy={80}
          texte={
            avecMinuteur
              ? `Choisis une table : ${QUESTIONS_TABLES} calculs, ${DELAI_TABLES_SECONDES} secondes pour chacun. Si tu te trompes, je te montre la réponse et on continue.`
              : `Choisis une table : ${QUESTIONS_TABLES} calculs, à ton rythme. Si tu te trompes, je te montre la réponse et on continue.`
          }
        />
        <View style={styles.reglage}>
          <Text style={[typo.texteGras, styles.flex]}>Dans le désordre</Text>
          <Switch
            value={desordre}
            onValueChange={setDesordre}
            trackColor={{ true: couleurs.sarcelle[700], false: couleurs.gris[300] }}
            thumbColor={couleurs.blanc}
            accessibilityLabel="Poser les calculs de la table dans le désordre"
          />
        </View>
        <View style={styles.grilleTables}>
          {TABLES.map((t) => {
            const record = lireRecord(t);
            const parfaite = record?.record === QUESTIONS_TABLES;
            return (
              <SurfaceEnRelief
                key={t}
                onPress={() => demarrer(t)}
                accessibilityRole="button"
                accessibilityLabel={`La table de ${t}${record ? `, record ${record.record} sur ${QUESTIONS_TABLES}` : ''}`}
                couleurFace={parfaite ? couleurs.jaune[400] : couleurs.blanc}
                couleurRelief={parfaite ? couleurs.jaune[600] : couleurs.sarcelle[500]}
                relief={4}
                rayon={formes.carte.rayon}
                style={[styles.tuileTable, { minHeight: Math.max(76, cible + 20) }]}
                styleFace={styles.tuileTableFace}
              >
                <Text style={[styles.nombreTable, parfaite && { color: couleurs.jaune.texte }]}>× {t}</Text>
                <Text style={[typo.petit, { color: parfaite ? couleurs.jaune.texte : couleurs.encreDouce }]}>
                  {record ? `${record.record}/${QUESTIONS_TABLES}` : 'à essayer'}
                </Text>
              </SurfaceEnRelief>
            );
          })}
        </View>
        <Bouton
          titre="Toutes les tables mélangées"
          variante="jaune"
          libelleAccessible={`Toutes les tables mélangées${lireRecord('toutes') ? `, record ${lireRecord('toutes')!.record} sur ${QUESTIONS_TABLES}` : ''}`}
          onPress={() => demarrer('toutes')}
        />
        {lireRecord('toutes') ? (
          <Text style={[typo.petit, styles.centre]}>
            Ton record, toutes les tables : {lireRecord('toutes')!.record}/{QUESTIONS_TABLES}
          </Text>
        ) : null}
      </Ecran>
    );
  }

  if (phase === 'fin') {
    const justes = reponses.filter((r) => r.juste).length;
    const erreurs = reponses.filter((r) => !r.juste);
    const taux = tauxReussite(justes, reponses.length);
    const message = revision
      ? erreurs.length === 0
        ? `Bravo ${profil.prenom} ! Tu as corrigé toutes tes erreurs.`
        : `Encore ${erreurs.length} à revoir. Tu peux les rejouer !`
      : messageTables(justes, reponses.length, recordAvant, profil.prenom);
    return (
      <Ecran
        pied={
          <View style={styles.boutons}>
            {erreurs.length > 0 ? (
              <Bouton
                titre="Rejouer mes erreurs"
                onPress={() =>
                  lancer(
                    choix,
                    erreurs.map((r) => r.question),
                    true,
                  )
                }
              />
            ) : null}
            <Bouton
              titre="Rejouer la partie"
              variante={erreurs.length > 0 ? 'secondaire' : 'principal'}
              onPress={() => demarrer(choix)}
            />
            <Bouton titre="Choisir une autre table" variante="secondaire" onPress={() => setPhase('choix')} />
          </View>
        }
      >
        <View style={styles.fin}>
          <CapyAnime pose={taux >= 50 ? 'bravo' : 'clinOeil'} taille={140} />
          <Text style={[typo.texteGras, styles.centre]}>{revision ? 'Tes erreurs' : libelleTables(choix)}</Text>
          <Text
            style={[typo.titre1, styles.grandNombre]}
            accessibilityLabel={`${justes} réponses justes sur ${reponses.length}`}
          >
            {justes}/{reponses.length}
          </Text>
          <Text style={[typo.titre3, styles.centre]}>{taux} % de réussite</Text>
          <Text style={[typo.enonce, styles.centre]}>{message}</Text>
        </View>
        {erreurs.length > 0 ? (
          <View style={styles.carteErreurs}>
            <Text style={typo.titre3} accessibilityRole="header">
              À revoir
            </Text>
            {erreurs.map((r, i) => (
              <View key={i} style={styles.ligneErreur}>
                <Text style={[typo.texteGras, styles.calculErreur]}>
                  {r.question.a} × {r.question.b} = {resultat(r.question)}
                </Text>
                <Text style={[typo.petit, { color: couleurs.brun[800] }]}>
                  {r.donnee === null ? 'temps dépassé' : `tu as écrit ${r.donnee}`}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Ecran>
    );
  }

  if (!question) return null;
  const ecrire = (chiffre: string) => {
    if (corrigee) return;
    setSaisie((s) => (s.length >= CHIFFRES_MAX ? s : s === '0' ? chiffre : s + chiffre));
  };
  const effacer = () => {
    if (!corrigee) setSaisie((s) => s.slice(0, -1));
  };
  const valider = () => {
    if (saisie !== '') repondre(Number(saisie));
  };
  const toucheStyle = [styles.touche, { minHeight: Math.max(56, cible) }];

  let couleurCase: string = couleurs.blanc;
  let texteCase = saisie === '' ? '?' : saisie;
  if (corrigee) {
    couleurCase = corrigee.juste ? couleurs.menthe[100] : couleurs.brun[100];
    texteCase = String(resultat(question));
  }

  return (
    <Ecran>
      <View style={styles.entete}>
        <Text style={typo.texteGras}>{revision ? 'Tes erreurs' : libelleTables(choix)}</Text>
        <Text style={typo.texteGras} accessibilityLabel={`Calcul ${numero + 1} sur ${questions.length}`}>
          {numero + 1}/{questions.length}
        </Text>
      </View>
      {avecMinuteur ? (
        <View
          style={styles.barreFond}
          accessible
          accessibilityLabel={`${DELAI_TABLES_SECONDES} secondes pour répondre`}
        >
          <Animated.View style={[styles.barre, styleBarre]} />
        </View>
      ) : null}

      <View style={styles.carteCalcul} accessibilityLiveRegion="polite">
        <Text style={styles.calcul} accessibilityLabel={`${question.a} fois ${question.b}`}>
          {question.a} × {question.b} ={' '}
        </Text>
        <View style={[styles.caseReponse, { backgroundColor: couleurCase }]}>
          <Text style={[styles.calcul, saisie === '' && !corrigee && { color: couleurs.gris[300] }]}>{texteCase}</Text>
        </View>
      </View>
      <Text style={[typo.texteGras, styles.centre, styles.retour]} accessibilityLiveRegion="polite">
        {corrigee
          ? corrigee.juste
            ? 'Bravo !'
            : corrigee.donnee === null
              ? `Temps écoulé : ${question.a} × ${question.b} = ${resultat(question)}`
              : `Presque ! ${question.a} × ${question.b} = ${resultat(question)}`
          : ' '}
      </Text>

      <View style={styles.clavier}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((c) => (
          <Pressable
            key={c}
            onPress={() => ecrire(c)}
            accessibilityRole="button"
            accessibilityLabel={`Écrire ${c}`}
            style={({ pressed }) => [...toucheStyle, pressed && styles.toucheAppuyee]}
          >
            <Text style={styles.chiffre}>{c}</Text>
          </Pressable>
        ))}
        <Pressable
          onPress={effacer}
          accessibilityRole="button"
          accessibilityLabel="Effacer un chiffre"
          style={({ pressed }) => [...toucheStyle, pressed && styles.toucheAppuyee]}
        >
          <Text style={typo.texteGras}>Effacer</Text>
        </Pressable>
        <Pressable
          onPress={() => ecrire('0')}
          accessibilityRole="button"
          accessibilityLabel="Écrire 0"
          style={({ pressed }) => [...toucheStyle, pressed && styles.toucheAppuyee]}
        >
          <Text style={styles.chiffre}>0</Text>
        </Pressable>
        <Pressable
          onPress={valider}
          disabled={saisie === '' || corrigee !== null}
          accessibilityRole="button"
          accessibilityLabel="Valider ma réponse"
          style={({ pressed }) => [
            ...toucheStyle,
            styles.toucheValider,
            (saisie === '' || corrigee !== null) && styles.toucheInactive,
            pressed && styles.toucheAppuyee,
          ]}
        >
          <Text style={[typo.texteGras, { color: couleurs.blanc }]}>OK</Text>
        </Pressable>
      </View>
    </Ecran>
  );
}

export default avecReglagesEnfant(Tables);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centre: { textAlign: 'center' },
  boutons: { gap: espaces.m },
  reglage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.m,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    paddingHorizontal: espaces.l,
    paddingVertical: espaces.s,
  },
  grilleTables: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.m },
  tuileTable: { flexBasis: '28%', flexGrow: 1 },
  tuileTableFace: { alignItems: 'center', justifyContent: 'center', paddingVertical: espaces.s },
  nombreTable: { fontFamily: polices.fredokaGras, fontSize: 28, lineHeight: 34, color: couleurs.sarcelle[900] },
  fin: { alignItems: 'center', gap: espaces.s, paddingTop: espaces.l },
  grandNombre: { fontSize: 64, lineHeight: 72, color: couleurs.sarcelle[900] },
  carteErreurs: {
    gap: espaces.s,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
  },
  ligneErreur: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: espaces.m },
  calculErreur: { color: couleurs.sarcelle[900] },
  entete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  barreFond: { height: 14, borderRadius: 7, backgroundColor: couleurs.gris[200], overflow: 'hidden' },
  barre: { height: '100%', borderRadius: 7, backgroundColor: couleurs.sarcelle[400] },
  carteCalcul: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    paddingVertical: espaces.xl,
    paddingHorizontal: espaces.m,
  },
  calcul: { fontFamily: polices.fredokaGras, fontSize: 44, lineHeight: 54, color: couleurs.encre },
  caseReponse: {
    minWidth: 96,
    alignItems: 'center',
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.tuile.rayon,
    paddingHorizontal: espaces.s,
  },
  retour: { minHeight: 28 },
  clavier: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: espaces.s,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
  },
  touche: {
    flexBasis: '30%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.tuile.rayon,
  },
  toucheValider: { backgroundColor: couleurs.sarcelle[700], borderColor: couleurs.sarcelle[900] },
  toucheInactive: { opacity: 0.45 },
  toucheAppuyee: { opacity: 0.7 },
  chiffre: { fontFamily: polices.fredokaGras, fontSize: 28, lineHeight: 34, color: couleurs.encre },
});
