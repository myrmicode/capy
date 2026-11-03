import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { nouvelObjet } from '@/collection/objets';
import { adapterExercice, DOMAINES_SANS_TABLE, nombreDeQuestions } from '@/accessibilite/adaptation';
import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { ContexteExplications, type Explications } from '@/accessibilite/explications';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import {
  AideNombres,
  BarreProgression,
  BulleCapy,
  Bouton,
  CapyAnime,
  Ecran,
  IconeAmpoule,
  IconeCroix,
  IconeEtoile,
  IconeHautParleur,
  PanneauRetour,
  PoserCalcul,
  SchemaBarres,
  TableConsultable,
} from '@/composants';
import { THEMES, trouverEtape } from '@/config/parcours';
import { MOTS_EXPLIQUES } from '@/contenu/motsExpliques';
import type { ExerciceQuelconque } from '@/exercices';
import { poseDonnee } from '@/exercices/pose';
import { schemaDe } from '@/exercices/schemas';
import { COMPOSANTS_JEUX, JEUX, type JeuId } from '@/jeux';
import { consigneDe, type DefinitionJeu } from '@/jeux/registre';
import { arreterLecture, celebrer, feliciter, lireAVoixHaute } from '@/jeux/retours';
import { PHRASES_CAPY, phraseDe } from '@/contenu/phrasesCapy';
import { aideApresErreur, ESSAIS_AVANT_CHOIX_REDUITS } from '@/parcours/aide';
import { avancement, derouler, etatInitial, pauseDue, resteEnMots } from '@/parcours/deroulement';
import { genererEtape } from '@/parcours/etape';
import { niveauPourDomaine } from '@/parcours/niveau';
import { dateLocale, defiFait, etoilesPour, graineDePartie, mediane } from '@/parcours/progression';
import { revisionsDues } from '@/parcours/revision';
import { genererDefi, QUESTIONS_DEFI } from '@/parcours/defi';
import { serieEntrainement, themeEnEntrainement, themeEstPropose } from '@/parcours/selection';
import { themesSurprise } from '@/parcours/surprise';
import { useProfilActif, useProfils } from '@/store/profils';
import { couleurs, espaces, formes } from '@/theme';

/** Jeux où l'on glisse le doigt : l'écran ne défile pas pendant la question. */
const JEUX_A_GLISSER: readonly JeuId[] = ['marche', 'bonFil', 'funambule'];
/** Jeux qui gardent leur état quand l'enfant réessaie (il ajuste au lieu de tout refaire). */
const JEUX_QUI_GARDENT_LEUR_ETAT: readonly JeuId[] = ['marche', 'funambule', 'dictee', 'ordre', 'caisse', 'horloge'];
/** Jeux où les aides visuelles de calcul n'ont pas de sens (le fil gradué est déjà une aide). */
const JEUX_SANS_AIDE_NOMBRES: readonly JeuId[] = ['funambule', 'horloge'];

/**
 * Domaines où l'on peut poser le calcul en colonnes (jamais en calcul mental ni
 * dans les tables : c'est la mémoire des résultats qu'ils travaillent).
 */
const DOMAINES_A_POSER: readonly string[] = ['resoudre-problemes', 'poser-calculer'];
/** Jeux où le brouillon a du sens : on y donne un nombre (pas dans le bon fil, où l'on choisit l'opération). */
const JEUX_A_POSER: readonly JeuId[] = ['reponses', 'lucioles'];

/** Jeux où Capy peut enlever des réponses après plusieurs essais (voir parcours/aide.ts). */
const JEUX_A_CHOIX_REDUCTIBLES: readonly JeuId[] = ['reponses', 'lucioles', 'questionPerdue'];

/** Nombre de réponses que montre le mini-jeu. */
function nombreDePropositions(ex: ExerciceQuelconque, jeu: JeuId): number {
  return jeu === 'questionPerdue' && ex.nature === 'nombre' ? (ex.questionsAuChoix?.length ?? 0) : ex.choix.length;
}

/** Au-delà, on considère que l'enfant a fait une pause : le temps n'est pas compté. */
const DUREE_MAX_SECONDES = 30 * 60;
/** Au-delà, une réponse ne dit plus rien de la vitesse (l'enfant a levé les yeux). */
const TEMPS_REPONSE_MAX_SECONDES = 120;

