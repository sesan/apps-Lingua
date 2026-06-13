import React from 'react';
import { View, Text, Pressable, useColorScheme, Platform, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const scheme = useColorScheme();
  const router = useRouter();

  const handleGetStarted = () => {
    // Navigate back to the home route or close modal
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View 
      className="flex-1 px-6 bg-white dark:bg-neutral-text"
      style={{
        paddingTop: Math.max(insets.top, Spacing.four),
        paddingBottom: Math.max(insets.bottom, Spacing.four),
      }}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      {/* Header Logo */}
      <View className="flex-row items-center justify-center mt-2 gap-2">
        <Image 
          source={require('@/assets/images/moscot-logo.png')} 
          style={{ width: 32, height: 32 }}
          contentFit="contain"
        />
        <Text className="text-[26px] font-poppins-bold text-[#0D132B] dark:text-white leading-[32px]">
          lingua
        </Text>
      </View>

      {/* Headline Text */}
      <Text className="text-[34px] font-poppins-bold text-center leading-[42px] mt-8 text-[#0D132B] dark:text-white">
        Your AI language{'\n'}
        <Text className="text-[#6C4EF5] dark:text-[#8E75FF]">teacher</Text>.
      </Text>

      {/* Subtitle Text */}
      <Text className="text-[15px] font-poppins text-[#6B7280] dark:text-[#9CA3AF] text-center leading-[23px] mt-3 px-2">
        Real conversations, personalized{'\n'}lessons, anytime, anywhere.
      </Text>

      {/* Center Illustration Area */}
      <View className="flex-1 items-center justify-center my-6 relative w-full max-w-[380px] self-center">
        {/* Mascot Image */}
        <Image 
          source={require('@/assets/images/mascot-welcome.png')} 
          style={{ width: 270, height: 270, zIndex: 10 }}
          contentFit="contain"
        />

        {/* Floating Speech Bubbles */}
        {/* Bubble 1 (Left): "Hello!" */}
        <View 
          className="absolute left-[-15px] top-[24%] bg-[#E8F2FF] px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm z-20"
          style={styles.bubbleShadow}
        >
          <Text className="text-[15px] font-poppins-medium text-[#0D132B]">
            Hello!
          </Text>
        </View>

        {/* Bubble 2 (Top Right): "¡Hola!" */}
        <View 
          className="absolute right-[-10px] top-[14%] bg-[#F0EEFF] px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm z-20"
          style={styles.bubbleShadow}
        >
          <Text className="text-[15px] font-poppins-medium text-[#6C4EF5]">
            ¡Hola!
          </Text>
        </View>

        {/* Bubble 3 (Bottom Right): "你好!" */}
        <View 
          className="absolute right-[-8px] top-[54%] bg-[#FFEFEF] px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm z-20"
          style={styles.bubbleShadow}
        >
          <Text className="text-[15px] font-poppins-medium text-[#FF4D4F]">
            你好!
          </Text>
        </View>
      </View>

      {/* CTA Button */}
      <View className="w-full mt-auto">
        <Pressable 
          className="w-full bg-[#6C4EF5] dark:bg-[#5B3BF6] py-4 px-6 rounded-2xl flex-row items-center justify-center relative active:opacity-90"
          style={styles.buttonShadow}
          onPress={handleGetStarted}
        >
          <Text className="text-white font-poppins-semibold text-[17px]">
            Get Started
          </Text>
          <View className="absolute right-6">
            <SymbolView 
              tintColor="#FFFFFF" 
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={18}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  buttonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#6C4EF5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(108, 78, 245, 0.25)',
      },
    }),
  },
});
