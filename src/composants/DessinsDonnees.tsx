// Dessins des données et du repérage : diagramme en barres gradué, tableau,
// quadrillage avec Capy et des objets. Le libellé lu par le lecteur d'écran ne
// donne jamais la réponse.
import { useState } from 'react';
import { Image, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Line, Rect, Text as TexteSvg } from 'react-native-svg';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { imageDe } from '@/contenu/imagier';
import { LETTRES_COLONNES } from '@/exercices/modeles/quadrillage';
import type { IllustrationGraphique, IllustrationQuadrillage } from '@/exercices/types';
import { mascotte } from '@/mascotte';
import { couleurs, espaces, formes, polices } from '@/theme';

/** Largeur du diagramme sur une tablette ; sur un téléphone, il prend la place qu'il a. */
const LARGEUR_MAX = 320;
const HAUTEUR = 240;
const GAUCHE = 40;
const BAS = 34;
/** Place au-dessus de l’axe, pour écrire ce qu’on compte. */
const HAUT = 30;
/** En dessous, les noms sous les barres se chevaucheraient : un sur deux descend d'une ligne. */
const PLACE_PAR_NOM = 60;

/** La largeur disponible, mesurée au premier affichage (0 tant qu'elle est inconnue). */
function useLargeur(): [number, (e: LayoutChangeEvent) => void] {
  const [largeur, setLargeur] = useState(0);
  return [largeur, (e) => setLargeur(Math.floor(e.nativeEvent.layout.width))];
}

/** Sous la barre, le nom sans article : « pommes » plutôt que « les pommes ». */
const etiquette = (nom: string) => nom.replace(/^les /, '');

function Barres({ lignes, pas, unite, largeur }: IllustrationGraphique & { largeur: number }) {
  const LARGEUR = Math.min(LARGEUR_MAX, largeur);
  const max = Math.max(...lignes.map((l) => l.valeur));
  const graduations = Math.ceil(max / pas) + 1;
  const hauteurUtile = HAUTEUR - BAS - HAUT;
  const y = (v: number) => HAUTEUR - BAS - (v / (graduations * pas)) * hauteurUtile;
  const place = (LARGEUR - GAUCHE - 8) / lignes.length;
  const largeurBarre = Math.min(40, place * 0.6);
  const decaler = place < PLACE_PAR_NOM;
  const hauteur = HAUTEUR + (decaler ? 14 : 0);
  return (
    <Svg width={LARGEUR} height={hauteur} viewBox={`0 0 ${LARGEUR} ${hauteur}`}>
      {Array.from({ length: graduations + 1 }, (_, i) => (
        <Line
          key={`g${i}`}
          x1={GAUCHE}
          y1={y(i * pas)}
          x2={LARGEUR - 4}
          y2={y(i * pas)}
          stroke={i === 0 ? couleurs.encre : couleurs.gris[300]}
          strokeWidth={i === 0 ? 2 : 1}
        />
      ))}
      {Array.from({ length: graduations + 1 }, (_, i) => (
        <TexteSvg
          key={`n${i}`}
          x={GAUCHE - 6}
          y={y(i * pas) + 4}
          textAnchor="end"
          fontFamily={polices.nunitoGras}
          fontSize={12}
          fill={couleurs.encre}
        >
          {i * pas}
        </TexteSvg>
      ))}
      <Line x1={GAUCHE} y1={HAUT - 4} x2={GAUCHE} y2={HAUTEUR - BAS} stroke={couleurs.encre} strokeWidth={2} />
      {lignes.map((l, i) => {
        const x = GAUCHE + 4 + place * i + (place - largeurBarre) / 2;
        return (
          <Rect
            key={`b${i}`}
            x={x}
            y={y(l.valeur)}
            width={largeurBarre}
            height={HAUTEUR - BAS - y(l.valeur)}
            fill={i % 2 === 0 ? couleurs.sarcelle[400] : couleurs.caramel[500]}
            stroke={couleurs.sarcelle[900]}
            strokeWidth={1}
          />
        );
      })}
      {lignes.map((l, i) => (
        <TexteSvg
          key={`e${i}`}
          x={GAUCHE + 4 + place * i + place / 2}
          y={HAUTEUR - BAS + 18 + (decaler && i % 2 === 1 ? 14 : 0)}
          textAnchor="middle"
          fontFamily={polices.nunitoGras}
          fontSize={lignes.length > 4 ? 11 : 12}
          fill={couleurs.encre}
        >
          {etiquette(l.nom)}
        </TexteSvg>
      ))}
      <TexteSvg x={4} y={12} fontFamily={polices.nunito} fontSize={11} fill={couleurs.encreDouce}>
        {unite}
      </TexteSvg>
    </Svg>
  );
}

