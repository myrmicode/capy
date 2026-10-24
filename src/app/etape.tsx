import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { adapterExercice, DOMAINES_SANS_TABLE, nombreDeQuestions } from '@/accessibilite/adaptation';
import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { ContexteExplications, type Explications } from '@/accessibilite/explications';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import {
  AideNombres,
  BarreProgression,
  BulleCapy,
  Bouton,
  Ecran,
  IconeAmpoule,
  IconeCroix,
  IconeEtoile,
  IconeHautParleur,
  PanneauRetour,
  TableConsultable,
} from '@/composants';
import { THEMES, trouverEtape } from '@/config/parcours';
import { MOTS_EXPLIQUES } from '@/contenu/motsExpliques';
import type { ExerciceQuelconque } from '@/exercices';
import { COMPOSANTS_JEUX, JEUX, type JeuId } from '@/jeux';
import { consigneDe, type DefinitionJeu } from '@/jeux/registre';
import { arreterLecture, feliciter, lireAVoixHaute } from '@/jeux/retours';
import { mascotte } from '@/mascotte';
import { avancement, derouler, etatInitial, pauseDue, resteEnMots } from '@/parcours/deroulement';
import { genererEtape } from '@/parcours/etape';
import { niveauPourDomaine } from '@/parcours/niveau';
import { etoilesPour, graineDePartie } from '@/parcours/progression';
import { serieEntrainement, themeEnEntrainement, themeEstPropose } from '@/parcours/selection';
import { useProfilActif, useProfils } from '@/store/profils';
import { couleurs, espaces, formes } from '@/theme';

/** Jeux où l'on glisse le doigt : l'écran ne défile pas pendant la question. */
const JEUX_A_GLISSER: readonly JeuId[] = ['marche', 'bonFil', 'funambule'];
/** Jeux qui gardent leur état quand l'enfant réessaie (il ajuste au lieu de tout refaire). */
const JEUX_QUI_GARDENT_LEUR_ETAT: readonly JeuId[] = ['marche', 'funambule', 'dictee'];
/** Jeux où les aides visuelles de calcul n'ont pas de sens (le fil gradué est déjà une aide). */
const JEUX_SANS_AIDE_NOMBRES: readonly JeuId[] = ['funambule'];

/** Au-delà, on considère que l'enfant a fait une pause : le temps n'est pas compté. */
const DUREE_MAX_SECONDES = 30 * 60;

/**
 * Ce que Capy lit pour une question : la consigne, puis l'énoncé et la question.
 * La question perdue lit les trois questions ; la dictée dit le mot ; en
 * compréhension de lecture, l'enfant lit le texte seul.
 */
export function textesALire(jeuId: JeuId, consigne: string, ex: ExerciceQuelconque): string[] {
  if (ex.nature === 'nombre' && ex.questionsAuChoix && jeuId === 'questionPerdue') {
    return [consigne, ex.enonce, ...ex.questionsAuChoix];
  }
  if (ex.nature === 'texte' && ex.lecture) return [consigne, ex.lecture];
  if (ex.nature === 'texte' && ex.lectureAutonome) return [consigne, ex.question];
  return [consigne, ex.enonce, ex.question];
}

