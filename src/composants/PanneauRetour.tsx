import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import { couleurs, espaces, formes } from '@/theme';

import { Bouton } from './Bouton';
import { CapyAnime } from './CapyAnime';
import { IconeAmpoule } from './icones';

interface PropsPanneauRetour {
  type: 'bravo' | 'presque';
  /** Explication de la méthode, montrée après une bonne réponse. */
  explication?: string;
  /** Indice qui guide sans donner la réponse, montré après une erreur. */
  indice?: string;
  /** Après plusieurs essais : Capy a enlevé des réponses pour le prochain essai. */
  choixReduits?: boolean;
  /** Après plusieurs essais : la méthode expliquée, comme un exemple résolu. */
  methode?: string;
  /** Titre du panneau (« Bravo ! », « Super ! »…), pour varier ; par défaut « Bravo ! » ou « Presque ! ». */
  titre?: string;
  onContinuer: () => void;
}

/**
 * Retour après une réponse. Jamais punitif : après une erreur on affiche
 * « Presque ! », un indice et « Réessayer », sans limite. L'explication complète
 * n'arrive qu'après la bonne réponse, pour que l'enfant cherche encore, sauf
 * quand l'indice et le choix réduit n'ont pas suffi (voir parcours/aide.ts).
 * Capy réfléchit, il n'est jamais triste. En mode calme, rien ne bouge.
 */
export function PanneauRetour({
  type,
  explication,
  indice,
  choixReduits,
  methode,
  titre,
  onContinuer,
}: PropsPanneauRetour) {
  const bravo = type === 'bravo';
  const { typo, animationsReduites, ecart } = useThemeEnfant();
  const fond = {
    backgroundColor: bravo ? couleurs.menthe[100] : couleurs.brun[100],
    padding: ecart('xl'),
    gap: ecart('m'),
  };
  const pose = bravo ? 'heureux' : methode ? 'conseils' : 'reflechi';

  const contenu = (
    <>
      <View style={styles.entete}>
        <CapyAnime pose={pose} taille={64} style={styles.capy} />
        <Text style={[typo.titre2, { color: bravo ? couleurs.sarcelle[900] : couleurs.brun[800] }]}>
          {titre ?? (bravo ? 'Bravo !' : 'Presque !')}
        </Text>
      </View>
      {bravo && explication ? <TexteAccessible texte={explication} variante="texte" coloration /> : null}
      {!bravo && !methode ? (
        <View style={styles.indice}>
          <IconeAmpoule taille={22} couleur={couleurs.brun[600]} />
          <View style={styles.flex}>
            <TexteAccessible texte={indice ?? 'Relis bien l’histoire, tu vas trouver.'} variante="enonce" coloration />
          </View>
        </View>
      ) : null}
      {!bravo && choixReduits ? (
        <TexteAccessible texte="Capy a enlevé des réponses pour t’aider." variante="texte" coloration />
      ) : null}
      {!bravo && methode ? (
        <View style={styles.methode}>
          <Text style={[typo.texteGras, { color: couleurs.brun[800] }]}>Regarde comment on fait :</Text>
          <TexteAccessible texte={methode} variante="enonce" coloration />
        </View>
      ) : null}
      <Bouton
        titre={bravo ? 'Continuer' : 'Réessayer'}
        variante={bravo ? 'principal' : 'reessayer'}
        onPress={onContinuer}
      />
    </>
  );

  if (animationsReduites) {
    return (
      <View style={[styles.panneau, fond]} accessibilityLiveRegion="polite">
        {contenu}
      </View>
    );
  }
  return (
    <Animated.View entering={FadeInDown.duration(260)} style={[styles.panneau, fond]} accessibilityLiveRegion="polite">
      {contenu}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panneau: { borderRadius: formes.carte.rayon },
  entete: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  capy: { borderRadius: 16 },
  indice: { flexDirection: 'row', gap: espaces.s, alignItems: 'flex-start' },
  flex: { flex: 1 },
  methode: { gap: espaces.xs, backgroundColor: couleurs.blanc, borderRadius: formes.carte.rayon, padding: espaces.m },
});
