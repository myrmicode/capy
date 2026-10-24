// Réglages de lecture et de jeu d'un enfant, dans l'espace parent (et proposés,
// de façon facultative, à la fin de la création d'un profil).
// Aucun diagnostic n'est demandé ni enregistré : seulement les réglages eux-mêmes.
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { adapterExercice } from '@/accessibilite/adaptation';
import { FournisseurReglages } from '@/accessibilite/contexte';
import { OPTIONS, TITRES_SECTIONS, type OptionReglage, type SectionReglages } from '@/accessibilite/options';
import {
  appliquerRaccourci,
  lireReglages,
  RACCOURCIS,
  REGLAGES_PAR_DEFAUT,
  sontParDefaut,
  type ReglagesEnfant,
} from '@/accessibilite/reglages';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import { AideNombres, Bouton, ControleParental, Ecran, IconeHautParleur } from '@/composants';
import { modeleParId } from '@/exercices';
import { JeuReponses } from '@/jeux/JeuReponses';
import { lireAVoixHaute } from '@/jeux/retours';
import { deverrouillerParents, parentsDeverrouilles } from '@/parents/verrou';
import { useProfils } from '@/store/profils';
import { couleurs, espaces, formes, typo } from '@/theme';

/** Phrase d'exemple de l'aperçu : tous ses mots ont un découpage syllabique vérifié. */
export const PHRASE_APERCU = 'Capy range ses billes dans une jolie boîte bleue.';
const EXERCICE_APERCU = modeleParId('ajout')!.generer('CE2', 3, {
  niveau: 1,
  histoire: 0,
});
const SECTIONS: readonly SectionReglages[] = ['lecture', 'calcul', 'geste', 'attention'];

export default function ReglagesLecture() {
  const { profil: profilId = '', apres } = useLocalSearchParams<{
    profil?: string;
    apres?: string;
  }>();
  const profil = useProfils((e) => e.profils.find((p) => p.id === profilId));
  const modifierReglages = useProfils((e) => e.modifierReglages);
  const apresCreation = apres === 'creation';
  const [deverrouille, setDeverrouille] = useState(() => apresCreation || parentsDeverrouilles());
  const [adapter, setAdapter] = useState(!apresCreation);

  if (!profil) return <Redirect href="/" />;
  if (!deverrouille) {
    return (
      <Ecran>
        <ControleParental
          onReussi={() => {
            deverrouillerParents();
            setDeverrouille(true);
          }}
        />
      </Ecran>
    );
  }

  const reglages = lireReglages(profil.reglages);
  const changer = (r: ReglagesEnfant) => modifierReglages(profil.id, r);
  const terminer = () =>
    apresCreation ? router.replace({ pathname: '/toile', params: { apres: 'creation' } }) : router.back();

  if (!adapter) {
    return (
      <Ecran
        pied={
          <View style={styles.boutons}>
            <Bouton titre="Oui, adapter" onPress={() => setAdapter(true)} />
            <Bouton titre="Plus tard" variante="secondaire" onPress={terminer} />
          </View>
        }
      >
        <Text style={typo.titre1}>Voulez-vous adapter la lecture ou les jeux ?</Text>
        <Text style={typo.texte}>
          Capy peut agrandir le texte, colorer les syllabes, lire les consignes à voix haute, remplacer les gestes de
          glisser par des touchers, ou rendre l’écran plus calme. C’est facultatif, et modifiable à tout moment dans
          l’espace parent.
        </Text>
        <Text style={typo.petit}>
          Aucune information de santé n’est demandée ni enregistrée : seuls les réglages choisis sont gardés.
        </Text>
      </Ecran>
    );
  }

  return (
    <Ecran pied={<Bouton titre="Terminé" onPress={terminer} />}>
      <View>
        <Text style={typo.titre1}>Réglages de lecture et de jeu</Text>
        <Text style={typo.petit}>Pour {profil.prenom}. Chaque changement s’applique tout de suite.</Text>
      </View>
      <Text style={typo.texte}>
        Ces réglages adaptent l’affichage et les jeux. Aucune information de santé n’est demandée ni enregistrée : seuls
        les réglages choisis sont gardés.
      </Text>

      <Section titre="Raccourcis">
        <Text style={typo.petit}>
          Un raccourci active plusieurs réglages d’un coup ; vous les ajustez ensuite un par un.
        </Text>
        {RACCOURCIS.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => changer(appliquerRaccourci(reglages, r))}
            accessibilityRole="button"
            accessibilityLabel={`${r.titre}. ${r.description}`}
            style={({ pressed }) => [styles.raccourci, pressed && styles.appuye]}
          >
            <Text style={[typo.texteGras, styles.titreRaccourci]}>{r.titre}</Text>
            <Text style={typo.petit}>{r.description}</Text>
          </Pressable>
        ))}
      </Section>

      <Apercu reglages={reglages} />

      {SECTIONS.map((s) => (
        <Section key={s} titre={TITRES_SECTIONS[s]}>
          {OPTIONS.filter((o) => o.section === s).map((o) => (
            <LigneOption key={o.cle} option={o} reglages={reglages} onChange={changer} />
          ))}
        </Section>
      ))}

      <Bouton
        titre="Revenir aux réglages par défaut"
        variante="secondaire"
        desactive={sontParDefaut(reglages)}
        onPress={() => changer(REGLAGES_PAR_DEFAUT)}
      />
      <Text style={typo.petit}>
        Polices : Andika (SIL), OpenDyslexic (Abbie Gonzalez, licence SIL OFL) et Luciole (Laurent Bourcellier et
        Jonathan Perez, licence CC BY 4.0).
      </Text>
    </Ecran>
  );
}

