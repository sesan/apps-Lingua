import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const customStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (isWeb) {
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    }
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (isWeb) {
      try {
        localStorage.setItem(name, value);
      } catch (e) {
        console.warn('localStorage is not available', e);
      }
      return;
    }
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (e) {
      console.warn('SecureStore is not available', e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (isWeb) {
      try {
        localStorage.removeItem(name);
      } catch {
        // ignore
      }
      return;
    }
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // ignore
    }
  },
};

interface LanguageState {
  activeLanguageId: string | null;
  isHydrated: boolean;
  setActiveLanguageId: (id: string | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      activeLanguageId: null,
      isHydrated: false,
      setActiveLanguageId: (id) => set({ activeLanguageId: id }),
      setHasHydrated: (hydrated) => set({ isHydrated: hydrated }),
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
