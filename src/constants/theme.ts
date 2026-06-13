/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

export const Colors = {
  light: {
    text: colors.neutral.text,
    background: colors.neutral.background,
    backgroundElement: colors.neutral.surface,
    backgroundSelected: '#E0E1E6',
    textSecondary: colors.neutral.textSecondary,
    primary: colors.primary,
  },
  dark: {
    text: colors.neutral.background, // #FFFFFF
    background: colors.neutral.text, // #0D132B
    backgroundElement: '#1E2540',
    backgroundSelected: '#2A3358',
    textSecondary: '#9CA3AF',
    primary: colors.primary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  sans: fonts.regular,
  medium: fonts.medium,
  semibold: fonts.semibold,
  bold: fonts.bold,
  mono: Platform.select({
    ios: 'ui-monospace',
    default: 'monospace',
    web: 'var(--font-mono)',
  })!,
};

export const Spacing = spacing;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
