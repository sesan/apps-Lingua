import React from 'react';
import { useColorScheme, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { View, Text, Pressable, ScrollView } from '@/tw';
import { getLessonById, getUnitById, getLanguageById, getVocabularyForLanguage, getPhrasesForLanguage } from '@/data/lessons';
import { useLanguageStore } from '@/store/language-store';

export default function LessonDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const completedLessonIds = useLanguageStore((s) => s.completedLessonIds);
  const completeLesson = useLanguageStore((s) => s.completeLesson);

  const lesson = getLessonById(id ?? '');
  if (!lesson) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0D132B' : '#FFFFFF' }}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-lg font-poppins-semibold text-[#0D132B] dark:text-white mb-4">
            Lesson not found
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="px-6 py-3 bg-[#6C4EF5] rounded-xl"
          >
            <Text className="text-white font-poppins-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const unit = getUnitById(lesson.unitId);
  const language = unit ? getLanguageById(unit.languageId) : undefined;
  const isCompleted = completedLessonIds.includes(lesson.id);

  // Find names of expected vocabs and phrases for displays
  const allVocab = language ? getVocabularyForLanguage(language.id) : [];
  const allPhrases = language ? getPhrasesForLanguage(language.id) : [];

  const expectedVocabItems = allVocab.filter((v) =>
    lesson.aiTeacherPrompt.expectedVocabulary.includes(v.id)
  );
  const expectedPhraseItems = allPhrases.filter((p) =>
    lesson.aiTeacherPrompt.expectedPhrases.includes(p.id)
  );

  const handleStartOrComplete = () => {
    if (!isCompleted) {
      completeLesson(lesson.id, lesson.xpReward);
    }
    // Navigate back to the lessons tab
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/learn');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0D132B' : '#FFFFFF' }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Navigation Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-neutral-border dark:border-[#1E2540]">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="w-10 h-10 items-center justify-center rounded-full bg-neutral-surface dark:bg-[#1E2540] active:opacity-75"
        >
          <SymbolView
            tintColor={isDark ? '#FFFFFF' : '#0D132B'}
            name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
            size={20}
          />
        </Pressable>
        <Text className="text-lg font-poppins-bold text-[#0D132B] dark:text-white">
          Lesson {lesson.number}
        </Text>
        <View className="w-10" />
      </View>

      {/* Scrollable details */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-6 py-6"
      >
        {/* Unit Info Tag */}
        {unit && (
          <View
            className="self-start px-3 py-1.5 rounded-full mb-3"
            style={{ backgroundColor: (isDark ? '#1E2540' : '#E0D9FF') }}
          >
            <Text className="text-xs font-poppins-semibold text-[#6C4EF5] dark:text-[#A855F7]">
              {language?.name} • Unit {unit.number}
            </Text>
          </View>
        )}

        {/* Title */}
        <Text className="text-2xl font-poppins-bold text-[#0D132B] dark:text-white mb-2">
          {lesson.title}
        </Text>

        {/* Description */}
        <Text className="text-[15px] font-poppins text-neutral-text-secondary dark:text-[#9CA3AF] mb-6">
          {lesson.description}
        </Text>

        {/* XP Reward card */}
        <View className="flex-row items-center p-4 bg-neutral-surface dark:bg-[#161F3D] rounded-2xl mb-6 border border-neutral-border dark:border-[#1E2540]">
          <View className="w-10 h-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 mr-4">
            <SymbolView
              tintColor="#FF8A00"
              name={{ ios: 'bolt.fill', android: 'flash_on', web: 'flash_on' }}
              size={20}
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-poppins-semibold text-neutral-text-secondary dark:text-[#9CA3AF]">
              Reward on Completion
            </Text>
            <Text className="text-lg font-poppins-bold text-[#FF8A00]">
              +{lesson.xpReward} XP
            </Text>
          </View>
          {isCompleted && (
            <View className="px-3 py-1 bg-green-100 dark:bg-green-950 rounded-full">
              <Text className="text-xs font-poppins-bold text-green-600 dark:text-green-400">
                Completed
              </Text>
            </View>
          )}
        </View>

        {/* Objectives / Goals */}
        <Text className="text-[17px] font-poppins-bold text-[#0D132B] dark:text-white mb-3">
          What you'll learn
        </Text>
        <View className="gap-3 mb-6">
          {lesson.goals.map((goal, idx) => (
            <View key={idx} className="flex-row items-start gap-3">
              <View className="mt-0.5">
                <SymbolView
                  tintColor="#58CC02"
                  name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                  size={18}
                />
              </View>
              <Text className="flex-1 text-[15px] font-poppins text-neutral-text dark:text-neutral-text-secondary">
                {goal}
              </Text>
            </View>
          ))}
        </View>

        {/* Vocabulary Highlight (if any) */}
        {expectedVocabItems.length > 0 && (
          <>
            <Text className="text-[17px] font-poppins-bold text-[#0D132B] dark:text-white mb-3">
              Key Vocabulary
            </Text>
            <View className="gap-3 mb-6">
              {expectedVocabItems.map((vocab) => (
                <View key={vocab.id} className="p-4 bg-neutral-surface dark:bg-[#161F3D] rounded-2xl border border-neutral-border dark:border-[#1E2540]">
                  <View className="flex-row items-baseline gap-2 mb-1">
                    <Text className="text-lg font-poppins-bold text-[#6C4EF5] dark:text-[#A855F7]">
                      {vocab.word}
                    </Text>
                    <Text className="text-xs font-poppins-medium text-neutral-text-secondary dark:text-[#9CA3AF]">
                      {vocab.pronunciation}
                    </Text>
                  </View>
                  <Text className="text-sm font-poppins text-neutral-text dark:text-neutral-text-secondary">
                    {vocab.translation} • <Text className="italic text-xs">{vocab.partOfSpeech}</Text>
                  </Text>
                  <Text className="text-xs font-poppins text-neutral-text-secondary dark:text-[#9CA3AF] mt-2 border-t border-neutral-border dark:border-[#2E375B] pt-2">
                    Ex: "{vocab.example}" ({vocab.exampleTranslation})
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Phrases Highlight (if any) */}
        {expectedPhraseItems.length > 0 && (
          <>
            <Text className="text-[17px] font-poppins-bold text-[#0D132B] dark:text-white mb-3">
              Useful Phrases
            </Text>
            <View className="gap-3 mb-8">
              {expectedPhraseItems.map((phrase) => (
                <View key={phrase.id} className="p-4 bg-neutral-surface dark:bg-[#161F3D] rounded-2xl border border-neutral-border dark:border-[#1E2540]">
                  <Text className="text-base font-poppins-bold text-[#0D132B] dark:text-white mb-1">
                    {phrase.text}
                  </Text>
                  <Text className="text-sm font-poppins text-neutral-text-secondary dark:text-[#9CA3AF] mb-2">
                    {phrase.translation}
                  </Text>
                  {phrase.context && (
                    <Text className="text-xs font-poppins text-neutral-text-secondary dark:text-[#9CA3AF] italic">
                      Context: {phrase.context}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Action Button at bottom */}
      <View className="p-6 border-t border-neutral-border dark:border-[#1E2540]">
        <Pressable
          onPress={handleStartOrComplete}
          accessibilityRole="button"
          accessibilityLabel={isCompleted ? 'Review Lesson' : 'Complete Lesson'}
          className="w-full py-4 bg-[#6C4EF5] dark:bg-[#5B3BF6] rounded-2xl items-center justify-center shadow-lg shadow-[#6C4EF5]/20 active:opacity-90"
        >
          <Text className="text-white font-poppins-bold text-[17px]">
            {isCompleted ? 'Review Lesson' : 'Simulate Lesson Completion'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
