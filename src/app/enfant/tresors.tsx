// Les trésors de Capy : les objets gagnés (un par coffre ouvert, un tous les
// 5 défis du jour), que l'enfant fait porter à Capy, et l'accès au carnet.
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { BulleCapy, Bouton, CapyHabille, Ecran, IconeCadenas, TuileObjet } from '@/composants';
import {
  DEFIS_PAR_OBJET,
  DEFIS_PAR_OBJET_SAISON,
  defisDeLaSaison,
  nombreDeTresors,
  objetsGagnes,
  OBJETS,
  OBJETS_SAISON,
  tenueValide,
  type ObjetCapy,
} from '@/collection/objets';
import { pagesDuCarnet } from '@/contenu/carnet';
import { saisonDe, type Saison } from '@/parcours/saisons';
import { useProfilActif, useProfils } from '@/store/profils';
import { couleurs, espaces, formes } from '@/theme';

function Tresors() {
  const profil = useProfilActif();
  const porterObjet = useProfils((e) => e.porterObjet);
  const { typo, ecart, cible } = useThemeEnfant();
  if (!profil) return null;

  const p = profil.progression;
  const gagnes = Math.min(nombreDeTresors(p), OBJETS.length);
  const tenue = tenueValide(p.tenue, p);
  const pages = pagesDuCarnet(profil.classe, p).filter((e) => e.decouverte).length;

  let message: string;
  if (gagnes === 0) message = 'Ouvre ton premier coffre au bout d’une unité : un trésor t’attend dedans !';
  else if (gagnes < OBJETS.length)
    message = `Touche un trésor pour me le faire porter. Le prochain est dans le coffre suivant, ou après ${DEFIS_PAR_OBJET} défis du jour.`;
  else message = 'Tu as gagné tous mes trésors ! Change ma tenue quand tu veux.';

  const gagnesSaison = new Set(objetsGagnes(p).map((o) => o.id));
  const saisonDuJour = saisonDe(new Date());
  const toucher = (o: ObjetCapy) => porterObjet(profil.id, o.emplacement, tenue[o.emplacement] === o.id ? null : o.id);

  return (
    <Ecran>
      <Text style={typo.titre1} accessibilityRole="header">
        Les trésors de Capy
      </Text>
      <View style={styles.centre}>
        <CapyHabille tenue={tenue} taille={200} />
      </View>
      <BulleCapy pose="clinOeil" tailleCapy={64} texte={message} />
      <Text style={typo.texteGras}>
        {gagnes} trésor{gagnes > 1 ? 's' : ''} sur {OBJETS.length}
      </Text>
      <View style={[styles.grille, { gap: ecart('m') }]}>
        {OBJETS.map((o, i) => {
          if (i >= gagnes) {
            return (
              <View
                key={o.id}
                style={[styles.tuile, styles.tuileFermee, { minHeight: cible + 64 }]}
                accessible
                accessibilityLabel="Trésor à gagner"
              >
                <IconeCadenas taille={28} couleur={couleurs.encreDouce} />
                <Text style={[typo.petit, styles.texteCentre]}>À gagner</Text>
              </View>
            );
          }
          const porte = tenue[o.emplacement] === o.id;
          return (
            <Pressable
              key={o.id}
              onPress={() => toucher(o)}
              accessibilityRole="button"
              accessibilityState={{ selected: porte }}
              accessibilityLabel={porte ? `Enlever ${o.nom}` : `Mettre ${o.nom}`}
              style={[styles.tuile, porte && styles.tuilePortee, { minHeight: cible + 64 }]}
            >
              <TuileObjet id={o.id} taille={64} />
              <Text style={[typo.petit, styles.texteCentre]}>{porte ? 'Porté' : 'Mettre'}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={typo.titre3} accessibilityRole="header">
        Les trésors de saison
      </Text>
      <Text style={typo.petit}>
        {`Réussis ${DEFIS_PAR_OBJET_SAISON} défis du jour pendant une saison, et Capy gagne le trésor de cette saison.`}
      </Text>
      <View style={[styles.grille, { gap: ecart('m') }]}>
        {OBJETS_SAISON.map((o) => {
          const saison = o.saison!;
          if (!gagnesSaison.has(o.id)) {
            const faits = Math.min(defisDeLaSaison(p, saison), DEFIS_PAR_OBJET_SAISON);
            const enCours = saison === saisonDuJour;
            return (
              <View
                key={o.id}
                style={[styles.tuile, styles.tuileFermee, enCours && styles.tuileSaison, { minHeight: cible + 64 }]}
                accessible
                accessibilityLabel={`Trésor ${NOMS_SAISONS[saison]} à gagner${enCours ? `, ${faits} défis sur ${DEFIS_PAR_OBJET_SAISON}` : ''}`}
              >
                <IconeCadenas taille={28} couleur={couleurs.encreDouce} />
                <Text style={[typo.petit, styles.texteCentre]}>{NOMS_SAISONS[saison]}</Text>
                {enCours ? (
                  <Text style={[typo.petit, styles.texteCentre]}>
                    {faits}/{DEFIS_PAR_OBJET_SAISON}
                  </Text>
                ) : null}
              </View>
            );
          }
          const porte = tenue[o.emplacement] === o.id;
          return (
            <Pressable
              key={o.id}
              onPress={() => toucher(o)}
              accessibilityRole="button"
              accessibilityState={{ selected: porte }}
              accessibilityLabel={porte ? `Enlever ${o.nom}` : `Mettre ${o.nom}`}
              style={[styles.tuile, porte && styles.tuilePortee, { minHeight: cible + 64 }]}
            >
              <TuileObjet id={o.id} taille={64} />
              <Text style={[typo.petit, styles.texteCentre]}>{porte ? 'Porté' : 'Mettre'}</Text>
            </Pressable>
          );
        })}
      </View>
      <Bouton
        titre={pages > 0 ? `Le carnet de Capy (${pages} page${pages > 1 ? 's' : ''})` : 'Le carnet de Capy'}
        variante="secondaire"
        onPress={() => router.push('/carnet')}
      />
    </Ecran>
  );
}

const NOMS_SAISONS: Record<Saison, string> = {
  automne: 'D’automne',
  hiver: 'D’hiver',
  printemps: 'De printemps',
  ete: 'D’été',
};

export default avecReglagesEnfant(Tresors);

const styles = StyleSheet.create({
  centre: { alignItems: 'center' },
  grille: { flexDirection: 'row', flexWrap: 'wrap' },
  tuile: {
    flexBasis: '21%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaces.xs,
    padding: espaces.s,
    backgroundColor: couleurs.blanc,
    borderRadius: formes.carte.rayon,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: couleurs.bordure,
  },
  tuileFermee: { backgroundColor: couleurs.gris[200], borderColor: couleurs.gris[300] },
  tuilePortee: { borderColor: couleurs.sarcelle[700], backgroundColor: couleurs.menthe[100] },
  tuileSaison: { borderColor: couleurs.jaune[600] },
  texteCentre: { textAlign: 'center' },
});
