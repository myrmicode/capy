// Le chrono de Capy : une minute de calculs, pour que les tables et les petits
// calculs deviennent automatiques. On bat son propre record ; une erreur ne fait
// rien perdre, Capy montre la bonne réponse et passe au calcul suivant.
import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { adapterExercice } from '@/accessibilite/adaptation';
import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { BulleCapy, Bouton, CapyAnime, CarteEnonce, CarteTheme, Ecran, TuileReponse } from '@/composants';
import { THEMES } from '@/config/parcours';
import type { Exercice } from '@/exercices';
import { celebrer, feliciter } from '@/jeux/retours';
import { calculDuChrono, DUREE_CHRONO_SECONDES, messageChrono, themesChrono } from '@/parcours/chrono';
import { niveauPourDomaine } from '@/parcours/niveau';
import { graineDePartie, type ResultatChrono } from '@/parcours/progression';
import { useProfilActif, useProfils } from '@/store/profils';
import { couleurs, couleursMatieres, espaces, formes } from '@/theme';

/** Le temps de voir la bonne réponse après une erreur. */
const PAUSE_APRES_ERREUR_MS = 1200;
const PAUSE_APRES_REUSSITE_MS = 250;

function Chrono() {
  const profil = useProfilActif();
  const enregistrerChrono = useProfils((e) => e.enregistrerChrono);
  const { typo, reglages, animationsReduites } = useThemeEnfant();
  const [themeId, setThemeId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'choix' | 'jeu' | 'fin'>('choix');
  const [reste, setReste] = useState(DUREE_CHRONO_SECONDES);
  const [numero, setNumero] = useState(0);
  const [justes, setJustes] = useState(0);
  const [choisie, setChoisie] = useState<number | null>(null);
  const [calcul, setCalcul] = useState<Exercice | null>(null);
  // Le record d'avant la série, pour le message de fin.
  const [recordAvant, setRecordAvant] = useState<ResultatChrono | undefined>(undefined);
  // Fixée au début de chaque série : chaque minute tire de nouveaux calculs, de façon reproductible.
  const [graine, setGraine] = useState(0);
  const justesRef = useRef(0);
  const suivant = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (suivant.current) clearTimeout(suivant.current);
    },
    [],
  );

  const theme = THEMES.find((t) => t.id === themeId);

  // La minute : elle part quand la série commence.
  useEffect(() => {
    if (phase !== 'jeu') return;
    const debut = Date.now();
    const minuteur = setInterval(() => {
      const ecoule = (Date.now() - debut) / 1000;
      setReste(Math.max(0, Math.ceil(DUREE_CHRONO_SECONDES - ecoule)));
      if (ecoule >= DUREE_CHRONO_SECONDES) {
        clearInterval(minuteur);
        if (suivant.current) clearTimeout(suivant.current);
        setPhase('fin');
      }
    }, 200);
    return () => clearInterval(minuteur);
  }, [phase]);

  // La série est enregistrée une fois, à la fin de la minute.
  const enregistree = useRef(false);
  useEffect(() => {
    if (phase !== 'fin' || !profil || !theme || enregistree.current) return;
    enregistree.current = true;
    enregistrerChrono(profil.id, theme.id, justesRef.current, DUREE_CHRONO_SECONDES);
    celebrer('fin', { silencieux: animationsReduites });
  }, [phase, profil, theme, enregistrerChrono, animationsReduites]);

  if (!profil) return <Redirect href="/" />;
  // Pas de course contre la montre en mode calme.
  if (reglages.modeCalme) return <Redirect href="/enfant" />;
  const themes = themesChrono(profil.classe, profil.toile);

  const nouveauCalcul = (n: number, precedent?: Exercice) => {
    if (!theme) return;
    setCalcul(
      calculDuChrono(theme, profil.classe, niveauPourDomaine(profil.toile, theme.domaine), graine, n, precedent),
    );
    setNumero(n);
    setChoisie(null);
  };

  const lireRecord = (id: string) => profil.progression.chronos?.[id];

  const demarrer = (id: string) => {
    const t = THEMES.find((x) => x.id === id);
    if (!t) return;
    setThemeId(id);
    setRecordAvant(lireRecord(id));
    justesRef.current = 0;
    setJustes(0);
    enregistree.current = false;
    setReste(DUREE_CHRONO_SECONDES);
    const g = graineDePartie(profil.id, `chrono:${t.id}`, profil.progression.chronos?.[t.id]?.series ?? 0);
    setGraine(g);
    setCalcul(calculDuChrono(t, profil.classe, niveauPourDomaine(profil.toile, t.domaine), g, 0));
    setNumero(0);
    setChoisie(null);
    setPhase('jeu');
  };

  if (phase === 'choix' || !theme) {
    return (
      <Ecran pied={<Bouton titre="Retour" variante="secondaire" onPress={() => router.back()} />}>
        <Text style={typo.titre1} accessibilityRole="header">
          Le chrono de Capy
        </Text>
        <BulleCapy
          pose="clinOeil"
          tailleCapy={80}
          texte="Une minute pour répondre au plus de calculs possible. Pas de piège : si tu te trompes, je te montre la réponse et on continue. Essaie de battre ton record !"
        />
        {themes.map((t) => {
          const record = lireRecord(t.id);
          return (
            <CarteTheme key={t.id} theme={t} couleurs={couleursMatieres.mathematiques}>
              <Text style={typo.petit}>
                {record ? `Ton record : ${record.record} bonnes réponses en une minute.` : 'Pas encore de record.'}
              </Text>
              <Bouton
                titre="C’est parti !"
                libelleAccessible={`Lancer le chrono : ${t.titre}`}
                onPress={() => demarrer(t.id)}
              />
            </CarteTheme>
          );
        })}
      </Ecran>
    );
  }

  if (phase === 'fin') {
    return (
      <Ecran
        pied={
          <View style={styles.boutons}>
            <Bouton titre="Encore une minute" onPress={() => demarrer(theme.id)} />
            <Bouton titre="Retour" variante="secondaire" onPress={() => router.back()} />
          </View>
        }
      >
        <View style={styles.fin}>
          <CapyAnime pose="bravo" taille={160} />
          <Text style={[typo.titre1, styles.grandNombre]}>{justes}</Text>
          <Text style={[typo.texteGras, styles.centre]}>bonnes réponses en une minute</Text>
          <Text style={[typo.enonce, styles.centre]}>{messageChrono(justes, recordAvant, profil.prenom)}</Text>
        </View>
      </Ecran>
    );
  }

  const ex = calcul ? adapterExercice(calcul, reglages) : null;
  if (!ex || ex.nature !== 'nombre') return null;
  const repondre = (valeur: number) => {
    if (choisie !== null) return;
    setChoisie(valeur);
    const juste = valeur === ex.reponse;
    if (juste) {
      justesRef.current += 1;
      setJustes(justesRef.current);
      feliciter({ silencieux: true });
    }
    suivant.current = setTimeout(
      () => nouveauCalcul(numero + 1, calcul ?? undefined),
      juste ? PAUSE_APRES_REUSSITE_MS : PAUSE_APRES_ERREUR_MS,
    );
  };

  return (
    <Ecran>
      <View style={styles.entete}>
        <View style={[styles.pastille, reste <= 10 && styles.pastilleFin]} accessibilityLiveRegion="polite">
          <Text style={[typo.titre2, { color: reste <= 10 ? couleurs.jaune.texte : couleurs.sarcelle[900] }]}>
            {reste} s
          </Text>
        </View>
        <Text style={typo.texteGras} accessible accessibilityLabel={`${justes} bonnes réponses`}>
          {justes} ✓
        </Text>
      </View>
      <CarteEnonce enonce={ex.enonce} question={ex.question} />
      <View style={styles.grille}>
        {ex.choix.map((valeur) => (
          <View key={valeur} style={styles.cellule}>
            <TuileReponse
              libelle={valeur}
              etat={
                choisie === null
                  ? 'normal'
                  : valeur === ex.reponse
                    ? 'juste'
                    : valeur === choisie
                      ? 'presque'
                      : 'desactive'
              }
              onPress={() => repondre(valeur)}
            />
          </View>
        ))}
      </View>
    </Ecran>
  );
}

export default avecReglagesEnfant(Chrono);

const styles = StyleSheet.create({
  boutons: { gap: espaces.m },
  fin: { alignItems: 'center', gap: espaces.m, paddingTop: espaces.xl },
  grandNombre: { fontSize: 64, lineHeight: 72, color: couleurs.sarcelle[900] },
  centre: { textAlign: 'center' },
  entete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pastille: {
    backgroundColor: couleurs.menthe[100],
    borderRadius: formes.pilule,
    paddingHorizontal: espaces.l,
    paddingVertical: espaces.xs,
  },
  pastilleFin: { backgroundColor: couleurs.jaune[400] },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.m },
  cellule: { flexBasis: '45%', flexGrow: 1 },
});
