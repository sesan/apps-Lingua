import React, { useState } from 'react';
import { useColorScheme, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { View, Text, Pressable, ScrollView, TextInput } from '@/tw';
import { Image } from '@/tw/image';
import { GoogleIcon, FacebookIcon, AppleIcon } from '@/components/social-icons';
import { OTPVerificationModal } from '@/components/ui/otp-verification-modal';
import { useSignIn, useSSO } from '@clerk/expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

const isValidEmail = (emailStr: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailStr);
};

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const router = useRouter();

  const { signIn, errors, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();
  const posthog = usePostHog();

  // Form states
  const [email, setEmail] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Verification modal states
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/onboarding');
    }
  };

  const handleSignIn = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    posthog.capture('sign_in_started', { method: 'email' });

    try {
      const { error } = await signIn.emailCode.sendCode({
        emailAddress: email,
      });

      if (error) {
        console.error('Sign in error', JSON.stringify(error, null, 2));
        if (errors.fields.identifier) {
          setEmailError(errors.fields.identifier.longMessage || errors.fields.identifier.message);
        } else {
          setEmailError(error.longMessage || error.message);
        }
        return;
      }

      setCode('');
      setShowModal(true);
    } catch (err: any) {
      console.error('Sign in catch error', err);
      posthog.captureException(err instanceof Error ? err : new Error(err?.message || 'Sign in failed'));
      setEmailError(err.message || 'Failed to sign in. Please try again.');
    }
  };

  const handleCodeChange = async (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setCode(cleaned);

    if (cleaned.length === 6) {
      try {
        const { error } = await signIn.emailCode.verifyCode({
          code: cleaned,
        });

        if (error) {
          console.error('Verification error', JSON.stringify(error, null, 2));
          Alert.alert('Verification Failed', error.longMessage || error.message);
          return;
        }

        if (signIn.status === 'complete') {
          const { error: finalizeError } = await signIn.finalize();
          if (finalizeError) {
            Alert.alert('Activation Failed', finalizeError.longMessage || finalizeError.message);
            return;
          }
          posthog.capture('sign_in_completed', { method: 'email' });
          posthog.identify(email, {
            $set: { email },
          });
          setShowModal(false);
          router.replace('/');
        } else {
          console.warn('Sign-in not complete:', signIn);
          Alert.alert('Sign-in Incomplete', 'Additional factors are required.');
        }
      } catch (err: any) {
        console.error('Verification catch error', err);
        posthog.captureException(err instanceof Error ? err : new Error(err?.message || 'Verification failed'));
        Alert.alert('Verification Failed', err.message || 'An unexpected error occurred.');
      }
    }
  };

  const handleResendCode = async () => {
    const { error } = await signIn.emailCode.sendCode({
      emailAddress: email,
    });
    if (error) {
      throw error;
    }
  };

  const handleOAuth = async (strategy: 'oauth_google' | 'oauth_facebook' | 'oauth_apple') => {
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startSSOFlow({
        strategy,
        redirectUrl: Linking.createURL('/oauth-callback', { scheme: 'reactaiapp' }),
      });

      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        posthog.capture('sign_in_oauth_completed', { provider: strategy });
        router.replace('/');
      }
    } catch (err: any) {
      console.error('OAuth error', JSON.stringify(err, null, 2));
      posthog.captureException(err instanceof Error ? err : new Error(err?.message || 'OAuth failed'));
      const errMsg = err.errors?.[0]?.longMessage || err.message || 'OAuth flow failed.';
      Alert.alert('Authentication Failed', errMsg);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-neutral-text"
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerClassName="flex-grow px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        {/* Navigation Header */}
        <View className="flex-row items-center justify-start py-2">
          <Pressable 
            onPress={handleBack} 
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the onboarding screen"
            className="w-10 h-10 items-center justify-center rounded-full bg-neutral-surface dark:bg-neutral-800 active:scale-95 transition-transform"
          >
            <SymbolView 
              tintColor={scheme === 'dark' ? '#FFFFFF' : '#0D132B'} 
              name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
              size={24}
            />
          </Pressable>
        </View>

        {/* Header Text */}
        <View className="mt-4">
          <Text className="text-[32px] font-poppins-bold text-[#0D132B] dark:text-white leading-[38.4px]">
            Welcome back
          </Text>
          <Text className="text-[15px] font-poppins text-[#6B7280] dark:text-[#9CA3AF] mt-1 leading-[22px]">
            Continue your language journey today ✨
          </Text>
        </View>

        {/* Mascot Center Illustration */}
        <View className="items-center justify-center my-4" accessible={false} importantForAccessibility="no-hide-descendants">
          <Image 
            source={require('@/assets/images/mascot-auth.png')} 
            className="w-[180px] h-[180px]"
            contentFit="contain"
            accessible={false}
          />
        </View>

        {/* Form Inputs */}
        <View className="w-full gap-y-1">
          {/* Email Box */}
          <View 
            className={`w-full bg-[#F6F7FB] dark:bg-neutral-800 border ${isEmailFocused ? 'border-[#6C4EF5] dark:border-[#8E75FF] bg-white' : 'border-[#E5E7EB] dark:border-neutral-700'} rounded-2xl px-4 py-3`}
          >
            <Text className="text-[11px] font-poppins-medium text-[#6B7280] dark:text-[#9CA3AF] mb-0.5">
              Email
            </Text>
            <TextInput
              className="text-base font-poppins text-[#0D132B] dark:text-white p-0 m-0 w-full"
              placeholder="alex@gmail.com"
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              accessibilityLabel="Email input"
              accessibilityHint="Enter your email address to sign in"
            />
          </View>
          {emailError ? (
            <Text 
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              className="text-xs font-poppins text-red-500 mt-1 pl-2"
            >
              {emailError}
            </Text>
          ) : null}
        </View>

        {/* Sign In Button */}
        <View className="w-full mt-6">
          <Pressable 
            accessibilityRole="button"
            accessibilityLabel="Sign In"
            className="w-full bg-[#6C4EF5] dark:bg-[#5B3BF6] py-4 px-6 rounded-2xl flex-row items-center justify-center active:scale-[0.99] active:opacity-95 shadow-md shadow-[#6C4EF5]/20"
            onPress={handleSignIn}
          >
            <Text className="text-white font-poppins-semibold text-[17px]">
              Sign In
            </Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View className="flex-row items-center justify-center my-6">
          <View className="flex-1 h-[1px] bg-[#E5E7EB] dark:bg-neutral-700" />
          <Text className="text-[13px] font-poppins text-[#6B7280] dark:text-[#9CA3AF] mx-4">
            or continue with
          </Text>
          <View className="flex-1 h-[1px] bg-[#E5E7EB] dark:bg-neutral-700" />
        </View>

        {/* Social Buttons */}
        <View className="w-full gap-y-3">
          {/* Google */}
          <Pressable 
            onPress={() => handleOAuth('oauth_google')}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
            className="w-full flex-row items-center justify-center bg-white dark:bg-neutral-800 border border-[#E5E7EB] dark:border-neutral-700 py-3.5 rounded-2xl active:scale-[0.99] active:bg-neutral-50 dark:active:bg-neutral-700/50"
          >
            <View className="absolute left-6">
              <GoogleIcon />
            </View>
            <Text className="text-[15px] font-poppins-medium text-[#0D132B] dark:text-white">
              Continue with Google
            </Text>
          </Pressable>

          {/* Facebook */}
          <Pressable 
            onPress={() => handleOAuth('oauth_facebook')}
            accessibilityRole="button"
            accessibilityLabel="Continue with Facebook"
            className="w-full flex-row items-center justify-center bg-white dark:bg-neutral-800 border border-[#E5E7EB] dark:border-neutral-700 py-3.5 rounded-2xl active:scale-[0.99] active:bg-neutral-50 dark:active:bg-neutral-700/50"
          >
            <View className="absolute left-6">
              <FacebookIcon />
            </View>
            <Text className="text-[15px] font-poppins-medium text-[#0D132B] dark:text-white">
              Continue with Facebook
            </Text>
          </Pressable>

          {/* Apple */}
          <Pressable 
            onPress={() => handleOAuth('oauth_apple')}
            accessibilityRole="button"
            accessibilityLabel="Continue with Apple"
            className="w-full flex-row items-center justify-center bg-white dark:bg-neutral-800 border border-[#E5E7EB] dark:border-neutral-700 py-3.5 rounded-2xl active:scale-[0.99] active:bg-neutral-50 dark:active:bg-neutral-700/50"
          >
            <View className="absolute left-6">
              <AppleIcon color={scheme === 'dark' ? '#FFFFFF' : '#0D132B'} />
            </View>
            <Text className="text-[15px] font-poppins-medium text-[#0D132B] dark:text-white">
              Continue with Apple
            </Text>
          </Pressable>
        </View>

        {/* Footer Link */}
        <View className="flex-row justify-center items-center mt-8 mb-6">
          <Text className="text-sm font-poppins text-[#4B5563] dark:text-[#9CA3AF]">
            Don't have an account?{' '}
          </Text>
          <Pressable 
            onPress={() => router.push('/signup')} 
            accessibilityRole="link"
            accessibilityLabel="Sign up"
            className="active:opacity-70"
          >
            <Text className="text-sm font-poppins-semibold text-[#6C4EF5] dark:text-[#8E75FF]">
              Sign up
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Verification Modal */}
      <OTPVerificationModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        code={code}
        onCodeChange={handleCodeChange}
        mode="signin"
        onResendCode={handleResendCode}
      />
    </KeyboardAvoidingView>
  );
}
