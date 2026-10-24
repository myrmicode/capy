import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Text as TexteSvg, TSpan } from 'react-native-svg';

import type { Domaine } from '@/config/domaines';
import { symboleDe, type Niveaux } from '@/toile/niveaux';
import { couleurs, espaces, polices, typo } from '@/theme';

export interface CoucheToile {
  niveaux: Niveaux;
  /** « septembre » : contour brun en pointillés ; « actuelle » : surface sarcelle. */
  style: 'septembre' | 'actuelle';
}

interface PropsToile {
  domaines: readonly Domaine[];
  couches: readonly CoucheToile[];
  taille?: number;
  /** Affiche la légende sous la toile quand il y a deux couches. */
  legende?: boolean;
}

const MARGE_LIBELLES = 64;
/** Place supplémentaire à gauche et à droite pour les libellés longs. */
const MARGE_LATERALE = 56;
/** Les trois anneaux de la fiche : +, ++, +++. */
const GRADUATIONS = [1 / 3, 2 / 3, 1];

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

/** La toile (graphique radar) des niveaux par domaine. */
export function Toile({ domaines, couches, taille = 320, legende = true }: PropsToile) {
  const largeur = taille + 2 * MARGE_LATERALE;
  const centreX = largeur / 2;
  const centre = taille / 2;
  const rayon = centre - MARGE_LIBELLES;
  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / domaines.length;
  const point = (i: number, v: number) => ({
    x: centreX + rayon * v * Math.cos(angle(i)),
    y: centre + rayon * v * Math.sin(angle(i)),
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
    .map((d) => {
      const v = actuelle?.niveaux[d.id] ?? couches[0]?.niveaux[d.id] ?? 0;
      return `${d.libelle} : ${symboleDe(v).length} plus`;
    })
    .join(', ');

  return (
    <View style={styles.cadre} accessible accessibilityRole="image" accessibilityLabel={`Toile. ${description}`}>
      <Svg width={largeur} height={taille} viewBox={`0 0 ${largeur} ${taille}`} style={styles.svg}>
        {GRADUATIONS.map((g) => (
          <Polygon key={g} points={polygone(() => g)} fill="none" stroke={couleurs.gris[300]} strokeWidth={1.5} />
        ))}
        {domaines.map((d, i) => {
          const bout = point(i, 1);
          return <Line key={d.id} x1={centreX} y1={centre} x2={bout.x} y2={bout.y} stroke={couleurs.gris[300]} strokeWidth={1.5} />;
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
                ? domaines.map((d, i) => {
                    const p = point(i, valeur(i));
                    return <Circle key={d.id} cx={p.x} cy={p.y} r={5} fill={couleurs.sarcelle[700]} />;
                  })
                : null}
            </G>
          );
        })}

        {domaines.map((d, i) => {
          const a = angle(i);
          const x = centreX + (rayon + 12) * Math.cos(a);
          const y = centre + (rayon + 12) * Math.sin(a);
          const cos = Math.cos(a);
          // Seuls les axes presque verticaux ont un libellé centré : les autres s'écartent sur le côté.
          const ancre = cos > 0.12 ? 'start' : cos < -0.12 ? 'end' : 'middle';
          const morceaux = lignes(d.libelle);
          const sin = Math.sin(a);
          // Au-dessus de la toile, le texte remonte ; en dessous, il descend.
          const decalage = sin < -0.5 ? -(morceaux.length - 1) * 14 - 4 : sin > 0.5 ? 14 : 4 - ((morceaux.length - 1) * 14) / 2;
          return (
            <TexteSvg
              key={d.id}
              x={x}
              y={y + decalage}
              textAnchor={ancre}
              fontFamily={polices.nunitoGras}
              fontSize={12}
              fill={couleurs.encre}
            >
              {morceaux.map((m, j) => (
                <TSpan key={j} x={x} dy={j === 0 ? 0 : 14}>
                  {m}
                </TSpan>
              ))}
            </TexteSvg>
          );
        })}
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
  cadre: { alignItems: 'center', gap: espaces.s },
  svg: { maxWidth: '100%' },
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
