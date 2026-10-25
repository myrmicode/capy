// Prépare le dossier dist/ (après `expo export -p web`) pour GitHub Pages, comme
// PM gare : site installable (manifeste, icônes), jouable hors ligne (service
// worker), mise à jour dès qu'une nouvelle version est publiée, et page de
// téléchargement de l'APK.
//
// Usage : CAPY_BASE_URL=/capy-app node scripts/preparer-web.mjs [version]
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const base = (process.env.CAPY_BASE_URL ?? '').replace(/\/$/, '');
const version = process.argv[2] ?? new Date().toISOString();
const racine = `${base}/`;

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('dist/index.html introuvable : lancez d’abord « npx expo export -p web ».');
  process.exit(1);
}

// Icônes et page de téléchargement.
for (const f of fs.readdirSync('assets/web')) fs.copyFileSync(path.join('assets/web', f), path.join(DIST, f));

const manifeste = {
  name: 'Capy',
  short_name: 'Capy',
  description: 'Capy aide les enfants du CP au CM2 à progresser à partir des évaluations Repères.',
  lang: 'fr',
  start_url: racine,
  scope: racine,
  display: 'standalone',
  orientation: 'any',
  background_color: '#faf9f5',
  theme_color: '#1f7a6d',
  icons: [
    { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icone-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
fs.writeFileSync(path.join(DIST, 'manifest.webmanifest'), JSON.stringify(manifeste, null, 2));

// Service worker : la page passe toujours d'abord par le réseau (on reçoit la
// dernière version), les fichiers construits (noms uniques) viennent du cache.
const sw = `// Généré par scripts/preparer-web.mjs — version ${version}
const CACHE = 'capy-${version}';
const RACINE = '${racine}';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([RACINE])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // L'APK n'est jamais mise en cache (trop lourde).
  if (req.url.endsWith('.apk')) return;
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((rep) => {
          const copie = rep.clone();
          caches.open(CACHE).then((c) => c.put(RACINE, copie));
          return rep;
        })
        .catch(() => caches.match(RACINE)),
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(
      (trouve) =>
        trouve ||
        fetch(req).then((rep) => {
          if (rep.ok) {
            const copie = rep.clone();
            caches.open(CACHE).then((c) => c.put(req, copie));
          }
          return rep;
        }),
    ),
  );
});
`;
fs.writeFileSync(path.join(DIST, 'sw.js'), sw);

// Balises du manifeste et enregistrement du service worker. Quand une nouvelle
// version prend la main, la page se recharge une fois, toute seule.
const tete = `
    <link rel="manifest" href="${racine}manifest.webmanifest" />
    <meta name="theme-color" content="#1f7a6d" />
    <link rel="apple-touch-icon" href="${racine}icone-192.png" />
    <script>
      if ('serviceWorker' in navigator) {
        var dejaRecharge = false;
        navigator.serviceWorker.addEventListener('controllerchange', function () {
          if (dejaRecharge) return;
          dejaRecharge = true;
          location.reload();
        });
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('${racine}sw.js', { scope: '${racine}' }).then(function (r) {
            document.addEventListener('visibilitychange', function () {
              if (document.visibilityState === 'visible') r.update();
            });
          });
        });
      }
    </script>
  </head>`;
const index = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8').replace('</head>', tete);
fs.writeFileSync(path.join(DIST, 'index.html'), index);
// GitHub Pages renvoie 404.html pour toute adresse inconnue : l'appli s'ouvre
// quand même sur la bonne page (application à page unique).
fs.writeFileSync(path.join(DIST, '404.html'), index);
// Sans ce fichier, GitHub Pages ignore les dossiers qui commencent par « _ ».
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

console.log(`dist/ prêt pour ${racine} (version ${version})`);
