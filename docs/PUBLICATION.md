# Publier Capy (site installable et APK)

Comme PM gare : tout passe par GitHub, rien à installer sur le PC.

| Quoi | Où |
|---|---|
| Code source (privé) | https://github.com/myrmicode/capy |
| Appli en ligne | https://myrmicode.github.io/capy-app/ |
| Installer l'APK | https://myrmicode.github.io/capy-app/telecharger.html |
| Construction en cours | onglet **Actions** du dépôt `capy` |

## Comment ça marche

Chaque envoi sur la branche `main` de `myrmicode/capy` lance le workflow
`.github/workflows/publier.yml` (environ 15 minutes) :

1. typage, lint et tests : si l'un échoue, rien n'est publié ;
2. construction de l'APK Android (`npx expo prebuild`, puis Gradle) ;
3. construction du site (`npx expo export -p web`, puis `scripts/preparer-web.mjs`
   qui ajoute le manifeste, les icônes, le service worker et la page de téléchargement) ;
4. envoi du site et de l'APK sur le dépôt public `myrmicode/capy-app`, servi par GitHub Pages.

Le dépôt public ne contient que le résultat de la construction, jamais le code.
On peut aussi relancer une publication à la main : Actions > Publier > Run workflow.

## Mises à jour sur la tablette

- **Site installé** : il se met à jour tout seul à l'ouverture suivante.
- **APK** : retélécharger depuis la page « Installer Capy » et installer par-dessus.
  Le numéro de version augmente à chaque construction et la clé de signature ne
  change pas : les profils et les progrès sont gardés.

## Les clés (à ne pas perdre)

Rangées hors du projet, dans `C:\Users\hp\capy-cles\` :

- `capy-android.keystore` : clé de signature de l'APK (copie dans le secret
  `ANDROID_KEYSTORE_BASE64`). Perdue, il faudrait désinstaller Capy de la tablette
  (et perdre ses profils) avant d'installer une nouvelle version. Elle suffit pour
  les essais ; pour le Play Store, on passera à une vraie clé de publication.
- `capy-app-deploy` : clé qui autorise le workflow à écrire dans `capy-app`
  (secret `CAPY_APP_DEPLOY_KEY`, clé de déploiement du dépôt `capy-app`).

## Compte parent et lecture des fiches

Facultatif : pour que l'APK et le site publiés utilisent Supabase, ajouter dans
Settings > Secrets and variables > Actions du dépôt `capy` les secrets
`EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (valeurs
publiques, voir `.env.example`). Sans eux, ces deux fonctions sont simplement désactivées.
