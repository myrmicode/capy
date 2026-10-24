import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BarreProgression,
  BulleCapy,
  Bouton,
  Ecran,
  IconeAmpoule,
  IconeCroix,
  IconeHautParleur,
  PanneauRetour,
} from '@/composants';
import { COMPOSANTS_JEUX, JEUX } from '@/jeux';
import { arreterLecture, lireAVoixHaute, vibrerBravo } from '@/jeux/retours';
import { mascotte } from '@/mascotte';
import { avancement, derouler, etatInitial } from '@/parcours/deroulement';
import { genererEtape } from '@/parcours/etape';
import { useProfilActif } from '@/store/profils';
import { couleurs, espaces, formes, typo } from '@/theme';

/** Une étape de jeu : quelques questions qui mélangent les mini-jeux. */
export default function EcranEtape() {
  const profil = useProfilActif();
  const { graine: graineTexte } = useLocalSearchParams<{ graine?: string }>();
  const graine = Number(graineTexte) || 1;

  const questions = useMemo(
    () =>
      profil
        ? genererEtape({
            classe: profil.classe,
            domaine: 'resoudre-problemes',
            graine,
            jeux: ['marche', 'bonFil', 'reponses'],
          })
        : [],
    [profil, graine],
  );
  const [etat, envoyer] = useReducer(derouler, questions.length, etatInitial);
  // Numéro de la question dont l'indice est ouvert : il se referme tout seul à la question suivante.
  const [indiceOuvert, setIndiceOuvert] = useState<number | null>(null);
  const indiceVisible = indiceOuvert === etat.index;

  const question = questions[etat.index];

  useEffect(() => {
    if (etat.phase === 'bravo') vibrerBravo();
  }, [etat.phase]);

  // On coupe la voix en changeant de question ou en quittant l'étape.
  useEffect(() => {
    arreterLecture();
  }, [etat.index]);
  useEffect(() => arreterLecture, []);

  if (!profil) return <Redirect href="/" />;

  if (questions.length === 0) {
    return (
      <Ecran pied={<Bouton titre="Retour" variante="secondaire" onPress={() => router.back()} />}>
        <BulleCapy pose="ralentir" texte={`Les exercices de ${profil.classe} arrivent bientôt. Pour l’instant, Capy prépare le CE2.`} />
      </Ecran>
    );
  }

  if (etat.phase === 'terminee') {
    return (
      <Ecran
        pied={
          <View style={styles.boutonsFin}>
            <Bouton titre="Retour au parcours" onPress={() => router.back()} />
            <Bouton titre="Rejouer l’étape" variante="secondaire" onPress={() => envoyer({ type: 'recommencer' })} />
          </View>
        }
      >
        <View style={styles.fin}>
          <Image source={mascotte.bravo} style={styles.capyFin} resizeMode="contain" accessible={false} />
          <Text style={[typo.titre1, styles.centre]}>Étape terminée !</Text>
          <Text style={[typo.manuscrit, styles.centre]}>Petit pas après petit pas…</Text>
          <Text style={[typo.enonce, styles.centre]}>Bravo {profil.prenom}, tu as résolu tous les problèmes.</Text>
        </View>
      </Ecran>
    );
  }

  const jeu = JEUX[question.jeu];
  const Jeu = COMPOSANTS_JEUX[question.jeu];
  const { exercice } = question;

  let pied = null;
  if (etat.phase === 'bravo') {
    pied = <PanneauRetour type="bravo" explication={exercice.explication} onContinuer={() => envoyer({ type: 'continuer' })} />;
  } else if (etat.phase === 'presque') {
    pied = <PanneauRetour type="presque" indice={exercice.indice} onContinuer={() => envoyer({ type: 'reessayer' })} />;
  }

  return (
    <Ecran pied={pied} defilementActif={question.jeu === 'reponses' || etat.phase !== 'question'}>
      <View style={styles.entete}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Quitter l’étape"
          hitSlop={8}
          style={styles.quitter}
        >
          <IconeCroix taille={28} couleur={couleurs.encreDouce} />
        </Pressable>
        <BarreProgression valeur={avancement(etat)} />
      </View>

      <View style={styles.outils}>
        <Text style={[typo.titre3, styles.flex]}>{jeu.titre}</Text>
        <Bouton
          titre="Écouter"
          variante="secondaire"
          pleineLargeur={false}
          icone={(c) => <IconeHautParleur taille={22} couleur={c} />}
          onPress={() => lireAVoixHaute(`${jeu.consigne} ${exercice.enonce} ${exercice.question}`)}
        />
        <Bouton
          titre="Indice"
          variante="secondaire"
          pleineLargeur={false}
          icone={(c) => <IconeAmpoule taille={22} couleur={c} />}
          onPress={() => setIndiceOuvert(indiceVisible ? null : etat.index)}
        />
      </View>

      <Text style={typo.texte}>{jeu.consigne}</Text>
      {indiceVisible ? <BulleCapy pose="reflechi" tailleCapy={72} texte={exercice.indice} /> : null}

      {/* La clé remet le mini-jeu à zéro pour chaque question, et pour chaque nouvel essai du bon fil. */}
      <Jeu
        key={`${etat.index}-${question.jeu === 'marche' ? 0 : etat.essaisRates}`}
        exercice={exercice}
        actif={etat.phase === 'question'}
        onRepondre={(juste) => envoyer({ type: 'repondre', juste })}
      />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  entete: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  quitter: {
    width: formes.cibleTactile,
    height: formes.cibleTactile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outils: { flexDirection: 'row', alignItems: 'center', gap: espaces.s, flexWrap: 'wrap' },
  flex: { flex: 1, minWidth: 140 },
  fin: { alignItems: 'center', gap: espaces.m, paddingTop: espaces.xxl },
  capyFin: { width: 200, height: 200 },
  centre: { textAlign: 'center' },
  boutonsFin: { gap: espaces.m },
});
