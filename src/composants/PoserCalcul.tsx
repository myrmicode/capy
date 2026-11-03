// Le brouillon en colonnes : l'enfant choisit l'opération, écrit les nombres de
// l'histoire, puis pose le calcul case par case, les retenues au-dessus. Il peut
// vérifier son calcul (pas le choix de l'opération : c'est à lui de le trouver).
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import {
  CHIFFRES_MAX,
  grillePose,
  ligneRemplie,
  nomColonne,
  OPERATIONS_POSEES,
  problemePose,
  verifierLigne,
  type GrillePose,
  type LigneAttendue,
  type OperationPosee,
  type ProblemePose,
} from '@/exercices/pose';
import { couleurs, espaces, formes, polices } from '@/theme';

import { Bouton } from './Bouton';

const CASE = 40;
const NOMS_OPERATIONS: Record<OperationPosee, string> = { '+': 'addition', '−': 'soustraction', '×': 'multiplication' };
const MESSAGES: Record<ProblemePose, string> = {
  vide: 'Écris les deux nombres de l’histoire.',
  'trop-grand': 'Ces nombres sont trop grands pour le brouillon.',
  'soustraction-impossible': 'Dans une soustraction posée, le plus grand nombre se met en haut.',
  'multiplicateur-trop-long': 'Le second nombre d’une multiplication a 3 chiffres au plus.',
};

interface PropsPoserCalcul {
  /** L'opération déjà posée (« Poser et calculer ») : l'enfant n'a plus qu'à calculer. */
  donnee?: { operation: OperationPosee; a: number; b: number } | null;
  /** Le bouton « Vérifier » (absent quand le calcul est justement la question). */
  verification?: boolean;
}

