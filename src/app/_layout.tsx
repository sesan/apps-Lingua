import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider, Stack, useSegments, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@/utils/token-cache';
import { useLanguageStore } from '@/store/language-store';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  const activeLanguageId = useLanguageStore((state) => state.activeLanguageId);
  const isHydrated = useLanguageStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isLoaded || !isHydrated) return;

    const inAuthGroup = segments[0] === 'signin' || segments[0] === 'signup' || segments[0] === 'onboarding';

    if (!isSignedIn) {
      if (!inAuthGroup) {
        // Redirect to onboarding if not signed in
        router.replace('/onboarding');
      }
    } else {
      // User is signed in
      if (!activeLanguageId) {
        // Must select a language first
        if (segments[0] !== 'language-select') {
          router.replace('/language-select');
        }
      } else {
        // Already selected language
        if (inAuthGroup) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [isSignedIn, isLoaded, isHydrated, activeLanguageId, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="signup" />
        <Stack.Screen name="signin" />
        <Stack.Screen name="language-select" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RootLayoutNav />
    </ClerkProvider>
  );
}
