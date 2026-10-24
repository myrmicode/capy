import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Text as TexteSvg, TSpan } from 'react-native-svg';

import { useThemeEnfant } from '@/accessibilite/contexte';
import type { Domaine } from '@/config/domaines';
import { symboleDe, type Niveaux } from '@/toile/niveaux';
import { couleurs, espaces, polices } from '@/theme';

export interface CoucheToile {
  niveaux: Niveaux;
  /** « septembre » : contour brun en pointillés ; « actuelle » : surface sarcelle. */
  style: 'septembre' | 'actuelle';
}

interface PropsToile {
  domaines: readonly Domaine[];
  couches: readonly CoucheToile[];
  /** Largeur maximale du dessin (la toile prend sinon toute la largeur disponible). */
  largeurMax?: number;
  /** Affiche la légende sous la toile quand il y a deux couches. */
  legende?: boolean;
}

/** Les trois anneaux de la fiche : +, ++, +++. */
const GRADUATIONS = [1 / 3, 2 / 3, 1];
/** Largeur utilisée avant la première mesure (et dans les tests). */
const LARGEUR_PAR_DEFAUT = 360;
const RAYON_MIN = 70;
/** En dessous, la toile serait illisible : on ne descend jamais plus bas. */
const RAYON_PLANCHER = 50;
const POLICE_MIN = 10;
const RAYON_MAX = 210;
/** Écart entre le bout d'un axe et son libellé, et entre deux libellés. */
const ECART_LIBELLE = 10;
const ESPACE_ENTRE_LIBELLES = 4;

/** Coupe un libellé en lignes d'au plus LARGEUR_LIGNE caractères (mot à mot). */
const LARGEUR_LIGNE = 15;
export function lignes(libelle: string): string[] {
  const resultat: string[] = [];
  let ligne = '';
  for (const mot of libelle.split(' ')) {
    if (ligne && (ligne + ' ' + mot).length > LARGEUR_LIGNE) {
      resultat.push(ligne);
      ligne = mot;
    } else {
      ligne = ligne ? ligne + ' ' + mot : mot;
    }
  }
  if (ligne) resultat.push(ligne);
  return resultat;
}

export interface LibellePlace {
  lignes: string[];
  x: number;
  /** Haut du bloc de texte. */
  haut: number;
  hauteur: number;
  ancre: 'start' | 'middle' | 'end';
}

export interface Disposition {
  rayon: number;
  /** Taille des libellés retenue (plus petite sur un écran étroit). */
  taillePolice: number;
  /** Centre de la toile (x), le centre vertical étant en 0. */
  centreX: number;
  libelles: LibellePlace[];
  /** Haut et bas de tout le dessin, libellés compris. */
  haut: number;
  bas: number;
}

/**
 * Place la toile et ses libellés dans la largeur disponible. Les libellés d'un
 * même côté sont écartés verticalement pour ne jamais se chevaucher.
 */
export function disposer(nombreAxes: number, libelles: readonly string[], largeur: number, policeVoulue: number): Disposition {
  // Place réservée aux libellés : celle de la plus longue ligne réelle.
  const plusLongue = Math.max(1, ...libelles.flatMap((l) => lignes(l).map((m) => m.length)));
  const rayonPour = (police: number) => largeur / 2 - plusLongue * police * 0.56 - ECART_LIBELLE - 4;
  // Sur un écran étroit, les libellés rapetissent un peu plutôt que la toile.
  let taillePolice = policeVoulue;
  while (taillePolice > POLICE_MIN && rayonPour(taillePolice) < RAYON_MIN) taillePolice--;
  const hauteurLigne = Math.round(taillePolice * 1.2);
  const rayon = Math.min(RAYON_MAX, Math.max(RAYON_PLANCHER, rayonPour(taillePolice)));
  const centreX = largeur / 2;
  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / nombreAxes;

  const places: LibellePlace[] = libelles.map((libelle, i) => {
    const a = angle(i);
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const x = centreX + (rayon + ECART_LIBELLE) * cos;
    const y = (rayon + ECART_LIBELLE) * sin;
    const morceaux = lignes(libelle);
    const hauteur = morceaux.length * hauteurLigne;
    // Seuls les axes presque verticaux ont un libellé centré : les autres s'écartent sur le côté.
    const ancre = cos > 0.12 ? 'start' : cos < -0.12 ? 'end' : 'middle';
    // Au-dessus de la toile, le texte remonte ; en dessous, il descend ; sur les côtés, il est centré.
    const haut = sin < -0.5 ? y - hauteur : sin > 0.5 ? y : y - hauteur / 2;
    return { lignes: morceaux, x, haut, hauteur, ancre };
  });

  // De chaque côté, de haut en bas : un libellé qui empiète sur le précédent descend.
  for (const ancre of ['start', 'end', 'middle'] as const) {
    const cote = places.filter((p) => p.ancre === ancre).sort((a, b) => a.haut - b.haut);
    for (let k = 1; k < cote.length; k++) {
      const precedent = cote[k - 1];
      const minimum = precedent.haut + precedent.hauteur + ESPACE_ENTRE_LIBELLES;
      if (cote[k].haut < minimum) cote[k].haut = minimum;
    }
  }

  const haut = Math.min(-rayon, ...places.map((p) => p.haut));
  const bas = Math.max(rayon, ...places.map((p) => p.haut + p.hauteur));
  return { rayon, centreX, taillePolice, libelles: places, haut, bas };
}

