import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-router';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ensureNotificationPermission } from '@/lib/notifications';
import { Platform } from 'react-native';
import { AuthProvider } from '@/lib/auth';

(SplashScreen as any).preventAutoHideAsync?.();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      (SplashScreen as any).hideAsync?.();
      setReady(true);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      void ensureNotificationPermission();
    }
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </AuthProvider>
  );
}