export function PoserCalcul({ donnee, verification = true }: PropsPoserCalcul) {
  const { typo } = useThemeEnfant();
  const [operation, setOperation] = useState<OperationPosee>(donnee?.operation ?? '+');
  const [texteA, setTexteA] = useState(donnee ? String(donnee.a) : '');
  const [texteB, setTexteB] = useState(donnee ? String(donnee.b) : '');
  const [grille, setGrille] = useState<GrillePose | null>(
    donnee ? grillePose(donnee.operation, donnee.a, donnee.b) : null,
  );
  const [message, setMessage] = useState<string | null>(null);

  if (grille) {
    return (
      <View style={styles.carte}>
        <Grille key={`${grille.operation}${grille.a}${grille.b}`} grille={grille} verification={verification} />
        {donnee ? null : <Bouton titre="Changer le calcul" variante="secondaire" onPress={() => setGrille(null)} />}
      </View>
    );
  }

  const poser = () => {
    const a = Number(texteA);
    const b = Number(texteB);
    const probleme = texteA === '' || texteB === '' ? 'vide' : problemePose(operation, a, b);
    if (probleme) {
      setMessage(MESSAGES[probleme]);
      return;
    }
    setMessage(null);
    setGrille(grillePose(operation, a, b));
  };
  const chiffres = (t: string) =>
    t
      .replace(/\D/g, '')
      .replace(/^0+(?=\d)/, '')
      .slice(0, CHIFFRES_MAX);

  return (
    <View style={styles.carte}>
      <Text style={typo.texteGras}>Pose le calcul</Text>
      <Text style={typo.petit}>Choisis l’opération, puis écris les nombres de l’histoire.</Text>
      <View style={styles.ligne}>
        {OPERATIONS_POSEES.map((op) => (
          <Pressable
            key={op}
            onPress={() => setOperation(op)}
            accessibilityRole="button"
            accessibilityLabel={NOMS_OPERATIONS[op]}
            accessibilityState={{ selected: op === operation }}
            style={[styles.operation, op === operation && styles.operationChoisie]}
          >
            <Text style={[styles.chiffre, op === operation && { color: couleurs.blanc }]}>{op}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.ligne}>
        <TextInput
          value={texteA}
          onChangeText={(t) => setTexteA(chiffres(t))}
          keyboardType="number-pad"
          placeholder="1er nombre"
          placeholderTextColor={couleurs.encreDouce}
          accessibilityLabel="Le premier nombre"
          style={[styles.champ, styles.chiffre]}
        />
        <Text style={styles.chiffre}>{operation}</Text>
        <TextInput
          value={texteB}
          onChangeText={(t) => setTexteB(chiffres(t))}
          keyboardType="number-pad"
          placeholder="2e nombre"
          placeholderTextColor={couleurs.encreDouce}
          accessibilityLabel="Le second nombre"
          style={[styles.champ, styles.chiffre]}
        />
      </View>
      {message ? <Text style={[typo.texte, { color: couleurs.brun[800] }]}>{message}</Text> : null}
      <Bouton titre="Poser en colonnes" onPress={poser} />
    </View>
  );
}

type Saisies = Record<string, string[]>;
const RETENUES = 'retenues';
const RESULTAT = 'resultat';

/** Les lignes à remplir (sauf les retenues, qui ne sont pas vérifiées). */
function lignesAVerifier(g: GrillePose): { cle: string; attendue: LigneAttendue }[] {
  return [...g.partiels.map((p, i) => ({ cle: `p${i}`, attendue: p })), { cle: RESULTAT, attendue: g.resultat }];
}

function Grille({ grille, verification }: { grille: GrillePose; verification: boolean }) {
  const { typo } = useThemeEnfant();
  const n = grille.colonnes;
  const [saisies, setSaisies] = useState<Saisies>({});
  const [choisie, setChoisie] = useState<{ ligne: string; colonne: number }>({
    ligne: grille.partiels.length > 0 ? 'p0' : RESULTAT,
    colonne: n - 1,
  });
  const [verifiee, setVerifiee] = useState<Record<string, boolean[]> | null>(null);

  const ecrire = (chiffre: string | null) => {
    const ligne = [...(saisies[choisie.ligne] ?? Array.from({ length: n }, () => ''))];
    ligne[choisie.colonne] = chiffre ?? '';
    setSaisies({ ...saisies, [choisie.ligne]: ligne });
    setVerifiee(null);
    // On écrit de droite à gauche : la case suivante est à gauche (pas pour les retenues, ni pour effacer).
    if (chiffre !== null && choisie.ligne !== RETENUES && choisie.colonne > 0)
      setChoisie({ ...choisie, colonne: choisie.colonne - 1 });
  };

  const verifier = () =>
    setVerifiee(
      Object.fromEntries(
        lignesAVerifier(grille).map(({ cle, attendue }) => [cle, verifierLigne(saisies[cle] ?? [], attendue, n)]),
      ),
    );
  const toutJuste = verifiee !== null && Object.values(verifiee).every((l) => l.every(Boolean));
  const remplie = lignesAVerifier(grille).every(({ cle, attendue }) => ligneRemplie(saisies[cle] ?? [], attendue, n));

  const chiffresDe = (nombre: number) => String(nombre).padStart(n, ' ').split('');

  const ligneFixe = (signe: string, nombre: number, cle: string) => (
    <View style={styles.rangee} key={cle}>
      <Text style={[styles.signe, styles.chiffre]}>{signe}</Text>
      {chiffresDe(nombre).map((c, i) => (
        <View key={i} style={styles.case}>
          <Text style={styles.chiffre}>{c.trim()}</Text>
        </View>
      ))}
    </View>
  );

  const ligneASaisir = (cle: string, libelle: string, signe = '', decalage = 0, petite = false) => (
    <View style={styles.rangee} key={cle}>
      <Text style={[styles.signe, styles.chiffre]}>{signe}</Text>
      {Array.from({ length: n }, (_, i) => {
        if (i >= n - decalage)
          return (
            <View key={i} style={styles.case}>
              <Text style={[styles.chiffre, { color: couleurs.encreDouce }]}>0</Text>
            </View>
          );
        const valeur = saisies[cle]?.[i] ?? '';
        const estChoisie = choisie.ligne === cle && choisie.colonne === i;
        const juste = verifiee?.[cle]?.[i];
        return (
          <Pressable
            key={i}
            onPress={() => setChoisie({ ligne: cle, colonne: i })}
            accessibilityRole="button"
            accessibilityLabel={`${libelle}, ${nomColonne(n, i)} : ${valeur || 'vide'}${juste === false ? ', à revoir' : ''}`}
            style={[
              styles.case,
              petite ? styles.caseRetenue : styles.caseSaisie,
              estChoisie && styles.caseChoisie,
              juste === false && styles.caseFausse,
              juste === true && valeur !== '' && styles.caseJuste,
            ]}
          >
            <Text style={[styles.chiffre, petite && styles.chiffreRetenue]}>{valeur}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={styles.grilleEtClavier}>
      <View style={styles.grille} accessibilityLabel={`Le calcul posé : ${grille.a} ${grille.operation} ${grille.b}`}>
        {ligneASaisir(RETENUES, 'Retenue', '', 0, true)}
        {ligneFixe('', grille.a, 'a')}
        {ligneFixe(grille.operation, grille.b, 'b')}
        <View style={[styles.trait, { width: (n + 1) * CASE }]} />
        {grille.partiels.map((p, i) =>
          ligneASaisir(`p${i}`, `Ligne ${i + 1}`, i === grille.partiels.length - 1 && i > 0 ? '+' : '', p.decalage),
        )}
        {grille.partiels.length > 0 ? <View style={[styles.trait, { width: (n + 1) * CASE }]} /> : null}
        {ligneASaisir(RESULTAT, 'Résultat')}
      </View>

      <View style={styles.clavier}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((c) => (
          <Pressable
            key={c}
            onPress={() => ecrire(c)}
            accessibilityRole="button"
            accessibilityLabel={`Écrire ${c}`}
            style={({ pressed }) => [styles.touche, pressed && styles.toucheAppuyee]}
          >
            <Text style={styles.chiffre}>{c}</Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => ecrire(null)}
          accessibilityRole="button"
          accessibilityLabel="Effacer la case"
          style={({ pressed }) => [styles.touche, styles.toucheLarge, pressed && styles.toucheAppuyee]}
        >
          <Text style={typo.texteGras}>Effacer</Text>
        </Pressable>
      </View>

      {verification ? (
        <Bouton titre="Vérifier mon calcul" variante="secondaire" desactive={!remplie} onPress={verifier} />
      ) : null}
      {verifiee ? (
        <Text style={[typo.texteGras, { color: toutJuste ? couleurs.sarcelle[900] : couleurs.brun[800] }]}>
          {toutJuste
            ? 'Ton calcul est juste. Vérifie maintenant que c’était le bon calcul pour l’histoire !'
            : 'Presque ! Regarde les cases en orange, et pense aux retenues.'}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    gap: espaces.m,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.m,
  },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: espaces.s },
  operation: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: formes.tuile.rayon,
    backgroundColor: couleurs.menthe[100],
  },
  operationChoisie: { backgroundColor: couleurs.sarcelle[700] },
  champ: {
    flex: 1,
    minHeight: 56,
    textAlign: 'center',
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.tuile.rayon,
    backgroundColor: couleurs.fondPage,
  },
  chiffre: {
    fontFamily: polices.fredokaGras,
    fontSize: 26,
    lineHeight: 32,
    color: couleurs.encre,
    textAlign: 'center',
  },
  chiffreRetenue: { fontSize: 16, lineHeight: 20, color: couleurs.brun[800] },
  grilleEtClavier: { gap: espaces.m, alignItems: 'center' },
  grille: { alignItems: 'flex-end', paddingVertical: espaces.s },
  rangee: { flexDirection: 'row', alignItems: 'center' },
  signe: { width: CASE },
  case: { width: CASE, height: CASE + 4, alignItems: 'center', justifyContent: 'center' },
  caseSaisie: { borderBottomWidth: 2, borderColor: couleurs.gris[300], backgroundColor: couleurs.fondPage },
  caseRetenue: { height: 28, borderRadius: 6 },
  caseChoisie: { backgroundColor: couleurs.jaune[400], borderRadius: 6 },
  caseFausse: { backgroundColor: couleurs.brun[100], borderColor: couleurs.brun[600] },
  caseJuste: { backgroundColor: couleurs.menthe[100] },
  trait: { height: 3, backgroundColor: couleurs.encre, marginVertical: 2 },
  clavier: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: espaces.s, maxWidth: 340 },
  touche: {
    width: 56,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: formes.tuile.rayon,
    backgroundColor: couleurs.menthe[100],
  },
  toucheLarge: { width: 120 },
  toucheAppuyee: { backgroundColor: couleurs.menthe[200] },
});
