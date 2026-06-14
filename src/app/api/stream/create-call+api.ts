import { getLessonById, getLanguageById, getVocabularyForLanguage, getPhrasesForLanguage } from '../../../data/lessons';

import { base64url, getSubtleCrypto } from '@/lib/crypto-utils';

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
    console.log('POST /api/stream/create-call parameters:', { userId, lessonId, languageId });

    if (!userId || !lessonId || !languageId) {
      return Response.json(
        { error: 'Missing required parameters: userId, lessonId, languageId' },
        { status: 400 }
      );
    }

    const lesson = getLessonById(lessonId);
    if (!lesson) {
      return Response.json(
        { error: `Lesson not found: ${lessonId}` },
        { status: 404 }
      );
    }

    const language = getLanguageById(languageId);
    const languageName = language ? language.name : 'Unknown';
    const allVocab = getVocabularyForLanguage(languageId);
    const allPhrases = getPhrasesForLanguage(languageId);

    const expectedVocabItems = allVocab
      .filter((v) => lesson.aiTeacherPrompt.expectedVocabulary.includes(v.id))
      .map((v) => ({
        word: v.word,
        translation: v.translation,
        pronunciation: v.pronunciation,
      }));

    const expectedPhraseItems = allPhrases
      .filter((p) => lesson.aiTeacherPrompt.expectedPhrases.includes(p.id))
      .map((p) => ({
        text: p.text,
        translation: p.translation,
        pronunciation: p.pronunciation,
      }));

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

    // Generate administrative system token for REST request matching Stream SDK empty payload structure
    const adminPayload = {};
    
    const adminToken = await signStreamTokenWithPayload(adminPayload, apiSecret);

    // Make request to GetStream Video API to create call
    const createCallUrl = `https://video.stream-io-api.com/api/v2/video/call/audio_room/${callId}?api_key=${apiKey}`;
    
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
            { user_id: userId, role: 'user' },
            { user_id: 'ai-teacher', role: 'admin' }
          ],
          custom: {
            lesson_id: lessonId,
            language_id: languageId,
            language_name: languageName,
            started_at: new Date().toISOString(),
            lesson_title: lesson.title,
            lesson_description: lesson.description,
            goals: lesson.goals,
            ai_teacher_prompt: {
              persona: lesson.aiTeacherPrompt.persona,
              scenario: lesson.aiTeacherPrompt.scenario,
              instructions: lesson.aiTeacherPrompt.instructions,
            },
            vocabulary: expectedVocabItems,
            phrases: expectedPhraseItems,
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
