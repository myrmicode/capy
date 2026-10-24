import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { creerAlea } from '@/exercices';
import { mascotte } from '@/mascotte';
import { nouveauDefi, type DefiParental } from '@/parents/controleParental';
import { couleurs, espaces, formes, polices, typo } from '@/theme';

import { Bouton } from './Bouton';
import { IconeRetour } from './icones';

const TOUCHES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'effacer', '0', 'valider'] as const;

function tirerDefi(): DefiParental {
  return nouveauDefi(creerAlea(Math.floor(Math.random() * 2 ** 31)));
}

/**
 * Contrôle parental avant l'espace parent : un nombre écrit en lettres à taper
 * en chiffres. Une erreur propose simplement un autre nombre, sans blocage.
 */
export function ControleParental({ onReussi }: { onReussi: () => void }) {
  const [defi, setDefi] = useState(tirerDefi);
  const [saisie, setSaisie] = useState('');
  const [autreNombre, setAutreNombre] = useState(false);

  const toucher = (t: (typeof TOUCHES)[number]) => {
    if (t === 'effacer') return setSaisie((s) => s.slice(0, -1));
    if (t === 'valider') {
      if (saisie === defi.reponse) return onReussi();
      setDefi(tirerDefi());
      setSaisie('');
      setAutreNombre(true);
      return;
    }
    setSaisie((s) => (s.length < 6 ? s + t : s));
  };

  return (
    <View style={styles.cadre}>
      <View style={styles.entete}>
        <Image source={mascotte.serieux} style={styles.capy} resizeMode="contain" accessible={false} />
        <View style={styles.flex}>
          <Text style={typo.titre2}>Espace réservé aux parents</Text>
          <Text style={typo.petit}>Pour continuer, écrivez ce nombre en chiffres.</Text>
        </View>
      </View>

      <View style={styles.carte}>
        <Text style={[typo.enonce, styles.centre]}>{defi.enLettres}</Text>
        <Text style={styles.saisie} accessibilityLabel={`Saisie : ${saisie || 'vide'}`}>
          {saisie || ' '}
        </Text>
        {autreNombre ? (
          <Text style={[typo.petit, styles.centre]}>Ce n’était pas tout à fait ça. Voici un autre nombre.</Text>
        ) : null}
      </View>

      <View style={styles.clavier}>
        {TOUCHES.map((t) =>
          t === 'valider' ? (
            <View key={t} style={styles.touche}>
              <Bouton titre="OK" onPress={() => toucher(t)} desactive={saisie.length === 0} libelleAccessible="Valider" />
            </View>
          ) : (
            <Pressable
              key={t}
              onPress={() => toucher(t)}
              accessibilityRole="button"
              accessibilityLabel={t === 'effacer' ? 'Effacer' : t}
              style={({ pressed }) => [styles.touche, styles.chiffre, pressed && styles.chiffreAppuye]}
            >
              {t === 'effacer' ? (
                <IconeRetour taille={26} couleur={couleurs.encre} />
              ) : (
                <Text style={styles.texteTouche}>{t}</Text>
              )}
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: { gap: espaces.l },
  entete: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  capy: { width: 80, height: 90 },
  flex: { flex: 1, gap: espaces.xs },
  carte: {
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
    gap: espaces.s,
  },
  centre: { textAlign: 'center' },
  saisie: {
    fontFamily: polices.fredokaGras,
    fontSize: 32,
    lineHeight: 40,
    color: couleurs.sarcelle[900],
    textAlign: 'center',
    letterSpacing: 4,
  },
  clavier: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.s, justifyContent: 'center' },
  touche: { width: '30%', minHeight: 60, justifyContent: 'center' },
  chiffre: {
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderBottomColor: couleurs.gris[300],
    borderRadius: formes.tuile.rayon,
    alignItems: 'center',
  },
  chiffreAppuye: { borderBottomWidth: 2, marginTop: 3 },
  texteTouche: { fontFamily: polices.fredokaGras, fontSize: 26, color: couleurs.encre },
});
