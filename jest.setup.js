// Stockage local simulé en mémoire pour les tests.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Gestes simulés pour les mini-jeux.
require('react-native-gesture-handler/jestSetup');
// Branchement de gesture-handler sur le fil d'interface : sans objet dans Jest,
// où Worklets tourne dans sa version web.
jest.mock('react-native-worklets', () => ({
  ...jest.requireActual('react-native-worklets'),
  getUIRuntimeHolder: () => ({}),
}));
