import React, { useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView, SymbolViewProps } from 'expo-symbols';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TabItem {
  key: string;
  label: string;
  /** expo-symbols SymbolView name object: { ios, android, web } */
  icon: any;
}

interface CustomTabBarProps {
  tabs: TabItem[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

// ─── Colours ─────────────────────────────────────────────────────────────────

const LIGHT = {
  background: '#FFFFFF',
  border: '#E5E7EB',
  activeBg: '#6C4EF5',
  activeIcon: '#FFFFFF',
  inactiveIcon: '#9CA3AF',
  label: '#9CA3AF',
};

const DARK = {
  background: '#0D132B',
  border: '#1E2540',
  activeBg: '#6C4EF5',
  activeIcon: '#FFFFFF',
  inactiveIcon: '#6B7280',
  label: '#6B7280',
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_BAR_HEIGHT = 64;
const CIRCLE_SIZE = 48;
const ICON_SIZE = 22;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomTabBar({ tabs, activeIndex, onTabPress }: CustomTabBarProps) {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? DARK : LIGHT;
  const insets = useSafeAreaInsets();
  const totalHeight = TAB_BAR_HEIGHT + insets.bottom;

  const containerWidth = useRef<number>(0);
  const circleX = useSharedValue(0);
  const isFirstRender = useRef(true);

  const updateCirclePosition = (index: number) => {
    const tabWidth = containerWidth.current / tabs.length;
    const x = tabWidth * index + tabWidth / 2 - CIRCLE_SIZE / 2;

    if (isFirstRender.current) {
      circleX.value = x;
      isFirstRender.current = false;
    } else {
      circleX.value = withSpring(x, { damping: 20, stiffness: 200, mass: 0.8 });
    }
  };

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: circleX.value }],
  }));

  const handleContainerLayout = (width: number) => {
    containerWidth.current = width;
    updateCirclePosition(activeIndex);
  };

  useEffect(() => {
    if (containerWidth.current > 0) {
      updateCirclePosition(activeIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: c.background,
          borderTopColor: c.border,
          paddingBottom: insets.bottom,
          height: totalHeight,
        },
      ]}
    >
      <View
        style={styles.tabsRow}
        onLayout={(e) => handleContainerLayout(e.nativeEvent.layout.width)}
      >
        {/* Animated active circle — renders behind icons */}
        <Animated.View
          style={[styles.activeCircle, { backgroundColor: c.activeBg }, circleStyle]}
          pointerEvents="none"
        />

        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={tab.key}
              style={styles.tabButton}
              onPress={() => onTabPress(index)}
              hitSlop={4}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <View style={styles.tabInner}>
                <SymbolView
                  name={tab.icon}
                  size={ICON_SIZE}
                  tintColor={isActive ? c.activeIcon : c.inactiveIcon}
                  resizeMode="scaleAspectFit"
                />
                {!isActive && (
                  <Text style={[styles.label, { color: c.label }]} numberOfLines={1}>
                    {tab.label}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabsRow: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    position: 'relative',
  },
  activeCircle: {
    position: 'absolute',
    top: (TAB_BAR_HEIGHT - CIRCLE_SIZE) / 2,
    left: 0,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: TAB_BAR_HEIGHT,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: ICON_SIZE + 16,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.1,
  },
});
