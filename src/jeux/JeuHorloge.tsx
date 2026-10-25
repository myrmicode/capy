// Mini-jeu « L'horloge » (mathématiques) : l'aiguille des heures part de
// l'heure de début. L'enfant la fait avancer heure par heure jusqu'à l'heure
// de fin, puis valide. Avancer heure par heure, c'est compter la durée.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Text as TexteSvg } from 'react-native-svg';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { Bouton, CarteEnonce, IconeMoins, IconePlus } from '@/composants';
import { couleurs, polices } from '@/theme';

import type { PropsJeuNombre } from './types';

const TAILLE = 240;
const C = TAILLE / 2;

const angle = (heure: number) => ((heure % 12) * 30 - 90) * (Math.PI / 180);
const suivante = (h: number, pas: number) => ((h - 1 + pas + 12) % 12) + 1;

export function JeuHorloge({ exercice, actif, onRepondre }: PropsJeuNombre) {
  const [heure, setHeure] = useState(() => exercice.donnees.debut ?? 12);
  const [avance, setAvance] = useState(0);
  const { typo, cible, ecart } = useThemeEnfant();

  const deplacer = (pas: number) => {
    setHeure((h) => suivante(h, pas));
    setAvance((a) => a + pas);
  };

  return (
    <View style={[styles.jeu, { gap: ecart('m') }]}>
      <CarteEnonce enonce={exercice.enonce} question={exercice.question} />
      <View style={styles.centre} accessible accessibilityLabel={`L’horloge indique ${heure} heures.`}>
        <Svg width={TAILLE} height={TAILLE}>
          <Circle cx={C} cy={C} r={C - 4} fill={couleurs.blanc} stroke={couleurs.sarcelle[700]} strokeWidth={6} />
          {Array.from({ length: 12 }, (_, i) => {
            const h = i + 1;
            const a = angle(h);
            return (
              <TexteSvg
                key={h}
                x={C + Math.cos(a) * (C - 30)}
                y={C + Math.sin(a) * (C - 30) + 8}
                fontSize={22}
                fontFamily={polices.nunitoGras}
                fill={h === heure ? couleurs.sarcelle[700] : couleurs.encre}
                textAnchor="middle"
              >
                {String(h)}
              </TexteSvg>
            );
          })}
          {/* L'aiguille des minutes reste sur 12 : on compte des heures entières. */}
          <Line x1={C} y1={C} x2={C} y2={56} stroke={couleurs.encreDouce} strokeWidth={4} strokeLinecap="round" />
          <Line
            x1={C}
            y1={C}
            x2={C + Math.cos(angle(heure)) * (C - 62)}
            y2={C + Math.sin(angle(heure)) * (C - 62)}
            stroke={couleurs.brun[600]}
            strokeWidth={9}
            strokeLinecap="round"
          />
          <Circle cx={C} cy={C} r={8} fill={couleurs.brun[800]} />
        </Svg>
      </View>
      <View style={[styles.commandes, { gap: ecart('m') }]}>
        <Pressable
          onPress={() => deplacer(-1)}
          disabled={!actif}
          accessibilityRole="button"
          accessibilityLabel="Reculer d’une heure"
          style={[styles.rond, { width: cible + 8, height: cible + 8, borderRadius: (cible + 8) / 2 }]}
        >
          <IconeMoins taille={26} couleur={couleurs.blanc} />
        </Pressable>
        <View style={styles.lecture}>
          <Text style={typo.titre2}>{heure} h</Text>
          <Text style={typo.petit}>
            {avance === 0
              ? 'Avance l’aiguille'
              : `${Math.abs(avance)} heure${Math.abs(avance) > 1 ? 's' : ''} ${avance > 0 ? 'en avant' : 'en arrière'}`}
          </Text>
        </View>
        <Pressable
          onPress={() => deplacer(1)}
          disabled={!actif}
          accessibilityRole="button"
          accessibilityLabel="Avancer d’une heure"
          style={[styles.rond, { width: cible + 8, height: cible + 8, borderRadius: (cible + 8) / 2 }]}
        >
          <IconePlus taille={26} couleur={couleurs.blanc} />
        </Pressable>
      </View>
      <Bouton titre="Valider" desactive={!actif} onPress={() => onRepondre(heure === exercice.reponse)} />
    </View>
  );
}

const styles = StyleSheet.create({
  jeu: {},
  centre: { alignItems: 'center' },
  commandes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  rond: { backgroundColor: couleurs.sarcelle[700], alignItems: 'center', justifyContent: 'center' },
  lecture: { alignItems: 'center', minWidth: 140 },
});
