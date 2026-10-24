// Réglages de lecture et de jeu d'un enfant, dans l'espace parent (et proposés,
// de façon facultative, à la fin de la création d'un profil).
// Aucun diagnostic n'est demandé ni enregistré : seulement les réglages eux-mêmes.
// Chaque option s'active et se désactive seule ; un aperçu montre le résultat.
// Sur une tablette en largeur, l'aperçu reste visible à côté des options.
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';

import { adapterExercice } from '@/accessibilite/adaptation';
import { FournisseurReglages, useThemeEnfant } from '@/accessibilite/contexte';
import {
  basculerOption,
  OPTIONS,
  optionActive,
  optionsActives,
  SECTIONS,
  type OptionReglage,
  type OptionVariante,
} from '@/accessibilite/options';
import {
  basculerRaccourci,
  lireReglages,
  RACCOURCIS,
  raccourciActif,
  REGLAGES_PAR_DEFAUT,
  sontParDefaut,
  type ReglagesEnfant,
} from '@/accessibilite/reglages';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import { AideNombres, Bouton, ControleParental, Ecran, IconeBouclier, IconeCoche, IconeHautParleur, IconeOeil } from '@/composants';
import { modeleParId } from '@/exercices';
import { JeuReponses } from '@/jeux/JeuReponses';
import { lireAVoixHaute } from '@/jeux/retours';
import { mascotte } from '@/mascotte';
import { deverrouillerParents, parentsDeverrouilles } from '@/parents/verrou';
import { useProfils } from '@/store/profils';
import { couleurs, espaces, formes } from '@/theme';

/** Phrase d'exemple de l'aperçu : tous ses mots ont un découpage syllabique vérifié. */
export const PHRASE_APERCU = 'Capy range ses billes dans une jolie boîte bleue.';
const EXERCICE_APERCU = modeleParId('ajout')!.generer('CE2', 3, { niveau: 1, histoire: 0 });

/** Largeur à partir de laquelle l'aperçu passe à côté des options. */
const LARGEUR_DEUX_COLONNES = 900;
/** Largeur à partir de laquelle les raccourcis vont par deux. */
const LARGEUR_RACCOURCIS_PAR_DEUX = 560;

