import React from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar, { TabItem } from './custom-tab-bar';

const TABS: TabItem[] = [
  { key: 'index',      label: 'Home',       icon: { ios: 'house.fill',    android: 'home',         web: 'house.fill' } as any },
  { key: 'learn',      label: 'Learn',      icon: { ios: 'book.fill',     android: 'menu_book',    web: 'book.fill' } as any },
  { key: 'ai-teacher', label: 'AI Teacher', icon: { ios: 'sparkles',      android: 'auto_awesome', web: 'sparkles' } as any },
  { key: 'chat',       label: 'Chat',       icon: { ios: 'message.fill',  android: 'chat',         web: 'message.fill' } as any },
  { key: 'profile',    label: 'Profile',    icon: { ios: 'person.fill',   android: 'person',       web: 'person.fill' } as any },
];

const ROUTE_TO_INDEX: Record<string, number> = {
  index: 0,
  learn: 1,
  'ai-teacher': 2,
  chat: 3,
  profile: 4,
};

export default function AppTabs() {
  return (
    <Tabs
      tabBar={({ state, navigation }) => (
        <CustomTabBar
          tabs={TABS}
          activeIndex={ROUTE_TO_INDEX[state.routes[state.index].name] ?? 0}
          onTabPress={(index) => {
            const route = TABS[index];
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes.find((r) => r.name === route.key)?.key ?? '',
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              navigation.navigate(route.key);
            }
          }}
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="ai-teacher" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="profile" />
      {/* Legacy explore screen — hidden from tab bar */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
