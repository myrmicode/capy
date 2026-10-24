import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { BarreProgression, Bouton, ControleParental, Ecran, Toile } from '@/composants';
import { domainesDe } from '@/config/domaines';
import { themesDe } from '@/config/parcours';
import { dateEnFrancais, dureeEnFrancais } from '@/parents/format';
import { dateLocale, serieDeJours, tempsDeLaSemaine } from '@/parcours/progression';
import { useProfilActif, useProfils } from '@/store/profils';
import { useReglages } from '@/store/reglages';
import { couleurs, espaces, formes, typo } from '@/theme';

/** Espace parent, derrière le contrôle parental. Il se reverrouille dès qu'on le quitte. */
export default function EspaceParents() {
  const [deverrouille, setDeverrouille] = useState(false);
  useFocusEffect(useCallback(() => () => setDeverrouille(false), []));

  return (
    <Ecran>
      {deverrouille ? <ContenuParents /> : <ControleParental onReussi={() => setDeverrouille(true)} />}
    </Ecran>
  );
}

function ContenuParents() {
  const profil = useProfilActif();
  const supprimerProfil = useProfils((e) => e.supprimerProfil);
  const { sons, activerSons } = useReglages();
  const [confirmerSuppression, setConfirmerSuppression] = useState(false);
  if (!profil) return null;

  const p = profil.progression;
  const aujourdhui = dateLocale(new Date());
  const domaines = domainesDe(profil.classe);
  const etapesReussies = Object.keys(p.etapes).length;
  const serie = serieDeJours(p.jours, aujourdhui);

  const supprimer = () => {
    supprimerProfil(profil.id);
    router.replace('/');
  };

  return (
    <>
      <View>
        <Text style={typo.titre1}>Espace parent</Text>
        <Text style={typo.petit}>
          {profil.prenom} · {profil.classe}
        </Text>
      </View>

      <Section titre="La toile">
        {profil.toile ? (
          <>
            <Toile
              domaines={domaines}
              couches={[
                { niveaux: profil.toile.septembre, style: 'septembre' },
                { niveaux: profil.toile.actuelle, style: 'actuelle' },
              ]}
            />
            <Text style={[typo.petit, styles.centre]}>
              Fiche de l’école saisie le {dateEnFrancais(profil.toile.saisieLe)}. La toile du jour évolue avec les
              résultats aux exercices.
            </Text>
            <Bouton titre="Voir le bilan" variante="secondaire" onPress={() => router.push('/bilan')} />
          </>
        ) : (
          <Text style={typo.texte}>
            Aucune fiche n’a encore été saisie. Recopiez la toile de la fiche de l’école pour que le parcours commence
            par le bon domaine.
          </Text>
        )}
        <Bouton
          titre={profil.toile ? 'Scanner une nouvelle fiche' : 'Scanner la toile de la fiche'}
          variante={profil.toile ? 'secondaire' : 'principal'}
          onPress={() => router.push('/toile/photo')}
        />
      </Section>

      <Section titre="En bref">
        <View style={styles.stats}>
          <Statistique valeur={String(etapesReussies)} libelle={`étape${etapesReussies > 1 ? 's' : ''} réussie${etapesReussies > 1 ? 's' : ''}`} />
          <Statistique valeur={String(serie)} libelle={`jour${serie > 1 ? 's' : ''} d’affilée`} />
          <Statistique valeur={dureeEnFrancais(tempsDeLaSemaine(p, aujourdhui))} libelle="cette semaine" />
        </View>
      </Section>

      <Section titre="Progression par thème">
        {themesDe(profil.classe).map((theme) => {
          const etapes = theme.unites.flatMap((u) => u.etapes);
          const faites = etapes.filter((e) => e.id in p.etapes).length;
          return (
            <View key={theme.id} style={styles.theme}>
              <Text style={typo.texteGras}>{theme.titre}</Text>
              <View style={styles.ligneTheme}>
                <BarreProgression valeur={faites / etapes.length} />
                <Text style={typo.petit}>
                  {faites} sur {etapes.length}
                </Text>
              </View>
            </View>
          );
        })}
        {themesDe(profil.classe).length === 0 ? (
          <Text style={typo.texte}>Le parcours de {profil.classe} arrive bientôt.</Text>
        ) : null}
      </Section>

      <Section titre="Réglages">
        <View style={styles.reglage}>
          <Text style={[typo.texte, styles.flex]}>Son doux après une bonne réponse</Text>
          <Switch
            value={sons}
            onValueChange={activerSons}
            trackColor={{ true: couleurs.sarcelle[700], false: couleurs.gris[300] }}
            thumbColor={couleurs.blanc}
            accessibilityLabel="Son doux après une bonne réponse"
          />
        </View>
      </Section>

      <Section titre="Compte (facultatif)">
        <Text style={typo.texte}>
          Capy fonctionne entièrement sans compte : tout reste sur cet appareil. Un compte servira seulement à
          retrouver la progression sur un autre appareil. Bientôt disponible.
        </Text>
      </Section>

      <Section titre="Supprimer le profil">
        {confirmerSuppression ? (
          <>
            <Text style={typo.texte}>
              Toutes les données de {profil.prenom} (toile et progression) seront effacées de cet appareil. Cette
              action est définitive.
            </Text>
            <Bouton titre={`Oui, supprimer ${profil.prenom}`} variante="reessayer" onPress={supprimer} />
            <Bouton titre="Annuler" variante="secondaire" onPress={() => setConfirmerSuppression(false)} />
          </>
        ) : (
          <Bouton titre="Supprimer le profil" variante="secondaire" onPress={() => setConfirmerSuppression(true)} />
        )}
      </Section>
    </>
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

function Statistique({ valeur, libelle }: { valeur: string; libelle: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${valeur} ${libelle}`}>
      <Text style={[typo.titre2, { color: couleurs.sarcelle[900] }]}>{valeur}</Text>
      <Text style={[typo.petit, styles.centre]}>{libelle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: espaces.m,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
  },
  centre: { textAlign: 'center' },
  stats: { flexDirection: 'row', gap: espaces.s },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: couleurs.menthe[100],
    borderRadius: formes.tuile.rayon,
    paddingVertical: espaces.m,
    paddingHorizontal: espaces.xs,
  },
  theme: { gap: espaces.xs },
  ligneTheme: { flexDirection: 'row', alignItems: 'center', gap: espaces.m },
  reglage: { flexDirection: 'row', alignItems: 'center', gap: espaces.m, minHeight: formes.cibleTactile },
  flex: { flex: 1 },
});
