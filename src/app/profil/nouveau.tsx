import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Bouton, CarteConfiance, Ecran, IconeRetour } from '@/composants';
import { CLASSES, type Classe } from '@/config/classes';
import { mascotte } from '@/mascotte';
import { LONGUEUR_MAX_PRENOM, validerPrenom } from '@/profils/validation';
import { useProfils } from '@/store/profils';
import { couleurs, espaces, formes, polices, typo } from '@/theme';

/** Création d'un profil enfant : prénom ou surnom + classe, rien d'autre. */
export default function NouveauProfil() {
  const ajouterProfil = useProfils((e) => e.ajouterProfil);
  const choisirProfil = useProfils((e) => e.choisirProfil);
  const [prenom, setPrenom] = useState('');
  const [classe, setClasse] = useState<Classe | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  function creer() {
    const resultat = validerPrenom(prenom);
    if (!resultat.ok) {
      setErreur(resultat.message);
      return;
    }
    if (!classe) return;
    const profil = ajouterProfil(resultat.prenom, classe);
    choisirProfil(profil.id);
    router.replace({ pathname: '/toile/saisie', params: { apres: 'creation' } });
  }

  return (
    <Ecran
      pied={
        <Bouton
          titre="Créer le profil"
          onPress={creer}
          desactive={prenom.trim().length === 0 || classe === null}
        />
      }
    >
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={8}
        style={styles.retour}
      >
        <IconeRetour taille={28} couleur={couleurs.encre} />
      </Pressable>

      <View style={styles.entete}>
        <Image source={mascotte.exploration} style={styles.capy} resizeMode="contain" accessible={false} />
        <Text style={[typo.titre1, styles.flex]}>Ajouter un enfant</Text>
      </View>

      <View style={styles.champ}>
        <Text style={typo.texteGras} nativeID="libellePrenom">
          Prénom ou surnom
        </Text>
        <TextInput
          value={prenom}
          onChangeText={(t) => {
            setPrenom(t);
            setErreur(null);
          }}
          placeholder="Par exemple : Lou"
          placeholderTextColor={couleurs.encreDouce}
          maxLength={LONGUEUR_MAX_PRENOM + 5}
          autoCapitalize="words"
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          returnKeyType="done"
          accessibilityLabelledBy="libellePrenom"
          accessibilityLabel="Prénom ou surnom"
          style={[styles.saisie, erreur ? styles.saisieErreur : null]}
        />
        {erreur ? <Text style={[typo.petit, styles.erreur]}>{erreur}</Text> : null}
      </View>

      <View style={styles.champ}>
        <Text style={typo.texteGras}>Classe</Text>
        <View style={styles.pastilles} accessibilityRole="radiogroup">
          {CLASSES.map((c) => {
            const choisie = classe === c;
            return (
              <Pressable
                key={c}
                onPress={() => setClasse(c)}
                accessibilityRole="radio"
                accessibilityState={{ checked: choisie }}
                accessibilityLabel={c}
                style={[styles.pastille, choisie && styles.pastilleChoisie]}
              >
                <Text style={[styles.pastilleTexte, choisie && styles.pastilleTexteChoisie]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <CarteConfiance />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  retour: {
    width: formes.cibleTactile,
    height: formes.cibleTactile,
    justifyContent: 'center',
  },
  entete: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  capy: { width: 96, height: 90 },
  flex: { flex: 1 },
  champ: { gap: espaces.s },
  saisie: {
    ...typo.enonce,
    minHeight: 56,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.tuile.rayon,
    paddingHorizontal: espaces.l,
  },
  saisieErreur: { borderColor: couleurs.brun[600] },
  erreur: { color: couleurs.brun[800] },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.s },
  pastille: {
    minWidth: 64,
    minHeight: 48,
    paddingHorizontal: espaces.l,
    borderRadius: formes.pilule,
    borderWidth: 2,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.blanc,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  pastilleChoisie: { backgroundColor: couleurs.menthe[100], borderColor: couleurs.sarcelle[700] },
  pastilleTexte: { fontFamily: polices.fredoka, fontSize: 18, color: couleurs.encre },
  pastilleTexteChoisie: { color: couleurs.sarcelle[900] },
});
