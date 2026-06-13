# Project Memory: Clerk, Expo Router, and Web SSR Learnings

This document logs critical learnings, gotchas, and architectural choices made during the implementation of the Language Selection screen. Use these lessons when maintaining the authentication and routing systems in this project.

## Key Learnings

### 1. Clerk & Expo Web Static Rendering Mismatch
* **Problem**: Setting `"output": "static"` in [app.json](file:///Users/sesan/Documents/Projects%20/React%20AI%20App/app.json) for the web platform triggers server-side rendering (SSR/prerendering) inside Node.js. When `@clerk/expo` runs on the Node server during compilation, it attempts to fetch browser-specific cookies or headers (calling `.get()` on an uninitialized context), resulting in the build crash:
  ```
  TypeError: Cannot read properties of undefined (reading 'get')
  ```
* **Solution**: Change the web output type to `"single"` (Single Page Application/SPA mode) in [app.json](file:///Users/sesan/Documents/Projects%20/React%20AI%20App/app.json). This causes the web version of the Expo app to compile and render entirely client-side in the browser, bypassing the server-side Node execution environment and avoiding Clerk hydration crashes.

---

### 2. Custom SSR-Safe Token Cache
* **Problem**: Importing `{ tokenCache }` from `@clerk/expo/token-cache` causes compilation and runtime issues on non-native environments because it tightly couples Clerk authentication with the native `expo-secure-store` module.
* **Solution**: We implemented a custom token cache in [token-cache.ts](file:///Users/sesan/Documents/Projects%20/React%20AI%20App/src/utils/token-cache.ts):
  ```typescript
  import * as SecureStore from 'expo-secure-store';
  import { Platform } from 'react-native';

  const createTokenCache = () => {
    return {
      async getToken(key: string) { ... },
      async saveToken(key: string, value: string) { ... }
    };
  };

  // Only use SecureStore tokenCache on native platforms
  export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;
  ```
  When `tokenCache` is `undefined` on the Web, Clerk falls back to standard web-secure local/cookie-based storage mechanisms automatically.

---

### 3. Cross-Platform Active State Storage fallback
* **Problem**: Storing user preferences (like active language) in native keychains using `SecureStore` works on iOS and Android but throws errors on browsers since `SecureStore` doesn't support web.
* **Solution**: Always build utility wrappers that check the active platform before making storage calls:
  ```typescript
  const getStoredItem = async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  };
  ```
  This guarantees instant local loads on both mobile and web, which can later be synced to Clerk's `user.unsafeMetadata` on the server when logged in.

---

### 4. UI Implementation: Design Review & Asset Mapping
* **Problem**: Implementing UI layouts from text prompts alone can lead to mismatch with actual high-fidelity designs, missing custom assets (e.g., `palace.png` for Continue Learning card, `treasure.png` for Daily Goal card), or visual components (e.g., custom header stats row, green Next Up card).
* **Solution**:
  1. Always inspect image design specs (like `.png` mockups in `prompt_material/` or `prompts/`) *first* before writing layout code.
  2. Audit `assets/` to map mockup illustrations to existing files to ensure correct graphics are embedded.
  3. Customize theme integrations to react to active configurations (e.g., translating greetings to "Hola", "Bonjour", "Konnichiwa" based on the user's selected language) to make the app feel extremely premium.
  4. Write clean custom SVG elements for standard icons (like bell, headphones, book) to ensure absolute cross-platform visual consistency.


