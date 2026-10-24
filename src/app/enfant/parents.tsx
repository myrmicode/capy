import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { BarreProgression, Bouton, ControleParental, Ecran, Toile } from '@/composants';
import { domainesDe, LIBELLES_MATIERES, MATIERES } from '@/config/domaines';
import { themesProposes } from '@/parcours/selection';
import { dateEnFrancais, dureeEnFrancais } from '@/parents/format';
import { dateLocale, serieDeJours, tempsDeLaSemaine } from '@/parcours/progression';
import { seDeconnecter, supprimerCompte } from '@/serveur/compte';
import { synchroniser } from '@/serveur/synchro';
import { useCompte } from '@/store/compte';
import { useProfilActif, useProfils } from '@/store/profils';
import { useReglages } from '@/store/reglages';
import { ficheSaisie } from '@/toile/niveaux';
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
  const connecte = useCompte((e) => e.email !== null);
  if (!profil) return null;

  const p = profil.progression;
  const aujourdhui = dateLocale(new Date());
  const etapesReussies = Object.keys(p.etapes).length;
  const serie = serieDeJours(p.jours, aujourdhui);

  const supprimer = () => {
    supprimerProfil(profil.id);
    // Avec un compte, les données du serveur sont effacées tout de suite
    // (ou à la prochaine connexion si l'appareil est hors ligne).
    if (connecte) void synchroniser();
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

      <Section titre="Les toiles">
        {MATIERES.filter((m) => ficheSaisie(profil.toile, m)).map((m) => (
          <View key={m} style={styles.toile}>
            <Text style={typo.texteGras}>{LIBELLES_MATIERES[m]}</Text>
            <Toile
              domaines={domainesDe(profil.classe, m)}
              couches={[
                { niveaux: profil.toile!.septembre, style: 'septembre' },
                { niveaux: profil.toile!.actuelle, style: 'actuelle' },
              ]}
            />
            <Text style={[typo.petit, styles.centre]}>Fiche saisie le {dateEnFrancais(profil.toile!.saisieLe[m]!)}.</Text>
          </View>
        ))}
        {profil.toile ? (
          <>
            <Text style={[typo.petit, styles.centre]}>La toile du jour évolue avec les résultats aux exercices.</Text>
            <Bouton titre="Voir le bilan" variante="secondaire" onPress={() => router.push('/bilan')} />
          </>
        ) : (
          <Text style={typo.texte}>
            Aucune fiche n’a encore été saisie. Photographiez ou recopiez les toiles des fiches de l’école (français et
            mathématiques) pour que le parcours commence par les bonnes compétences.
          </Text>
        )}
        <Bouton
          titre="Les fiches de l’école"
          variante={profil.toile ? 'secondaire' : 'principal'}
          onPress={() => router.push('/toile')}
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
        <Text style={typo.petit}>
          Capy ne propose que les compétences notées + ou ++ sur les fiches de l’école, de la plus fragile à la moins
          fragile.
        </Text>
        {themesProposes(profil.classe, profil.toile).map((theme) => {
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
        {themesProposes(profil.classe, profil.toile).length === 0 ? (
          <Text style={typo.texte}>
            {profil.toile
              ? 'Aucun exercice à proposer pour l’instant : les compétences que Capy sait travailler sont déjà à +++.'
              : 'Aucun exercice n’est proposé tant que les fiches de l’école ne sont pas saisies.'}
          </Text>
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

      <SectionCompte />

      <Section titre="Supprimer le profil">
        {confirmerSuppression ? (
          <>
            <Text style={typo.texte}>
              Toutes les données de {profil.prenom} (toile et progression) seront effacées de cet appareil
              {connecte ? ' et du compte' : ''}. Cette action est définitive.
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

/** Compte parent facultatif : connexion, synchronisation, déconnexion, suppression complète. */
function SectionCompte() {
  const { disponible, email, synchro, derniereSynchro } = useCompte();
  const [confirmer, setConfirmer] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const titre = 'Compte (facultatif)';
  if (!disponible) {
    return (
      <Section titre={titre}>
        <Text style={typo.texte}>Capy fonctionne entièrement sans compte : tout reste sur cet appareil.</Text>
      </Section>
    );
  }
  if (!email) {
    return (
      <Section titre={titre}>
        <Text style={typo.texte}>
          Capy fonctionne entièrement sans compte : tout reste sur cet appareil. Un compte sert seulement à retrouver
          la progression sur un autre appareil.
        </Text>
        <Bouton titre="Créer un compte ou se connecter" variante="secondaire" onPress={() => router.push('/compte')} />
      </Section>
    );
  }

  let etat = 'Synchronisation en attente.';
  if (synchro === 'en_cours') etat = 'Synchronisation en cours…';
  else if (synchro === 'erreur') etat = 'La dernière synchronisation n’a pas abouti. Elle sera retentée automatiquement.';
  else if (derniereSynchro) {
    const heure = new Date(derniereSynchro);
    etat = `Synchronisé à ${String(heure.getHours()).padStart(2, '0')} h ${String(heure.getMinutes()).padStart(2, '0')}.`;
  }

  const supprimer = async () => {
    setMessage(null);
    if (await supprimerCompte()) setConfirmer(false);
    else setMessage('La suppression n’a pas abouti. Vérifiez la connexion et réessayez.');
  };

  return (
    <Section titre={titre}>
      <Text style={typo.texte}>Connecté avec {email}</Text>
      <Text style={typo.petit}>{etat}</Text>
      <Bouton titre="Synchroniser maintenant" variante="secondaire" onPress={() => void synchroniser()} />
      <Bouton titre="Se déconnecter" variante="secondaire" onPress={() => void seDeconnecter()} />
      {confirmer ? (
        <>
          <Text style={typo.texte}>
            Le compte et toutes les données enregistrées sur le serveur seront effacés. Les profils restent sur cet
            appareil. Cette action est définitive.
          </Text>
          <Bouton titre="Oui, supprimer le compte" variante="reessayer" onPress={() => void supprimer()} />
          <Bouton titre="Annuler" variante="secondaire" onPress={() => setConfirmer(false)} />
        </>
      ) : (
        <Bouton titre="Supprimer le compte" variante="secondaire" onPress={() => setConfirmer(true)} />
      )}
      {message ? <Text style={[typo.texte, { color: couleurs.brun[800] }]}>{message}</Text> : null}
    </Section>
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
  toile: { gap: espaces.s, alignItems: 'center' },
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
