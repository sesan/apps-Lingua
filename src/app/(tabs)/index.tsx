import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, Text, Pressable, Image as RNImage, useColorScheme } from 'react-native';
import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Image } from '@/tw/image';
import { useActiveLanguage } from '@/hooks/use-active-language';
import { useLanguageStore } from '@/store/language-store';
import { getUnitsForLanguage, getLessonsForUnit } from '@/data/lessons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

// Custom clean SVG icons for perfect design match
const BellIcon = ({ color = '#0D132B' }: { color?: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
      fill={color}
    />
  </Svg>
);

const BookIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C12 21 9 18 3 18V5C9 5 12 8 12 8C12 8 15 5 21 5V18C15 18 12 21 12 21Z"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HeadphonesIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 14C3 9.02944 7.02944 5 12 5C16.9706 5 21 9.02944 21 14M3 14H6V18H3V14ZM21 14H18V18H21V14Z"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MascotIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 17C10.9 17 10 16.1 10 15H14C14 16.1 13.1 17 12 17ZM15.5 11C14.67 11 14 10.33 14 9.5C14 8.67 14.67 8 15.5 8C16.33 8 17 8.67 17 9.5C17 10.33 16.33 11 15.5 11ZM8.5 11C7.67 11 7 10.33 7 9.5C7 8.67 7.67 8 8.5 8C9.33 8 10 8.67 10 9.5C10 10.33 9.33 11 8.5 11Z"
      fill="white"
    />
  </Svg>
);

const VideoIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 10L20 6V18L15 14V10ZM4 6H13C13.55 6 14 6.45 14 7V17C14 17.55 13.55 18 13 18H4C3.45 18 3 17.55 3 17V7C3 6.45 3.45 6 4 6Z"
      fill="white"
    />
  </Svg>
);

// Mocks for current user stats to display on home screen
const MOCK_XP_CURRENT = 15;
const MOCK_XP_GOAL = 20;
const MOCK_STREAK = 12;

