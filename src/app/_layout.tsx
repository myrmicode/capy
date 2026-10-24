import { Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import { Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useHydratation } from '@/store/useHydratation';
import { couleurs } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RacineLayout() {
  const [policesChargees, erreurPolices] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Caveat_600SemiBold,
  });
  const donneesPretes = useHydratation();
  const pret = (policesChargees || erreurPolices !== null) && donneesPretes;

  useEffect(() => {
    if (pret) SplashScreen.hideAsync();
  }, [pret]);

  if (!pret) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: couleurs.fondPage },
            animation: 'slide_from_right',
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