/** Une étape du parcours : quelques questions qui mélangent les mini-jeux. */
function EcranEtape() {
  const profil = useProfilActif();
  const enregistrerEtape = useProfils((e) => e.enregistrerEtape);
  const enregistrerEntrainement = useProfils((e) => e.enregistrerEntrainement);
  // Une étape du parcours, ou une série d'entraînement libre sur un thème déjà à +++.
  const { etape: idEtape, entrainement: idTheme } = useLocalSearchParams<{ etape?: string; entrainement?: string }>();
  const enEntrainement = idTheme !== undefined;
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
  // Niveau des exercices : celui de l'enfant sur cette compétence, recalculé à chaque partie.
  const [niveauEtape, setNiveauEtape] = useState(() => (domaine ? niveauPourDomaine(profil?.toile, domaine) : 1));
  const graine = profil ? graineDePartie(profil.id, etapeId, foisAuDepart + partie) : 0;
  const classe = profil?.classe;
  const nbQuestions = trouvee ? nombreDeQuestions(trouvee.etape.nombreQuestions, reglages) : 0;

  const questions = useMemo(
    () =>
      classe && trouvee
        ? genererEtape({
            classe,
            domaine: trouvee.theme.domaine,
            graine,
            ...trouvee.etape,
            nombreQuestions: nbQuestions,
            niveau: niveauEtape,
          })
        : [],
    [classe, trouvee, graine, niveauEtape, nbQuestions],
  );
  const [etat, envoyer] = useReducer(derouler, questions.length, etatInitial);
  // Numéro de la question dont l'indice est ouvert : il se referme tout seul à la question suivante.
  const [indiceOuvert, setIndiceOuvert] = useState<number | null>(null);
  const indiceVisible = indiceOuvert === etat.index;
  // « Une seule chose à la fois » : la consigne d'abord, seule à l'écran.
  const [consigneVue, setConsigneVue] = useState<number | null>(null);
  const [tableOuverte, setTableOuverte] = useState(false);
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
  const exercice = useMemo(
    () => (question ? adapterExercice(question.exercice, reglages, question.jeu) : undefined),
    [question, reglages],
  );
  const consigne = jeu ? consigneDe(jeu, reglages) : '';
  const enConsigne = reglages.uneChoseALaFois && consigneVue !== etat.index && etat.phase === 'question';
  const lire = (textes: string[]) => lireAVoixHaute(textes, { lente: reglages.lectureLente });

  useEffect(() => {
    if (etat.phase === 'bravo') feliciter({ silencieux: theme.animationsReduites });
  }, [etat.phase, theme.animationsReduites]);

  // Le résultat est enregistré une seule fois par partie.
  const partieEnregistree = useRef(-1);
  useEffect(() => {
    if (etat.phase !== 'terminee' || !profil || !domaine || partieEnregistree.current === partie) return;
    partieEnregistree.current = partie;
    const resultat = {
      domaine,
      reussiesPremierCoup: etat.reussiesPremierCoup,
      nombreQuestions: etat.nombreQuestions,
      dureeSecondes: Math.min(DUREE_MAX_SECONDES, (Date.now() - debut) / 1000),
    };
    if (idTheme !== undefined) enregistrerEntrainement(profil.id, idTheme, resultat);
    else enregistrerEtape(profil.id, etapeId, resultat);
  }, [etat, profil, partie, etapeId, idTheme, debut, domaine, enregistrerEtape, enregistrerEntrainement]);

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
    ? enEntrainement
      ? themeEnEntrainement(profil.classe, profil.toile, trouvee.theme.id)
      : themeEstPropose(profil.classe, profil.toile, trouvee.theme.id)
    : true;
  if (!ouvert) return <Redirect href="/enfant" />;

  if (questions.length === 0 || !jeu || !exercice || !question) {
    if (etat.phase !== 'terminee') {
      return (
        <Ecran pied={<Bouton titre="Retour" variante="secondaire" onPress={() => router.back()} />}>
          <BulleCapy
            pose="ralentir"
            texte={`Les exercices de ${profil.classe} arrivent bientôt. Pour l’instant, Capy prépare le CE2.`}
          />
        </Ecran>
      );
    }
  }

  if (etat.phase === 'terminee') {
    const etoiles = etoilesPour(etat.reussiesPremierCoup, etat.nombreQuestions);
    const rejouer = () => {
      setPartie((n) => n + 1);
      if (domaine) setNiveauEtape(niveauPourDomaine(profil.toile, domaine));
      setDebut(Date.now());
      envoyer({ type: 'recommencer' });
    };
    return (
      <Ecran
        pied={
          <View style={styles.boutonsFin}>
            <Bouton titre="Retour au parcours" onPress={() => router.back()} />
            <Bouton titre={enEntrainement ? 'Une autre série' : 'Rejouer l’étape'} variante="secondaire" onPress={rejouer} />
          </View>
        }
      >
        <View style={styles.fin}>
          <Image source={mascotte.bravo} style={styles.capyFin} resizeMode="contain" accessible={false} />
          <Text style={[typo.titre1, styles.centre]}>{enEntrainement ? 'Série terminée !' : 'Étape terminée !'}</Text>
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
            <Text style={[typo.manuscrit, styles.centre]}>Petit pas après petit pas…</Text>
          ) : null}
          <Text style={[typo.enonce, styles.centre]}>
            {enEntrainement
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
    pied = <PanneauRetour type="bravo" explication={ex.explication} onContinuer={continuer} />;
  } else if (etat.phase === 'presque') {
    pied = <PanneauRetour type="presque" indice={indice} onContinuer={() => envoyer({ type: 'reessayer' })} />;
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
        <BulleCapy pose="capy" texte={consigne} coloration />
        <Bouton
          titre="Écouter"
          variante="secondaire"
          icone={(c) => <IconeHautParleur taille={22} couleur={c} />}
          onPress={() => lire([consigne])}
        />
      </Ecran>
    );
  }

  const montrerTable =
    reglages.tableConsultable && ex.nature === 'nombre' && !!domaine && !DOMAINES_SANS_TABLE.includes(domaine);
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
          {ex.niveau > niveauEtape ? (
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
          {montrerTable ? (
            <Bouton
              titre="Table"
              variante="secondaire"
              pleineLargeur={false}
              onPress={() => setTableOuverte((o) => !o)}
            />
          ) : null}
        </View>

        {!calme || etat.phase === 'question' ? <TexteAccessible texte={consigne} variante="texte" coloration /> : null}
        {indiceVisible ? <BulleCapy pose="reflechi" tailleCapy={72} texte={indice} coloration /> : null}
        {explication && explication.question === etat.index ? (
          <BulleCapy pose="capy" tailleCapy={72} texte={`« ${explication.mot} » : ${explication.texte}`} />
        ) : null}
        {montrerTable && tableOuverte ? <TableConsultable /> : null}
        {nombresAide.length > 0 ? <AideNombres nombres={nombresAide} /> : null}

        {/* La clé remet le mini-jeu à zéro pour chaque question, et pour chaque nouvel essai du bon fil. */}
        <Jeu
          key={`${etat.index}-${JEUX_QUI_GARDENT_LEUR_ETAT.includes(q.jeu) ? 0 : etat.essaisRates}`}
          exercice={ex}
          actif={etat.phase === 'question'}
          onRepondre={(juste) => envoyer({ type: 'repondre', juste })}
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
  ligneBarre: { flexDirection: 'row' },
  flex: { flex: 1 },
  fin: { alignItems: 'center', gap: espaces.m, paddingTop: espaces.xxl },
  capyFin: { width: 200, height: 200 },
  centre: { textAlign: 'center' },
  boutonsFin: { gap: espaces.m },
  etoiles: { flexDirection: 'row', gap: espaces.s },
});
