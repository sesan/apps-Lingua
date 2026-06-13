import { useEffect } from 'react';
import { useUser } from '@clerk/expo';
import { languages } from '../data/languages';
import { useLanguageStore } from '@/store/language-store';

export function useActiveLanguage() {
  const { user, isLoaded } = useUser();
  const activeLanguageId = useLanguageStore((state) => state.activeLanguageId);
  const setActiveLanguageId = useLanguageStore((state) => state.setActiveLanguageId);

  // Sync Clerk metadata to Zustand store if store has no language selected
  useEffect(() => {
    if (isLoaded && user && !activeLanguageId) {
      const metadataId = user.unsafeMetadata?.selectedLanguageId as string | undefined;
      if (metadataId && languages.some(lang => lang.id === metadataId)) {
        setActiveLanguageId(metadataId);
      }
    }
  }, [isLoaded, user, activeLanguageId, setActiveLanguageId]);

  const changeLanguage = async (id: string) => {
    try {
      // Validate id exists
      if (!languages.some(lang => lang.id === id)) {
        console.warn(`Language ID ${id} does not exist.`);
        return;
      }

      setActiveLanguageId(id);

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

