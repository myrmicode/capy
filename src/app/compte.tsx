import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemeEnfant } from '@/accessibilite/contexte';
import { BulleCapy, Bouton, CarteConfiance, Ecran } from '@/composants';
import { emailValide, envoyerCode, verifierCode } from '@/serveur/compte';
import { useCompte } from '@/store/compte';
import { couleurs, espaces, formes } from '@/theme';

/**
 * Création du compte ou connexion, sans mot de passe : le parent reçoit un code
 * par e-mail. Accessible seulement depuis l'espace parent (après le contrôle parental).
 */
export default function Compte() {
  const { typo } = useThemeEnfant();
  const disponible = useCompte((e) => e.disponible);
  const [etape, setEtape] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!disponible) return <Redirect href="/enfant/parents" />;

  const demanderCode = async () => {
    setOccupe(true);
    setMessage(null);
    const ok = await envoyerCode(email);
    setOccupe(false);
    if (ok) setEtape('code');
    else setMessage('L’envoi du code n’a pas abouti. Vérifiez l’adresse et la connexion, puis réessayez.');
  };

  const valider = async () => {
    setOccupe(true);
    setMessage(null);
    const ok = await verifierCode(email, code);
    setOccupe(false);
    if (ok) router.back();
    else setMessage('Ce code ne fonctionne pas. Vérifiez-le, ou demandez-en un nouveau.');
  };

  return (
    <Ecran
      pied={
        <View style={styles.boutons}>
          {etape === 'email' ? (
            <Bouton titre="Recevoir un code" desactive={!emailValide(email) || occupe} onPress={demanderCode} />
          ) : (
            <>
              <Bouton titre="Se connecter" desactive={code.trim().length < 6 || occupe} onPress={valider} />
              <Bouton titre="Changer d’adresse" variante="secondaire" onPress={() => setEtape('email')} />
            </>
          )}
          <Bouton titre="Annuler" variante="secondaire" onPress={() => router.back()} />
        </View>
      }
    >
      <Text style={typo.titre1}>Compte parent</Text>
      <BulleCapy
        pose="serieux"
        tailleCapy={80}
        texte={
          etape === 'email'
            ? 'Un compte sert seulement à retrouver la progression sur un autre appareil. Pas de mot de passe : vous recevrez un code.'
            : `Un code vient d’être envoyé à ${email.trim()}. Saisissez-le ici.`
        }
      />

      {etape === 'email' ? (
        <View style={styles.champ}>
          <Text style={typo.texteGras} nativeID="libelleEmail">
            Votre adresse e-mail
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="parent@exemple.fr"
            placeholderTextColor={couleurs.encreDouce}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            accessibilityLabelledBy="libelleEmail"
            accessibilityLabel="Votre adresse e-mail"
            style={[typo.enonce, styles.saisie]}
          />
        </View>
      ) : (
        <View style={styles.champ}>
          <Text style={typo.texteGras} nativeID="libelleCode">
            Code reçu par e-mail
          </Text>
          <TextInput
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
            placeholder="123456"
            placeholderTextColor={couleurs.encreDouce}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={10}
            accessibilityLabelledBy="libelleCode"
            accessibilityLabel="Code reçu par e-mail"
            style={[typo.enonce, styles.saisie, styles.code]}
          />
        </View>
      )}
      {message ? <Text style={[typo.texte, { color: couleurs.brun[800] }]}>{message}</Text> : null}

      <CarteConfiance
        titre="Ce qui est enregistré avec un compte"
        texte="Votre adresse e-mail, puis pour chaque enfant : prénom ou surnom, classe, toile et progression. Rien d’autre. Hébergement en Europe, suppression complète possible à tout moment."
      />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  boutons: { gap: espaces.m },
  champ: { gap: espaces.s },
  saisie: {
    minHeight: 56,
    backgroundColor: couleurs.blanc,
    borderColor: couleurs.bordure,
    borderWidth: 2,
    borderRadius: formes.tuile.rayon,
    paddingHorizontal: espaces.l,
  },
  code: { letterSpacing: 6, fontSize: 24 },
});
