import { useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@clerk/expo';
import { languages } from '../data/languages';
import { useLanguageStore } from '@/store/language-store';

const getStoredItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    console.error('Failed to get item from AsyncStorage', e);
    return null;
  }
};

const setStoredItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
    return;
  }
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error('Failed to set item in AsyncStorage', e);
  }
};

export function useActiveLanguage() {
  const { user, isLoaded } = useUser();
  const activeLanguageId = useLanguageStore((state) => state.activeLanguageId);
  const setActiveLanguageId = useLanguageStore((state) => state.setActiveLanguageId);

  // Sync / load language based on user identity or metadata
  useEffect(() => {
    let active = true;

    const loadLanguage = async () => {
      if (!isLoaded) return;

      const storageKey = user ? `lingua-lang-${user.id}` : 'lingua-lang-anonymous';

      if (user) {
        // Logged-in user flow:
        // 1. Prefer Clerk metadata
        const metadataId = user.unsafeMetadata?.selectedLanguageId as string | undefined;
        if (metadataId && languages.some(lang => lang.id === metadataId)) {
          if (active) {
            setActiveLanguageId(metadataId);
            await setStoredItem(storageKey, metadataId);
          }
          return;
        }

        // 2. Fall back to per-user local storage
        const storedId = await getStoredItem(storageKey);
        if (storedId && languages.some(lang => lang.id === storedId)) {
          if (active) {
            setActiveLanguageId(storedId);
          }
          return;
        }

        // 3. Fall back to null/no language selected
        if (active) {
          setActiveLanguageId(null);
        }
      } else {
        // Anonymous/signed-out flow:
        // Load from anonymous key
        const storedId = await getStoredItem(storageKey);
        if (storedId && languages.some(lang => lang.id === storedId)) {
          if (active) {
            setActiveLanguageId(storedId);
          }
        } else {
          if (active) {
            setActiveLanguageId(null);
          }
        }
      }
    };

    loadLanguage();

    return () => {
      active = false;
    };
  }, [isLoaded, user?.id, setActiveLanguageId]);

  const changeLanguage = async (id: string) => {
    try {
      // Validate id exists
      if (!languages.some(lang => lang.id === id)) {
        console.warn(`Language ID ${id} does not exist.`);
        return;
      }

      setActiveLanguageId(id);

      // Save to local storage
      const storageKey = user ? `lingua-lang-${user.id}` : 'lingua-lang-anonymous';
      await setStoredItem(storageKey, id);

      // Sync to Clerk metadata if signed in
      if (isLoaded && user) {
        await user.updateMetadata({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            selectedLanguageId: id,
          },
        });
      }
    } catch (e) {
      console.error('Failed to change active language:', e);
    }
  };

  const activeLanguage = activeLanguageId
    ? (languages.find(lang => lang.id === activeLanguageId) ?? undefined)
    : undefined;

  return {
    activeLanguage,
    activeLanguageId,
    changeLanguage,
  };
}

