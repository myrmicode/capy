// Pictogramme de chaque thème, sur une tuile de la couleur de sa matière. Le
// dessin rappelle l'univers de l'unité (le marché, le funambule, le jardin…).
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { DomaineId } from '@/config/domaines';
import { couleurs, type CouleursMatiere } from '@/theme';

type Dessin =
  | 'probleme'
  | 'eclair'
  | 'ligne'
  | 'fleur'
  | 'panier'
  | 'jumeaux'
  | 'arbre'
  | 'wagon'
  | 'horloge'
  | 'crayon'
  | 'phrases'
  | 'livre';

const DESSINS: Partial<Record<DomaineId, Dessin>> = {
  'resoudre-problemes': 'probleme',
  'calcul-mental': 'eclair',
  'tables-addition': 'eclair',
  'tables-multiplication': 'eclair',
  'poser-calculer': 'eclair',
  'ligne-graduee': 'ligne',
  'accord-nom-adjectif': 'fleur',
  'accord-sujet-verbe': 'fleur',
  'nature-mots': 'panier',
  synonymes: 'jumeaux',
  'synonymes-familles': 'jumeaux',
  'familles-mots': 'arbre',
  'sujet-verbe': 'wagon',
  'sujet-verbe-complement': 'wagon',
  conjugaison: 'horloge',
  'ecrire-mots': 'crayon',
  'ecrire-syllabes': 'crayon',
  'ecrire-nombres': 'crayon',
  'comprendre-phrases': 'phrases',
  'comprendre-phrases-lues': 'phrases',
  'comprendre-mots': 'phrases',
  'comprendre-texte-lu': 'livre',
  'comprendre-texte-entendu': 'livre',
};

const trait = { strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none', strokeWidth: 2.2 } as const;

function Pictogramme({ dessin, couleur }: { dessin: Dessin | undefined; couleur: string }) {
  const t = { ...trait, stroke: couleur };
  switch (dessin) {
    case 'probleme':
      return (
        <>
          <Path
            d="M5 4.5h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-7l-4.5 3.5V17H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z"
            {...t}
          />
          <Path d="M9.8 8.8a2.2 2.2 0 1 1 3.1 2c-.6.3-.9.8-.9 1.4" {...t} />
          <Circle cx={12} cy={14.6} r={1.1} fill={couleur} />
        </>
      );
    case 'eclair':
      return (
        <Path
          d="M13.5 2.5L5 13.5h6.2L10 21.5l8.8-11.3h-6.3z"
          fill={couleur}
          stroke={couleur}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      );
    case 'ligne':
      return (
        <>
          <Path d="M2.5 16h19M5 13v6M9.7 14.3v3.4M14.3 14.3v3.4M19 13v6" {...t} />
          <Circle cx={14.3} cy={8} r={2.6} fill={couleur} />
        </>
      );
    case 'fleur':
      return (
        <>
          <Circle cx={12} cy={5.4} r={2.6} {...t} />
          <Circle cx={15.6} cy={9} r={2.6} {...t} />
          <Circle cx={12} cy={12.6} r={2.6} {...t} />
          <Circle cx={8.4} cy={9} r={2.6} {...t} />
          <Circle cx={12} cy={9} r={1.3} fill={couleur} />
          <Path d="M12 15.5v6M12 19c1.5-2 3.5-2.4 5-2-.8 1.8-2.8 2.6-5 2" {...t} />
        </>
      );
    case 'panier':
      return (
        <>
          <Path d="M7 10a5 5 0 0 1 10 0" {...t} />
          <Path d="M3.5 10h17l-2 9.3a1.5 1.5 0 0 1-1.5 1.2H7a1.5 1.5 0 0 1-1.5-1.2z" {...t} />
          <Path d="M9 13.5v3.8M12 13.5v3.8M15 13.5v3.8" {...t} />
        </>
      );
    case 'jumeaux':
      return (
        <>
          <Circle cx={8.8} cy={12} r={5.6} {...t} />
          <Circle cx={15.2} cy={12} r={5.6} {...t} />
        </>
      );
    case 'arbre':
      return (
        <>
          <Circle cx={12} cy={8.5} r={5.8} {...t} />
          <Path d="M12 14.3v7M12 18l-3-2.4M12 16.8l2.8-2" {...t} />
        </>
      );
    case 'wagon':
      return (
        <>
          <Rect x={2.5} y={5.5} width={19} height={10.5} rx={2.2} {...t} />
          <Rect x={5.8} y={8.3} width={4.4} height={3.6} rx={0.8} fill={couleur} />
          <Rect x={13.8} y={8.3} width={4.4} height={3.6} rx={0.8} fill={couleur} />
          <Circle cx={7.5} cy={19} r={2} {...t} />
          <Circle cx={16.5} cy={19} r={2} {...t} />
        </>
      );
    case 'horloge':
      return (
        <>
          <Circle cx={12} cy={12} r={8.8} {...t} />
          <Path d="M12 7v5.2l3.4 2.2" {...t} />
        </>
      );
    case 'crayon':
      return (
        <>
          <Path d="M4 20l1-4.6L15.6 4.8a2.2 2.2 0 0 1 3.1 3.1L8.1 18.6z" {...t} />
          <Path d="M13.6 6.8l3.1 3.1" {...t} />
        </>
      );
    case 'phrases':
      return <Path d="M4 6.5h16M4 12h11M4 17.5h14" {...t} />;
    case 'livre':
      return (
        <>
          <Path d="M12 6.5C10 5 7 4.5 3 5v13.5c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5z" {...t} />
          <Path d="M12 6.5V20" {...t} />
        </>
      );
    default:
      return <Path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.6l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" fill={couleur} />;
  }
}

interface PropsTuileTheme {
  domaine: DomaineId;
  couleurs: CouleursMatiere;
  taille?: number;
  /** Tuile blanche, dessin de la couleur de la matière (sur un bandeau coloré). */
  inverse?: boolean;
}

/** Tuile carrée en relief, avec le pictogramme du thème. Décorative : le titre du thème est toujours écrit à côté. */
export function TuileTheme({ domaine, couleurs: c, taille = 56, inverse = false }: PropsTuileTheme) {
  const relief = Math.round(taille / 14);
  const fond = inverse ? couleurs.blanc : c.face;
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{
        width: taille,
        height: taille,
        borderRadius: taille * 0.3,
        backgroundColor: fond,
        borderBottomWidth: relief,
        borderBottomColor: c.relief,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={taille * 0.6} height={taille * 0.6} viewBox="0 0 24 24">
        <Pictogramme dessin={DESSINS[domaine]} couleur={inverse ? c.face : couleurs.blanc} />
      </Svg>
    </View>
  );
}
