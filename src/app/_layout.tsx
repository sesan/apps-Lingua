import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider, Stack, useSegments, useRouter, usePathname, useGlobalSearchParams } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { tokenCache } from '@/utils/token-cache';
import { useLanguageStore } from '@/store/language-store';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '@/lib/posthog';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  const activeLanguageId = useLanguageStore((state) => state.activeLanguageId);
  const isHydrated = useLanguageStore((state) => state.isHydrated);

  // Screen tracking for Expo Router
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      // Whitelist of safe parameter keys to prevent leaking sensitive data
      const safeParamKeys = ['tab', 'lesson_id', 'language_id', 'section'];
      const safeParams = Object.keys(params).reduce((acc, key) => {
        if (safeParamKeys.includes(key)) {
          acc[key] = params[key];
        }
        return acc;
      }, {} as Record<string, any>);

      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...safeParams,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  // Identify user when Clerk session is loaded (covers OAuth + session restore)
  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      const email = user?.primaryEmailAddress?.emailAddress;
      posthog.identify(userId, email ? { $set: { email } } : undefined);
    }
  }, [isLoaded, isSignedIn, userId]);

  // Reset PostHog on sign-out
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      posthog.reset();
    }
  }, [isLoaded, isSignedIn]);

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
      <PostHogProvider
        client={posthog}
        autocapture={{
          captureScreens: false,
          captureTouches: true,
          propsToCapture: ['testID'],
        }}
      >
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="signup" />
          <Stack.Screen name="signin" />
          <Stack.Screen name="language-select" />
          <Stack.Screen name="lesson/[id]" />
        </Stack>
      </PostHogProvider>
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
