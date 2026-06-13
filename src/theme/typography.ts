import { Platform } from 'react-native';

export const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
} as const;

export const fontSizes = {
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 16,
  bodyLarge: 16,
  bodyMedium: 14,
  bodySmall: 13,
  caption: 11,
} as const;

export const lineHeights = {
  h1: 38.4,      // 32 * 1.2
  h2: 31.2,      // 24 * 1.3
  h3: 26.0,      // 20 * 1.3
  h4: 22.4,      // 16 * 1.4
  bodyLarge: 25.6,  // 16 * 1.6
  bodyMedium: 22.4, // 14 * 1.6
  bodySmall: 20.8,  // 13 * 1.6
  caption: 15.4,    // 11 * 1.4
} as const;
