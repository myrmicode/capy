import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { BulleCapy, Ecran, EtapeParcours, IconeEtoile, IconeFlamme } from '@/composants';
import { themesParPriorite } from '@/config/parcours';
import { mascotte, type PoseCapy } from '@/mascotte';
import {
  cheminDuTheme,
  dateLocale,
  joursDepuisDerniereActivite,
  serieDeJours,
  totalEtoiles,
  type Noeud,
} from '@/parcours/progression';
import { useProfilActif } from '@/store/profils';
import { analyserToile, domainesParPriorite } from '@/toile/niveaux';
import { couleurs, espaces, formes, typo } from '@/theme';

/** Décalages horizontaux du chemin en zigzag, répétés. */
const ZIGZAG = [0, 56, 84, 56, 0, -56, -84, -56];
/** Absence (en jours) à partir de laquelle Capy dit qu'on lui a manqué. */
const ABSENCE_LONGUE = 3;

export default function Parcours() {
  const profil = useProfilActif();
  if (!profil) return null;

  // Le parcours commence par le domaine prioritaire de la toile.
  const theme = themesParPriorite(profil.classe, domainesParPriorite(profil.classe, profil.toile?.actuelle))[0];
  const prioritaire =
    !!theme && !!profil.toile && analyserToile(profil.classe, profil.toile.actuelle).priorite?.id === theme.domaine;
  const p = profil.progression;
  const aujourdhui = dateLocale(new Date());
  const serie = serieDeJours(p.jours, aujourdhui);
  const absence = joursDepuisDerniereActivite(p.jours, aujourdhui);

  const entete = (
    <View style={styles.entete}>
      <View style={styles.flex}>
        <Text style={typo.titre2} numberOfLines={1}>
          {profil.prenom}
        </Text>
        <Pressable onPress={() => router.replace('/')} accessibilityRole="button" hitSlop={10}>
          <Text style={[typo.petit, styles.lien]}>Changer d’enfant</Text>
        </Pressable>
      </View>
      <Compteur
        icone={<IconeEtoile taille={22} couleur={couleurs.jaune.texte} />}
        texte={String(totalEtoiles(p))}
        libelle={`${totalEtoiles(p)} étoiles`}
        fond={couleurs.jaune[400]}
        couleur={couleurs.jaune.texte}
      />
      <Compteur
        icone={<IconeFlamme taille={22} couleur={couleurs.brun[600]} />}
        texte={`${serie} j`}
        libelle={`${serie} jour${serie > 1 ? 's' : ''} d’affilée`}
        fond={couleurs.brun[100]}
        couleur={couleurs.brun[800]}
      />
    </View>
  );

  if (!theme) {
    return (
      <Ecran>
        {entete}
        <BulleCapy pose="ralentir" texte={`Le parcours de ${profil.classe} arrive bientôt. Pour l’instant, Capy prépare le CE2.`} />
      </Ecran>
    );
  }

  const chemin = cheminDuTheme(theme, p);
  const enCours = chemin.find((n) => n.etat === 'enCours');
  const uniteEnCours = theme.unites.find((u) => u.id === (enCours ?? chemin[chemin.length - 1]).uniteId)!;
  const numeroUnite = theme.unites.indexOf(uniteEnCours) + 1;

  let pose: PoseCapy = 'reussite';
  let message: string;
  if (absence !== null && absence >= ABSENCE_LONGUE) {
    pose = 'triste';
    message = 'Tu m’as manqué ! On reprend ensemble, tout doucement ?';
  } else if (!enCours) {
    pose = 'bravo';
    message = 'Tu as fini tout le parcours ! Tu peux rejouer les étapes quand tu veux.';
  } else if (enCours.type === 'coffre') {
    pose = 'surpris';
    message = 'Un coffre t’attend au bout du chemin. Va vite l’ouvrir !';
  } else if (serie >= 2) {
    pose = 'clinOeil';
    message = `${serie} jours d’affilée, bravo ! Prochaine étape : « ${enCours.titre} »`;
  } else {
    message = `On y va ? Prochaine étape : « ${enCours.titre} »`;
  }

  const ouvrir = (n: Noeud) => {
    if (n.etat === 'verrouillee') return;
    if (n.type === 'coffre') router.push({ pathname: '/coffre', params: { id: n.id } });
    else router.push({ pathname: '/etape', params: { etape: n.id } });
  };

  return (
    <Ecran>
      {entete}

      <View style={styles.bandeau}>
        <View style={styles.flex}>
          <Text style={[typo.petit, styles.surtitre]}>
            Unité {numeroUnite} · {uniteEnCours.titre}
          </Text>
          <Text style={typo.titre2}>{theme.titre}</Text>
          {prioritaire ? (
            <View style={styles.priorite}>
              <Text style={[typo.petit, styles.texteBlanc]}>Priorité</Text>
            </View>
          ) : null}
        </View>
        <Image source={mascotte.reussite} style={styles.capyBandeau} resizeMode="contain" accessible={false} />
      </View>

      <BulleCapy pose={pose} tailleCapy={80} texte={message} />

      {theme.unites.map((unite, u) => (
        <View key={unite.id} style={styles.unite}>
          <Text style={[typo.texteGras, styles.titreUnite]}>
            Unité {u + 1} · {unite.titre}
          </Text>
          {chemin
            .filter((n) => n.uniteId === unite.id)
            .map((n, i) => (
              <View key={n.id} style={[styles.noeud, { transform: [{ translateX: ZIGZAG[i % ZIGZAG.length] }] }]}>
                <EtapeParcours
                  etat={n.etat}
                  numero={n.type === 'etape' ? n.numero : 0}
                  coffre={n.type === 'coffre'}
                  onPress={() => ouvrir(n)}
                />
                {n.type === 'etape' ? (
                  <Text
                    style={[typo.petit, styles.titreEtape, n.etat === 'enCours' && styles.titreEnCours]}
                    numberOfLines={1}
                  >
                    {n.titre}
                  </Text>
                ) : null}
              </View>
            ))}
        </View>
      ))}
    </Ecran>
  );
}

