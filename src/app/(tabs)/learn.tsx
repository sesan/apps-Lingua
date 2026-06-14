import React, { useState } from 'react';
import { useColorScheme, Platform, View as RNView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { View, Text, Pressable, ScrollView } from '@/tw';
import { Image } from '@/tw/image';
import { useActiveLanguage } from '@/hooks/use-active-language';
import { useLanguageStore } from '@/store/language-store';
import { getUnitsForLanguage, getLessonsForUnit } from '@/data/lessons';
import { images } from '@/constants/images';

export default function LearnScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();

  const { activeLanguage, activeLanguageId } = useActiveLanguage();
  const completedLessonIds = useLanguageStore((s) => s.completedLessonIds);

  const [currentTab, setCurrentTab] = useState<'lessons' | 'practice'>('lessons');

  // If no language is selected, direct the user to select one
  if (!activeLanguageId) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white dark:bg-neutral-text">
        <Text className="text-lg font-poppins-semibold text-[#0D132B] dark:text-white mb-4">
          Please select a language to start learning
        </Text>
        <Pressable
          onPress={() => router.push('/language-select')}
          className="px-6 py-3 bg-[#6C4EF5] rounded-xl"
        >
          <Text className="text-white font-poppins-semibold">Select Language</Text>
        </Pressable>
      </View>
    );
  }

  // Retrieve units and lessons
  const units = getUnitsForLanguage(activeLanguageId);
  const activeUnit = units[0] ?? null;
  const lessons = activeUnit ? getLessonsForUnit(activeUnit.id) : [];

  // Calculate user progress in this unit
  const unitCompletedCount = lessons.filter((l) => completedLessonIds.includes(l.id)).length;
  // Active lesson index is the first incomplete lesson, capping at lessons.length - 1
  const activeLessonIndex = Math.min(unitCompletedCount, lessons.length > 0 ? lessons.length - 1 : 0);
  const activeLesson = lessons[activeLessonIndex] ?? null;

  // Decide on header background image based on active lesson title
  const getHeaderImage = () => {
    if (activeLesson?.title.toLowerCase().includes('café') || activeLesson?.title.toLowerCase().includes('biergarten') || activeLesson?.title.toLowerCase().includes('dumpling') || activeLesson?.title.toLowerCase().includes('sushi')) {
      return images.lessonHeaderCafe;
    }
    return images.palace; // Fallback image
  };

  const getHeaderTitle = () => {
    return activeLesson?.title ?? activeUnit?.title ?? 'Learn';
  };

  const handleBack = () => {
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-text" style={{ paddingBottom: insets.bottom }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ── Transparent Navigation Overlaid Header ──────────────── */}
      <RNView
        style={{
          position: 'absolute',
          top: insets.top,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 12,
          zIndex: 10,
        }}
      >
        {/* Back Chevron */}
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back to Home"
          className="w-10 h-10 items-center justify-center rounded-full bg-white/80 dark:bg-[#1E2540]/80 active:opacity-75 shadow-sm"
        >
          <SymbolView
            tintColor={isDark ? '#FFFFFF' : '#0D132B'}
            name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
            size={20}
          />
        </Pressable>

        {/* Title and Progress */}
        <View className="items-center bg-white/70 dark:bg-[#0D132B]/70 px-4 py-1.5 rounded-full shadow-sm">
          <Text className="text-[15px] font-poppins-bold text-[#0D132B] dark:text-white leading-tight">
            {getHeaderTitle()}
          </Text>
          {activeUnit && (
            <Text className="text-[11px] font-poppins-medium text-neutral-text-secondary dark:text-[#9CA3AF]">
              Unit {activeUnit.number} • {activeLessonIndex + 1} / {lessons.length} lessons
            </Text>
          )}
        </View>

        {/* Bookmark Outline */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bookmark unit"
          className="w-10 h-10 items-center justify-center rounded-full bg-white/80 dark:bg-[#1E2540]/80 active:opacity-75 shadow-sm"
        >
          <SymbolView
            tintColor="#FF8A00"
            name={{ ios: 'bookmark.fill', android: 'bookmark', web: 'bookmark' }}
            size={18}
          />
        </Pressable>
      </RNView>

      {/* ── Scrollable Body ────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* Unit Header Image */}
        <View className="h-[230px] w-full overflow-hidden bg-neutral-surface dark:bg-[#161F3D]">
          <Image
            source={getHeaderImage()}
            className="w-full h-full"
            contentFit="cover"
            accessible={false}
          />
          {/* Bottom fade shadow effect */}
          <RNView
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              backgroundColor: isDark ? '#0D132B' : '#FFFFFF',
              opacity: 0.15,
            }}
          />
        </View>

        {/* Segmented Tab Control Container */}
        <View className="mx-6 -mt-8 bg-neutral-surface dark:bg-[#161F3D] border border-neutral-border dark:border-[#1E2540] rounded-[24px] p-1.5 flex-row shadow-sm mb-6 z-20">
          <Pressable
            onPress={() => setCurrentTab('lessons')}
            className={`flex-1 py-3 rounded-[18px] items-center justify-center transition-all ${
              currentTab === 'lessons'
                ? 'bg-white dark:bg-[#1E2540] shadow-sm'
                : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-[14px] font-poppins-semibold ${
                currentTab === 'lessons'
                  ? 'text-[#6C4EF5] dark:text-[#A855F7]'
                  : 'text-neutral-text-secondary dark:text-[#9CA3AF]'
              }`}
            >
              Lessons
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCurrentTab('practice')}
            className={`flex-1 py-3 rounded-[18px] items-center justify-center transition-all ${
              currentTab === 'practice'
                ? 'bg-white dark:bg-[#1E2540] shadow-sm'
                : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-[14px] font-poppins-semibold ${
                currentTab === 'practice'
                  ? 'text-[#6C4EF5] dark:text-[#A855F7]'
                  : 'text-neutral-text-secondary dark:text-[#9CA3AF]'
              }`}
            >
              Practice
            </Text>
          </Pressable>
        </View>

        {/* Dynamic tab contents */}
        {currentTab === 'lessons' ? (
          /* ── Lessons List ── */
          <View className="gap-3.5 px-6">
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              const isActive = index === activeLessonIndex;
              const isLocked = index > activeLessonIndex;

              // Styles based on states
              let cardBgClass = 'bg-white dark:bg-[#1E2540]';
              let cardBorderColorClass = 'border-neutral-border dark:border-[#2E375B]';
              let lessonNumberClass = 'text-neutral-text-secondary dark:text-[#9CA3AF]';
              let lessonTitleClass = 'text-neutral-text dark:text-white';

              if (isActive) {
                cardBgClass = 'bg-[#F4F2FF] dark:bg-[#17152B]';
                cardBorderColorClass = 'border-[#6C4EF5] dark:border-[#6C4EF5]';
                lessonNumberClass = 'text-[#6C4EF5] dark:text-[#A855F7]';
                lessonTitleClass = 'text-[#0D132B] dark:text-white';
              } else if (isLocked) {
                // Dimmed look for locked lessons
                cardBgClass = 'bg-white/80 dark:bg-[#1E2540]/80';
              }

              return (
                <Pressable
                  key={lesson.id}
                  onPress={() =>
                    router.push({
                      pathname: '/lesson/[id]',
                      params: { id: lesson.id },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Lesson ${lesson.number}: ${lesson.title}. ${
                    isCompleted ? 'Completed' : isActive ? 'In progress' : 'Locked'
                  }`}
                  className={`flex-row items-center justify-between p-5 border-2 rounded-2xl active:opacity-90 transition-all ${cardBgClass} ${cardBorderColorClass}`}
                >
                  {/* Left Column info */}
                  <View className="flex-1 pr-4">
                    <Text className={`text-xs font-poppins-semibold mb-1 ${lessonNumberClass}`}>
                      Lesson {lesson.number}
                    </Text>
                    <Text className={`text-[16px] font-poppins-bold ${lessonTitleClass}`}>
                      {lesson.title}
                    </Text>
                    {isActive && (
                      <Text className="text-[13px] font-poppins-semibold text-[#6C4EF5] dark:text-[#A855F7] mt-1">
                        In progress
                      </Text>
                    )}
                    {isLocked && (
                      <Text className="text-[12px] font-poppins text-neutral-text-secondary dark:text-[#9CA3AF] mt-0.5">
                        0 / {lesson.activities.length} activities
                      </Text>
                    )}
                  </View>

                  {/* Right Column icons/images */}
                  <View className="items-center justify-center">
                    {isCompleted && (
                      <View className="w-8 h-8 rounded-full bg-[#58CC02] items-center justify-center shadow-sm">
                        <SymbolView
                          tintColor="#FFFFFF"
                          name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                          size={14}
                        />
                      </View>
                    )}

                    {isActive && (
                      <View className="w-[50px] h-[50px] overflow-hidden rounded-lg bg-neutral-surface dark:bg-[#2A244E]">
                        <Image
                          source={images.cardCafeTable}
                          className="w-full h-full"
                          contentFit="contain"
                        />
                      </View>
                    )}

                    {isLocked && (
                      <View className="w-8 h-8 items-center justify-center rounded-full bg-neutral-surface dark:bg-[#2E375B]">
                        <SymbolView
                          tintColor={isDark ? '#9CA3AF' : '#6B7280'}
                          name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
                          size={16}
                        />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          /* ── Practice Tab Coming Soon ── */
          <View className="px-6 py-8 items-center justify-center">
            <View className="w-36 h-36 mb-6">
              <Image
                source={images.mascotWelcome}
                className="w-full h-full"
                contentFit="contain"
              />
            </View>
            <Text className="text-xl font-poppins-bold text-[#0D132B] dark:text-white text-center mb-2">
              Practice Makes Perfect!
            </Text>
            <Text className="text-sm font-poppins text-neutral-text-secondary dark:text-[#9CA3AF] text-center max-w-[280px]">
              Review vocabulary, phrases, and grammar rules to solidify your memory and earn bonus XP. Coming soon!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