function Tableau({ lignes, unite }: IllustrationGraphique) {
  const { typo } = useThemeEnfant();
  return (
    <View style={styles.tableau}>
      <View style={[styles.ligne, styles.entete]}>
        <Text style={[typo.texteGras, styles.cellule]} />
        <Text style={[typo.texteGras, styles.cellule, styles.nombre]}>{unite}</Text>
      </View>
      {lignes.map((l, i) => (
        <View key={i} style={[styles.ligne, i % 2 === 1 && styles.ligneTeintee]}>
          <Text style={[typo.texte, styles.cellule]}>{l.nom}</Text>
          <Text style={[typo.texteGras, styles.cellule, styles.nombre]}>{l.valeur}</Text>
        </View>
      ))}
    </View>
  );
}

export function GraphiqueDonnees(props: IllustrationGraphique) {
  const { typo } = useThemeEnfant();
  const [largeur, mesurer] = useLargeur();
  return (
    <View style={styles.graphique} onLayout={mesurer}>
      <Text style={[typo.texteGras, styles.titre]}>{props.titre}</Text>
      {props.forme === 'tableau' ? (
        <Tableau {...props} />
      ) : (
        <View accessible accessibilityRole="image" accessibilityLabel={`Un diagramme en barres : ${props.titre}`}>
          {largeur > 0 ? <Barres {...props} largeur={largeur} /> : null}
        </View>
      )}
    </View>
  );
}

/** Taille d'une case du quadrillage, en points, quand il y a la place (tablette). */
export const CASE_GRILLE = 44;

export function Quadrillage({ colonnes, lignes, depart, objets, reperes }: IllustrationQuadrillage) {
  const { typo } = useThemeEnfant();
  const [largeur, mesurer] = useLargeur();
  const marge = reperes ? 24 : 0;
  // Sur un petit téléphone, les cases rapetissent pour que la grille tienne en entier.
  const taille = Math.min(CASE_GRILLE, Math.floor((largeur - marge) / colonnes));
  return (
    <View
      onLayout={mesurer}
      accessible
      accessibilityRole="image"
      accessibilityLabel={depart ? 'Un quadrillage avec Capy et des objets' : 'Un quadrillage avec des objets'}
      style={styles.centre}
    >
      {taille > 0 ? (
        <View style={{ width: marge + colonnes * taille, height: marge + lignes * taille }}>
          {reperes
            ? Array.from({ length: colonnes }, (_, c) => (
                <Text
                  key={`l${c}`}
                  style={[typo.texteGras, styles.repere, { left: marge + c * taille, top: 0, width: taille }]}
                >
                  {LETTRES_COLONNES[c]}
                </Text>
              ))
            : null}
          {reperes
            ? Array.from({ length: lignes }, (_, l) => (
                <Text
                  key={`c${l}`}
                  style={[
                    typo.texteGras,
                    styles.repere,
                    { left: 0, top: marge + l * taille + (taille - 24) / 2, width: marge },
                  ]}
                >
                  {l + 1}
                </Text>
              ))
            : null}
          {Array.from({ length: lignes * colonnes }, (_, i) => {
            const c = i % colonnes;
            const l = Math.floor(i / colonnes);
            const objet = objets.find((o) => o.colonne === c && o.ligne === l);
            const capy = depart?.colonne === c && depart.ligne === l;
            return (
              <View
                key={i}
                style={[
                  styles.case,
                  {
                    left: marge + c * taille,
                    top: marge + l * taille,
                    width: taille,
                    height: taille,
                  },
                  capy && styles.caseCapy,
                ]}
              >
                {capy ? (
                  <Image
                    source={mascotte.capy}
                    style={{ width: taille - 6, height: taille - 6 }}
                    resizeMode="contain"
                  />
                ) : objet ? (
                  <Text style={{ fontSize: taille * 0.6, lineHeight: taille * 0.75 }}>{imageDe(objet.objet)}</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  graphique: { alignItems: 'center', gap: espaces.s },
  titre: { textAlign: 'center' },
  tableau: {
    alignSelf: 'stretch',
    borderColor: couleurs.sarcelle[700],
    borderWidth: 2,
    borderRadius: formes.tuile.rayon,
    overflow: 'hidden',
  },
  ligne: { flexDirection: 'row', borderTopColor: couleurs.bordure, borderTopWidth: 1 },
  entete: { backgroundColor: couleurs.menthe[100], borderTopWidth: 0 },
  ligneTeintee: { backgroundColor: couleurs.fondPage },
  cellule: { flex: 1, paddingHorizontal: espaces.m, paddingVertical: espaces.s },
  nombre: { textAlign: 'center' },
  centre: { alignItems: 'center', alignSelf: 'stretch' },
  repere: { position: 'absolute', textAlign: 'center', color: couleurs.sarcelle[900] },
  case: {
    position: 'absolute',
    borderColor: couleurs.gris[300],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: couleurs.blanc,
  },
  caseCapy: { backgroundColor: couleurs.menthe[100] },
});