interface PropsCompteur {
  icone: React.ReactNode;
  texte: string;
  libelle: string;
  fond: string;
  couleur: string;
}

function Compteur({ icone, texte, libelle, fond, couleur }: PropsCompteur) {
  return (
    <View style={[styles.compteur, { backgroundColor: fond }]} accessible accessibilityLabel={libelle}>
      {icone}
      <Text style={[typo.texteGras, { color: couleur }]}>{texte}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  entete: { flexDirection: 'row', alignItems: 'center', gap: espaces.s },
  lien: { color: couleurs.sarcelle[700], paddingVertical: 4 },
  compteur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.xs,
    borderRadius: formes.pilule,
    paddingHorizontal: espaces.m,
    minHeight: formes.cibleTactile,
  },
  bandeau: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: couleurs.creme,
    borderRadius: formes.carte.rayon,
    paddingLeft: espaces.l,
    paddingVertical: espaces.s,
    overflow: 'hidden',
  },
  surtitre: { color: couleurs.brun[800] },
  priorite: {
    alignSelf: 'flex-start',
    backgroundColor: couleurs.brun[600],
    borderRadius: formes.pilule,
    paddingHorizontal: espaces.m,
    paddingVertical: 2,
    marginTop: espaces.xs,
  },
  texteBlanc: { color: couleurs.blanc, fontFamily: typo.texteGras.fontFamily },
  capyBandeau: { width: 120, height: 90, borderRadius: 16 },
  unite: { alignItems: 'center', gap: espaces.s, paddingTop: espaces.l },
  titreUnite: { color: couleurs.encreDouce, marginBottom: espaces.s },
  noeud: { alignItems: 'center' },
  titreEtape: { maxWidth: 160, textAlign: 'center' },
  titreEnCours: { color: couleurs.sarcelle[900], fontFamily: typo.texteGras.fontFamily },
});
