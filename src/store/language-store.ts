import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