/** La toile (graphique radar) des niveaux par domaine. Elle prend la largeur disponible. */
export function Toile({ domaines, couches, largeurMax = 680, legende = true }: PropsToile) {
  const { typo } = useThemeEnfant();
  const [largeurMesuree, setLargeurMesuree] = useState(0);
  const largeur = Math.min(largeurMesuree || LARGEUR_PAR_DEFAUT, largeurMax);
  // Les libellés suivent la taille du petit texte (plus grande sur tablette).
  const d = disposer(
    domaines.length,
    domaines.map((x) => x.libelle),
    largeur,
    Math.round(((typo.petit.fontSize ?? 14) * 12) / 14),
  );
  const { taillePolice } = d;
  const hauteurLigne = Math.round(taillePolice * 1.2);
  const marge = 8;
  const hauteur = d.bas - d.haut + 2 * marge;
  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / domaines.length;
  const point = (i: number, v: number) => ({
    x: d.centreX + d.rayon * v * Math.cos(angle(i)),
    y: d.rayon * v * Math.sin(angle(i)),
  });
  const polygone = (v: (i: number) => number) =>
    domaines
      .map((_, i) => {
        const p = point(i, v(i));
        return `${p.x},${p.y}`;
      })
      .join(' ');

  const actuelle = couches.find((c) => c.style === 'actuelle');
  const description = domaines
    .map((x) => {
      const v = actuelle?.niveaux[x.id] ?? couches[0]?.niveaux[x.id] ?? 0;
      return `${x.libelle} : ${symboleDe(v).length} plus`;
    })
    .join(', ');

  return (
    <View
      style={styles.cadre}
      onLayout={(e) => setLargeurMesuree(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Toile. ${description}`}
    >
      <Svg width={largeur} height={hauteur} viewBox={`0 ${d.haut - marge} ${largeur} ${hauteur}`}>
        {GRADUATIONS.map((g) => (
          <Polygon key={g} points={polygone(() => g)} fill="none" stroke={couleurs.gris[300]} strokeWidth={1.5} />
        ))}
        {domaines.map((x, i) => {
          const bout = point(i, 1);
          return <Line key={x.id} x1={d.centreX} y1={0} x2={bout.x} y2={bout.y} stroke={couleurs.gris[300]} strokeWidth={1.5} />;
        })}

        {couches.map((couche, k) => {
          const valeur = (i: number) => couche.niveaux[domaines[i].id] ?? 0;
          const septembre = couche.style === 'septembre';
          return (
            <G key={k}>
              <Polygon
                points={polygone(valeur)}
                fill={septembre ? 'none' : couleurs.sarcelle[400]}
                fillOpacity={septembre ? 0 : 0.35}
                stroke={septembre ? couleurs.brun[600] : couleurs.sarcelle[700]}
                strokeWidth={septembre ? 2.5 : 3}
                strokeDasharray={septembre ? '7 6' : undefined}
                strokeLinejoin="round"
              />
              {!septembre
                ? domaines.map((x, i) => {
                    const p = point(i, valeur(i));
                    return <Circle key={x.id} cx={p.x} cy={p.y} r={5} fill={couleurs.sarcelle[700]} />;
                  })
                : null}
            </G>
          );
        })}

        {d.libelles.map((l, i) => (
          <TexteSvg
            key={domaines[i].id}
            x={l.x}
            y={l.haut + taillePolice}
            textAnchor={l.ancre}
            fontFamily={polices.nunitoGras}
            fontSize={taillePolice}
            fill={couleurs.encre}
          >
            {l.lignes.map((m, j) => (
              <TSpan key={j} x={l.x} dy={j === 0 ? 0 : hauteurLigne}>
                {m}
              </TSpan>
            ))}
          </TexteSvg>
        ))}
      </Svg>

      {legende && couches.length > 1 ? (
        <View style={styles.legende}>
          <View style={styles.element}>
            <View style={styles.traitSeptembre} />
            <Text style={typo.petit}>Septembre (fiche de l’école)</Text>
          </View>
          <View style={styles.element}>
            <View style={styles.traitActuel} />
            <Text style={typo.petit}>Aujourd’hui</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: { width: '100%', alignItems: 'center', gap: espaces.s },
  legende: { flexDirection: 'row', flexWrap: 'wrap', gap: espaces.l, justifyContent: 'center' },
  element: { flexDirection: 'row', alignItems: 'center', gap: espaces.s },
  traitSeptembre: { width: 28, height: 0, borderTopWidth: 3, borderStyle: 'dashed', borderColor: couleurs.brun[600] },
  traitActuel: {
    width: 28,
    height: 14,
    borderRadius: 4,
    backgroundColor: couleurs.menthe[200],
    borderWidth: 2,
    borderColor: couleurs.sarcelle[700],
  },
});
