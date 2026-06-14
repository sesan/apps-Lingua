import React from 'react';
import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, useColorScheme, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

// Tab definitions for web (expo-router/ui headless tabs)
const TABS: { key: string; href: string; label: string; icon: SymbolViewProps['name'] }[] = [
  { key: 'home',       href: '/',           label: 'Home',       icon: { ios: 'house.fill',   android: 'home',         web: 'house.fill' } as any },
  { key: 'learn',      href: '/learn',      label: 'Learn',      icon: { ios: 'book.fill',    android: 'menu_book',    web: 'book.fill' } as any },
  { key: 'ai-teacher', href: '/ai-teacher', label: 'AI Teacher', icon: { ios: 'sparkles',     android: 'auto_awesome', web: 'sparkles' } as any },
  { key: 'chat',       href: '/chat',       label: 'Chat',       icon: { ios: 'message.fill', android: 'chat',         web: 'message.fill' } as any },
  { key: 'profile',    href: '/profile',    label: 'Profile',    icon: { ios: 'person.fill',  android: 'person',       web: 'person.fill' } as any },
];

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <WebTabBar>
          {TABS.map((tab) => (
            <TabTrigger key={tab.key} name={tab.key} href={tab.href as any} asChild>
              <WebTabButton label={tab.label} icon={tab.icon} />
            </TabTrigger>
          ))}
        </WebTabBar>
      </TabList>
    </Tabs>
  );
}

// ─── Web Tab Button ───────────────────────────────────────────────────────────

interface WebTabButtonProps extends TabTriggerSlotProps {
  label?: string;
  icon?: any;
}

export function WebTabButton({ isFocused, label, icon, ...props }: WebTabButtonProps) {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.tabInner,
          isFocused && {
            backgroundColor: c.primary,
            borderRadius: 24,
            width: 48,
            height: 48,
          },
        ]}
      >
        <SymbolView
          name={icon ?? { ios: 'circle', android: 'circle', web: 'circle' }}
          size={22}
          tintColor={isFocused ? '#FFFFFF' : c.textSecondary}
          resizeMode="scaleAspectFit"
        />
        {!isFocused && (
          <Text style={[styles.label, { color: c.textSecondary }]} numberOfLines={1}>
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

// ─── Web Tab Bar Container ────────────────────────────────────────────────────

export function WebTabBar({ children, ...props }: TabListProps) {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  return (
    <View
      {...props}
      style={[
        styles.container,
        {
          backgroundColor: c.background,
          borderTopColor: c.backgroundElement,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 88,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 38,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.1,
  },
  pressed: {
    opacity: 0.7,
  },
});
