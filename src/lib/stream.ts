import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { StreamVideoClient, User } from '@stream-io/video-react-native-sdk';

let StreamVideoClientClass: any = null;
try {
  StreamVideoClientClass = require('@stream-io/video-react-native-sdk').StreamVideoClient;
} catch (e) {
  console.log('Stream Video SDK not available in stream.ts (running in simulated mode).');
}

// Resolves local development host dynamically for React Native fetch
const getBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return '';
  }
  // Try debuggerHost or hostUri
  const manifest = Constants.expoConfig || (Constants as any).manifest;
  const debuggerHost = manifest?.debuggerHost || (manifest as any).hostUri;
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    // Use the default Expo Router port 8081
    return `http://${host}:8081`;
  }
  return 'http://localhost:8081';
};

export const getApiUrl = (path: string): string => {
  const base = getBaseUrl();
  return `${base}${path}`;
};

export interface StreamCallSession {
  callId: string;
  apiKey: string;
  token: string;
  isPlaceholder: boolean;
}

// Fetch user token from backend API route
export async function fetchStreamToken(userId: string): Promise<{ token: string; apiKey: string; isPlaceholder: boolean }> {
  const url = getApiUrl('/api/stream/token');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch Stream token: ${response.status} ${errText}`);
  }
  
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    if (text.trim().startsWith('<')) {
      throw new Error(`Server returned HTML (likely 404). Please ensure the Expo dev server has been restarted to load new "web.output: 'server'" configurations.`);
    }
    throw new Error(`Expected JSON response, got: ${text.substring(0, 100)}`);
  }
  
  return response.json();
}

// Create call session from backend API route
export async function createStreamCall(
  userId: string,
  lessonId: string,
  languageId: string
): Promise<{ callId: string; apiKey: string; isPlaceholder: boolean }> {
  const url = getApiUrl('/api/stream/create-call');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, lessonId, languageId }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create Stream call: ${response.status} ${errText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    if (text.trim().startsWith('<')) {
      throw new Error(`Server returned HTML (likely 404). Please ensure the Expo dev server has been restarted to load new "web.output: 'server'" configurations.`);
    }
    throw new Error(`Expected JSON response, got: ${text.substring(0, 100)}`);
  }

  return response.json();
}

let streamClient: StreamVideoClient | null = null;
let currentUserId: string | null = null;

// Initialize or reuse StreamVideoClient
export const getStreamClient = (
  apiKey: string,
  userId: string,
  token: string,
  userName?: string
): StreamVideoClient => {
  if (streamClient && currentUserId === userId) {
    return streamClient;
  }

  if (streamClient) {
    // Clean up if logging in as different user
    streamClient.disconnectUser().catch((err) => {
      console.warn('Error disconnecting client user:', err);
    });
  }

  const user: User = {
    id: userId,
    name: userName || userId,
    image: `https://getstream.io/random_png/?id=${userId}&name=${userName || userId}`,
  };

  if (!StreamVideoClientClass) {
    throw new Error('StreamVideoClient is not available (WebRTC native module not found)');
  }

  streamClient = new StreamVideoClientClass({
    apiKey,
    user,
    token,
  });
  currentUserId = userId;

  return streamClient!;
};

// Reset Stream Client singleton
export const resetStreamClient = async () => {
  if (streamClient) {
    try {
      await streamClient.disconnectUser();
    } catch (e) {
      console.warn('Error disconnecting client user during reset:', e);
    }
    streamClient = null;
    currentUserId = null;
  }
};
