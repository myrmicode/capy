import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  BulleCapy,
  Bouton,
  CarteConfiance,
  Ecran,
  EtapeParcours,
  IconeHautParleur,
  PanneauRetour,
  TuileReponse,
  type EtatTuile,
} from '@/composants';
import { useThemeEnfant } from '@/accessibilite/contexte';
import { couleurs, espaces } from '@/theme';

/** Catalogue des composants de base, visible seulement en développement. */
export default function Galerie() {
  const { typo } = useThemeEnfant();
  const [choix, setChoix] = useState<number | null>(null);
  const [retour, setRetour] = useState<'bravo' | 'presque'>('presque');
  const etatTuile = (n: number): EtatTuile => {
    if (choix === null) return 'normal';
    if (n === choix) return n === 24 ? 'juste' : 'presque';
    return 'normal';
  };

  return (
    <Ecran>
      <Bouton titre="Retour" variante="secondaire" pleineLargeur={false} onPress={() => router.back()} />
      <Text style={typo.titre1}>Composants</Text>

      <Section titre="Boutons">
        <Bouton titre="Lancer le parcours" onPress={() => {}} />
        <Bouton titre="Réessayer" variante="reessayer" onPress={() => {}} />
        <Bouton titre="Scanner la toile" variante="jaune" onPress={() => {}} />
        <Bouton
          titre="Écouter"
          variante="secondaire"
          icone={(c) => <IconeHautParleur taille={22} couleur={c} />}
          onPress={() => {}}
        />
        <Bouton titre="Désactivé" desactive onPress={() => {}} />
      </Section>

      <Section titre="Tuiles de réponse (24 est juste)">
        <View style={styles.grille}>
          {[18, 24, 10, 42].map((n) => (
            <View key={n} style={styles.cellule}>
              <TuileReponse libelle={n} etat={etatTuile(n)} onPress={() => setChoix(n)} />
            </View>
          ))}
        </View>
        <TuileReponse libelle="Combien de fraises en tout ?" etat="selectionne" onPress={() => {}} />
      </Section>

      <Section titre="Bulle de Capy">
        <BulleCapy pose="reflechi" texte="Au marché, Capy achète 4 paquets de 6 fraises. Combien de fraises en tout ?" />
        <BulleCapy pose="clinOeil" cote="droite" texte="3 jours d’affilée, continue comme ça !" />
      </Section>

      <Section titre="Panneau de retour">
        <View style={styles.grille}>
          <Bouton titre="Bravo" pleineLargeur={false} variante="secondaire" onPress={() => setRetour('bravo')} />
          <Bouton titre="Presque" pleineLargeur={false} variante="secondaire" onPress={() => setRetour('presque')} />
        </View>
        <PanneauRetour
          key={retour}
          type={retour}
          indice="Il y a 4 paquets. Combien de fraises dans chaque paquet ?"
          explication="4 paquets de 6 fraises, c’est 6 + 6 + 6 + 6, donc 4 × 6 = 24."
          onContinuer={() => {}}
        />
      </Section>

      <Section titre="Carte de confiance">
        <CarteConfiance />
      </Section>

      <Section titre="Étapes du parcours">
        <View style={styles.grille}>
          <EtapeParcours numero={1} etat="reussie" onPress={() => {}} />
          <EtapeParcours numero={2} etat="enCours" onPress={() => {}} />
          <EtapeParcours numero={3} etat="verrouillee" onPress={() => {}} />
          <EtapeParcours numero={4} etat="enCours" coffre onPress={() => {}} />
          <EtapeParcours numero={5} etat="verrouillee" coffre onPress={() => {}} />
        </View>
      </Section>
    </Ecran>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  const { typo } = useThemeEnfant();
  return (
    <View style={styles.section}>
      <Text style={typo.titre3}>{titre}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: espaces.m, paddingTop: espaces.l, borderTopWidth: 2, borderTopColor: couleurs.bordure },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.m, alignItems: 'center' },
  cellule: { flexBasis: '45%', flexGrow: 1 },
});
