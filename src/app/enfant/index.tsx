import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { estLeSoir } from '@/accessibilite/theme';
import {
  BulleCapy,
  Bouton,
  ChoixTheme,
  DecorParcours,
  Ecran,
  EtapeParcours,
  IconeCoche,
  IconeEtoile,
  IconeFlamme,
  IconeGrille,
  SurfaceEnRelief,
  TuileTheme,
} from '@/composants';
import { TEXTE_EMPILE } from '@/composants/CarteTheme';
import { domaineDe, LIBELLES_MATIERES, MATIERES, type Matiere } from '@/config/domaines';
import type { Theme } from '@/config/parcours';
import { HISTOIRES } from '@/contenu/histoires';
import { graineDuJour, PHRASES_CAPY, phraseDe } from '@/contenu/phrasesCapy';
import type { PoseCapy } from '@/mascotte';
import { themesChrono } from '@/parcours/chrono';
import { QUESTIONS_DEFI } from '@/parcours/defi';
import { QUESTIONS_TABLES, tablesOuvertes } from '@/parcours/tables';
import {
  avancementDuTheme,
  cheminDuTheme,
  dateLocale,
  defiFait,
  joursDepuisDerniereActivite,
  serieDeJours,
  totalEtoiles,
  type Noeud,
} from '@/parcours/progression';
import { themesEntrainement, themesProposes } from '@/parcours/selection';
import { saisonDe } from '@/parcours/saisons';
import { verrouillerParents } from '@/parents/verrou';
import { useProfilActif } from '@/store/profils';
import { useReglages } from '@/store/reglages';
import { ficheSaisie, prioritesDe } from '@/toile/niveaux';
import { couleurs, couleursMatieres, espaces, formes, type CouleursMatiere } from '@/theme';

/** Décalages horizontaux du chemin en zigzag, répétés. */
const ZIGZAG = [0, 56, 84, 56, 0, -56, -84, -56];
/** Absence (en jours) à partir de laquelle Capy dit qu'on lui a manqué. */
const ABSENCE_LONGUE = 3;
/** Largeur maximale de la fiche qui s'ouvre sous une étape. */
const LARGEUR_FICHE = 360;

