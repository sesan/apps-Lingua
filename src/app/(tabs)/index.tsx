import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, useColorScheme, View } from 'react-native';

export default function Index() {
  const scheme = useColorScheme();

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-neutral-text px-6">
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      {/* Premium Mascot Logo Icon alongside Title */}
      <View className="flex-row items-center justify-center gap-3 mb-6">
        <Image 
          source={require('@/assets/images/moscot-logo.png')} 
          style={{ width: 48, height: 48 }} 
          contentFit="contain"
        />
        <Text className="text-[36px] font-poppins-bold text-[#0D132B] dark:text-white leading-[44px]">
          Lingua
        </Text>
      </View>

      {/* Tagline */}
      <Text className="text-[15px] font-poppins text-center text-[#6B7280] dark:text-[#9CA3AF] leading-[22px] max-w-[280px] mb-8">
        Your ultimate AI-powered companion for immersive language learning.
      </Text>

      {/* Call to Action Navigation Link */}
      <Link href="/onboarding" asChild>
        <Pressable className="bg-[#6C4EF5] dark:bg-[#5B3BF6] px-8 py-4 rounded-2xl active:opacity-90 shadow-md">
          <Text className="text-white font-poppins-semibold text-base">
            Get Started
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}