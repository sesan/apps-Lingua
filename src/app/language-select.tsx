import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ScrollView, View, Text, Pressable, TextInput } from '@/tw';
import { Image } from '@/tw/image';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useActiveLanguage } from '@/hooks/use-active-language';
import { languages } from '@/data/languages';

const LEARNER_COUNTS: Record<string, string> = {
  es: '28.4M learners',
  fr: '19.4M learners',
  ja: '12.7M learners',
  ko: '9.3M learners',
  de: '8.1M learners',
  zh: '7.4M learners',
};

export default function LanguageSelectScreen() {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeLanguageId, changeLanguage } = useActiveLanguage();

  const [selectedId, setSelectedId] = useState<string | null>(activeLanguageId);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync selectedId when activeLanguageId becomes available
  useEffect(() => {
    if (activeLanguageId && activeLanguageId !== selectedId) {
      setSelectedId(activeLanguageId);
    }
  }, [activeLanguageId]);

  // Handle confirmation
  const handleConfirm = async () => {
    if (selectedId) {
      await changeLanguage(selectedId);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    }
  };

  // Filter languages based on search query
  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View 
      className="flex-1 bg-white dark:bg-neutral-text"
      style={{
        paddingTop: Math.max(insets.top, 16),
      }}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-6 py-3">
        {activeLanguageId ? (
          <Pressable 
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the previous screen"
            className="w-10 h-10 items-center justify-center rounded-full bg-neutral-surface dark:bg-[#1E2540] active:opacity-75"
          >
            <SymbolView 
              tintColor={scheme === 'dark' ? '#FFFFFF' : '#0D132B'} 
              name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
              size={20}
            />
          </Pressable>
        ) : (
          <View className="w-10 h-10" />
        )}
        <Text className="text-lg font-poppins-semibold text-[#0D132B] dark:text-white">
          Choose a language
        </Text>
        {/* Spacer to balance the back button */}
        <View className="w-10" />
      </View>

      {/* Search Bar */}
      <View className="px-6 mt-4">
        <View className="flex-row items-center bg-neutral-surface dark:bg-[#1E2540] border border-neutral-border dark:border-[#2E375B] rounded-2xl px-4 py-3.5 gap-3">
          <SymbolView 
            tintColor="#4B5563" 
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={18}
          />
          <TextInput
            placeholder="Search languages"
            placeholderTextColor="#4B5563"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search languages"
            className="flex-1 text-base font-poppins text-[#0D132B] dark:text-white bg-transparent p-0 border-0 outline-none"
          />
          {searchQuery.length > 0 && (
            <Pressable 
              onPress={() => setSearchQuery('')} 
              accessibilityRole="button"
              accessibilityLabel="Clear search query"
              className="active:opacity-75"
            >
              <SymbolView 
                tintColor="#4B5563" 
                name={{ ios: 'xmark.circle.fill', android: 'close', web: 'close' }}
                size={16}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Scrollable Language List */}
      <ScrollView 
        className="flex-1 px-6 mt-6"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 140, // Ensure space for bottom button + image
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[17px] font-poppins-semibold text-[#4B5563] dark:text-[#9CA3AF] mb-4">
          Popular
        </Text>

        <View className="gap-3">
          {filteredLanguages.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-base font-poppins text-neutral-text-secondary dark:text-[#9CA3AF]">
                No languages match your search.
              </Text>
            </View>
          ) : (
            filteredLanguages.map((lang) => {
              const isSelected = selectedId === lang.id;
              const learnerCount = LEARNER_COUNTS[lang.id] || '5.0M learners';

              return (
                <Pressable
                  key={lang.id}
                  onPress={() => setSelectedId(lang.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`${lang.name}, ${learnerCount}`}
                  className={`flex-row items-center justify-between p-4 bg-white dark:bg-[#1E2540] border-2 rounded-2xl active:opacity-90 transition-colors ${
                    isSelected 
                      ? 'border-[#6C4EF5]' 
                      : 'border-neutral-border dark:border-[#2E375B]'
                  }`}
                >
                  <View className="flex-row items-center gap-4">
                    <Image 
                      source={lang.flag} 
                      className="w-[48px] h-[34px] rounded-lg border border-neutral-border dark:border-transparent"
                      contentFit="cover"
                      accessibilityLabel={`${lang.name} flag`}
                    />
                    <View>
                      <Text className="text-base font-poppins-semibold text-[#0D132B] dark:text-white">
                        {lang.name}
                      </Text>
                      <Text className="text-[13px] font-poppins text-[#4B5563] dark:text-[#9CA3AF]">
                        {learnerCount}
                      </Text>
                    </View>
                  </View>

                  <View className="w-6 h-6 items-center justify-center">
                    {isSelected ? (
                      <View className="w-6 h-6 rounded-full bg-[#6C4EF5] items-center justify-center">
                        <SymbolView 
                          tintColor="#FFFFFF" 
                          name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                          size={12}
                        />
                      </View>
                    ) : (
                      <SymbolView 
                        tintColor={scheme === 'dark' ? '#9CA3AF' : '#4B5563'} 
                        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                        size={16}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Bottom Visual & Action Panel */}
      <View className="absolute bottom-0 left-0 right-0 items-center justify-end pointer-events-none overflow-hidden h-[240px]" accessible={false} importantForAccessibility="no-hide-descendants">
        {/* Earth Image */}
        <Image 
          source={require('@/assets/images/earth.png')}
          className="w-full max-w-[440px] aspect-square"
          contentFit="contain"
          accessible={false}
          style={{
            transform: [{ translateY: 95 }]
          }}
        />
      </View>

      {/* Confirmation Button overlay */}
      <View 
        className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto"
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        <Pressable 
          onPress={handleConfirm}
          disabled={!selectedId}
          accessibilityRole="button"
          accessibilityLabel="Confirm Selection"
          accessibilityState={{ disabled: !selectedId }}
          className={`w-full py-4 px-6 rounded-2xl flex-row items-center justify-center active:opacity-95 shadow-lg transition-all ${
            selectedId 
              ? 'bg-[#6C4EF5] dark:bg-[#5B3BF6] shadow-[#6C4EF5]/20 dark:shadow-none' 
              : 'bg-neutral-border dark:bg-[#2E375B] opacity-50 shadow-none'
          }`}
        >
          <Text className="text-white font-poppins-semibold text-[17px]">
            Confirm Selection
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