export default function ReglagesLecture() {
  const { typo } = useThemeEnfant();
  const { profil: profilId = '', apres } = useLocalSearchParams<{ profil?: string; apres?: string }>();
  const profil = useProfils((e) => e.profils.find((p) => p.id === profilId));
  const modifierReglages = useProfils((e) => e.modifierReglages);
  const apresCreation = apres === 'creation';
  const [deverrouille, setDeverrouille] = useState(() => apresCreation || parentsDeverrouilles());
  const [adapter, setAdapter] = useState(!apresCreation);
  const [apercuOuvert, setApercuOuvert] = useState(false);
  const { width } = useWindowDimensions();

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
  const terminer = () => (apresCreation ? router.replace({ pathname: '/toile', params: { apres: 'creation' } }) : router.back());

  if (!adapter) return <Proposition prenom={profil.prenom} onAdapter={() => setAdapter(true)} onPlusTard={terminer} />;

  const deuxColonnes = width >= LARGEUR_DEUX_COLONNES;
  const nombreActives = optionsActives(reglages).length;

  const entete = (
    <View style={styles.entete}>
      <Text style={typo.titre1}>Réglages de lecture et de jeu</Text>
      <View style={styles.ligneEntete}>
        <Text style={typo.texteGras}>Pour {profil.prenom}</Text>
        <View style={[styles.compteur, nombreActives === 0 && styles.compteurVide]}>
          <Text style={[typo.petit, styles.texteCompteur]}>
            {nombreActives === 0
              ? 'Aucun réglage activé'
              : `${nombreActives} réglage${nombreActives > 1 ? 's' : ''} activé${nombreActives > 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>
      <View style={styles.note}>
        <IconeBouclier taille={22} couleur={couleurs.sarcelle[700]} />
        <Text style={[typo.petit, styles.texteNote]}>
          Aucune information de santé n’est demandée ni enregistrée : seuls les réglages choisis sont gardés. Chaque
          changement s’applique tout de suite.
        </Text>
      </View>
    </View>
  );

  const options = (
    <>
      <Raccourcis
        reglages={reglages}
        onChange={changer}
        parDeux={(deuxColonnes ? width * 0.55 : width) >= LARGEUR_RACCOURCIS_PAR_DEUX}
      />
      {SECTIONS.map((s) => (
        <SectionOptions
          key={s.id}
          titre={s.titre}
          description={s.description}
          options={OPTIONS.filter((o) => o.section === s.id)}
          reglages={reglages}
          onChange={changer}
        />
      ))}
      <Bouton
        titre="Tout désactiver"
        variante="secondaire"
        desactive={sontParDefaut(reglages)}
        onPress={() => changer(REGLAGES_PAR_DEFAUT)}
      />
      <Text style={[typo.petit, styles.centre]}>
        Polices : Andika (SIL), OpenDyslexic (Abbie Gonzalez, licence SIL OFL) et Luciole (Laurent Bourcellier et
        Jonathan Perez, licence CC BY 4.0).
      </Text>
    </>
  );

  if (deuxColonnes) {
    // Tablette en largeur : les options défilent à gauche, l'aperçu reste visible à droite.
    return (
      <Ecran
        defilant={false}
        largeurMax={1180}
        pied={
          <View style={styles.piedLarge}>
            <Bouton titre="Terminé" onPress={terminer} />
          </View>
        }
      >
        <View style={styles.deuxColonnes}>
          <ScrollView
            style={styles.colonneOptions}
            contentContainerStyle={styles.pile}
            showsVerticalScrollIndicator={false}
          >
            {entete}
            {options}
          </ScrollView>
          <ScrollView style={styles.colonneApercu} contentContainerStyle={styles.pile} showsVerticalScrollIndicator={false}>
            <Apercu reglages={reglages} prenom={profil.prenom} />
          </ScrollView>
        </View>
      </Ecran>
    );
  }

  // Téléphone et tablette en hauteur : l'aperçu s'ouvre en plein écran, toujours à portée de doigt.
  return (
    <>
      <Ecran
        pied={
          <View style={styles.piedDouble}>
            <Bouton
              titre="Aperçu"
              variante="secondaire"
              icone={(c) => <IconeOeil taille={22} couleur={c} />}
              onPress={() => setApercuOuvert(true)}
              style={styles.flex}
            />
            <Bouton titre="Terminé" onPress={terminer} style={styles.flex} />
          </View>
        }
      >
        {entete}
        {options}
      </Ecran>
      <Modal visible={apercuOuvert} animationType="slide" onRequestClose={() => setApercuOuvert(false)}>
        <Ecran pied={<Bouton titre="Revenir aux réglages" onPress={() => setApercuOuvert(false)} />}>
          <Apercu reglages={reglages} prenom={profil.prenom} />
          <Text style={[typo.petit, styles.centre]}>Touchez une réponse pour essayer.</Text>
        </Ecran>
      </Modal>
    </>
  );
}

/** Après la création d'un profil : proposition facultative, sans obligation. */
function Proposition({ prenom, onAdapter, onPlusTard }: { prenom: string; onAdapter: () => void; onPlusTard: () => void }) {
  const { typo } = useThemeEnfant();
  return (
    <Ecran
      pied={
        <View style={styles.boutons}>
          <Bouton titre="Oui, adapter" onPress={onAdapter} />
          <Bouton titre="Plus tard" variante="secondaire" onPress={onPlusTard} />
        </View>
      }
    >
      <Image source={mascotte.explorer} style={styles.capyProposition} resizeMode="contain" accessible={false} />
      <Text style={[typo.titre1, styles.centre]}>Voulez-vous adapter la lecture ou les jeux ?</Text>
      <Text style={[typo.texte, styles.centre]}>
        Capy peut agrandir le texte, colorer les syllabes, lire les consignes à voix haute, remplacer les gestes de
        glisser par des touchers, ou rendre l’écran plus calme pour {prenom}.
      </Text>
      <View style={styles.listeProposition}>
        {['C’est facultatif.', 'Chaque réglage s’active et se désactive à tout moment, dans l’espace parent.'].map((t) => (
          <View key={t} style={styles.puce}>
            <IconeCoche taille={20} couleur={couleurs.sarcelle[700]} />
            <Text style={[typo.texte, styles.flex]}>{t}</Text>
          </View>
        ))}
      </View>
      <View style={styles.note}>
        <IconeBouclier taille={22} couleur={couleurs.sarcelle[700]} />
        <Text style={[typo.petit, styles.texteNote]}>
          Aucune information de santé n’est demandée ni enregistrée : seuls les réglages choisis sont gardés.
        </Text>
      </View>
    </Ecran>
  );
}

/** Les raccourcis : un toucher active un groupe de réglages, un second toucher le retire. */
function Raccourcis({
  reglages,
  onChange,
  parDeux,
}: {
  reglages: ReglagesEnfant;
  onChange: (r: ReglagesEnfant) => void;
  parDeux: boolean;
}) {
  const { typo } = useThemeEnfant();
  return (
    <Carte>
      <Text style={typo.titre3}>Raccourcis</Text>
      <Text style={typo.petit}>
        Un raccourci active plusieurs réglages d’un coup ; touchez-le à nouveau pour les retirer. Vous pouvez ensuite
        ajuster chaque réglage un par un.
      </Text>
      <View style={styles.grille}>
        {RACCOURCIS.map((r) => {
          const actif = raccourciActif(reglages, r);
          return (
            <Pressable
              key={r.id}
              onPress={() => onChange(basculerRaccourci(reglages, r))}
              accessibilityRole="switch"
              accessibilityState={{ checked: actif }}
              accessibilityLabel={`${r.titre}. ${r.description}`}
              style={({ pressed }) => [
                styles.raccourci,
                parDeux ? styles.raccourciDemi : styles.raccourciPlein,
                actif && styles.raccourciActif,
                pressed && styles.appuye,
              ]}
            >
              <View style={styles.ligneRaccourci}>
                <Text style={[typo.texteGras, styles.titreRaccourci, actif && styles.titreRaccourciActif]}>{r.titre}</Text>
                {actif ? (
                  <View style={styles.badgeActif}>
                    <IconeCoche taille={16} couleur={couleurs.blanc} />
                    <Text style={[typo.petit, styles.texteBadge]}>Activé</Text>
                  </View>
                ) : null}
              </View>
              <Text style={typo.petit}>{r.description}</Text>
            </Pressable>
          );
        })}
      </View>
    </Carte>
  );
}

function SectionOptions({
  titre,
  description,
  options,
  reglages,
  onChange,
}: {
  titre: string;
  description: string;
  options: readonly OptionReglage[];
  reglages: ReglagesEnfant;
  onChange: (r: ReglagesEnfant) => void;
}) {
  const { typo } = useThemeEnfant();
  const actives = options.filter((o) => o.type !== 'variante' && optionActive(o, reglages)).length;
  const visibles = options.filter((o) => o.type !== 'variante' || optionActive(o, reglages));
  return (
    <Carte>
      <View style={styles.enteteSection}>
        <Text style={[typo.titre3, styles.flex]}>{titre}</Text>
        {actives > 0 ? (
          <View style={styles.compteur}>
            <Text style={[typo.petit, styles.texteCompteur]}>
              {actives} activé{actives > 1 ? 's' : ''}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={typo.petit}>{description}</Text>
      <View>
        {visibles.map((o, i) =>
          o.type === 'variante' ? (
            <LigneVariante key={o.cle} option={o} reglages={reglages} onChange={onChange} />
          ) : (
            <LigneOption key={o.cle} option={o} reglages={reglages} onChange={onChange} premiere={i === 0} />
          ),
        )}
      </View>
    </Carte>
  );
}

function LigneOption({
  option,
  reglages,
  onChange,
  premiere,
}: {
  option: Exclude<OptionReglage, OptionVariante>;
  reglages: ReglagesEnfant;
  onChange: (r: ReglagesEnfant) => void;
  premiere: boolean;
}) {
  const { typo } = useThemeEnfant();
  const active = optionActive(option, reglages);
  return (
    <View style={[styles.option, !premiere && styles.separateur]}>
      <View style={styles.ligne}>
        <View style={styles.flex}>
          <Text style={typo.texteGras}>{option.titre}</Text>
          <Text style={typo.petit}>{option.explication}</Text>
        </View>
        <Switch
          value={active}
          onValueChange={(v) => onChange(basculerOption(option, reglages, v))}
          trackColor={{ true: couleurs.sarcelle[700], false: couleurs.gris[300] }}
          thumbColor={couleurs.blanc}
          accessibilityLabel={option.titre}
        />
      </View>
      {option.type === 'choix' && active ? (
        <Pastilles
          libelle={option.titre}
          valeurs={option.valeurs}
          valeur={reglages[option.cle]}
          onChoisir={(v) => onChange({ ...reglages, [option.cle]: v })}
        />
      ) : null}
    </View>
  );
}

/** Une précision d'une option activée (les couleurs des syllabes), en retrait sous elle. */
function LigneVariante({
  option,
  reglages,
  onChange,
}: {
  option: OptionVariante;
  reglages: ReglagesEnfant;
  onChange: (r: ReglagesEnfant) => void;
}) {
  const { typo } = useThemeEnfant();
  return (
    <View style={styles.variante}>
      <Text style={typo.texteGras}>{option.titre}</Text>
      <Text style={typo.petit}>{option.explication}</Text>
      <Pastilles
        libelle={option.titre}
        valeurs={option.valeurs}
        valeur={reglages[option.cle]}
        onChoisir={(v) => onChange({ ...reglages, [option.cle]: v })}
      />
    </View>
  );
}

function Pastilles<V>({
  libelle,
  valeurs,
  valeur,
  onChoisir,
}: {
  libelle: string;
  valeurs: readonly { valeur: V; libelle: string }[];
  valeur: V;
  onChoisir: (v: V) => void;
}) {
  const { typo } = useThemeEnfant();
  return (
    <View style={styles.pastilles} accessibilityRole="radiogroup" accessibilityLabel={`Choix pour : ${libelle}`}>
      {valeurs.map((v) => {
        const choisie = v.valeur === valeur;
        return (
          <Pressable
            key={String(v.valeur)}
            onPress={() => onChoisir(v.valeur)}
            accessibilityRole="radio"
            accessibilityState={{ checked: choisie }}
            accessibilityLabel={`${libelle} : ${v.libelle}`}
            style={({ pressed }) => [styles.pastille, choisie && styles.pastilleChoisie, pressed && !choisie && styles.appuye]}
          >
            {choisie ? <IconeCoche taille={16} couleur={couleurs.blanc} /> : null}
            <Text style={[typo.texteGras, choisie && styles.texteChoisi]}>{v.libelle}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Aperçu en direct : une phrase et un petit exercice, sur le fond et avec les réglages choisis. */
function Apercu({ reglages, prenom }: { reglages: ReglagesEnfant; prenom: string }) {
  return (
    <FournisseurReglages reglages={reglages}>
      <ContenuApercu reglages={reglages} prenom={prenom} />
    </FournisseurReglages>
  );
}

function ContenuApercu({ reglages, prenom }: { reglages: ReglagesEnfant; prenom: string }) {
  const { typo } = useThemeEnfant();
  const { fond } = useThemeEnfant();
  const exercice = useMemo(() => adapterExercice(EXERCICE_APERCU, reglages, 'reponses'), [reglages]);
  const [essai, setEssai] = useState(0);
  return (
    <View style={styles.apercu}>
      <View style={styles.enteteApercu}>
        <View style={styles.flex}>
          <Text style={typo.titre3}>Aperçu</Text>
          <Text style={typo.petit}>Ce que voit {prenom}</Text>
        </View>
        <Bouton
          titre="Écouter"
          variante="secondaire"
          pleineLargeur={false}
          icone={(c) => <IconeHautParleur taille={22} couleur={c} />}
          onPress={() => lireAVoixHaute(PHRASE_APERCU, { lente: reglages.lectureLente })}
        />
      </View>
      <View style={[styles.scene, { backgroundColor: fond }]}>
        <TexteAccessible texte={PHRASE_APERCU} variante="enonce" coloration />
        {reglages.aidesVisuelles && exercice.nature === 'nombre' ? (
          <AideNombres nombres={Object.values(exercice.donnees)} />
        ) : null}
        <JeuReponses key={essai} exercice={exercice} actif onRepondre={() => setTimeout(() => setEssai((n) => n + 1), 1200)} />
      </View>
    </View>
  );
}

function Carte({ children }: { children: ReactNode }) {
  return <View style={styles.carte}>{children}</View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centre: { textAlign: 'center' },
  boutons: { gap: espaces.m },
  entete: { gap: espaces.s },
  ligneEntete: { flexDirection: 'row', alignItems: 'center', gap: espaces.s, flexWrap: 'wrap' },
  compteur: {
    backgroundColor: couleurs.menthe[100],
    borderRadius: formes.pilule,
    paddingHorizontal: espaces.m,
    paddingVertical: 2,
  },
  compteurVide: { backgroundColor: couleurs.gris[200] },
  texteCompteur: { color: couleurs.sarcelle[900] },
  note: {
    flexDirection: 'row',
    gap: espaces.s,
    alignItems: 'flex-start',
    backgroundColor: couleurs.menthe[100],
    borderRadius: formes.tuile.rayon,
    padding: espaces.m,
  },
  texteNote: { flex: 1, color: couleurs.encre },
  carte: {
    gap: espaces.s,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
  },
  enteteSection: { flexDirection: 'row', alignItems: 'center', gap: espaces.s },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.m, marginTop: espaces.xs },
  raccourci: {
    gap: espaces.xs,
    padding: espaces.m,
    minHeight: formes.cibleTactile,
    borderRadius: formes.tuile.rayon,
    borderWidth: 2,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.blanc,
  },
  raccourciPlein: { flexBasis: '100%' },
  raccourciDemi: { flexBasis: '47%', flexGrow: 1 },
  raccourciActif: { borderColor: couleurs.sarcelle[700], backgroundColor: couleurs.menthe[100] },
  ligneRaccourci: { flexDirection: 'row', alignItems: 'center', gap: espaces.s, flexWrap: 'wrap' },
  titreRaccourci: { flex: 1, color: couleurs.sarcelle[700] },
  titreRaccourciActif: { color: couleurs.sarcelle[900] },
  badgeActif: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: couleurs.sarcelle[700],
    borderRadius: formes.pilule,
    paddingHorizontal: espaces.s,
    paddingVertical: 2,
  },
  texteBadge: { color: couleurs.blanc },
  appuye: { opacity: 0.85 },
  option: { gap: espaces.s, paddingVertical: espaces.m },
  separateur: { borderTopWidth: 1, borderTopColor: couleurs.bordure },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: espaces.m, minHeight: formes.cibleTactile },
  variante: {
    gap: espaces.xs,
    marginBottom: espaces.m,
    marginLeft: espaces.m,
    paddingLeft: espaces.m,
    borderLeftWidth: 3,
    borderLeftColor: couleurs.menthe[200],
  },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.s, marginTop: espaces.xs },
  pastille: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.xs,
    minHeight: formes.cibleTactile,
    paddingHorizontal: espaces.l,
    borderRadius: formes.pilule,
    borderWidth: 2,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.blanc,
  },
  pastilleChoisie: { backgroundColor: couleurs.sarcelle[700], borderColor: couleurs.sarcelle[700] },
  texteChoisi: { color: couleurs.blanc },
  apercu: {
    gap: espaces.m,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.sarcelle[400],
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
  },
  enteteApercu: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  scene: { gap: espaces.l, borderRadius: formes.tuile.rayon, padding: espaces.m },
  deuxColonnes: { flex: 1, flexDirection: 'row', gap: espaces.xl },
  colonneOptions: { flex: 1.35 },
  colonneApercu: { flex: 1 },
  pile: { gap: espaces.l, paddingBottom: espaces.xl },
  piedLarge: { width: '100%', maxWidth: 420, alignSelf: 'flex-end' },
  piedDouble: { flexDirection: 'row', gap: espaces.m },
  capyProposition: { width: 150, height: 150, alignSelf: 'center' },
  listeProposition: { gap: espaces.s, alignSelf: 'center', maxWidth: 520, width: '100%' },
  puce: { flexDirection: 'row', gap: espaces.s, alignItems: 'flex-start' },
});
