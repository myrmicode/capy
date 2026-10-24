import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { IconeChemin, IconeParents, IconeToile } from '@/composants';
import { useProfilActif } from '@/store/profils';
import { couleurs, polices } from '@/theme';

/** Espace de l'enfant : barre de navigation Parcours, Ma toile, Parents. */
export default function LayoutEnfant() {
  const profil = useProfilActif();
  if (!profil) return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: couleurs.sarcelle[700],
        tabBarInactiveTintColor: couleurs.encreDouce,
        tabBarLabelStyle: { fontFamily: polices.nunitoGras, fontSize: 13 },
        tabBarStyle: {
          backgroundColor: couleurs.blanc,
          borderTopColor: couleurs.bordure,
          borderTopWidth: 2,
          height: 72,
          paddingTop: 6,
        },
        sceneStyle: { backgroundColor: couleurs.fondPage },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Parcours', tabBarIcon: ({ color }) => <IconeChemin taille={28} couleur={String(color)} /> }}
      />
      <Tabs.Screen
        name="toile"
        options={{ title: 'Ma toile', tabBarIcon: ({ color }) => <IconeToile taille={28} couleur={String(color)} /> }}
      />
      <Tabs.Screen
        name="parents"
        options={{ title: 'Parents', tabBarIcon: ({ color }) => <IconeParents taille={28} couleur={String(color)} /> }}
      />
    </Tabs>
  );
}
