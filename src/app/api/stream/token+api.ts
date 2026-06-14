import { Platform } from 'react-native';

// Base64URL encoding helper
function base64url(source: ArrayBuffer | string): string {
  let binary = '';
  if (typeof source === 'string') {
    // UTF-8 string to binary string
    const encoder = new TextEncoder();
    const bytes = encoder.encode(source);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
  } else {
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Environment-agnostic Web Crypto reference
const getSubtleCrypto = () => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    return crypto.subtle;
  }
  try {
    // Dynamic require for Node.js fallback (failsafe for local dev vs worker edge)
    const nodeCrypto = require('crypto');
    return nodeCrypto.webcrypto.subtle;
  } catch (e) {
    throw new Error('Web Crypto API not available in this environment');
  }
};

// HS256 Token generator
export async function signStreamToken(userId: string, apiSecret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    user_id: userId,
    iat: now,
    exp: now + 3600, // 1 hour expiration
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const tokenInput = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(tokenInput);
  const secretBytes = encoder.encode(apiSecret);

  const subtle = getSubtleCrypto();
  const cryptoKey = await subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await subtle.sign(
    'HMAC',
    cryptoKey,
    inputBytes
  );

  const encodedSignature = base64url(signatureBuffer);
  return `${tokenInput}.${encodedSignature}`;
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return Response.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const apiKey = process.env.STREAM_API_KEY || 'your_stream_api_key_here';
    const apiSecret = process.env.STREAM_API_SECRET || process.env.STREAM_SECRET_KEY || 'your_stream_api_secret_here';

    // In local dev/fallback mode if keys are placeholders
    const isPlaceholder = apiKey === 'your_stream_api_key_here' || apiSecret === 'your_stream_api_secret_here';

    let token = '';
    if (!isPlaceholder) {
      token = await signStreamToken(userId, apiSecret);
    } else {
      // Return a simulated mock token if keys are not set up yet
      token = `mock_token_${userId}_${Math.floor(Date.now() / 1000)}`;
    }

    return Response.json({
      token,
      apiKey,
      isPlaceholder,
    });
  } catch (error: any) {
    console.error('Error generating Stream token:', error);
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
