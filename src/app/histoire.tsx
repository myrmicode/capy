// Une histoire de Capy : on la lit page par page (Capy peut la lire à voix
// haute), puis on répond à trois questions. Comme dans une étape : jamais
// punitif, « Presque ! » renvoie à la page où se trouve la réponse.
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useReducer, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { avecReglagesEnfant, useThemeEnfant } from '@/accessibilite/contexte';
import { TexteAccessible } from '@/accessibilite/TexteAccessible';
import {
  BarreProgression,
  Bouton,
  CapyAnime,
  Ecran,
  IconeEtoile,
  IconeHautParleur,
  PanneauRetour,
  TuileReponse,
  type EtatTuile,
} from '@/composants';
import { HISTOIRES } from '@/contenu/histoires';
import { PHRASES_CAPY, phraseDe } from '@/contenu/phrasesCapy';
import { arreterLecture, celebrer, feliciter, lireAVoixHaute } from '@/jeux/retours';
import { derouler, etatInitial } from '@/parcours/deroulement';
import { etoilesPour } from '@/parcours/progression';
import { useProfilActif, useProfils } from '@/store/profils';
import { couleurs, espaces, formes } from '@/theme';

function EcranHistoire() {
  const profil = useProfilActif();
  const enregistrerHistoire = useProfils((e) => e.enregistrerHistoire);
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const histoire = HISTOIRES.find((h) => h.id === id);
  const { typo, reglages, ecart, animationsReduites } = useThemeEnfant();
  const [page, setPage] = useState(0);
  const [debut] = useState(() => Date.now());
  const [etat, envoyer] = useReducer(derouler, histoire?.questions.length ?? 0, etatInitial);
  const [choisie, setChoisie] = useState<string | null>(null);
  const enregistree = useRef(false);
  const lire = (textes: string[]) => lireAVoixHaute(textes, { lente: reglages.lectureLente });

  useEffect(() => arreterLecture, []);
  useEffect(() => {
    if (etat.phase === 'bravo') feliciter({ silencieux: animationsReduites });
    if (etat.phase === 'terminee') celebrer('fin', { silencieux: animationsReduites });
  }, [etat.phase, animationsReduites]);
  useEffect(() => {
    if (etat.phase !== 'terminee' || !profil || !histoire || enregistree.current) return;
    enregistree.current = true;
    enregistrerHistoire(profil.id, histoire.id, {
      reussiesPremierCoup: etat.reussiesPremierCoup,
      nombreQuestions: etat.nombreQuestions,
      dureeSecondes: Math.min(30 * 60, (Date.now() - debut) / 1000),
    });
  }, [etat, profil, histoire, debut, enregistrerHistoire]);

  if (!profil) return <Redirect href="/" />;
  if (!histoire) return <Redirect href="/histoires" />;

  const nbPages = histoire.pages.length;
  const enLecture = page < nbPages;

  if (etat.phase === 'terminee') {
    const etoiles = etoilesPour(etat.reussiesPremierCoup, etat.nombreQuestions);
    return (
      <Ecran pied={<Bouton titre="Retour aux histoires" onPress={() => router.back()} />}>
        <View style={styles.fin}>
          <CapyAnime pose="bravo" taille={180} />
          <Text style={[typo.titre1, styles.centre]}>Histoire terminée !</Text>
          <View
            style={styles.etoiles}
            accessible
            accessibilityLabel={`${etoiles} étoile${etoiles > 1 ? 's' : ''} gagnée${etoiles > 1 ? 's' : ''}`}
          >
            {[1, 2, 3].map((n) => (
              <IconeEtoile key={n} taille={48} couleur={n <= etoiles ? couleurs.jaune[400] : couleurs.gris[200]} />
            ))}
          </View>
          <Text style={[typo.enonce, styles.centre]}>
            Bravo {profil.prenom}, tu as lu « {histoire.titre} » et répondu aux questions.
          </Text>
        </View>
      </Ecran>
    );
  }

  if (enLecture) {
    const p = histoire.pages[page];
    return (
      <Ecran
        pied={
          <View style={{ gap: ecart('m') }}>
            <Bouton
              titre={page + 1 < nbPages ? 'Page suivante' : 'Aux questions'}
              onPress={() => {
                arreterLecture();
                setPage(page + 1);
              }}
            />
            {page > 0 ? <Bouton titre="Page d’avant" variante="secondaire" onPress={() => setPage(page - 1)} /> : null}
          </View>
        }
      >
        <Text style={typo.titre2} accessibilityRole="header">
          {histoire.titre}
        </Text>
        <Text style={typo.petit}>
          Page {page + 1} sur {nbPages}
        </Text>
        <View style={styles.illustration}>
          <CapyAnime key={page} pose={p.pose} taille={150} />
        </View>
        <View style={styles.pageTexte}>
          <TexteAccessible texte={p.texte} variante="enonce" coloration />
        </View>
        <Bouton
          titre="Écouter"
          variante="secondaire"
          pleineLargeur={false}
          icone={(c) => <IconeHautParleur taille={22} couleur={c} />}
          onPress={() => lire([p.texte])}
        />
      </Ecran>
    );
  }

  const q = histoire.questions[etat.index];
  const etatTuile = (c: string): EtatTuile => {
    if (c !== choisie) return etat.phase === 'question' ? 'normal' : 'desactive';
    return c === q.reponse ? 'juste' : 'presque';
  };
  let pied = null;
  if (etat.phase === 'bravo') {
    pied = (
      <PanneauRetour
        type="bravo"
        titre={phraseDe(PHRASES_CAPY.bravo, etat.index)}
        explication={q.explication}
        onContinuer={() => {
          setChoisie(null);
          envoyer({ type: 'continuer' });
        }}
      />
    );
  } else if (etat.phase === 'presque') {
    pied = (
      <PanneauRetour
        type="presque"
        titre={phraseDe(PHRASES_CAPY.presque, etat.index + etat.essaisRates)}
        indice={`Relis la page ${q.page} : la réponse y est.`}
        methode={etat.essaisRates >= 2 ? q.explication : undefined}
        onContinuer={() => {
          setChoisie(null);
          envoyer({ type: 'reessayer' });
        }}
      />
    );
  }

  return (
    <Ecran pied={pied}>
      <Text style={typo.titre2}>{histoire.titre}</Text>
      <View style={styles.ligne}>
        <BarreProgression valeur={(etat.index + (etat.phase === 'bravo' ? 1 : 0)) / etat.nombreQuestions} />
      </View>
      <View style={styles.pageTexte}>
        <TexteAccessible texte={q.question} variante="enonce" couleur={couleurs.sarcelle[900]} coloration />
      </View>
      <View style={[styles.grille, { gap: ecart('m') }]}>
        {q.choix.map((c) => (
          <View key={c} style={c.length > 12 ? styles.ligneEntiere : styles.cellule}>
            <TuileReponse
              libelle={c}
              etat={etatTuile(c)}
              onPress={() => {
                if (etat.phase !== 'question') return;
                setChoisie(c);
                envoyer({ type: 'repondre', juste: c === q.reponse });
              }}
            />
          </View>
        ))}
      </View>
      <Bouton
        titre={`Relire la page ${q.page}`}
        variante="secondaire"
        onPress={() => lire([histoire.pages[q.page - 1].texte])}
        icone={(c) => <IconeHautParleur taille={22} couleur={c} />}
      />
    </Ecran>
  );
}

export default avecReglagesEnfant(EcranHistoire);

const styles = StyleSheet.create({
  centre: { textAlign: 'center' },
  fin: { alignItems: 'center', gap: espaces.m, paddingTop: espaces.xl },
  etoiles: { flexDirection: 'row', gap: espaces.s },
  illustration: {
    alignItems: 'center',
    backgroundColor: couleurs.menthe[100],
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
  },
  pageTexte: {
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.carte.rayon,
    padding: espaces.l,
  },
  ligne: { flexDirection: 'row' },
  grille: { flexDirection: 'row', flexWrap: 'wrap' },
  cellule: { flexBasis: '45%', flexGrow: 1 },
  ligneEntiere: { flexBasis: '100%' },
});
