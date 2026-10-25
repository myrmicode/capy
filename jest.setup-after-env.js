require('react-native-reanimated').setUpTests();

// L'ambiance du soir dépend de l'heure : coupée dans les tests, pour que les
// couleurs ne changent pas selon le moment où on les lance.
beforeEach(() => {
  require('./src/store/reglages').useReglages.setState({ ambianceSoir: false });
});
