import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BulleCapy, Bouton, Ecran, EtapeParcours, IconeEtoile, IconeFlamme } from '@/composants';
import { domaineDe, LIBELLES_MATIERES, MATIERES } from '@/config/domaines';
import type { Theme } from '@/config/parcours';
import { mascotte, type PoseCapy } from '@/mascotte';
import {
  cheminDuTheme,
  dateLocale,
  joursDepuisDerniereActivite,
  serieDeJours,
  totalEtoiles,
  type Noeud,
} from '@/parcours/progression';
import { themesProposes } from '@/parcours/selection';
import { useProfilActif } from '@/store/profils';
import { ficheSaisie, prioritesDe } from '@/toile/niveaux';
import { couleurs, espaces, formes, typo } from '@/theme';

/** Décalages horizontaux du chemin en zigzag, répétés. */
const ZIGZAG = [0, 56, 84, 56, 0, -56, -84, -56];
/** Absence (en jours) à partir de laquelle Capy dit qu'on lui a manqué. */
const ABSENCE_LONGUE = 3;

export default function Parcours() {
  const profil = useProfilActif();
  const [themeChoisiId, setThemeChoisiId] = useState<string | null>(null);
  if (!profil) return null;

  const p = profil.progression;
  // Seuls les thèmes des difficultés de la toile sont proposés, du plus fragile au
  // moins fragile (voir parcours/selection.ts). Par défaut, on ouvre le premier
  // thème qui n'est pas terminé.
  const themes = themesProposes(profil.classe, profil.toile);
  const parDefaut = themes.find((t) => cheminDuTheme(t, p).some((n) => n.etat === 'enCours')) ?? themes[0];
  const theme = themes.find((t) => t.id === themeChoisiId) ?? parDefaut;
  // Un axe prioritaire par matière (français, mathématiques).
  const priorites = prioritesDe(profil.classe, profil.toile);
  const prioritaire = !!theme && priorites.has(theme.domaine);
  // Les thèmes sont regroupés par matière ; la matière du thème le plus prioritaire vient en premier.
  const matiereDuTheme = (t: Theme) => domaineDe(profil.classe, t.domaine)?.matiere ?? 'mathematiques';
  const matieresDesThemes = [...new Set(themes.map(matiereDuTheme))];
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
    // Aucun exercice sans le résultat de la toile.
    const fichesManquantes = MATIERES.filter((m) => !ficheSaisie(profil.toile, m));
    let texte: string;
    if (!profil.toile) {
      texte = 'Pour commencer, demande à un parent de photographier les fiches de l’école. Je préparerai ton parcours avec !';
    } else if (fichesManquantes.length > 0) {
      texte = `Bravo, ce que je sais faire travailler est déjà solide ! Il manque encore la fiche de ${LIBELLES_MATIERES[fichesManquantes[0]].toLowerCase()}.`;
    } else {
      texte = 'Bravo, ce que je sais faire travailler est déjà solide ! De nouveaux exercices arrivent bientôt.';
    }
    return (
      <Ecran
        pied={
          fichesManquantes.length > 0 ? (
            <Bouton titre="Aller voir un parent" variante="secondaire" onPress={() => router.push('/enfant/parents')} />
          ) : undefined
        }
      >
        {entete}
        <BulleCapy pose={profil.toile ? 'bravo' : 'explorer'} tailleCapy={110} texte={texte} />
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
    message = 'Tu as fini ce thème ! Rejoue ses étapes quand tu veux, ou choisis un autre thème.';
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

      {themes.length > 1
        ? matieresDesThemes.map((matiere) => (
            <View key={matiere} style={styles.rangee}>
              <Text style={[typo.petit, styles.matiere]}>{LIBELLES_MATIERES[matiere]}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themes}>
                {themes
                  .filter((t) => matiereDuTheme(t) === matiere)
                  .map((t) => {
                    const choisi = t.id === theme.id;
                    return (
                      <Pressable
                        key={t.id}
                        onPress={() => setThemeChoisiId(t.id)}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: choisi }}
                        accessibilityLabel={`${t.titre}${priorites.has(t.domaine) ? ', priorité' : ''}`}
                        style={[styles.puceTheme, choisi && styles.puceChoisie]}
                      >
                        {priorites.has(t.domaine) ? <View style={styles.pointPriorite} /> : null}
                        <Text style={[typo.texteGras, choisi && styles.texteBlanc]}>{t.titre}</Text>
                      </Pressable>
                    );
                  })}
              </ScrollView>
            </View>
          ))
        : null}

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
  rangee: { gap: espaces.xs },
  matiere: { color: couleurs.encreDouce, fontFamily: typo.texteGras.fontFamily },
  themes: { gap: espaces.s, paddingVertical: espaces.xs },
  puceTheme: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaces.s,
    minHeight: formes.cibleTactile,
    paddingHorizontal: espaces.l,
    borderRadius: formes.pilule,
    borderWidth: 2,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.blanc,
  },
  puceChoisie: { backgroundColor: couleurs.sarcelle[700], borderColor: couleurs.sarcelle[700] },
  pointPriorite: { width: 10, height: 10, borderRadius: 5, backgroundColor: couleurs.brun[600] },
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
