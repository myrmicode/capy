// La dictée de Capy : Capy dit le mot dans une phrase (ou toute une phrase), l'enfant l'écrit au clavier.
// Le clavier ne propose ni suggestion ni correction : ce serait souffler la réponse.
import { useRef, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Bouton, CarteEnonce } from '@/composants';
import { conseilSaisie, saisieJuste } from '@/exercices/francais/dictee';
import { conseilPhrase, phraseJuste } from '@/exercices/francais/phrasesDictees';
import { useThemeEnfant } from '@/accessibilite/contexte';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import { couleurs, espaces, formes } from '@/theme';

import { BoutonReecouter, useDicteeAuDemarrage } from './dicter';
import type { PropsJeuTexte } from './types';

/** Lettres accentuées difficiles à trouver sur le clavier d'une tablette. */
export const LETTRES_SPECIALES = ['é', 'è', 'ê', 'à', 'â', 'ç', 'ù', 'î', 'ô', '’'] as const;
const LONGUEUR_MAX = 30;
const LONGUEUR_MAX_PHRASE = 120;

export function JeuDictee({ exercice, actif, onRepondre }: PropsJeuTexte) {
  const [saisie, setSaisie] = useState('');
  // Position du curseur, telle que le champ la signale ; inconnue = à la fin du mot.
  // Le curseur n'est pas imposé au champ : sur Android, cela le fait sauter pendant la frappe.
  const curseur = useRef<{ start: number; end: number } | null>(null);
  const [conseil, setConseil] = useState<string | null>(null);
  const { typo, cible, ecart } = useThemeEnfant();
  useDicteeAuDemarrage(exercice.lecture);
  // La même dictée sert pour les mots, les syllabes (CE1) et les phrases.
  const syllabe = exercice.domaine === 'ecrire-syllabes';
  const enPhrase = exercice.modeleId === 'dictee-phrase';
  const longueurMax = enPhrase ? LONGUEUR_MAX_PHRASE : LONGUEUR_MAX;

  const ajouter = (lettre: string) => {
    if (!actif || saisie.length >= longueurMax) return;
    const { start, end } = curseur.current ?? {
      start: saisie.length,
      end: saisie.length,
    };
    setSaisie(saisie.slice(0, start) + lettre + saisie.slice(end));
    curseur.current = {
      start: start + lettre.length,
      end: start + lettre.length,
    };
    setConseil(null);
  };

  const valider = () => {
    if (!actif || !saisie.trim()) return;
    Keyboard.dismiss();
    const juste = enPhrase ? phraseJuste(saisie, exercice.reponse) : saisieJuste(saisie, exercice.reponse);
    if (juste) setConseil(null);
    else setConseil(enPhrase ? conseilPhrase(saisie, exercice.reponse) : conseilSaisie(saisie, exercice.reponse));
    onRepondre(juste);
  };

  return (
    <View style={styles.jeu}>
      <CarteEnonce enonce={exercice.enonce} question={exercice.question} />
      {exercice.lecture ? (
        <BoutonReecouter
          lecture={exercice.lecture}
          titre={syllabe ? 'Réécouter la syllabe' : enPhrase ? 'Réécouter la phrase' : undefined}
        />
      ) : null}

      <TextInput
        value={saisie}
        onChangeText={(t) => {
          setSaisie(t);
          curseur.current = null;
          setConseil(null);
        }}
        onSelectionChange={(e) => {
          curseur.current = e.nativeEvent.selection;
        }}
        editable={actif}
        placeholder={syllabe ? 'Écris la syllabe ici' : enPhrase ? 'Écris la phrase ici' : 'Écris le mot ici'}
        placeholderTextColor={couleurs.encreDouce}
        maxLength={longueurMax}
        multiline={enPhrase}
        // Une phrase se valide avec le bouton : « Entrée » ne doit pas aller à la ligne.
        submitBehavior={enPhrase ? 'blurAndSubmit' : undefined}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
        textContentType="none"
        importantForAutofill="no"
        // Sur Android, ce type de clavier coupe la barre de suggestions.
        keyboardType={Platform.OS === 'android' ? 'visible-password' : 'default'}
        returnKeyType="done"
        onSubmitEditing={valider}
        accessibilityLabel={
          syllabe ? 'La syllabe que tu as écrite' : enPhrase ? 'La phrase que tu as écrite' : 'Le mot que tu as écrit'
        }
        style={[enPhrase ? typo.enonce : typo.titre2, styles.saisie, enPhrase && styles.saisiePhrase]}
      />

      <View style={[styles.lettres, { gap: ecart('s') }]} accessibilityLabel="Lettres avec accent">
        {LETTRES_SPECIALES.map((lettre) => (
          <Pressable
            key={lettre}
            onPress={() => ajouter(lettre)}
            accessibilityRole="button"
            accessibilityLabel={lettre === '’' ? 'Apostrophe' : `Ajouter ${lettre}`}
            style={({ pressed }) => [
              styles.lettre,
              { minWidth: cible, height: cible },
              pressed && styles.lettreAppuyee,
            ]}
          >
            <Text style={[typo.titre3, styles.texteLettre]}>{lettre}</Text>
          </Pressable>
        ))}
      </View>

      {conseil ? <TexteAccessible texte={conseil} variante="texteGras" style={styles.conseil} /> : null}

      <Bouton titre="Valider" onPress={valider} desactive={!actif || !saisie.trim()} />
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: { gap: espaces.l },
  saisie: {
    minHeight: 64,
    textAlign: 'center',
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.tuile.rayon,
    paddingHorizontal: espaces.l,
  },
  saisiePhrase: { minHeight: 96, textAlign: 'left', paddingVertical: espaces.m, textAlignVertical: 'top' },
  lettres: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  lettre: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: couleurs.menthe[100],
    borderRadius: formes.tuile.rayon,
  },
  lettreAppuyee: { backgroundColor: couleurs.menthe[200] },
  texteLettre: { color: couleurs.sarcelle[900] },
  conseil: { textAlign: 'center' },
});
