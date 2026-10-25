// Configuration dynamique, au-dessus de app.json. Fixés seulement au moment de
// la construction (GitHub Actions), pour ne pas gêner le serveur de développement :
// - CAPY_BASE_URL : adresse du site sur GitHub Pages (« /capy-app ») ;
// - CAPY_VERSION_CODE : numéro de version Android, qui augmente à chaque APK
//   (une nouvelle APK s'installe alors par-dessus l'ancienne).
module.exports = ({ config }) => {
  const baseUrl = process.env.CAPY_BASE_URL;
  const versionCode = Number(process.env.CAPY_VERSION_CODE);
  return {
    ...config,
    ...(baseUrl ? { experiments: { ...config.experiments, baseUrl } } : {}),
    ...(versionCode > 0 ? { android: { ...config.android, versionCode } } : {}),
  };
};