function Parcours() {
  const profil = useProfilActif();
  const { typo, reglages } = useThemeEnfant();
  const ambianceSoir = useReglages((e) => e.ambianceSoir);
  // Revenu sur son parcours, l'enfant ne retrouve jamais l'espace parent ouvert.
  useFocusEffect(useCallback(() => verrouillerParents(), []));
  const [themeChoisiId, setThemeChoisiId] = useState<string | null>(null);
  const [choixOuvert, setChoixOuvert] = useState(false);
  // Comme sur Duolingo : toucher une étape ouvre sa fiche, avec le bouton pour la commencer.
  const [noeudOuvertId, setNoeudOuvertId] = useState<string | null>(null);
  // Un thème choisi sur la carte des mondes s'ouvre ici (l'état suit le paramètre quand il change).
  const { theme: themeDeLaCarte } = useLocalSearchParams<{ theme?: string }>();
  const [themeDeLaCarteVu, setThemeDeLaCarteVu] = useState(themeDeLaCarte);
  if (themeDeLaCarte !== themeDeLaCarteVu) {
    setThemeDeLaCarteVu(themeDeLaCarte);
    if (themeDeLaCarte) {
      setThemeChoisiId(themeDeLaCarte);
      setNoeudOuvertId(null);
    }
  }
  const themeId = themeChoisiId ?? themeDeLaCarte ?? null;
  if (!profil) return null;

  const p = profil.progression;
  // Seuls les thèmes des difficultés de la toile sont proposés, du plus fragile au
  // moins fragile (voir parcours/selection.ts). Par défaut, on ouvre le premier
  // thème qui n'est pas terminé.
  const themes = themesProposes(profil.classe, profil.toile);
  const parDefaut = themes.find((t) => cheminDuTheme(t, p).some((n) => n.etat === 'enCours')) ?? themes[0];
  const theme = themes.find((t) => t.id === themeId) ?? parDefaut;
  // Un axe prioritaire par matière (français, mathématiques).
  const priorites = prioritesDe(profil.classe, profil.toile);
  const matiereDuTheme = (t: Theme): Matiere => domaineDe(profil.classe, t.domaine)?.matiere ?? 'mathematiques';
  const aujourdhui = dateLocale(new Date());
  const soir = ambianceSoir && estLeSoir(new Date());
  const saison = saisonDe(new Date());
  const serie = serieDeJours(p.jours, aujourdhui);
  const absence = joursDepuisDerniereActivite(p.jours, aujourdhui);
  // Ce qui est déjà à +++ sur la fiche se rejoue en entraînement libre.
  const aEntrainer = themesEntrainement(profil.classe, profil.toile).length > 0;
  const boutonEntrainement = aEntrainer ? (
    <Bouton titre="Entraînement libre" variante="secondaire" onPress={() => router.push('/entrainement')} />
  ) : null;

  const entete = (
    <View style={styles.entete}>
      <View style={styles.flex}>
        <Text style={typo.titre2}>{profil.prenom}</Text>
        <Pressable onPress={() => router.replace('/')} accessibilityRole="button" hitSlop={10}>
          <Text style={[typo.petit, styles.lien]}>Changer d’enfant</Text>
        </Pressable>
      </View>
      <Compteur
        icone={<IconeEtoile taille={22} couleur={couleurs.jaune.texte} />}
        texte={String(totalEtoiles(p))}
        libelle={`${totalEtoiles(p)} étoiles`}
        fond={couleurs.jaune[400]}
        couleur={couleurs.jaune.texte}
      />
      <Compteur
        icone={<IconeFlamme taille={22} couleur={couleurs.brun[600]} />}
        texte={`${serie} j`}
        libelle={`${serie} jour${serie > 1 ? 's' : ''} d’affilée`}
        fond={couleurs.brun[100]}
        couleur={couleurs.brun[800]}
      />
    </View>
  );

  if (!theme) {
    // Aucun exercice sans le résultat de la toile.
    const fichesManquantes = MATIERES.filter((m) => !ficheSaisie(profil.toile, m));
    let texte: string;
    if (!profil.toile) {
      texte =
        'Pour commencer, demande à un parent de photographier les fiches de l’école. Je préparerai ton parcours avec !';
    } else if (fichesManquantes.length > 0) {
      texte = `Bravo, ce que je sais faire travailler est déjà solide ! Il manque encore la fiche de ${LIBELLES_MATIERES[fichesManquantes[0]].toLowerCase()}.`;
    } else {
      texte = 'Bravo, ce que je sais faire travailler est déjà solide ! De nouveaux exercices arrivent bientôt.';
    }
    return (
      <Ecran
        pied={
          fichesManquantes.length > 0 ? (
            <Bouton titre="Aller voir un parent" variante="secondaire" onPress={() => router.push('/enfant/parents')} />
          ) : undefined
        }
      >
        {entete}
        <BulleCapy pose={profil.toile ? 'bravo' : 'explorer'} tailleCapy={110} texte={texte} />
        {boutonEntrainement}
      </Ecran>
    );
  }

  const matiere = matiereDuTheme(theme);
  const c = couleursMatieres[matiere];
  const chemin = cheminDuTheme(theme, p);
  const enCours = chemin.find((n) => n.etat === 'enCours');
  const uniteEnCours = theme.unites.find((u) => u.id === (enCours ?? chemin[chemin.length - 1]).uniteId)!;
  const numeroUnite = theme.unites.indexOf(uniteEnCours) + 1;

  let pose: PoseCapy = 'reussite';
  let message: string;
  if (absence !== null && absence >= ABSENCE_LONGUE) {
    pose = 'triste';
    message = 'Tu m’as manqué ! On reprend ensemble, tout doucement ?';
  } else if (!enCours) {
    pose = 'bravo';
    message = 'Tu as fini ce thème ! Rejoue ses étapes quand tu veux, ou choisis un autre thème.';
  } else if (enCours.type === 'coffre') {
    pose = 'surpris';
    message = 'Un coffre t’attend au bout du chemin. Va vite l’ouvrir !';
  } else if (serie >= 2) {
    pose = 'clinOeil';
    message = `${serie} jours d’affilée, bravo ! Prochaine étape : « ${enCours.titre} »`;
  } else if (absence !== null && absence >= 1) {
    pose = 'clinOeil';
    message = `${phraseDe(PHRASES_CAPY.retour, graineDuJour(aujourdhui))} Prochaine étape : « ${enCours.titre} »`;
  } else if (soir) {
    pose = 'ralentir';
    message = `Bonsoir ! Une petite étape avant de dormir ? Prochaine étape : « ${enCours.titre} »`;
  } else {
    message = `${phraseDe(PHRASES_CAPY.prochaine, graineDuJour(aujourdhui))} Prochaine étape : « ${enCours.titre} »`;
  }

  const ouvrir = (n: Noeud) => {
    if (n.etat === 'verrouillee') return;
    setNoeudOuvertId(null);
    if (n.type === 'coffre') router.push({ pathname: '/coffre', params: { id: n.id } });
    else router.push({ pathname: '/etape', params: { etape: n.id } });
  };

  const surtitre =
    theme.unites.length > 1
      ? `${LIBELLES_MATIERES[matiere]} · Unité ${numeroUnite} sur ${theme.unites.length}`
      : LIBELLES_MATIERES[matiere];

  return (
    <Ecran>
      {entete}

      <CarteDefi fait={defiFait(p, aujourdhui)} etoiles={p.defis?.[aujourdhui] ?? 0} />
      <CarteHistoires lues={Object.keys(p.histoires ?? {}).length} />
      {/* Pas de course contre la montre en mode calme. */}
      {!reglages.modeCalme && themesChrono(profil.classe, profil.toile).length > 0 ? (
        <CarteChrono
          record={Math.max(0, ...themesChrono(profil.classe, profil.toile).map((t) => p.chronos?.[t.id]?.record ?? 0))}
        />
      ) : null}
      {/* En mode calme aussi : sans minuteur, à son rythme. */}
      {tablesOuvertes(profil.classe) ? (
        <CarteTables
          sansFaute={Object.values(p.tables ?? {}).filter((t) => t.record === QUESTIONS_TABLES).length}
          calme={reglages.modeCalme}
        />
      ) : null}

      <View style={[styles.bandeau, { backgroundColor: c.face, borderBottomColor: c.relief }]}>
        <View style={styles.bandeauHaut}>
          <View style={[styles.flex, styles.bandeauTextes]}>
            <Text style={[typo.petit, styles.texteBlanc, { fontFamily: typo.texteGras.fontFamily }]}>{surtitre}</Text>
            <Text style={[typo.titre2, styles.texteBlanc]} accessibilityRole="header">
              {theme.titre}
            </Text>
            <Text style={[typo.texte, styles.texteBlanc]}>{theme.description}</Text>
          </View>
          {/* Avec un texte plus grand, la place va au titre. */}
          {(typo.texte.fontSize ?? 16) < TEXTE_EMPILE ? (
            <TuileTheme
              domaine={theme.domaine}
              couleurs={c}
              taille={Math.round((typo.titre2.fontSize ?? 24) * 2.6)}
              inverse
            />
          ) : null}
        </View>
        {priorites.has(theme.domaine) ? (
          <View style={styles.badgePriorite}>
            <Text style={[typo.petit, { color: couleurs.jaune.texte, fontFamily: typo.texteGras.fontFamily }]}>
              À faire en premier
            </Text>
          </View>
        ) : null}
        {themes.length > 1 ? (
          <SurfaceEnRelief
            onPress={() => setChoixOuvert(true)}
            accessibilityRole="button"
            accessibilityLabel={`Changer de thème, ${themes.length} thèmes`}
            couleurFace={couleurs.blanc}
            couleurRelief={c.relief}
            relief={4}
            rayon={formes.pilule}
            style={styles.changer}
            styleFace={styles.changerFace}
          >
            <IconeGrille taille={20} couleur={c.face} />
            <Text style={[typo.bouton, { color: c.face }]}>Changer de thème</Text>
          </SurfaceEnRelief>
        ) : null}
      </View>

      <BulleCapy pose={pose} tailleCapy={80} texte={message} />

      {theme.unites.map((unite, u) => {
        const noeuds = chemin.filter((n) => n.uniteId === unite.id);
        const etapes = noeuds.filter((n) => n.type === 'etape');
        return (
          <View key={unite.id} style={styles.unite}>
            <View style={styles.separateur} accessibilityRole="header">
              <View style={styles.trait} />
              <View style={styles.separateurTextes}>
                <Text style={[typo.texteGras, styles.titreUnite]}>
                  Unité {u + 1} · {unite.titre}
                </Text>
                <Text style={[typo.petit, styles.centre]}>{unite.objectif}</Text>
              </View>
              <View style={styles.trait} />
            </View>
            {noeuds.map((n, i) => {
              const decalage = ZIGZAG[i % ZIGZAG.length];
              const ouvert = noeudOuvertId === n.id;
              return (
                <View key={n.id} style={styles.noeud}>
                  {/* Un décor sur deux, du côté libre quand l'étape s'écarte du centre. */}
                  {decalage !== 0 && i % 2 === 1 ? (
                    <DecorParcours
                      matiere={matiere}
                      saison={saison}
                      rang={u * 7 + i}
                      cote={decalage > 0 ? 'gauche' : 'droite'}
                    />
                  ) : null}
                  <View style={[styles.noeud, { transform: [{ translateX: decalage }] }]}>
                    {n.etat === 'enCours' && !ouvert ? (
                      <BulleCommencer texte={n.type === 'coffre' ? 'Ouvrir' : 'Commencer'} couleur={c.face} />
                    ) : null}
                    <EtapeParcours
                      etat={n.etat}
                      numero={n.type === 'etape' ? n.numero : 0}
                      coffre={n.type === 'coffre'}
                      couleursMatiere={c}
                      onPress={() => setNoeudOuvertId(ouvert ? null : n.id)}
                    />
                    {n.type === 'etape' ? (
                      <Text
                        style={[
                          typo.petit,
                          styles.titreEtape,
                          n.etat === 'enCours' && { color: c.relief, fontFamily: typo.texteGras.fontFamily },
                        ]}
                      >
                        {n.titre}
                      </Text>
                    ) : null}
                  </View>
                  {ouvert ? (
                    <FicheNoeud
                      noeud={n}
                      position={n.type === 'etape' ? etapes.indexOf(n) + 1 : 0}
                      nombre={etapes.length}
                      couleursMatiere={c}
                      decalage={decalage}
                      onOuvrir={() => ouvrir(n)}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        );
      })}
      <Bouton titre="La carte des mondes" variante="secondaire" onPress={() => router.push('/carte')} />
      {boutonEntrainement}

      <ChoixTheme
        visible={choixOuvert}
        onFermer={() => setChoixOuvert(false)}
        themes={themes}
        matiereDe={matiereDuTheme}
        themeActuelId={theme.id}
        priorites={priorites}
        avancementDe={(t) => avancementDuTheme(t, p)}
        onChoisir={(id) => {
          setThemeChoisiId(id);
          setNoeudOuvertId(null);
        }}
      />
    </Ecran>
  );
}

/** La petite bulle « Commencer » qui flotte au-dessus de l'étape en cours (immobile en mode calme). */
function BulleCommencer({ texte, couleur }: { texte: string; couleur: string }) {
  const { typo, animationsReduites } = useThemeEnfant();
  const y = useSharedValue(0);
  useEffect(() => {
    if (animationsReduites) {
      y.value = 0;
      return;
    }
    y.value = withRepeat(withSequence(withTiming(-5, { duration: 700 }), withTiming(0, { duration: 700 })), -1);
    return () => cancelAnimation(y);
  }, [animationsReduites, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View
      style={[styles.bulleCommencer, style]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.bulleCommencerFace}>
        <Text style={[typo.texteGras, { color: couleur }]}>{texte}</Text>
      </View>
      <View style={styles.pointe} />
    </Animated.View>
  );
}

interface PropsFicheNoeud {
  noeud: Noeud;
  /** Rang de l'étape dans son unité (0 pour un coffre). */
  position: number;
  nombre: number;
  couleursMatiere: CouleursMatiere;
  /** Décalage horizontal de l'étape, pour pointer vers elle. */
  decalage: number;
  onOuvrir: () => void;
}

/** Fiche qui s'ouvre sous une étape : ce qu'elle est, et le bouton pour y aller. */
function FicheNoeud({ noeud, position, nombre, couleursMatiere: c, decalage, onOuvrir }: PropsFicheNoeud) {
  const { typo, ecart, cible } = useThemeEnfant();
  const coffre = noeud.type === 'coffre';
  const titre = coffre ? 'Le coffre de l’unité' : noeud.titre;
  let fond: string;
  let encre: string;
  let detail: string;
  let bouton: string | null;
  if (noeud.etat === 'enCours') {
    fond = c.face;
    encre = couleurs.blanc;
    detail = coffre ? 'Ouvre-le : une surprise t’attend !' : `Étape ${position} sur ${nombre}`;
    bouton = coffre ? 'Ouvrir le coffre' : 'Commencer';
  } else if (noeud.etat === 'reussie') {
    fond = couleurs.jaune[400];
    encre = couleurs.jaune.texte;
    detail = coffre ? 'Tu l’as déjà ouvert.' : `Étape ${position} sur ${nombre} · réussie`;
    bouton = coffre ? 'Revoir le coffre' : 'Rejouer';
  } else {
    fond = couleurs.gris[200];
    encre = couleurs.encreDouce;
    detail = coffre
      ? 'Il s’ouvre quand toutes les étapes de l’unité sont faites.'
      : 'Fais d’abord les étapes d’avant pour ouvrir celle-ci.';
    bouton = null;
  }
  const pointe = Math.max(-(LARGEUR_FICHE / 2 - 32), Math.min(LARGEUR_FICHE / 2 - 32, decalage));
  return (
    <View style={styles.fiche}>
      <View
        style={[
          styles.pointeFiche,
          { backgroundColor: fond, transform: [{ translateX: pointe }, { rotate: '45deg' }] },
        ]}
      />
      <View style={[styles.ficheCorps, { backgroundColor: fond, gap: ecart('s') }]}>
        <Text style={[typo.titre3, { color: encre }]}>{titre}</Text>
        <Text style={[typo.texte, { color: encre }]}>{detail}</Text>
        {bouton ? (
          <SurfaceEnRelief
            onPress={onOuvrir}
            accessibilityRole="button"
            accessibilityLabel={coffre ? bouton : `${bouton} : ${titre}`}
            couleurFace={couleurs.blanc}
            couleurRelief={noeud.etat === 'reussie' ? couleurs.jaune[600] : c.relief}
            relief={formes.bouton.relief}
            rayon={formes.pilule}
            style={{ minHeight: Math.max(formes.bouton.hauteur, cible) + formes.bouton.relief }}
          >
            <Text style={[typo.bouton, { color: noeud.etat === 'reussie' ? couleurs.jaune.texte : c.face }]}>
              {bouton}
            </Text>
          </SurfaceEnRelief>
        ) : null}
      </View>
    </View>
  );
}

/** Le défi du jour : 3 questions, pour les jours où l'on a peu de temps. */
function CarteDefi({ fait, etoiles }: { fait: boolean; etoiles: number }) {
  const { typo, ecart } = useThemeEnfant();
  const titre = fait ? 'Défi du jour réussi' : 'Défi du jour';
  const detail = fait
    ? `${etoiles} étoile${etoiles > 1 ? 's' : ''} gagnée${etoiles > 1 ? 's' : ''}. Reviens demain, ou rejoue-le !`
    : `${QUESTIONS_DEFI} questions pour bien commencer.`;
  return (
    <SurfaceEnRelief
      onPress={() => router.push({ pathname: '/etape', params: { defi: '1' } })}
      accessibilityRole="button"
      accessibilityLabel={`${titre}. ${detail}`}
      couleurFace={fait ? couleurs.menthe[100] : couleurs.jaune[400]}
      couleurRelief={fait ? couleurs.sarcelle[400] : couleurs.jaune[600]}
      relief={4}
      rayon={formes.carte.rayon}
      styleFace={[styles.defiFace, { padding: ecart('m'), gap: ecart('m') }]}
    >
      <View style={styles.defiIcone}>
        {fait ? (
          <IconeCoche taille={28} couleur={couleurs.sarcelle[700]} />
        ) : (
          <IconeEtoile taille={28} couleur={couleurs.jaune.texte} />
        )}
      </View>
      <View style={styles.flex}>
        <Text style={[typo.titre3, { color: fait ? couleurs.sarcelle[900] : couleurs.jaune.texte }]}>{titre}</Text>
        <Text style={[typo.petit, { color: fait ? couleurs.sarcelle[900] : couleurs.jaune.texte }]}>{detail}</Text>
      </View>
    </SurfaceEnRelief>
  );
}

/** Les histoires de Capy, à lire pour le plaisir (et pour comprendre un texte). */
function CarteHistoires({ lues }: { lues: number }) {
  const { typo, ecart } = useThemeEnfant();
  const reste = HISTOIRES.length - lues;
  const detail =
    reste > 0
      ? `${reste} histoire${reste > 1 ? 's' : ''} à lire, avec 3 questions.`
      : 'Tu as lu toutes les histoires. Relis ta préférée !';
  return (
    <SurfaceEnRelief
      onPress={() => router.push('/histoires')}
      accessibilityRole="button"
      accessibilityLabel={`Les histoires de Capy. ${detail}`}
      couleurFace={couleurs.caramel[100]}
      couleurRelief={couleurs.caramel[500]}
      relief={4}
      rayon={formes.carte.rayon}
      styleFace={[styles.defiFace, { padding: ecart('m'), gap: ecart('m') }]}
    >
      <View style={styles.defiIcone}>
        <TuileTheme domaine="comprendre-texte-lu" couleurs={couleursMatieres.francais} taille={40} />
      </View>
      <View style={styles.flex}>
        <Text style={[typo.titre3, { color: couleurs.brun[800] }]}>Les histoires de Capy</Text>
        <Text style={[typo.petit, { color: couleurs.brun[800] }]}>{detail}</Text>
      </View>
    </SurfaceEnRelief>
  );
}

function CarteChrono({ record }: { record: number }) {
  const { typo, ecart } = useThemeEnfant();
  const detail =
    record > 0
      ? `Une minute de calculs. Ton record : ${record} bonnes réponses.`
      : 'Une minute de calculs. Essaie de battre ton record !';
  return (
    <SurfaceEnRelief
      onPress={() => router.push('/chrono')}
      accessibilityRole="button"
      accessibilityLabel={`Le chrono de Capy. ${detail}`}
      couleurFace={couleurs.menthe[100]}
      couleurRelief={couleurs.sarcelle[500]}
      relief={4}
      rayon={formes.carte.rayon}
      styleFace={[styles.defiFace, { padding: ecart('m'), gap: ecart('m') }]}
    >
      <View style={styles.defiIcone}>
        <TuileTheme domaine="calcul-mental" couleurs={couleursMatieres.mathematiques} taille={40} />
      </View>
      <View style={styles.flex}>
        <Text style={[typo.titre3, { color: couleurs.sarcelle[900] }]}>Le chrono de Capy</Text>
        <Text style={[typo.petit, { color: couleurs.sarcelle[900] }]}>{detail}</Text>
      </View>
    </SurfaceEnRelief>
  );
}

/** Les tables de Capy : une table au choix, 10 calculs, 7 secondes chacun. */
function CarteTables({ sansFaute, calme }: { sansFaute: number; calme: boolean }) {
  const { typo, ecart } = useThemeEnfant();
  const rythme = calme ? 'à ton rythme' : '7 secondes par calcul';
  const detail =
    sansFaute > 0
      ? `Choisis ta table, ${rythme}. Déjà ${sansFaute} sans faute !`
      : `Choisis ta table : 10 calculs, ${rythme}.`;
  return (
    <SurfaceEnRelief
      onPress={() => router.push('/tables')}
      accessibilityRole="button"
      accessibilityLabel={`Les tables de Capy. ${detail}`}
      couleurFace={couleurs.blanc}
      couleurRelief={couleurs.sarcelle[500]}
      relief={4}
      rayon={formes.carte.rayon}
      styleFace={[styles.defiFace, { padding: ecart('m'), gap: ecart('m') }]}
    >
      <View style={[styles.defiIcone, { backgroundColor: couleurs.menthe[100] }]}>
        <TuileTheme domaine="tables-multiplication" couleurs={couleursMatieres.mathematiques} taille={40} />
      </View>
      <View style={styles.flex}>
        <Text style={[typo.titre3, { color: couleurs.sarcelle[900] }]}>Les tables de Capy</Text>
        <Text style={[typo.petit, { color: couleurs.sarcelle[900] }]}>{detail}</Text>
      </View>
    </SurfaceEnRelief>
  );
}

interface PropsCompteur {
  icone: React.ReactNode;
  texte: string;
  libelle: string;
  fond: string;
  couleur: string;
}

function Compteur({ icone, texte, libelle, fond, couleur }: PropsCompteur) {
  const { typo } = useThemeEnfant();
  return (
    <View style={[styles.compteur, { backgroundColor: fond }]} accessible accessibilityLabel={libelle}>
      {icone}
      <Text style={[typo.texteGras, { color: couleur }]}>{texte}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centre: { textAlign: 'center' },
  defiFace: { flexDirection: 'row', alignItems: 'center' },
  defiIcone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: couleurs.blanc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entete: { flexDirection: 'row', alignItems: 'center', gap: espaces.s },
  lien: { color: couleurs.sarcelle[700], paddingVertical: 4 },
  compteur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.xs,
    borderRadius: formes.pilule,
    paddingHorizontal: espaces.m,
    minHeight: formes.cibleTactile,
  },
  bandeau: {
    borderRadius: formes.carte.rayon,
    borderBottomWidth: 6,
    padding: espaces.l,
    gap: espaces.m,
  },
  bandeauHaut: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  bandeauTextes: { gap: espaces.xs },
  texteBlanc: { color: couleurs.blanc },
  badgePriorite: {
    alignSelf: 'flex-start',
    backgroundColor: couleurs.jaune[400],
    borderRadius: formes.pilule,
    paddingHorizontal: espaces.m,
    paddingVertical: 2,
  },
  changer: { alignSelf: 'flex-start', minHeight: formes.cibleTactile + 4 },
  changerFace: { flexDirection: 'row', gap: espaces.s, paddingHorizontal: espaces.l },
  unite: { alignItems: 'center', gap: espaces.s, paddingTop: espaces.l },
  separateur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.m,
    alignSelf: 'stretch',
    marginBottom: espaces.s,
  },
  separateurTextes: { flexShrink: 1, alignItems: 'center' },
  trait: { flex: 1, height: 2, backgroundColor: couleurs.gris[300], borderRadius: 1, minWidth: 16 },
  titreUnite: { color: couleurs.encreDouce, textAlign: 'center' },
  noeud: { alignItems: 'center', alignSelf: 'stretch' },
  titreEtape: { maxWidth: 160, textAlign: 'center' },
  bulleCommencer: { alignItems: 'center', marginBottom: -4 },
  bulleCommencerFace: {
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: espaces.m,
    paddingVertical: espaces.xs,
  },
  pointe: {
    width: 12,
    height: 12,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
    marginTop: -7,
  },
  fiche: {
    width: '100%',
    maxWidth: LARGEUR_FICHE,
    alignItems: 'center',
    marginTop: espaces.s,
    marginBottom: espaces.s,
  },
  pointeFiche: { width: 18, height: 18, borderRadius: 3, marginBottom: -10 },
  ficheCorps: { alignSelf: 'stretch', borderRadius: formes.carte.rayon, padding: espaces.l },
});

export default avecReglagesEnfant(Parcours);
