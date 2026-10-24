# Mettre en place l'analyse de la photo (Supabase + Claude)

Compter une vingtaine de minutes. Vous n'avez à me transmettre aucun mot de passe ni aucune clé.

## 1. Créer le projet Supabase (région UE)

1. Créez un compte sur https://supabase.com (offre gratuite).
2. **New project** :
   - Nom : `capy`
   - **Region : Europe** (Frankfurt `eu-central-1` ou Paris `eu-west-3`) — important pour le RGPD.
   - Notez le mot de passe de la base dans votre gestionnaire de mots de passe (je n'en ai pas besoin).
3. Dans **Project Settings > General**, notez la **Reference ID** (une suite de lettres, par exemple `abcdwxyz...`).

## 2. Créer la clé API Claude

1. Sur https://console.anthropic.com, créez une clé dans **API Keys** (nom : `capy-supabase`).
2. Dans **Billing**, ajoutez quelques euros de crédit et, si vous le souhaitez, une limite de dépense mensuelle.
3. Gardez la clé sous la main pour l'étape 3 : elle ne sera collée **que** dans Supabase.

## 3. Déployer la fonction

Dans PowerShell, dans le dossier `Capy` :

```
npx supabase login
npx supabase link --project-ref VOTRE_REFERENCE_ID
npx supabase secrets set ANTHROPIC_API_KEY=VOTRE_CLE_CLAUDE
npx supabase functions deploy analyser-toile --use-api
```

Facultatif, pour changer de modèle sans republier l'appli :

```
npx supabase secrets set CLAUDE_MODELE=claude-sonnet-5-5
```

## 4. Brancher l'appli

1. Copiez le fichier `.env.example` en `.env` (même dossier).
2. Remplissez :
   - `EXPO_PUBLIC_SUPABASE_URL` : **Project Settings > Data API > Project URL**
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` : **Project Settings > API Keys > Publishable key**
3. Relancez `npx expo start` (le fichier `.env` n'est lu qu'au démarrage).

Sans fichier `.env`, l'appli fonctionne quand même : le bouton photo bascule simplement sur la saisie à la main.

## Ce qui transite, et ce qui est conservé

- Le téléphone recadre la photo sur la toile et efface la photo et le recadrage.
- Seule l'image recadrée (environ 1024 px, en mémoire) est envoyée à la fonction, avec la liste des domaines.
- La fonction la transmet à l'API Claude pour lecture, renvoie les niveaux, et ne l'enregistre nulle part (ni base, ni stockage, ni journal).
- Anthropic intervient comme sous-traitant pour cette lecture : à mentionner dans la politique de confidentialité de l'appli.

---

# Compte parent facultatif (phase 7)

À faire une fois l'analyse de la photo en place (mêmes projet et dossier).

## 5. Créer la table et la fonction de suppression

Dans PowerShell, dans le dossier `Capy` :

```
npx supabase db push
npx supabase functions deploy supprimer-compte --use-api
```

`db push` crée la table `profils_enfants` avec la Row Level Security : chaque parent ne voit que ses propres profils.

## 6. Recevoir un code par e-mail (pas de mot de passe)

Dans Supabase, **Authentication > Emails > Templates > Magic link** (ou « Magic Link / OTP ») :
remplacez le contenu par un message qui affiche le code, par exemple :

```
<h2>Votre code Capy</h2>
<p>Voici votre code de connexion : <strong>{{ .Token }}</strong></p>
<p>Il est valable quelques minutes. Si vous n'avez rien demandé, ignorez ce message.</p>
```

Le sujet peut être : `Votre code Capy`.

Bon à savoir : le service d'e-mail intégré de Supabase n'envoie que quelques messages par heure. C'est suffisant
pour tester ; avant la publication, il faudra brancher un service d'envoi (SMTP) dans
**Authentication > Emails > SMTP Settings**.

## Ce qui est enregistré avec un compte

- Le parent : son adresse e-mail (gérée par Supabase Auth).
- Pour chaque enfant : prénom ou surnom, classe, toile (niveaux), progression, date de modification.
- « Supprimer le profil » efface aussi le profil du serveur ; « Supprimer le compte » efface le compte et tous
  les profils du serveur (les profils restent sur l'appareil).

---

# Limite d'appels à l'analyse (phase 8)

```
npx supabase db push
npx supabase functions deploy analyser-toile --use-api
```

Par défaut : 10 analyses par appareil et par jour, 300 par jour pour tout le projet. Pour changer :

```
npx supabase secrets set QUOTA_APPAREIL_JOUR=10 QUOTA_GLOBAL_JOUR=300
```

L'appli envoie un identifiant d'installation tiré au hasard (sans lien avec l'enfant, le parent ou le téléphone).
Les compteurs de plus de 7 jours sont effacés automatiquement.

---

# Deux toiles : français et mathématiques

La fonction d'analyse sait maintenant lire les deux fiches (niveaux + / ++ / +++). Redéployez-la :

```
npx supabase functions deploy analyser-toile --use-api
```

---

# Réglages de lecture et de jeu (accessibilité)

```
npx supabase db push
```

Ajoute la colonne `reglages` à `profils_enfants` : police, taille du texte, toucher au lieu de glisser… Aucune donnée de santé : seulement les réglages eux-mêmes, relus champ par champ par l'appli. Sans cette commande, l'appli fonctionne, mais la synchronisation échoue tant que la colonne n'existe pas.
