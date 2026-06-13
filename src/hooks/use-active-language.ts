import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/expo';
import { Platform } from 'react-native';
import { Language } from '../types/learning';
import { languages } from '../data/languages';

const SECURE_STORE_KEY = 'lingua_active_language_id';

const isWeb = Platform.OS === 'web';

const getStoredItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
};

const setStoredItem = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage is not available', e);
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.warn('SecureStore is not available', e);
  }
};

export function useActiveLanguage() {
  const { user, isLoaded } = useUser();
  const [activeLanguageId, setActiveLanguageId] = useState<string>('es');

  // Load active language on mount or when user changes
  useEffect(() => {
    const loadLanguage = async () => {
      // 1. Try local storage / SecureStore
      const stored = await getStoredItem(SECURE_STORE_KEY);
      if (stored) {
        setActiveLanguageId(stored);
        return;
      }

      // 2. If signed in, try user metadata
      if (isLoaded && user?.unsafeMetadata?.selectedLanguageId) {
        const metadataId = user.unsafeMetadata.selectedLanguageId as string;
        setActiveLanguageId(metadataId);
        await setStoredItem(SECURE_STORE_KEY, metadataId);
      }
    };

    loadLanguage();
  }, [user, isLoaded]);

  const changeLanguage = async (id: string) => {
    try {
      // Validate id exists
      if (!languages.some(lang => lang.id === id)) {
        console.warn(`Language ID ${id} does not exist.`);
        return;
      }

      setActiveLanguageId(id);
      await setStoredItem(SECURE_STORE_KEY, id);

      // Sync to Clerk metadata if signed in
      if (isLoaded && user) {
        await user.updateMetadata({
          unsafeMetadata: {
            selectedLanguageId: id,
          },
        });
      }
    } catch (e) {
      console.error('Failed to change active language:', e);
    }
  };

  const activeLanguage = languages.find(lang => lang.id === activeLanguageId) || languages[0];

  return {
    activeLanguage,
    activeLanguageId,
    changeLanguage,
  };
}