/**
 * Ce que Capy lit pour une question : la consigne, puis l'énoncé et la question.
 * La question perdue lit les trois questions ; la dictée dit le mot ; en
 * compréhension de lecture, l'enfant lit le texte seul.
 */
export function textesALire(jeuId: JeuId, consigne: string, ex: ExerciceQuelconque): string[] {
  if (ex.nature === 'nombre' && ex.questionsAuChoix && jeuId === 'questionPerdue') {
    return [consigne, ex.enonce, ...ex.questionsAuChoix];
  }
  if (ex.lecture) return [consigne, ex.lecture];
  if (ex.nature === 'texte' && ex.lectureAutonome) return [consigne, ex.question];
  return [consigne, ex.enonce, ex.question];
}

/** Une étape du parcours : quelques questions qui mélangent les mini-jeux. */
function EcranEtape() {
  const profil = useProfilActif();
  const enregistrerEtape = useProfils((e) => e.enregistrerEtape);
  const enregistrerEntrainement = useProfils((e) => e.enregistrerEntrainement);
  const noterRevisions = useProfils((e) => e.noterRevisions);
  const enregistrerDefi = useProfils((e) => e.enregistrerDefi);
  // Une étape du parcours, une série d'entraînement libre sur un thème déjà à +++, le défi du jour,
  // ou une série « thème surprise » proposée après un coffre (enregistrée comme un entraînement).
  const {
    etape: idEtape,
    entrainement: idTheme,
    defi,
    surprise,
  } = useLocalSearchParams<{ etape?: string; entrainement?: string; defi?: string; surprise?: string }>();
  const enEntrainement = idTheme !== undefined;
  const enDefi = defi !== undefined;
  const enSurprise = enEntrainement && surprise !== undefined;
  const trouvee = useMemo(() => {
    if (idTheme === undefined) return trouverEtape(idEtape ?? '');
    const theme = THEMES.find((t) => t.id === idTheme);
    return theme ? { theme, unite: theme.unites[0], etape: serieEntrainement(theme) } : undefined;
  }, [idEtape, idTheme]);
  const etapeId = trouvee?.etape.id ?? '';
  const domaine = trouvee?.theme.domaine;
  const theme = useThemeEnfant();
  const { reglages, typo } = theme;

  // Chaque partie (et chaque « Rejouer ») tire de nouveaux exercices, de façon reproductible.
  const [foisAuDepart] = useState(() =>
    idTheme !== undefined
      ? (profil?.progression.entrainement?.[idTheme]?.series ?? 0)
      : (profil?.progression.etapes[etapeId]?.fois ?? 0),
  );
  const [partie, setPartie] = useState(0);
  const [debut, setDebut] = useState(() => Date.now());
  // La progression au début de la partie : à la fin, on voit si un trésor est tombé (après un défi).
  const [progressionAuDepart, setProgressionAuDepart] = useState(() => profil?.progression);
  // Niveau des exercices : celui de l'enfant sur cette compétence, recalculé à chaque partie.
  const [niveauEtape, setNiveauEtape] = useState(() => (domaine ? niveauPourDomaine(profil?.toile, domaine) : 1));
  const graine = profil ? graineDePartie(profil.id, etapeId, foisAuDepart + partie) : 0;
  // Petit rappel d'une question difficile d'un jour précédent, figé pour toute la partie.
  const revisionDuJour = () =>
    domaine ? revisionsDues(profil?.progression.aRevoir, domaine, dateLocale(new Date()))[0] : undefined;
  const [revision, setRevision] = useState(revisionDuJour);
  const classe = profil?.classe;
  const nbQuestions = trouvee ? nombreDeQuestions(trouvee.etape.nombreQuestions, reglages) : 0;

  // Le défi du jour dépend de la progression : il est figé pour toute la partie.
  const defiDuJour = (n: number) =>
    profil
      ? genererDefi({
          classe: profil.classe,
          toile: profil.toile,
          progression: profil.progression,
          profilId: profil.id,
          jour: dateLocale(new Date()),
          partie: n + (defiFait(profil.progression, dateLocale(new Date())) ? 1 : 0),
          nombreQuestions: nombreDeQuestions(QUESTIONS_DEFI, reglages),
        })
      : [];
  const [questionsDefi, setQuestionsDefi] = useState(() => (enDefi ? defiDuJour(0) : []));

  const questionsEtape = useMemo(
    () =>
      classe && trouvee
        ? genererEtape({
            classe,
            domaine: trouvee.theme.domaine,
            graine,
            ...trouvee.etape,
            nombreQuestions: nbQuestions,
            niveau: niveauEtape,
            revision,
          })
        : [],
    [classe, trouvee, graine, niveauEtape, nbQuestions, revision],
  );
  const questions = enDefi ? questionsDefi : questionsEtape;
  const [etat, envoyer] = useReducer(derouler, questions.length, etatInitial);
  // Numéro de la question dont l'indice est ouvert : il se referme tout seul à la question suivante.
  const [indiceOuvert, setIndiceOuvert] = useState<number | null>(null);
  const indiceVisible = indiceOuvert === etat.index;
  // « Une seule chose à la fois » : la consigne d'abord, seule à l'écran.
  const [consigneVue, setConsigneVue] = useState<number | null>(null);
  const [tableOuverte, setTableOuverte] = useState(false);
  const [schemaOuvert, setSchemaOuvert] = useState<number | null>(null);
  // Question dont on a ouvert (ou fermé, en « Poser et calculer ») le brouillon.
  const [poseBasculee, setPoseBasculee] = useState<number | null>(null);
  // Temps des réponses justes du premier coup : il montre aux parents ce qui devient automatique.
  const debutQuestion = useRef(0);
  const tempsReponses = useRef<number[]>([]);
  const [explication, setExplication] = useState<{
    mot: string;
    texte: string;
    question: number;
  } | null>(null);
  // Pause proposée par Capy (réglage en minutes).
  const [depuisPause, setDepuisPause] = useState(() => Date.now());
  const [pauseProposee, setPauseProposee] = useState(false);

  const question = questions[etat.index];
  const jeu: DefinitionJeu | undefined = question ? JEUX[question.jeu] : undefined;
  // Après plusieurs essais, Capy peut ne garder que deux réponses.
  const peutReduire = useMemo(() => {
    if (!question || !JEUX_A_CHOIX_REDUCTIBLES.includes(question.jeu)) return false;
    const tous = adapterExercice(question.exercice, reglages, question.jeu);
    const deux = adapterExercice(question.exercice, { ...reglages, nombreChoix: 2 }, question.jeu);
    return nombreDePropositions(deux, question.jeu) < nombreDePropositions(tous, question.jeu);
  }, [question, reglages]);
  const choixReduits = peutReduire && etat.essaisRates >= ESSAIS_AVANT_CHOIX_REDUITS;
  const exercice = useMemo(
    () =>
      question
        ? adapterExercice(question.exercice, choixReduits ? { ...reglages, nombreChoix: 2 } : reglages, question.jeu)
        : undefined,
    [question, reglages, choixReduits],
  );
  const consigne = jeu ? consigneDe(jeu, reglages) : '';
  const enConsigne = reglages.uneChoseALaFois && consigneVue !== etat.index && etat.phase === 'question';
  const lire = (textes: string[]) => lireAVoixHaute(textes, { lente: reglages.lectureLente });

  useEffect(() => {
    if (etat.phase === 'bravo') feliciter({ silencieux: theme.animationsReduites });
    if (etat.phase === 'terminee') celebrer('fin', { silencieux: theme.animationsReduites });
  }, [etat.phase, theme.animationsReduites]);

  // Le résultat est enregistré une seule fois par partie.
  const partieEnregistree = useRef(-1);
  useEffect(() => {
    if (etat.phase !== 'terminee' || !profil || partieEnregistree.current === partie) return;
    if (!domaine && !enDefi) return;
    partieEnregistree.current = partie;
    const dureeSecondes = Math.min(DUREE_MAX_SECONDES, (Date.now() - debut) / 1000);
    noterRevisions(
      profil.id,
      questions.map((q, i) => ({
        modeleId: q.exercice.modeleId,
        jeu: q.jeu,
        domaine: q.exercice.domaine,
        niveau: q.exercice.niveau,
        rate: etat.aRevoir.includes(i),
        revision: q.revision === true,
      })),
    );
    if (enDefi || !domaine) {
      enregistrerDefi(profil.id, {
        reussiesPremierCoup: etat.reussiesPremierCoup,
        nombreQuestions: etat.nombreQuestions,
        dureeSecondes,
      });
      return;
    }
    const resultat = {
      domaine,
      reussiesPremierCoup: etat.reussiesPremierCoup,
      nombreQuestions: etat.nombreQuestions,
      dureeSecondes,
      // Une seule réponse ne suffit pas pour parler de vitesse.
      ...(tempsReponses.current.length >= 2 ? { tempsReponse: mediane(tempsReponses.current) } : {}),
    };
    if (idTheme !== undefined) enregistrerEntrainement(profil.id, idTheme, resultat);
    else enregistrerEtape(profil.id, etapeId, resultat);
  }, [
    etat,
    profil,
    partie,
    etapeId,
    idTheme,
    debut,
    domaine,
    enDefi,
    questions,
    enregistrerDefi,
    enregistrerEtape,
    enregistrerEntrainement,
    noterRevisions,
  ]);

  // On coupe la voix en changeant de question ou en quittant l'étape. Avec la
  // lecture automatique, Capy lit ensuite la nouvelle question.
  const lectureAuto = reglages.lectureAuto;
  const lente = reglages.lectureLente;
  const aLireAuto =
    jeu && exercice && !enConsigne && etat.phase === 'question' ? textesALire(jeu.id, consigne, exercice) : null;
  const cleLecture = aLireAuto ? `${etat.index}|${aLireAuto.join('|')}` : null;
  useEffect(() => {
    arreterLecture();
    if (!lectureAuto || !cleLecture || etat.essaisRates > 0) return;
    const minuteur = setTimeout(() => lireAVoixHaute(cleLecture.split('|').slice(1), { lente }), 400);
    return () => clearTimeout(minuteur);
  }, [cleLecture, lectureAuto, lente, etat.essaisRates]);
  useEffect(() => arreterLecture, []);

  // Le chrono de la question part quand elle s'affiche (après la consigne seule, si elle est demandée).
  useEffect(() => {
    if (!enConsigne) debutQuestion.current = Date.now();
  }, [etat.index, enConsigne, partie]);

  const explications = useMemo<Explications | null>(
    () =>
      exercice?.nature === 'nombre'
        ? {
            mots: MOTS_EXPLIQUES,
            onExpliquer: (mot, texte) => {
              setExplication({ mot, texte, question: etat.index });
              lireAVoixHaute(texte, { lente });
            },
          }
        : null,
    [exercice?.nature, etat.index, lente],
  );

  if (!profil) return <Redirect href="/" />;
  // Aucun exercice sans le résultat de la toile : seuls les thèmes proposés s'ouvrent.
  const ouvert = trouvee
    ? enSurprise
      ? themesSurprise(profil.classe, profil.toile).some((t) => t.id === trouvee.theme.id)
      : enEntrainement
        ? themeEnEntrainement(profil.classe, profil.toile, trouvee.theme.id)
        : themeEstPropose(profil.classe, profil.toile, trouvee.theme.id)
    : true;
  if (!ouvert) return <Redirect href="/enfant" />;

  if (questions.length === 0 || !jeu || !exercice || !question) {
    if (etat.phase !== 'terminee' && enDefi) return <Redirect href="/enfant" />;
    if (etat.phase !== 'terminee') {
      return (
        <Ecran pied={<Bouton titre="Retour" variante="secondaire" onPress={() => router.back()} />}>
          <BulleCapy
            pose="ralentir"
            texte="Ces exercices arrivent bientôt dans Capy. Choisis un autre thème en attendant."
          />
        </Ecran>
      );
    }
  }

  if (etat.phase === 'terminee') {
    const etoiles = etoilesPour(etat.reussiesPremierCoup, etat.nombreQuestions);
    const tresorDefi = enDefi && progressionAuDepart ? nouvelObjet(progressionAuDepart, profil.progression) : null;
    const rejouer = () => {
      setPartie((n) => n + 1);
      if (enDefi) setQuestionsDefi(defiDuJour(partie + 1));
      setProgressionAuDepart(profil.progression);
      if (domaine) setNiveauEtape(niveauPourDomaine(profil.toile, domaine));
      setRevision(revisionDuJour());
      setDebut(Date.now());
      tempsReponses.current = [];
      envoyer({ type: 'recommencer' });
    };
    return (
      <Ecran
        pied={
          <View style={styles.boutonsFin}>
            <Bouton titre="Retour au parcours" onPress={() => router.back()} />
            <Bouton
              titre={enDefi ? 'Un autre défi' : enEntrainement ? 'Une autre série' : 'Rejouer l’étape'}
              variante="secondaire"
              onPress={rejouer}
            />
          </View>
        }
      >
        <View style={styles.fin}>
          <CapyAnime pose="bravo" taille={200} />
          <Text style={[typo.titre1, styles.centre]}>
            {enDefi
              ? 'Défi du jour réussi !'
              : enSurprise
                ? 'Surprise réussie !'
                : enEntrainement
                  ? 'Série terminée !'
                  : 'Étape terminée !'}
          </Text>
          <View
            style={styles.etoiles}
            accessible
            accessibilityLabel={`${etoiles} étoile${etoiles > 1 ? 's' : ''} gagnée${etoiles > 1 ? 's' : ''}`}
          >
            {[1, 2, 3].map((n) => (
              <IconeEtoile key={n} taille={56} couleur={n <= etoiles ? couleurs.jaune[400] : couleurs.gris[200]} />
            ))}
          </View>
          {theme.manuscritVisible ? (
            <Text style={[typo.manuscrit, styles.centre]}>{phraseDe(PHRASES_CAPY.finEtape, graine + partie)}</Text>
          ) : null}
          <Text style={[typo.enonce, styles.centre]}>
            {enDefi
              ? `Bravo ${profil.prenom} ! Reviens demain : Capy te prépare un nouveau défi.${
                  tresorDefi ? ` Et un trésor pour Capy : ${tresorDefi.nom}. Va le voir dans « Trésors » !` : ''
                }`
              : enSurprise
                ? `Bravo ${profil.prenom}, tu as découvert « ${trouvee!.theme.titre} ». Tu le retrouveras dans le carnet de Capy.`
                : enEntrainement
                  ? `Bravo ${profil.prenom}, tes étoiles s’ajoutent à ton trésor. Tu peux faire une autre série quand tu veux.`
                  : `Bravo ${profil.prenom}, tu as fini « ${trouvee!.etape.titre} ».`}
          </Text>
        </View>
      </Ecran>
    );
  }

  // Le garde ci-dessus assure que la question existe ici.
  const q = question!;
  const ex = exercice!;
  const definition = jeu!;
  const Jeu = COMPOSANTS_JEUX[q.jeu];
  const indice = (reglages.falc ? definition.indiceFacile : undefined) ?? definition.indice ?? ex.indice;

  if (pauseProposee) {
    return (
      <Ecran
        pied={
          <View style={styles.boutonsFin}>
            <Bouton
              titre="Continuer"
              onPress={() => {
                setDepuisPause(Date.now());
                setPauseProposee(false);
              }}
            />
            <Bouton titre="Faire une pause" variante="secondaire" onPress={() => router.back()} />
          </View>
        }
      >
        <BulleCapy pose="ralentir" texte="Tu travailles bien ! Et si on faisait une petite pause ?" />
      </Ecran>
    );
  }

  const continuer = () => {
    envoyer({ type: 'continuer' });
    if (pauseDue(depuisPause, Date.now(), reglages.pause) && etat.index + 1 < etat.nombreQuestions)
      setPauseProposee(true);
  };

  let pied = null;
  if (etat.phase === 'bravo') {
    pied = (
      <PanneauRetour
        type="bravo"
        titre={phraseDe(PHRASES_CAPY.bravo, graine + etat.index)}
        explication={ex.explication}
        onContinuer={continuer}
      />
    );
  } else if (etat.phase === 'presque') {
    const aide = aideApresErreur(etat.essaisRates, {
      indice,
      explication: ex.explication,
      peutReduire,
      question: ex.question,
    });
    pied = (
      <PanneauRetour
        type="presque"
        titre={phraseDe(PHRASES_CAPY.presque, graine + etat.index + etat.essaisRates)}
        indice={aide.indice}
        choixReduits={aide.choixReduits}
        methode={aide.methode}
        onContinuer={() => envoyer({ type: 'reessayer' })}
      />
    );
  }

  const entete = (
    <View style={styles.entete}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Quitter l’étape"
        hitSlop={8}
        style={[styles.quitter, { width: theme.cible, height: theme.cible }]}
      >
        <IconeCroix taille={28} couleur={couleurs.encreDouce} />
      </Pressable>
      <View style={styles.flex}>
        <View style={styles.ligneBarre}>
          <BarreProgression valeur={avancement(etat)} />
        </View>
        <Text style={[typo.petit, styles.reste]}>{resteEnMots(etat)}</Text>
      </View>
    </View>
  );

  if (enConsigne) {
    return (
      <Ecran pied={<Bouton titre="C’est parti" onPress={() => setConsigneVue(etat.index)} />}>
        {entete}
        <BulleCapy pose="capy" texte={consigne} coloration motsCles />
        <Bouton
          titre="Écouter"
          variante="secondaire"
          icone={(c) => <IconeHautParleur taille={22} couleur={c} />}
          onPress={() => lire([consigne])}
        />
      </Ecran>
    );
  }

  const montrerTable = reglages.tableConsultable && ex.nature === 'nombre' && !DOMAINES_SANS_TABLE.includes(ex.domaine);
  // Le schéma en barres de l'histoire, à la demande ; pas quand c'est la question (« Le bon schéma »), ni quand on
  // cherche la bonne question (le schéma la donnerait).
  const schema = ex.nature === 'nombre' && q.jeu !== 'schema' && q.jeu !== 'questionPerdue' ? schemaDe(ex) : null;
  // Le brouillon pour poser le calcul : à la demande dans les problèmes, ouvert d'office en « Poser et calculer ».
  const peutPoser = ex.nature === 'nombre' && DOMAINES_A_POSER.includes(ex.domaine) && JEUX_A_POSER.includes(q.jeu);
  const poseParDefaut = ex.domaine === 'poser-calculer';
  const poseOuverte = peutPoser && poseParDefaut !== (poseBasculee === etat.index);
  // Dans le défi du jour, chaque question a sa compétence, donc son niveau.
  const niveauDeReference = enDefi ? niveauPourDomaine(profil.toile, ex.domaine) : niveauEtape;
  const nombresAide =
    reglages.aidesVisuelles && ex.nature === 'nombre' && !JEUX_SANS_AIDE_NOMBRES.includes(q.jeu)
      ? Object.values(ex.donnees)
      : [];
  // « Une seule chose à la fois » : rien d'autre que le retour pendant Bravo / Presque.
  const calme = reglages.uneChoseALaFois;

  return (
    <ContexteExplications.Provider value={explications}>
      <Ecran
        pied={pied}
        defilementActif={!JEUX_A_GLISSER.includes(q.jeu) || etat.phase !== 'question' || reglages.toucherPuisToucher}
      >
        {entete}

        {/* Le titre a sa propre ligne : en très grand texte, il ne se coupe jamais au milieu d'un mot. */}
        <Text style={typo.titre3}>{definition.titre}</Text>
        <View style={styles.outils}>
          {q.revision ? (
            <View style={styles.rappel} accessible accessibilityLabel="Petit rappel">
              <Text style={[typo.petit, styles.texteRappel]}>Petit rappel</Text>
            </View>
          ) : null}
          {ex.niveau > niveauDeReference ? (
            <View style={styles.defi} accessible accessibilityLabel="Question défi">
              <Text style={[typo.petit, styles.texteDefi]}>Question défi</Text>
            </View>
          ) : null}
          <Bouton
            titre="Écouter"
            variante="secondaire"
            pleineLargeur={false}
            icone={(c) => <IconeHautParleur taille={22} couleur={c} />}
            onPress={() => lire(textesALire(q.jeu, consigne, ex))}
          />
          <Bouton
            titre="Indice"
            variante="secondaire"
            pleineLargeur={false}
            icone={(c) => <IconeAmpoule taille={22} couleur={c} />}
            onPress={() => setIndiceOuvert(indiceVisible ? null : etat.index)}
          />
          {peutPoser ? (
            <Bouton
              titre={poseOuverte ? 'Fermer le brouillon' : 'Poser'}
              variante="secondaire"
              pleineLargeur={false}
              onPress={() => setPoseBasculee(poseBasculee === etat.index ? null : etat.index)}
            />
          ) : null}
          {schema ? (
            <Bouton
              titre="Schéma"
              variante="secondaire"
              pleineLargeur={false}
              onPress={() => setSchemaOuvert(schemaOuvert === etat.index ? null : etat.index)}
            />
          ) : null}
          {montrerTable ? (
            <Bouton
              titre="Table"
              variante="secondaire"
              pleineLargeur={false}
              onPress={() => setTableOuverte((o) => !o)}
            />
          ) : null}
        </View>

        {!calme || etat.phase === 'question' ? (
          // Toucher la consigne la fait relire par Capy.
          <Pressable
            onPress={() => lire([consigne])}
            accessibilityRole="button"
            accessibilityHint="Capy lit la consigne"
          >
            <TexteAccessible texte={consigne} variante="texte" coloration motsCles />
          </Pressable>
        ) : null}
        {indiceVisible ? <BulleCapy pose="reflechi" tailleCapy={72} texte={indice} coloration /> : null}
        {explication && explication.question === etat.index ? (
          <BulleCapy pose="capy" tailleCapy={72} texte={`« ${explication.mot} » : ${explication.texte}`} />
        ) : null}
        {montrerTable && tableOuverte ? <TableConsultable /> : null}
        {poseOuverte && ex.nature === 'nombre' ? (
          <PoserCalcul
            key={etat.index}
            donnee={poseDonnee(ex)}
            // En « Poser et calculer », le calcul est la question : les tuiles de réponse servent de vérification.
            verification={!poseParDefaut}
          />
        ) : null}
        {schema && schemaOuvert === etat.index ? (
          <View style={styles.schema}>
            <TexteAccessible
              texte="Le schéma de l’histoire. Le point d’interrogation, c’est ce qu’on cherche."
              variante="petit"
            />
            <SchemaBarres schema={schema} />
          </View>
        ) : null}
        {nombresAide.length > 0 ? <AideNombres nombres={nombresAide} /> : null}

        {/* La clé remet le mini-jeu à zéro pour chaque question, et pour chaque nouvel essai du bon fil. */}
        <Jeu
          key={`${etat.index}-${JEUX_QUI_GARDENT_LEUR_ETAT.includes(q.jeu) ? 0 : etat.essaisRates}`}
          exercice={ex}
          actif={etat.phase === 'question'}
          onRepondre={(juste) => {
            if (juste && etat.essaisRates === 0)
              tempsReponses.current.push(
                Math.min(TEMPS_REPONSE_MAX_SECONDES, (Date.now() - debutQuestion.current) / 1000),
              );
            envoyer({ type: 'repondre', juste });
          }}
        />
      </Ecran>
    </ContexteExplications.Provider>
  );
}

export default avecReglagesEnfant(EcranEtape);

const styles = StyleSheet.create({
  entete: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  quitter: { alignItems: 'center', justifyContent: 'center' },
  reste: { marginTop: espaces.xs },
  outils: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.s,
    flexWrap: 'wrap',
  },
  defi: {
    backgroundColor: couleurs.jaune[400],
    borderRadius: formes.pilule,
    paddingHorizontal: espaces.m,
    paddingVertical: espaces.xs,
  },
  texteDefi: { color: couleurs.jaune.texte },
  rappel: {
    backgroundColor: couleurs.menthe[100],
    borderRadius: formes.pilule,
    paddingHorizontal: espaces.m,
    paddingVertical: espaces.xs,
  },
  texteRappel: { color: couleurs.sarcelle[900] },
  ligneBarre: { flexDirection: 'row' },
  flex: { flex: 1 },
  fin: { alignItems: 'center', gap: espaces.m, paddingTop: espaces.xxl },
  centre: { textAlign: 'center' },
  boutonsFin: { gap: espaces.m },
  etoiles: { flexDirection: 'row', gap: espaces.s },
  schema: {
    gap: espaces.s,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.m,
  },
});
