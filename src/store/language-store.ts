import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface LanguageState {
  activeLanguageId: string | null;
  isHydrated: boolean;
  completedLessonIds: string[];
  xp: number;
  streak: number;
  setActiveLanguageId: (id: string | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
  completeLesson: (lessonId: string, xpReward: number) => void;
  resetProgress: () => void;
}

// Safe cross-platform storage fallback for Web
const customStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(name);
      } catch (e) {
        console.error('Failed to get item from localStorage', e);
        return null;
      }
    }
    return AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(name, value);
      } catch (e) {
        console.error('Failed to set item in localStorage', e);
      }
      return;
    }
    return AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(name);
      } catch (e) {
        console.error('Failed to remove item from localStorage', e);
      }
      return;
    }
    return AsyncStorage.removeItem(name);
  },
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      activeLanguageId: null,
      isHydrated: false,
      completedLessonIds: ['es-u1-l1', 'fr-u1-l1', 'ja-u1-l1'],
      xp: 15,
      streak: 12,
      setActiveLanguageId: (id) => set({ activeLanguageId: id }),
      setHasHydrated: (hydrated) => set({ isHydrated: hydrated }),
      completeLesson: (lessonId, xpReward) =>
        set((state) => {
          if (state.completedLessonIds.includes(lessonId)) {
            return {};
          }
          return {
            completedLessonIds: [...state.completedLessonIds, lessonId],
            xp: state.xp + xpReward,
          };
        }),
      resetProgress: () =>
        set({
          completedLessonIds: ['es-u1-l1', 'fr-u1-l1', 'ja-u1-l1'],
          xp: 15,
          streak: 12,
        }),
    }),
    {
      name: 'lingua-language-storage',
      storage: createJSONStorage(() => customStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);