export default function HomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { activeLanguage, activeLanguageId } = useActiveLanguage();
  const setActiveLanguageId = useLanguageStore((s) => s.setActiveLanguageId);
  const insets = useSafeAreaInsets();

  // Derive current unit and lesson info
  const units = activeLanguageId ? getUnitsForLanguage(activeLanguageId) : [];
  const currentUnit = units[0] ?? null;
  const lessons = currentUnit ? getLessonsForUnit(currentUnit.id) : [];
  const currentLesson = lessons[0] ?? null;

  const firstName = user?.firstName ?? user?.username ?? 'Alex';

  // Dynamic language greeting based on the active language selected
  const getGreeting = () => {
    switch (activeLanguageId) {
      case 'es':
        return 'Hola';
      case 'fr':
        return 'Bonjour';
      case 'ja':
        return 'Konnichiwa';
      case 'ko':
        return 'Annyeong';
      case 'de':
        return 'Hallo';
      case 'zh':
        return 'Nǐ hǎo';
      default:
        return 'Hello';
    }
  };

  // Theme colors matching the premium design aesthetics (contrast ratio compliant)
  const bg = isDark ? '#0D132B' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0D132B';
  const textSecondary = isDark ? '#9CA3AF' : '#4B5563';
  const cardBorder = isDark ? '#1E2540' : '#E5E7EB';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Main Content Scroll Container */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* ── Header Row ────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          {/* Flag + Greeting */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, overflow: 'hidden' }}>
              <Image
                source={{ uri: activeLanguage?.flag ?? 'https://flagcdn.com/w320/es.png' }}
                style={{ width: 36, height: 36 }}
                contentFit="cover"
                accessibilityLabel={`${activeLanguage?.name ?? 'Spanish'} flag`}
              />
            </View>
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20, color: textPrimary }}>
              {getGreeting()}, {firstName}! 👋
            </Text>
          </View>

          {/* Streak + Notifications */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            {/* Streak */}
            <View 
              accessible={true}
              accessibilityLabel={`${MOCK_STREAK} days streak`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Image
                source={require('@/assets/images/streak-fire.png')}
                style={{ width: 22, height: 22 }}
                contentFit="contain"
                accessible={false}
              />
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16, color: '#4B5563' }}>
                {MOCK_STREAK}
              </Text>
            </View>

            {/* Bell Icon */}
            <Pressable 
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={{ padding: 4 }}
            >
              <BellIcon color={textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* ── Daily Goal Card ────────────────────────────────────── */}
        <View
          accessible={true}
          accessibilityLabel={`Daily goal: ${MOCK_XP_CURRENT} out of ${MOCK_XP_GOAL} XP earned`}
          style={{
            backgroundColor: isDark ? '#221E1A' : '#FFF9F3',
            borderRadius: 24,
            padding: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <View style={{ flex: 1, marginRight: 16 }} accessible={false}>
            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 14, color: '#4B5563', marginBottom: 4 }}>
              Daily goal
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 }}>
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 32, color: textPrimary }}>
                {MOCK_XP_CURRENT}
              </Text>
              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 15, color: '#4B5563' }}>
                {` / ${MOCK_XP_GOAL} XP`}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={{ height: 8, backgroundColor: isDark ? '#3D342A' : '#FFEEDC', borderRadius: 4, overflow: 'hidden' }}>
              <View
                style={{
                  height: '100%',
                  width: `${(MOCK_XP_CURRENT / MOCK_XP_GOAL) * 100}%`,
                  backgroundColor: '#FF8A00',
                  borderRadius: 4,
                }}
              />
            </View>
          </View>

          {/* Treasure Chest */}
          <Image
            source={require('@/assets/images/treasure.png')}
            style={{ width: 90, height: 90 }}
            contentFit="contain"
            accessible={false}
          />
        </View>

        {/* ── Continue Learning Card ──────────────────────────────── */}
        <Pressable
          onPress={() => router.push('/learn')}
          accessibilityRole="button"
          accessibilityLabel={`Continue learning ${activeLanguage?.name ?? 'Spanish'}, Unit ${currentUnit?.number ?? 3}`}
          accessibilityHint="Navigates to the learn section"
          style={{
            backgroundColor: '#6C4EF5',
            borderRadius: 24,
            padding: 20,
            position: 'relative',
            overflow: 'hidden',
            minHeight: 164,
            marginBottom: 28,
            shadowColor: '#6C4EF5',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View style={{ zIndex: 2, flex: 1, justifyContent: 'space-between', width: '55%' }} accessible={false}>
            <View>
              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 13, color: '#E0D9FF', marginBottom: 2 }}>
                Continue learning
              </Text>
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 26, color: '#FFFFFF', marginBottom: 2 }}>
                {activeLanguage?.name ?? 'Spanish'}
              </Text>
              <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 14, color: '#E0D9FF' }}>
                A1 • Unit {currentUnit?.number ?? 3}
              </Text>
            </View>

            {/* Continue Button */}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                paddingVertical: 10,
                paddingHorizontal: 24,
                alignSelf: 'flex-start',
                marginTop: 14,
              }}
            >
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 14, color: '#6C4EF5' }}>
                Continue
              </Text>
            </View>
          </View>

          {/* Palace/Landmark Asset Graphic */}
          <Image
            source={require('@/assets/images/palace.png')}
            style={{
              position: 'absolute',
              right: -10,
              bottom: -10,
              width: 170,
              height: 170,
              zIndex: 1,
            }}
            contentFit="contain"
            accessible={false}
          />
        </Pressable>

        {/* ── Today's Plan ────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18, color: textPrimary }}>
            Today's plan
          </Text>
          <Pressable 
            accessibilityRole="button"
            accessibilityLabel="View all daily plans"
          >
            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 14, color: '#6C4EF5' }}>
              View all
            </Text>
          </Pressable>
        </View>

        {/* Today's Tasks List */}
        <View style={{ gap: 14, marginBottom: 28 }}>
          {/* Task 1: Lesson (Checked) */}
          <View
            accessible={true}
            accessibilityLabel={`Lesson: ${currentLesson?.title ?? 'At the café'}. Status: Completed.`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#161F3D' : '#F8F9FE',
              borderRadius: 20,
              padding: 16,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: '#6C4EF5',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <BookIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 15, color: textPrimary, marginBottom: 2 }}>
                Lesson
              </Text>
              <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 13, color: textSecondary }}>
                {currentLesson?.title ?? 'At the café'}
              </Text>
            </View>
            {/* Checked Circle */}
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#6C4EF5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
            </View>
          </View>

          {/* Task 2: AI Conversation (Unchecked) */}
          <View
            accessible={true}
            accessibilityLabel="AI Conversation: Talk about your day. Status: Not started."
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#161F3D' : '#F8F9FE',
              borderRadius: 20,
              padding: 16,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: '#6C4EF5',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <HeadphonesIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 15, color: textPrimary, marginBottom: 2 }}>
                AI Conversation
              </Text>
              <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 13, color: textSecondary }}>
                Talk about your day
              </Text>
            </View>
            {/* Unchecked Circle */}
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: '#C7CCD0',
              }}
            />
          </View>

          {/* Task 3: New words (Unchecked) */}
          <View
            accessible={true}
            accessibilityLabel="New words: 10 words. Status: Not started."
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#161F3D' : '#F8F9FE',
              borderRadius: 20,
              padding: 16,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: '#FF5A5F',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <MascotIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 15, color: textPrimary, marginBottom: 2 }}>
                New words
              </Text>
              <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 13, color: textSecondary }}>
                10 words
              </Text>
            </View>
            {/* Unchecked Circle */}
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: '#C7CCD0',
              }}
            />
          </View>
        </View>

        {/* ── Next Up Card ────────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: isDark ? '#1D2A20' : '#F2F8F3',
            borderRadius: 24,
            padding: 18,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12, color: '#58CC02', marginBottom: 2 }}>
              Next up
            </Text>
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16, color: textPrimary, marginBottom: 2 }}>
              AI Video Call
            </Text>
            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 13, color: textSecondary }}>
              Practice speaking
            </Text>
          </View>

          {/* Profile pic & video button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                borderWidth: 2,
                borderColor: '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
                }}
                style={{ width: 50, height: 50 }}
                contentFit="cover"
                accessible={false}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start AI Video Call"
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#58CC02',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <VideoIcon />
            </Pressable>
          </View>
        </View>

        {/* Dev Options Section (collapsible/subtle helper) */}
        <View style={{ marginTop: 32, borderTopWidth: 1, borderColor: cardBorder, paddingTop: 16 }}>
          <Pressable
            onPress={() => signOut()}
            style={{
              backgroundColor: '#EF4444' + '15',
              paddingVertical: 12,
              borderRadius: 16,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 14, color: '#EF4444' }}>
              Sign Out
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setActiveLanguageId(null);
            }}
            style={{
              borderWidth: 1,
              borderColor: cardBorder,
              paddingVertical: 10,
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12, color: textSecondary }}>
              [Dev] Clear Selected Language
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}