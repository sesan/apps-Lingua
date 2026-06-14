import { Platform } from 'react-native';

// Base64URL encoding helper
function base64url(source: ArrayBuffer | string): string {
  let binary = '';
  if (typeof source === 'string') {
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
    const nodeCrypto = require('crypto');
    return nodeCrypto.webcrypto.subtle;
  } catch (e) {
    throw new Error('Web Crypto API not available in this environment');
  }
};

// JWT Signer with custom payload
async function signStreamTokenWithPayload(payload: Record<string, any>, apiSecret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
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
    const { userId, lessonId, languageId } = await request.json();

    if (!userId || !lessonId || !languageId) {
      return Response.json(
        { error: 'Missing required parameters: userId, lessonId, languageId' },
        { status: 400 }
      );
    }

    const apiKey = process.env.STREAM_API_KEY || 'your_stream_api_key_here';
    const apiSecret = process.env.STREAM_API_SECRET || process.env.STREAM_SECRET_KEY || 'your_stream_api_secret_here';

    // Check if placeholders are used
    const isPlaceholder = apiKey === 'your_stream_api_key_here' || apiSecret === 'your_stream_api_secret_here';
    
    // Call ID must follow alphanumeric, underscore, hyphen rules. Max 64 chars.
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const sanitizedLessonId = lessonId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const rawCallId = `lesson_${sanitizedLessonId}_${sanitizedUserId}`;
    const callId = rawCallId.substring(0, 64);

    if (isPlaceholder) {
      // Simulate successful call creation locally without external HTTP request
      return Response.json({
        callId,
        apiKey,
        isPlaceholder: true,
        message: 'Mock call registered successfully (Stream credentials not set up)',
      });
    }

    // Generate administrative system token for REST request
    const now = Math.floor(Date.now() / 1000);
    const adminPayload = {
      server: true,
      iat: now,
      exp: now + 3600,
    };
    
    const adminToken = await signStreamTokenWithPayload(adminPayload, apiSecret);

    // Make request to GetStream Video API to create call
    const createCallUrl = `https://video.stream-io-api.com/api/v2/video/call/default/${callId}?api_key=${apiKey}`;
    
    const response = await fetch(createCallUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stream-Auth-Type': 'jwt',
        'Authorization': adminToken,
      },
      body: JSON.stringify({
        data: {
          created_by_id: userId,
          members: [
            { user_id: userId, role: 'user' }
          ],
          custom: {
            lesson_id: lessonId,
            language_id: languageId,
            started_at: new Date().toISOString(),
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GetStream API error status:', response.status, errorText);
      return Response.json(
        { error: `Stream API responded with ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const responseData = await response.json();

    return Response.json({
      callId,
      apiKey,
      isPlaceholder: false,
      streamData: responseData,
    });
  } catch (error: any) {
    console.error('Error in create-call API route:', error);
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
