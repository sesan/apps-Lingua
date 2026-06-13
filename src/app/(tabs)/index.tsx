import { Image } from '@/tw/image';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable } from '@/tw';
import { useColorScheme } from 'react-native';
import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useActiveLanguage } from '@/hooks/use-active-language';
import { useLanguageStore } from '@/store/language-store';

export default function Index() {
  const scheme = useColorScheme();
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { activeLanguage } = useActiveLanguage();
  const setActiveLanguageId = useLanguageStore((state) => state.setActiveLanguageId);

  const handleClearLanguage = async () => {
    try {
      setActiveLanguageId(null);
      if (user) {
        await user.updateMetadata({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            selectedLanguageId: null,
          },
        });
      }
    } catch (error) {
      console.error('Error clearing language state:', error);
    }
  };

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

      {/* Active Language Card */}
      <View className="w-full max-w-[320px] bg-neutral-surface dark:bg-[#1E2540] p-4 rounded-2xl border border-neutral-border dark:border-[#2E375B] flex-row items-center justify-between mb-8 shadow-sm">
        <View className="flex-row items-center gap-3">
          <Image 
            source={activeLanguage.flag} 
            className="w-10 h-7 rounded-md"
            contentFit="cover"
          />
          <View>
            <Text className="text-[11px] font-poppins text-neutral-text-secondary dark:text-[#9CA3AF] uppercase tracking-wider">
              Learning
            </Text>
            <Text className="text-base font-poppins-semibold text-[#0D132B] dark:text-white">
              {activeLanguage.name}
            </Text>
          </View>
        </View>
        <Pressable 
          onPress={() => router.push('/language-select')}
          className="bg-[#6C4EF5]/10 dark:bg-[#6C4EF5]/20 px-4 py-2 rounded-xl active:opacity-80"
        >
          <Text className="text-[#6C4EF5] dark:text-[#8E75FF] font-poppins-semibold text-xs">
            Change
          </Text>
        </Pressable>
      </View>

      {/* Sign Out Button */}
      <Pressable 
        onPress={() => signOut()} 
        className="bg-[#6C4EF5] dark:bg-[#5B3BF6] px-8 py-4 rounded-2xl active:opacity-90 shadow-md"
      >
        <Text className="text-white font-poppins-semibold text-base">
          Sign Out
        </Text>
      </Pressable>

      {/* Clear Language State (Test) */}
      <Pressable 
        onPress={handleClearLanguage} 
        className="mt-4 px-6 py-3 bg-neutral-surface dark:bg-[#1E2540] border border-neutral-border dark:border-[#2E375B] rounded-xl active:opacity-80"
      >
        <Text className="text-neutral-text-secondary dark:text-[#9CA3AF] font-poppins-semibold text-[13px]">
          Clear Language State (Test)
        </Text>
      </Pressable>
    </View>
  );
}