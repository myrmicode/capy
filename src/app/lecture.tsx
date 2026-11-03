// Lire à deux : l'enfant lit à voix haute pendant une minute, l'adulte suit sur
// l'écran et touche les mots mal lus, puis le dernier mot lu. Capy compte les
// mots bien lus en une minute, comme la lecture à voix haute des évaluations.
// Rien n'est enregistré, ni la voix ni le son : seulement des nombres.
import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { BulleCapy, Bouton, Ecran, SurfaceEnRelief } from '@/composants';
import { textesDe, texteLecture, type TexteLecture } from '@/contenu/textesLecture';
import { celebrer } from '@/jeux/retours';
import {
  DUREE_LECTURE_SECONDES,
  estUnMot,
  messageLecture,
  mesurerLecture,
  morceauxDuTexte,
  nombreDeMots,
  RELECTURES_CONSEILLEES,
  texteConseille,
} from '@/parcours/lecture';
import { dateLocale } from '@/parcours/progression';
import { dateEnFrancais } from '@/parents/format';
import { useProfilActif, useProfils } from '@/store/profils';
import { couleurs, espaces, formes } from '@/theme';

type Phase = 'choix' | 'pret' | 'lecture' | 'dernier' | 'resultat';

function LireADeux() {
  const profil = useProfilActif();
  const enregistrerLecture = useProfils((e) => e.enregistrerLecture);
  const { typo, ecart, animationsReduites } = useThemeEnfant();
  const [phase, setPhase] = useState<Phase>('choix');
  const [texteId, setTexteId] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState<ReadonlySet<number>>(new Set());
  const [dernier, setDernier] = useState<number | null>(null);
  const [debut, setDebut] = useState(0);
  const [reste, setReste] = useState(DUREE_LECTURE_SECONDES);
  const [secondesLues, setSecondesLues] = useState(DUREE_LECTURE_SECONDES);
  const enregistree = useRef(false);

  // La minute de lecture.
  useEffect(() => {
    if (phase !== 'lecture') return;
    const minuteur = setInterval(() => {
      const ecoule = (Date.now() - debut) / 1000;
      setReste(Math.max(0, Math.ceil(DUREE_LECTURE_SECONDES - ecoule)));
      if (ecoule >= DUREE_LECTURE_SECONDES) {
        clearInterval(minuteur);
        setSecondesLues(DUREE_LECTURE_SECONDES);
        setPhase('dernier');
        celebrer('fin', { silencieux: animationsReduites });
      }
    }, 200);
    return () => clearInterval(minuteur);
  }, [phase, debut, animationsReduites]);

  const texte = texteId ? texteLecture(texteId) : undefined;
  const morceaux = texte ? morceauxDuTexte(texte.texte) : [];

  // La lecture est enregistrée une seule fois, en arrivant sur le résultat.
  useEffect(() => {
    if (phase !== 'resultat' || !profil || !texte || dernier === null || enregistree.current) return;
    enregistree.current = true;
    const mesure = mesurerLecture(texte.texte, dernier, erreurs, secondesLues);
    enregistrerLecture(
      profil.id,
      texte.id,
      { motsParMinute: mesure.motsParMinute, erreurs: mesure.erreurs },
      secondesLues,
    );
  }, [phase, profil, texte, dernier, erreurs, secondesLues, enregistrerLecture]);

  if (!profil) return <Redirect href="/" />;
  const textes = textesDe(profil.classe);
  const conseille = texteConseille(profil.classe, profil.progression, dateLocale(new Date()));

  const choisir = (t: TexteLecture) => {
    setTexteId(t.id);
    setPhase('pret');
  };
  const demarrer = () => {
    setErreurs(new Set());
    setDernier(null);
    setReste(DUREE_LECTURE_SECONDES);
    enregistree.current = false;
    setDebut(Date.now());
    setPhase('lecture');
  };
  const basculerErreur = (i: number) =>
    setErreurs((avant) => {
      const apres = new Set(avant);
      if (apres.has(i)) apres.delete(i);
      else apres.add(i);
      return apres;
    });

  if (phase === 'choix' || !texte) {
    return (
      <Ecran pied={<Bouton titre="Retour" variante="secondaire" onPress={() => router.back()} />}>
        <Text style={typo.titre1} accessibilityRole="header">
          Lire à deux
        </Text>
        <BulleCapy
          pose="conseils"
          tailleCapy={80}
          texte={`${profil.prenom} lit à voix haute pendant une minute, vous écoutez. Relire le même texte ${RELECTURES_CONSEILLEES} jours de suite, c’est ce qui fait le plus progresser.`}
        />
        {textes.map((t) => {
          const lectures = profil.progression.lectures?.[t.id] ?? [];
          const meilleur = Math.max(0, ...lectures.map((l) => l.motsParMinute));
          return (
            <SurfaceEnRelief
              key={t.id}
              onPress={() => choisir(t)}
              accessibilityRole="button"
              accessibilityLabel={`${t.titre}. ${nombreDeMots(t.texte)} mots.${
                lectures.length > 0 ? ` Lu ${lectures.length} fois, au mieux ${meilleur} mots en une minute.` : ''
              }`}
              couleurFace={t.id === conseille?.id ? couleurs.menthe[100] : couleurs.blanc}
              couleurRelief={t.id === conseille?.id ? couleurs.sarcelle[700] : couleurs.gris[300]}
              couleurBordure={t.id === conseille?.id ? couleurs.sarcelle[700] : couleurs.bordure}
              relief={4}
              rayon={formes.carte.rayon}
              styleFace={{ padding: ecart('m'), gap: ecart('xs') }}
            >
              {t.id === conseille?.id ? (
                <Text style={[typo.petit, styles.conseil]}>Capy conseille ce texte</Text>
              ) : null}
              <Text style={typo.titre3}>{t.titre}</Text>
              <Text style={typo.petit}>
                {nombreDeMots(t.texte)} mots
                {lectures.length > 0
                  ? ` · lu ${lectures.length} fois · au mieux ${meilleur} mots en une minute`
                  : ' · pas encore lu'}
              </Text>
            </SurfaceEnRelief>
          );
        })}
      </Ecran>
    );
  }

  if (phase === 'pret') {
    return (
      <Ecran
        pied={
          <View style={styles.boutons}>
            <Bouton titre="Démarrer la minute" onPress={demarrer} />
            <Bouton titre="Choisir un autre texte" variante="secondaire" onPress={() => setPhase('choix')} />
          </View>
        }
      >
        <Text style={typo.titre1}>{texte.titre}</Text>
        <View style={[styles.carte, { padding: ecart('l'), gap: ecart('s') }]}>
          <Text style={typo.texteGras}>Pour l’adulte</Text>
          <Text style={typo.texte}>
            1. Asseyez-vous à côté de {profil.prenom}, l’écran entre vous deux.{'\n'}
            2. Touchez « Démarrer » : {profil.prenom} lit à voix haute, à son rythme.{'\n'}
            3. Touchez un mot mal lu, sauté ou deviné : il se marque. Retouchez-le pour l’effacer.{'\n'}
            4. Après une minute, touchez le dernier mot lu.
          </Text>
          <Text style={typo.petit}>
            Ne corrigez pas pendant la minute : laissez lire. On en parle après, gentiment.
          </Text>
        </View>
      </Ecran>
    );
  }

  if (phase === 'resultat' && dernier !== null) {
    const mesure = mesurerLecture(texte.texte, dernier, erreurs, secondesLues);
    const historique = profil.progression.lectures?.[texte.id] ?? [];
    const plusHaut = Math.max(1, ...historique.map((l) => l.motsParMinute));
    return (
      <Ecran
        pied={
          <View style={styles.boutons}>
            <Bouton titre="Relire ce texte" onPress={() => setPhase('pret')} />
            <Bouton titre="Choisir un autre texte" variante="secondaire" onPress={() => setPhase('choix')} />
            <Bouton titre="Terminer" variante="secondaire" onPress={() => router.back()} />
          </View>
        }
      >
        <View
          style={styles.resultat}
          accessible
          accessibilityLabel={`${mesure.motsParMinute} mots bien lus en une minute`}
        >
          <Text style={[typo.titre1, styles.grandNombre]}>{mesure.motsParMinute}</Text>
          <Text style={[typo.texteGras, styles.centre]}>mots bien lus en une minute</Text>
          <Text style={[typo.petit, styles.centre]}>
            {mesure.motsLus} mots lus, {mesure.erreurs} mot{mesure.erreurs > 1 ? 's' : ''} à revoir
            {secondesLues < DUREE_LECTURE_SECONDES ? `, texte fini en ${Math.round(secondesLues)} s` : ''}.
          </Text>
        </View>
        <BulleCapy pose="bravo" tailleCapy={80} texte={messageLecture(historique, profil.prenom)} />
        {historique.length > 1 ? (
          <View style={[styles.carte, { padding: ecart('m'), gap: ecart('s') }]}>
            <Text style={typo.texteGras}>Les lectures de ce texte</Text>
            <View style={styles.histogramme}>
              {historique.map((l, i) => (
                <View
                  key={i}
                  style={styles.colonne}
                  accessible
                  accessibilityLabel={`Le ${dateEnFrancais(l.jour)} : ${l.motsParMinute} mots`}
                >
                  <Text style={typo.petit}>{l.motsParMinute}</Text>
                  <View
                    style={[
                      styles.barre,
                      { height: 8 + (l.motsParMinute / plusHaut) * 96 },
                      i === historique.length - 1 && styles.barreRecente,
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : null}
        {mesure.erreurs > 0 ? (
          <Text style={typo.petit}>
            Les mots à revoir sont soulignés ci-dessous : relisez-les ensemble, sans insister.
          </Text>
        ) : null}
        <TexteALire morceaux={morceaux} erreurs={erreurs} dernier={dernier} onToucher={() => undefined} desactive />
      </Ecran>
    );
  }

  // Pendant la minute, puis le choix du dernier mot lu.
  const enLecture = phase === 'lecture';
  return (
    <Ecran
      pied={
        enLecture ? (
          <Bouton
            titre="Le texte est fini"
            variante="secondaire"
            onPress={() => {
              setSecondesLues((Date.now() - debut) / 1000);
              setDernier(morceaux.length - 1);
              setPhase('resultat');
            }}
          />
        ) : (
          <Bouton titre="Voir le résultat" desactive={dernier === null} onPress={() => setPhase('resultat')} />
        )
      }
    >
      <View style={[styles.minuteur, !enLecture && styles.minuteurFini]} accessibilityLiveRegion="polite">
        <Text style={[typo.titre2, styles.centre, !enLecture && { color: couleurs.jaune.texte }]}>
          {enLecture ? `${reste} s` : 'Stop !'}
        </Text>
        <Text style={[typo.petit, styles.centre]}>
          {enLecture
            ? 'Touchez les mots mal lus.'
            : `Touchez le dernier mot lu par ${profil.prenom}, puis « Voir le résultat ».`}
        </Text>
      </View>
      <TexteALire
        morceaux={morceaux}
        erreurs={erreurs}
        dernier={dernier}
        onToucher={(i) => (enLecture ? basculerErreur(i) : setDernier(i))}
      />
    </Ecran>
  );
}

interface PropsTexteALire {
  morceaux: readonly string[];
  erreurs: ReadonlySet<number>;
  dernier: number | null;
  onToucher: (i: number) => void;
  desactive?: boolean;
}

/** Le texte, un mot à la fois : assez grand pour être lu à deux, chaque mot se touche. */
function TexteALire({ morceaux, erreurs, dernier, onToucher, desactive = false }: PropsTexteALire) {
  const { typo } = useThemeEnfant();
  return (
    <View style={styles.texte}>
      {morceaux.map((m, i) => {
        const erreur = erreurs.has(i);
        const apres = dernier !== null && i > dernier;
        return (
          <Pressable
            key={i}
            onPress={() => onToucher(i)}
            disabled={desactive || !estUnMot(m)}
            accessibilityRole="button"
            accessibilityLabel={`${m}${erreur ? ', mal lu' : ''}${i === dernier ? ', dernier mot lu' : ''}`}
            hitSlop={4}
            style={[styles.mot, erreur && styles.erreur, i === dernier && styles.dernier, apres && styles.apres]}
          >
            <Text style={[typo.enonce, erreur && styles.texteErreur]}>{m}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default avecReglagesEnfant(LireADeux);

const styles = StyleSheet.create({
  boutons: { gap: espaces.m },
  carte: {
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
  },
  conseil: { color: couleurs.sarcelle[900] },
  centre: { textAlign: 'center' },
  resultat: { alignItems: 'center', gap: espaces.xs, paddingTop: espaces.l },
  grandNombre: { fontSize: 64, lineHeight: 72, color: couleurs.sarcelle[900] },
  histogramme: { flexDirection: 'row', alignItems: 'flex-end', gap: espaces.s, minHeight: 128 },
  colonne: { flex: 1, alignItems: 'center', gap: espaces.xs, maxWidth: 48 },
  barre: { width: '100%', backgroundColor: couleurs.sarcelle[400], borderRadius: 4 },
  barreRecente: { backgroundColor: couleurs.sarcelle[700] },
  minuteur: {
    backgroundColor: couleurs.menthe[100],
    borderRadius: formes.carte.rayon,
    padding: espaces.m,
    gap: espaces.xs,
  },
  minuteurFini: { backgroundColor: couleurs.jaune[400] },
  texte: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.m,
    columnGap: espaces.s,
    rowGap: espaces.xs,
  },
  mot: { borderRadius: 6, paddingHorizontal: 2 },
  erreur: { backgroundColor: couleurs.brun[100] },
  texteErreur: { textDecorationLine: 'underline', color: couleurs.brun[800] },
  dernier: { backgroundColor: couleurs.jaune[400] },
  apres: { opacity: 0.4 },
});