/** Aperçu en direct : une phrase et un petit exercice, avec les réglages en cours. */
function Apercu({ reglages }: { reglages: ReglagesEnfant }) {
  const exercice = useMemo(() => adapterExercice(EXERCICE_APERCU, reglages), [reglages]);
  const [essai, setEssai] = useState(0);
  return (
    <FournisseurReglages reglages={reglages}>
      <Section titre="Aperçu">
        <TexteAccessible texte={PHRASE_APERCU} variante="enonce" coloration />
        <Bouton
          titre="Écouter"
          variante="secondaire"
          pleineLargeur={false}
          icone={(c) => <IconeHautParleur taille={22} couleur={c} />}
          onPress={() => lireAVoixHaute(PHRASE_APERCU, { lente: reglages.lectureLente })}
        />
        {reglages.aidesVisuelles && exercice.nature === 'nombre' ? (
          <AideNombres nombres={Object.values(exercice.donnees)} />
        ) : null}
        <JeuReponses
          key={essai}
          exercice={exercice}
          actif
          onRepondre={() => setTimeout(() => setEssai((n) => n + 1), 1200)}
        />
      </Section>
    </FournisseurReglages>
  );
}

function LigneOption({
  option,
  reglages,
  onChange,
}: {
  option: OptionReglage;
  reglages: ReglagesEnfant;
  onChange: (r: ReglagesEnfant) => void;
}) {
  const valeur = reglages[option.cle];
  return (
    <View style={styles.option}>
      <View style={styles.ligne}>
        <View style={styles.flex}>
          <Text style={typo.texteGras}>{option.titre}</Text>
          <Text style={typo.petit}>{option.explication}</Text>
        </View>
        {option.type === 'interrupteur' ? (
          <Switch
            value={valeur === true}
            onValueChange={(v) => onChange({ ...reglages, [option.cle]: v })}
            trackColor={{
              true: couleurs.sarcelle[700],
              false: couleurs.gris[300],
            }}
            thumbColor={couleurs.blanc}
            accessibilityLabel={option.titre}
          />
        ) : null}
      </View>
      {option.type === 'choix' ? (
        <View style={styles.choix} accessibilityRole="radiogroup" accessibilityLabel={option.titre}>
          {option.valeurs.map((v) => {
            const choisi = v.valeur === valeur;
            return (
              <Pressable
                key={String(v.valeur)}
                onPress={() => onChange({ ...reglages, [option.cle]: v.valeur })}
                accessibilityRole="radio"
                accessibilityState={{ checked: choisi }}
                accessibilityLabel={`${option.titre} : ${v.libelle}`}
                style={[styles.pastille, choisi && styles.pastilleChoisie]}
              >
                <Text style={[typo.texteGras, choisi && styles.texteChoisi]}>{v.libelle}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={typo.titre3}>{titre}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  boutons: { gap: espaces.m },
  section: {
    gap: espaces.m,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
  },
  raccourci: {
    gap: espaces.xs,
    padding: espaces.m,
    borderRadius: formes.tuile.rayon,
    borderWidth: 2,
    borderColor: couleurs.bordure,
    minHeight: formes.cibleTactile,
  },
  titreRaccourci: { color: couleurs.sarcelle[700] },
  appuye: { backgroundColor: couleurs.menthe[100] },
  option: { gap: espaces.s, paddingVertical: espaces.xs },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  flex: { flex: 1 },
  choix: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.s },
  pastille: {
    minHeight: formes.cibleTactile,
    justifyContent: 'center',
    paddingHorizontal: espaces.l,
    borderRadius: formes.pilule,
    borderWidth: 2,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.blanc,
  },
  pastilleChoisie: {
    backgroundColor: couleurs.sarcelle[700],
    borderColor: couleurs.sarcelle[700],
  },
  texteChoisi: { color: couleurs.blanc },
});
