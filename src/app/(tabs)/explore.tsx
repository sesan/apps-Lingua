import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset } from '@/constants/theme';
import { View, Text, Pressable, ScrollView } from '@/tw';

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + 16,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: 64,
      paddingBottom: 24,
    },
  });

  return (
    <ScrollView
      className="flex-1 bg-neutral-background dark:bg-neutral-text"
      contentInset={insets}
      contentContainerStyle={contentPlatformStyle}
      contentContainerClassName="flex-row justify-center"
    >
      <View className="max-w-[800px] w-full flex-grow">
        <View className="gap-4 items-center px-6 py-16">
          <Text className="h1 text-neutral-text dark:text-white">Explore</Text>
          <Text className="text-center body-medium text-neutral-text-secondary dark:text-[#9CA3AF]">
            This starter app includes example{'\n'}code to help you get started.
          </Text>

          <ExternalLink href="https://docs.expo.dev" asChild>
            <Pressable className="active:opacity-75">
              <View className="flex-row bg-neutral-surface dark:bg-[#1E2540] px-6 py-2 rounded-[32px] justify-center gap-1 items-center">
                <Text className="text-sm font-poppins text-primary font-medium">Expo documentation</Text>
                <SymbolView
                  tintColor="#6C4EF5"
                  name={{ ios: 'arrow.up.right.square', android: 'link', web: 'link' }}
                  size={12}
                />
              </View>
            </Pressable>
          </ExternalLink>
        </View>

        <View className="gap-8 px-6 pt-4">
          <Collapsible title="File-based routing">
            <Text className="body-medium text-neutral-text-secondary dark:text-[#9CA3AF] mb-2">
              This app has two screens: <Text className="font-mono text-xs bg-neutral-surface dark:bg-[#1E2540] px-1 py-0.5 rounded">src/app/(tabs)/index.tsx</Text> and{' '}
              <Text className="font-mono text-xs bg-neutral-surface dark:bg-[#1E2540] px-1 py-0.5 rounded">src/app/(tabs)/explore.tsx</Text>
            </Text>
            <Text className="body-medium text-neutral-text-secondary dark:text-[#9CA3AF] mb-2">
              The layout file in <Text className="font-mono text-xs bg-neutral-surface dark:bg-[#1E2540] px-1 py-0.5 rounded">src/app/_layout.tsx</Text> sets up
              the tab navigator.
            </Text>
            <ExternalLink href="https://docs.expo.dev/router/introduction">
              <Text className="text-sm font-poppins text-primary font-medium">Learn more</Text>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Android, iOS, and web support">
            <View className="items-center bg-neutral-surface dark:bg-[#1E2540] p-4 rounded-xl">
              <Text className="body-medium text-neutral-text-secondary dark:text-[#9CA3AF] text-center mb-4">
                You can open this project on Android, iOS, and the web. To open the web version,
                press <Text className="font-poppins-semibold">w</Text> in the terminal running this
                project.
              </Text>
              <Image
                source={require('@/assets/images/tutorial-web.png')}
                className="w-full aspect-[296/171] rounded-xl"
              />
            </View>
          </Collapsible>

          <Collapsible title="Images">
            <Text className="body-medium text-neutral-text-secondary dark:text-[#9CA3AF] mb-4">
              For static images, you can use the <Text className="font-mono text-xs bg-neutral-surface dark:bg-[#1E2540] px-1 py-0.5 rounded">@2x</Text> and{' '}
              <Text className="font-mono text-xs bg-neutral-surface dark:bg-[#1E2540] px-1 py-0.5 rounded">@3x</Text> suffixes to provide files for different
              screen densities.
            </Text>
            <Image source={require('@/assets/images/react-logo.png')} className="w-[100px] h-[100px] self-center my-4" />
            <ExternalLink href="https://reactnative.dev/docs/images">
              <Text className="text-sm font-poppins text-primary font-medium">Learn more</Text>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Light and dark mode components">
            <Text className="body-medium text-neutral-text-secondary dark:text-[#9CA3AF] mb-4">
              This template has light and dark mode support. The{' '}
              <Text className="font-mono text-xs bg-neutral-surface dark:bg-[#1E2540] px-1 py-0.5 rounded">useColorScheme()</Text> hook lets you inspect what the
              user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
            </Text>
            <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
              <Text className="text-sm font-poppins text-primary font-medium">Learn more</Text>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Animations">
            <Text className="body-medium text-neutral-text-secondary dark:text-[#9CA3AF]">
              This template includes an example of an animated component. The{' '}
              <Text className="font-mono text-xs bg-neutral-surface dark:bg-[#1E2540] px-1 py-0.5 rounded">src/components/ui/collapsible.tsx</Text> component uses
              the powerful <Text className="font-mono text-xs bg-neutral-surface dark:bg-[#1E2540] px-1 py-0.5 rounded">react-native-reanimated</Text> library to
              animate opening this hint.
            </Text>
          </Collapsible>
        </View>
        {Platform.OS === 'web' && <WebBadge />}
      </View>
    </ScrollView>
  );
}
