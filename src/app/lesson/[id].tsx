import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useColorScheme, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { View, Text, Pressable } from '@/tw';
import { Image } from '@/tw/image';
import { getLessonById, getUnitById, getLanguageById, getVocabularyForLanguage, getPhrasesForLanguage } from '@/data/lessons';
import { useLanguageStore } from '@/store/language-store';
import { images } from '@/constants/images';
import { posthog } from '@/lib/posthog';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useUser } from '@clerk/expo';
import type { StreamVideoClient } from '@stream-io/video-react-native-sdk';

// ─── Caption Types ────────────────────────────────────────────────────────────
export interface LiveCaption {
  id: string;
  speakerId: string;
  speakerName: string;
  text: string;
  isAI: boolean;
  timestamp: number;
}

let StreamVideo: any = null;
let StreamCall: any = null;
let useCall: any = () => null;
let useCallStateHooks: any = () => ({
  useCallCallingState: () => 'left',
  useMicrophoneState: () => ({ microphone: { toggle: async () => {} }, isMute: false }),
});
let CallingState: any = {
  JOINED: 'joined',
  JOINING: 'joining',
  RECONNECTING: 'reconnecting',
  RECONNECTING_FAILED: 'reconnecting_failed',
  OFFLINE: 'offline',
  LEFT: 'left',
};

try {
  const sdk = require('@stream-io/video-react-native-sdk');
  StreamVideo = sdk.StreamVideo;
  StreamCall = sdk.StreamCall;
  useCall = sdk.useCall;
  useCallStateHooks = sdk.useCallStateHooks;
  CallingState = sdk.CallingState;
} catch (e) {
  console.log('Stream Video SDK is not available, falling back to simulated call.');
}
import { fetchStreamToken, createStreamCall, getStreamClient, resetStreamClient, getApiUrl } from '@/lib/stream';

// ─── Custom SVG Icons for Cross-Platform Pixel Perfection ────────────────────

const ChevronLeftIcon = ({ color = '#0D132B', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 19l-7-7 7-7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const VideoCameraOutlineIcon = ({ color = '#0D132B', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M23 7l-7 5 7 5V7z" />
    <Rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </Svg>
);

const VideoCameraFillIcon = ({ color = '#0D132B', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 7l-7 5 7 5V7z" fill={color} />
    <Rect x="1" y="5" width="15" height="14" rx="2" ry="2" fill={color} />
  </Svg>
);

const ProfileOutlineIcon = ({ color = '#0D132B', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const SpeakerIcon = ({ color = '#6C4EF5', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 5L6 9H2v6h4l5 4V5z" fill={color} />
    <Path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const MicIcon = ({ color = '#0D132B', size = 22, muted = false }: { color?: string; size?: number; muted?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 1c-1.66 0-3 1.34-3 3v8c0 1.66 1.34 3 3 3s3-1.34 3-3V4c0-1.66-1.34-3-3-3z" fill={muted ? 'none' : color} />
    <Path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
    {muted && <Path d="M4 4l16 16" stroke="#EF4444" strokeWidth="2.5" />}
  </Svg>
);

const TranslateIcon = ({ color = '#0D132B', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 8h14M4 14h11M7 5v6M17 11.5a5.5 5.5 0 0 1-5.5 5.5M16 21l-3.5-3.5" />
  </Svg>
);

const EndCallIcon = ({ color = '#FFFFFF', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill={color} transform="rotate(135 12 12)" />
  </Svg>
);

// ─── Pulsating Wavebar Animation for Real-Time Call Audio ────────────────────

const WaveBar = ({ delay, color = '#6C4EF5' }: { delay: number; color?: string }) => {
  const scaleY = useSharedValue(1);

  useEffect(() => {
    scaleY.value = withRepeat(
      withSequence(
        withTiming(2.2, { duration: 350 + delay }),
        withTiming(0.4, { duration: 250 + delay })
      ),
      -1,
      true
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
  }));

  return (
    <Animated.View
      className="w-[3px] h-5 rounded-full mx-[2px]"
      style={[{ backgroundColor: color }, animatedStyle]}
    />
  );
};

export default function AudioLessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const completedLessonIds = useLanguageStore((s) => s.completedLessonIds);
  const completeLesson = useLanguageStore((s) => s.completeLesson);

  const lesson = getLessonById(id ?? '');
  
  if (!lesson) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0D132B' : '#FFFFFF' }}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-lg font-poppins-semibold text-[#0D132B] dark:text-white mb-4">
            Lesson not found
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="px-6 py-3 bg-[#6C4EF5] rounded-xl"
          >
            <Text className="text-white font-poppins-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const unit = getUnitById(lesson.unitId);
  const language = unit ? getLanguageById(unit.languageId) : undefined;
  
  const allVocab = language ? getVocabularyForLanguage(language.id) : [];
  const allPhrases = language ? getPhrasesForLanguage(language.id) : [];

  const expectedVocabItems = allVocab.filter((v) =>
    lesson.aiTeacherPrompt.expectedVocabulary.includes(v.id)
  );
  const expectedPhraseItems = allPhrases.filter((p) =>
    lesson.aiTeacherPrompt.expectedPhrases.includes(p.id)
  );

  // Clerk auth user details
  const { user } = useUser();
  const userId = user?.id || 'anon_user';
  const userName = user?.fullName || user?.username || 'Language Learner';

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [isMock, setIsMock] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // AI Agent States & Refs
  const [agentStatus, setAgentStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const [agentSessionId, setAgentSessionId] = useState<string | null>(null);
  const agentSessionIdRef = useRef<string | null>(null);

  // Initialize Stream Video Call
  useEffect(() => {
    let active = true;
    async function initStream() {
      try {
        // Register/create call server-side
        const { callId, apiKey, isPlaceholder } = await createStreamCall(
          userId,
          lesson!.id,
          language?.id || 'en'
        );

        if (isPlaceholder) {
          if (active) {
            setIsMock(true);
            setInitLoading(false);
            setAgentStatus('connected');
          }
          return;
        }

        // Fetch client token
        const { token } = await fetchStreamToken(userId);

        // Get StreamVideoClient
        const streamClient = getStreamClient(apiKey, userId, token, userName);
        const streamCall = streamClient.call('audio_room', callId);
        
        await streamCall.join({
          create: true,
          data: {
            members: [
              { user_id: userId, role: 'user' },
              { user_id: 'ai-teacher', role: 'admin' }
            ],
          },
        });
        await streamCall.camera.disable();

        if (active) {
          setClient(streamClient);
          setCall(streamCall);
          setIsMock(false);
          setInitLoading(false);

          // Start the AI Agent session
          setAgentStatus('connecting');
          const startUrl = getApiUrl('/api/agent/start');
          fetch(startUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callId, callType: 'audio_room' }),
          })
            .then(async (res) => {
              if (!res.ok) throw new Error(`Agent start HTTP error: ${res.status}`);
              const data = await res.json();
              if (data && data.session_id) {
                setAgentSessionId(data.session_id);
                agentSessionIdRef.current = data.session_id;
                console.log('Agent session started successfully:', data.session_id);
              } else {
                throw new Error('Start agent response did not return session_id');
              }
            })
            .catch((agentErr) => {
              console.warn('Failed to start agent session:', agentErr);
              setAgentStatus('failed');
            });
        }
      } catch (err) {
        console.log('Stream Video init failed, using simulated call fallback:', err);
        if (active) {
          setIsMock(true);
          setInitLoading(false);
          setAgentStatus('connected');
        }
      }
    }

    initStream();

    return () => {
      active = false;
      if (call) {
        call.leave().catch((err: any) => console.warn('Error leaving call on cleanup:', err));
      }
    };
  }, [userId, lesson!.id, language?.id]);

  // Clean up client and agent session on unmount
  useEffect(() => {
    return () => {
      const sessionId = agentSessionIdRef.current;
      if (sessionId && lesson) {
        const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
        const sanitizedLessonId = lesson.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const rawCallId = `lesson_${sanitizedLessonId}_${sanitizedUserId}`;
        const callId = rawCallId.substring(0, 64);
        
        const stopUrl = getApiUrl('/api/agent/stop');
        fetch(stopUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId, sessionId }),
        }).catch((err) => console.warn('Error stopping agent on unmount:', err));
      }
      resetStreamClient().catch((err) => console.warn('Error resetting stream client:', err));
    };
  }, [userId, lesson!.id]);

  const handleFinishLesson = () => {
    const isCompleted = completedLessonIds.includes(lesson!.id);
    if (!isCompleted) {
      completeLesson(lesson!.id, lesson!.xpReward);
    }
    
    posthog.capture('audio_lesson_completed', {
      lesson_id: lesson!.id,
      xp_reward: lesson!.xpReward,
      language: language?.name || 'unknown',
    });

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/learn');
    }
  };

  if (initLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0D132B' : '#FFFFFF' }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View className="flex-1 items-center justify-center p-6 bg-[#EAE8F7] dark:bg-[#15192E]">
          <Text className="text-lg font-poppins-semibold text-[#0D132B] dark:text-white mb-4">
            Starting AI Audio Call...
          </Text>
          <View className="flex-row items-center justify-center h-4">
            <WaveBar delay={0} />
            <WaveBar delay={80} />
            <WaveBar delay={160} />
            <WaveBar delay={240} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isMock || !client || !call || !StreamVideo || !StreamCall) {
    return (
      <AudioLessonScreenMockContent
        lesson={lesson}
        language={language}
        expectedVocabItems={expectedVocabItems}
        expectedPhraseItems={expectedPhraseItems}
        handleFinishLesson={handleFinishLesson}
        showCompletionModal={showCompletionModal}
        setShowCompletionModal={setShowCompletionModal}
      />
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <AudioLessonScreenStreamContent
          lesson={lesson}
          language={language}
          expectedVocabItems={expectedVocabItems}
          expectedPhraseItems={expectedPhraseItems}
          handleFinishLesson={handleFinishLesson}
          showCompletionModal={showCompletionModal}
          setShowCompletionModal={setShowCompletionModal}
          userId={userId}
          agentStatus={agentStatus}
          setAgentStatus={setAgentStatus}
          agentSessionId={agentSessionId}
          setAgentSessionId={setAgentSessionId}
          agentSessionIdRef={agentSessionIdRef}
        />
      </StreamCall>
    </StreamVideo>
  );
}

// ─── Stream Active Call Wrapper ──────────────────────────────────────────────
function AudioLessonScreenStreamContent({
  lesson,
  language,
  expectedVocabItems,
  expectedPhraseItems,
  handleFinishLesson,
  showCompletionModal,
  setShowCompletionModal,
  userId,
  agentStatus,
  setAgentStatus,
  agentSessionId,
  setAgentSessionId,
  agentSessionIdRef,
}: {
  lesson: any;
  language: any;
  expectedVocabItems: any[];
  expectedPhraseItems: any[];
  handleFinishLesson: () => void;
  showCompletionModal: boolean;
  setShowCompletionModal: (show: boolean) => void;
  userId: string;
  agentStatus: 'idle' | 'connecting' | 'connected' | 'failed';
  setAgentStatus: (status: 'idle' | 'connecting' | 'connected' | 'failed') => void;
  agentSessionId: string | null;
  setAgentSessionId: (id: string | null) => void;
  agentSessionIdRef: React.MutableRefObject<string | null>;
}) {
  const call = useCall();
  const { useCallCallingState, useMicrophoneState, useParticipants, useCallClosedCaptions } = useCallStateHooks();
  
  const callingState = useCallCallingState();
  const { microphone, isMute } = useMicrophoneState();
  const participants = useParticipants ? useParticipants() : [];
  const rawCaptions: any[] = useCallClosedCaptions ? useCallClosedCaptions() : [];

  const isConnecting = callingState === CallingState.JOINING || callingState === CallingState.RECONNECTING;

  const isAgentInCall = participants.some(
    (p: any) => p.userId === 'ai-teacher' || p.user?.id === 'ai-teacher'
  );

  // Convert Stream captions to our LiveCaption format
  const liveCaptions: LiveCaption[] = useMemo(() => {
    return rawCaptions.map((c: any) => ({
      id: c.id || `${c.start_time}-${c.speaker_id}`,
      speakerId: c.speaker_id || 'user',
      speakerName: c.speaker_id === 'ai-teacher' ? 'AI Teacher' : 'You',
      text: c.text || '',
      isAI: c.speaker_id === 'ai-teacher',
      timestamp: c.start_time ? new Date(c.start_time).getTime() : Date.now(),
    }));
  }, [rawCaptions]);

  useEffect(() => {
    if (isAgentInCall && agentStatus === 'connecting') {
      setAgentStatus('connected');
    } else if (!isAgentInCall && agentStatus === 'connected') {
      setAgentStatus('connecting');
    }
  }, [isAgentInCall, agentStatus]);

  // Start closed captions when call is joined
  useEffect(() => {
    if (callingState === CallingState.JOINED && call) {
      call.startClosedCaptions().catch((err: any) => {
        console.warn('Failed to start closed captions:', err);
      });
    }
    return () => {
      if (call && callingState === CallingState.JOINED) {
        call.stopClosedCaptions().catch((err: any) => {
          console.warn('Failed to stop closed captions on unmount:', err);
        });
      }
    };
  }, [callingState === CallingState.JOINED]);

  let connectionStatusText = 'Connecting';
  if (callingState === CallingState.JOINED) {
    connectionStatusText = 'Online';
  } else if (callingState === CallingState.JOINING || callingState === CallingState.RECONNECTING) {
    connectionStatusText = 'Connecting';
  } else if (callingState === CallingState.RECONNECTING_FAILED || callingState === CallingState.OFFLINE) {
    connectionStatusText = 'Error';
  } else if (callingState === CallingState.LEFT) {
    connectionStatusText = 'Ended';
  }

  const handleToggleMic = async () => {
    try {
      await microphone.toggle();
    } catch (e) {
      console.warn('Failed to toggle mic:', e);
    }
  };

  const handleEndCall = async () => {
    // Stop captions first
    try {
      if (call) await call.stopClosedCaptions();
    } catch (e) {
      console.warn('Failed to stop captions on end call:', e);
    }

    try {
      await call?.leave();
    } catch (e) {
      console.warn('Failed to end call:', e);
    }

    if (agentSessionId) {
      const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const sanitizedLessonId = lesson.id.replace(/[^a-zA-Z0-9_-]/g, '_');
      const rawCallId = `lesson_${sanitizedLessonId}_${sanitizedUserId}`;
      const callId = rawCallId.substring(0, 64);
      
      const stopUrl = getApiUrl('/api/agent/stop');
      fetch(stopUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, sessionId: agentSessionId }),
      })
        .then(() => {
          setAgentSessionId(null);
          agentSessionIdRef.current = null;
        })
        .catch((err) => console.warn('Failed to stop agent on end call:', err));
    }
    
    setAgentStatus('idle');
    setShowCompletionModal(true);
  };

  return (
    <AudioLessonScreenContent
      lesson={lesson}
      language={language}
      expectedVocabItems={expectedVocabItems}
      expectedPhraseItems={expectedPhraseItems}
      isConnecting={isConnecting}
      isMuted={isMute}
      onToggleMic={handleToggleMic}
      onEndCall={handleEndCall}
      connectionStatusText={connectionStatusText}
      agentStatus={agentStatus}
      liveCaptions={liveCaptions}
      showCompletionModal={showCompletionModal}
      setShowCompletionModal={setShowCompletionModal}
      handleFinishLesson={handleFinishLesson}
    />
  );
}

// ─── Simulation Mock Call Wrapper ───────────────────────────────────────────
function AudioLessonScreenMockContent({
  lesson,
  language,
  expectedVocabItems,
  expectedPhraseItems,
  handleFinishLesson,
  showCompletionModal,
  setShowCompletionModal,
}: {
  lesson: any;
  language: any;
  expectedVocabItems: any[];
  expectedPhraseItems: any[];
  handleFinishLesson: () => void;
  showCompletionModal: boolean;
  setShowCompletionModal: (show: boolean) => void;
}) {
  const [agentStatus, setAgentStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [mockCaptions, setMockCaptions] = useState<LiveCaption[]>([]);
  const captionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simulate the agent connecting after 1.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      setAgentStatus('connected');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Generate simulated captions that rotate every few seconds
  const mockCaptionScript: LiveCaption[] = useMemo(() => [
    { id: 'mc1', speakerId: 'ai-teacher', speakerName: 'AI Teacher', text: `¡Hola! Bienvenido a la lección de hoy. I'm your AI language teacher!`, isAI: true, timestamp: 0 },
    { id: 'mc2', speakerId: 'user', speakerName: 'You', text: 'Hello! I am ready to learn.', isAI: false, timestamp: 0 },
    { id: 'mc3', speakerId: 'ai-teacher', speakerName: 'AI Teacher', text: lesson?.aiTeacherPrompt?.scenario ? `Let's practice: ${lesson.aiTeacherPrompt.scenario}` : 'Great! Let us practice together.', isAI: true, timestamp: 0 },
    { id: 'mc4', speakerId: 'user', speakerName: 'You', text: 'Can you repeat that please?', isAI: false, timestamp: 0 },
    { id: 'mc5', speakerId: 'ai-teacher', speakerName: 'AI Teacher', text: 'Of course! Try saying the phrase slowly after me.', isAI: true, timestamp: 0 },
  ], [lesson]);

  useEffect(() => {
    if (agentStatus !== 'connected') return;

    let idx = 0;
    const cycle = () => {
      const caption = { ...mockCaptionScript[idx % mockCaptionScript.length], id: `mc${Date.now()}`, timestamp: Date.now() };
      setMockCaptions([caption]);
      idx++;
      captionTimerRef.current = setTimeout(cycle, 3500);
    };

    captionTimerRef.current = setTimeout(cycle, 800);
    return () => {
      if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
    };
  }, [agentStatus]);

  return (
    <AudioLessonScreenContent
      lesson={lesson}
      language={language}
      expectedVocabItems={expectedVocabItems}
      expectedPhraseItems={expectedPhraseItems}
      isConnecting={agentStatus === 'connecting'}
      isMuted={isMuted}
      onToggleMic={() => setIsMuted(!isMuted)}
      onEndCall={() => setShowCompletionModal(true)}
      connectionStatusText={agentStatus === 'connecting' ? 'Connecting' : 'Online'}
      agentStatus={agentStatus}
      liveCaptions={mockCaptions}
      isMock={true}
      showCompletionModal={showCompletionModal}
      setShowCompletionModal={setShowCompletionModal}
      handleFinishLesson={handleFinishLesson}
    />
  );
}

// ─── Live Captions Overlay Component ─────────────────────────────────────────
function LiveCaptionsOverlay({ captions, isDark, userId }: { captions: LiveCaption[]; isDark: boolean; userId?: string }) {
  const captionsEndRef = useRef<ScrollView>(null);

  // Keep only the last 3 captions to avoid clutter
  const visibleCaptions = captions.slice(-3);

  useEffect(() => {
    // Auto-scroll to latest caption
    captionsEndRef.current?.scrollToEnd({ animated: true });
  }, [captions.length]);

  if (visibleCaptions.length === 0) return null;

  return (
    <View className="absolute bottom-[108px] left-4 right-4 z-20">
      <ScrollView
        ref={captionsEndRef}
        style={{ maxHeight: 180 }}
        contentContainerStyle={{ paddingBottom: 4 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {visibleCaptions.map((caption, index) => (
          <Animated.View
            key={caption.id}
            entering={FadeInDown.duration(250).springify()}
            exiting={FadeOutDown.duration(200)}
            style={{
              marginBottom: 6,
              alignSelf: caption.isAI ? 'flex-start' : 'flex-end',
              maxWidth: '85%',
            }}
          >
            {/* Speaker label */}
            <Text
              style={{
                fontSize: 10,
                fontFamily: 'Poppins_600SemiBold',
                color: caption.isAI ? '#6C4EF5' : '#58CC02',
                marginBottom: 2,
                marginLeft: caption.isAI ? 6 : 0,
                marginRight: caption.isAI ? 0 : 6,
                textAlign: caption.isAI ? 'left' : 'right',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {caption.isAI ? '🤖 AI Teacher' : '🎙 You'}
            </Text>

            {/* Caption bubble */}
            <View
              style={{
                backgroundColor: caption.isAI
                  ? isDark ? 'rgba(108,78,245,0.18)' : 'rgba(108,78,245,0.12)'
                  : isDark ? 'rgba(88,204,2,0.18)' : 'rgba(88,204,2,0.12)',
                borderWidth: 1,
                borderColor: caption.isAI
                  ? isDark ? 'rgba(108,78,245,0.45)' : 'rgba(108,78,245,0.3)'
                  : isDark ? 'rgba(88,204,2,0.45)' : 'rgba(88,204,2,0.3)',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderTopLeftRadius: caption.isAI ? 4 : 16,
                borderTopRightRadius: caption.isAI ? 16 : 4,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'Poppins_500Medium',
                  color: isDark ? '#FFFFFF' : '#0D132B',
                  lineHeight: 22,
                }}
              >
                {caption.text}
              </Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Presentational Content View ─────────────────────────────────────────────
function AudioLessonScreenContent({
  lesson,
  language,
  expectedVocabItems,
  expectedPhraseItems,
  isConnecting,
  isMuted,
  onToggleMic,
  onEndCall,
  connectionStatusText,
  agentStatus,
  liveCaptions = [],
  isMock = false,
  showCompletionModal,
  setShowCompletionModal,
  handleFinishLesson,
}: {
  lesson: any;
  language: any;
  expectedVocabItems: any[];
  expectedPhraseItems: any[];
  isConnecting: boolean;
  isMuted: boolean;
  onToggleMic: () => void;
  onEndCall: () => void;
  connectionStatusText: string;
  agentStatus: 'idle' | 'connecting' | 'connected' | 'failed';
  liveCaptions?: LiveCaption[];
  isMock?: boolean;
  showCompletionModal: boolean;
  setShowCompletionModal: (show: boolean) => void;
  handleFinishLesson: () => void;
}) {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // States
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [timeLeft, setTimeLeft] = useState(12 * 60); // 12 minutes countdown

  // Dynamic dialogue simulation generator
  const dialogueSteps = useMemo(() => {
    if (!lesson || !language) return [];
    
    const langId = language.id;
    const steps = [];

    // Step 0: Welcome
    let welcomeText = `Welcome!`;
    if (langId === 'es') {
      welcomeText = `¡Hola! Bienvenido. Comencemos la lección: ${lesson.title}.`;
    } else if (langId === 'fr') {
      welcomeText = `Bonjour ! Bienvenue. Commençons la leçon : ${lesson.title}.`;
    } else if (langId === 'ja') {
      welcomeText = `こんにちは！ようこそ。レッスンを始めましょう：${lesson.title}。`;
    } else if (langId === 'ko') {
      welcomeText = `안녕하세요! 환영합니다. 레슨을 시작해 볼까요: ${lesson.title}。`;
    } else if (langId === 'de') {
      welcomeText = `Hallo! Willkommen. Lass uns mit der Lektion beginnen: ${lesson.title}.`;
    } else if (langId === 'zh') {
      welcomeText = `你好！欢迎。让我们开始今天的课程：${lesson.title}。`;
    }

    steps.push({
      teacher: welcomeText,
      translation: `Hello! I'm ${lesson.aiTeacherPrompt.persona.split(',')[0].replace('You are ', '')}. Let's start the lesson: ${lesson.title}.`,
      scores: { speaking: 'Good', pronunciation: 'Good', grammar: 'Good' }
    });

    // Step 1: Scenario
    let scenarioText = `Let's practice in this scenario: ${lesson.aiTeacherPrompt.scenario}`;
    if (langId === 'es') {
      scenarioText = `Estamos en: ${lesson.aiTeacherPrompt.scenario.replace('.', '')}. ¿Estás listo para practicar?`;
    } else if (langId === 'fr') {
      scenarioText = `Nous sommes dans le scénario : ${lesson.aiTeacherPrompt.scenario.replace('.', '')}. Êtes-vous prêt ?`;
    } else if (langId === 'ja') {
      scenarioText = `ロケーションは：${lesson.aiTeacherPrompt.scenario.replace('.', '')}。準備はいいですか？`;
    } else if (langId === 'ko') {
      scenarioText = `우리는 지금 ${lesson.aiTeacherPrompt.scenario.replace('.', '')}에 있습니다. 시작할까요?`;
    } else if (langId === 'de') {
      scenarioText = `Wir sind hier: ${lesson.aiTeacherPrompt.scenario.replace('.', '')}. Bist du bereit?`;
    } else if (langId === 'zh') {
      scenarioText = `我们在情境中：${lesson.aiTeacherPrompt.scenario.replace('.', '')}。准备好了吗？`;
    }

    steps.push({
      teacher: scenarioText,
      translation: `We are set up in the lesson scenario: ${lesson.aiTeacherPrompt.scenario}. Ready to practice?`,
      scores: { speaking: 'Great', pronunciation: 'Good', grammar: 'Great' }
    });

    // Step 2: Vocabulary
    if (expectedVocabItems.length > 0) {
      const vocab = expectedVocabItems[0];
      let vocabText = `Practice pronouncing: "${vocab.word}".`;
      if (langId === 'es') {
        vocabText = `Practica pronunciar: "${vocab.word}" (${vocab.pronunciation}). Significa "${vocab.translation}".`;
      } else if (langId === 'fr') {
        vocabText = `Prononcez le mot : "${vocab.word}" (${vocab.pronunciation}). Cela signifie "${vocab.translation}".`;
      } else if (langId === 'ja') {
        vocabText = `発音してみましょう：「${vocab.word}」 (${vocab.pronunciation})。意味は「${vocab.translation}」です。`;
      } else if (langId === 'ko') {
        vocabText = `발음 연습입니다: "${vocab.word}" (${vocab.pronunciation}). 뜻은 "${vocab.translation}"입니다.`;
      } else if (langId === 'de') {
        vocabText = `Sprechen Sie das Wort aus: "${vocab.word}" (${vocab.pronunciation}). Es bedeutet "${vocab.translation}".`;
      } else if (langId === 'zh') {
        vocabText = `练习发音这个单词："${vocab.word}" (${vocab.pronunciation})。意思是 "${vocab.translation}"。`;
      }

      steps.push({
        teacher: vocabText,
        translation: `Let's practice the vocabulary word: "${vocab.word}", which means "${vocab.translation}".`,
        scores: { speaking: 'Excellent', pronunciation: 'Great', grammar: 'Great' }
      });
    }

    // Step 3: Phrase
    if (expectedPhraseItems.length > 0) {
      const phrase = expectedPhraseItems[0];
      let phraseText = `Let's try the key phrase: "${phrase.text}".`;
      if (langId === 'es') {
        phraseText = `¡Excelente! Repitamos la frase clave: "${phrase.text}".`;
      } else if (langId === 'fr') {
        phraseText = `Excellent ! Répétons la phrase clé : "${phrase.text}".`;
      } else if (langId === 'ja') {
        phraseText = `素晴らしい！キーフレーズを繰り返し練習しましょう：「${phrase.text}」。`;
      } else if (langId === 'ko') {
        phraseText = `훌륭해요! 이제 이 핵심 문장을 읽어 봐요: "${phrase.text}".`;
      } else if (langId === 'de') {
        phraseText = `Sehr gut! Lass uns den Schlüsselsatz wiederholen: "${phrase.text}".`;
      } else if (langId === 'zh') {
        phraseText = `非常棒！让我们一起念核心句子："${phrase.text}"。`;
      }

      steps.push({
        teacher: phraseText,
        translation: `Excellent! Let's repeat the key phrase: "${phrase.translation}".`,
        scores: { speaking: 'Excellent', pronunciation: 'Great', grammar: 'Excellent' }
      });
    }

    // Step 4: Completion wrap-up
    let wrapText = `Great job completing the audio lesson goals!`;
    if (langId === 'es') {
      wrapText = `¡Felicidades! Has completado todos los objetivos de hoy. ¡Lo has hecho de maravilla!`;
    } else if (langId === 'fr') {
      wrapText = `Félicitations ! Vous avez complété tous les objectifs du jour. Excellent travail !`;
    } else if (langId === 'ja') {
      wrapText = `おめでとうございます！今日の目標をすべて達成しました。本当によくできました！`;
    } else if (langId === 'ko') {
      wrapText = `축하합니다! 오늘의 학습 목표를 완벽하게 마치셨습니다. 대단해요!`;
    } else if (langId === 'de') {
      wrapText = `Herzlichen Glückwunsch! Du hast alle heutigen Ziele erreicht. Das war erstklassig!`;
    } else if (langId === 'zh') {
      wrapText = `恭喜你！已完成今天的所有学习目标。做得很完美！`;
    }

    steps.push({
      teacher: wrapText,
      translation: `Congratulations! You have completed all today's objectives. You did wonderfully!`,
      scores: { speaking: 'Excellent', pronunciation: 'Excellent', grammar: 'Excellent' }
    });

    return steps;
  }, [lesson, language, expectedVocabItems, expectedPhraseItems]);

  const currentStep = dialogueSteps[activeStep] || {
    teacher: '...',
    translation: '...',
    scores: { speaking: 'Good', pronunciation: 'Good', grammar: 'Good' }
  };

  // Connecting finished trigger
  useEffect(() => {
    if (!isConnecting) {
      setIsPlayingAudio(true);
    }
  }, [isConnecting]);

  // Speaker Animation Timer
  useEffect(() => {
    if (isPlayingAudio) {
      const audioTimer = setTimeout(() => {
        setIsPlayingAudio(false);
      }, 4000);
      return () => clearTimeout(audioTimer);
    }
  }, [isPlayingAudio, activeStep]);

  // Timer Countdown
  useEffect(() => {
    if (isConnecting || showCompletionModal) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnecting, showCompletionModal]);

  const formattedMinutes = Math.floor(timeLeft / 60);

  const handleToggleSpeaker = () => {
    if (isConnecting) return;
    setIsPlayingAudio((prev) => !prev);
  };

  const handleMicButtonPress = () => {
    if (isConnecting || showCompletionModal) return;

    if (isMuted) {
      onToggleMic();
      if (isMock) {
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          if (activeStep < dialogueSteps.length - 1) {
            setActiveStep((prev) => prev + 1);
            setIsPlayingAudio(true);
          } else {
            onEndCall();
          }
        }, 2000);
      }
    } else {
      onToggleMic();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0D132B' : '#FFFFFF' }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ─── Header Navigation ────────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between px-6 py-4">
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="w-10 h-10 items-center justify-center rounded-full bg-neutral-surface dark:bg-[#1E2540] active:opacity-75"
        >
          <ChevronLeftIcon color={isDark ? '#FFFFFF' : '#0D132B'} />
        </Pressable>

        {/* Teacher Status */}
        <View className="flex-1 ml-4 justify-center">
          <Text className="text-xl font-poppins-bold text-[#0D132B] dark:text-white leading-tight">
            AI Teacher
          </Text>
          <View className="flex-row items-center mt-0.5">
            <View className={`w-2.5 h-2.5 rounded-full mr-2 ${
              agentStatus === 'connecting'
                ? 'bg-amber-400'
                : agentStatus === 'failed'
                ? 'bg-red-500'
                : agentStatus === 'connected'
                ? 'bg-[#58CC02]'
                : 'bg-gray-400'
            }`} />
            <Text className="text-[13px] font-poppins-semibold text-neutral-text-secondary dark:text-[#9CA3AF] capitalize">
              {agentStatus}
            </Text>
          </View>
        </View>

        {/* Top Actions */}
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => setIsCameraOn(!isCameraOn)}
            className="w-11 h-11 items-center justify-center rounded-full border border-neutral-border dark:border-[#1E2540] bg-white dark:bg-[#0D132B] active:opacity-80"
          >
            {isCameraOn ? (
              <VideoCameraFillIcon color="#6C4EF5" />
            ) : (
              <VideoCameraOutlineIcon color={isDark ? '#FFFFFF' : '#0D132B'} />
            )}
          </Pressable>

          <View className="w-11 h-11 items-center justify-center rounded-full bg-neutral-surface dark:bg-[#1E2540]">
            <Text className="text-[15px] font-poppins-bold text-[#0D132B] dark:text-white">
              {formattedMinutes}
            </Text>
          </View>

          <Pressable
            className="w-11 h-11 items-center justify-center rounded-full border border-neutral-border dark:border-[#1E2540] bg-white dark:bg-[#0D132B]"
            accessibilityLabel="AI Profile Information"
          >
            <ProfileOutlineIcon color={isDark ? '#FFFFFF' : '#0D132B'} />
          </Pressable>
        </View>
      </View>

      {/* ─── Main Calling Canvas Container ───────────────────────────────────── */}
      <View className="flex-1 mx-6 mb-4 rounded-[32px] overflow-hidden bg-[#EAE8F7] dark:bg-[#15192E] relative border border-neutral-border dark:border-[#1E2540] shadow-sm">
        {/* Background Image */}
        <Image
          source={images.roomBlur}
          className="absolute inset-0 w-full h-full opacity-60 dark:opacity-40"
          contentFit="cover"
        />

        {/* Mascot */}
        <View className="absolute inset-0 items-center justify-center top-10">
          <Image
            source={images.mascotWelcome}
            className="w-[280px] h-[280px]"
            contentFit="contain"
          />
        </View>

        {/* User PIP Preview */}
        {isCameraOn && (
          <View className="absolute top-4 right-4 w-28 h-36 rounded-2xl overflow-hidden border-2 border-white dark:border-[#2E375B] bg-neutral-surface shadow-md z-30">
            <Image
              source={images.userPip}
              className="w-full h-full"
              contentFit="cover"
            />
          </View>
        )}

        {/* Live Captions Overlay — Real-time captions from Stream SDK or simulation */}
        {!isConnecting && liveCaptions.length > 0 ? (
          <LiveCaptionsOverlay captions={liveCaptions} isDark={isDark} />
        ) : !isConnecting ? (
          /* Fallback Static Speech Bubble when no live captions yet */
          <View className="absolute bottom-[108px] left-4 right-4 z-20">
            <View className="bg-white dark:bg-[#1E2540] p-5 rounded-3xl shadow-lg border border-neutral-border dark:border-[#2E375B] relative">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-6">
                  {/* Teacher Sentence */}
                  <Text className="text-[17px] font-poppins-bold text-[#0D132B] dark:text-white leading-snug">
                    {currentStep.teacher}
                  </Text>

                  {/* Subtitle Translation */}
                  {showSubtitles && (
                    <Text className="text-sm font-poppins-medium text-neutral-text-secondary dark:text-[#9CA3AF] mt-2 border-t border-neutral-border dark:border-[#2E375B] pt-1.5 leading-normal">
                      {currentStep.translation}
                    </Text>
                  )}
                </View>

                {/* Speaker playback action / pulsating voice wave */}
                <Pressable
                  onPress={handleToggleSpeaker}
                  className="w-10 h-10 rounded-full bg-[#F4F2FF] dark:bg-[#2E375B] items-center justify-center active:opacity-75"
                >
                  {isPlayingAudio ? (
                    <View className="flex-row items-center h-4">
                      <WaveBar delay={0} />
                      <WaveBar delay={80} />
                      <WaveBar delay={160} />
                      <WaveBar delay={240} />
                    </View>
                  ) : (
                    <SpeakerIcon color="#6C4EF5" />
                  )}
                </Pressable>
              </View>

              {/* Speech bubble pointer tail */}
              <View
                className="absolute bottom-[-10px] right-[40px] w-5 h-5 bg-white dark:bg-[#1E2540] rotate-45 transform"
                style={{
                  borderBottomRightRadius: 4,
                  zIndex: -1,
                }}
              />
            </View>
          </View>
        ) : null}

        {/* Audio control panel */}
        <View className="absolute bottom-6 left-0 right-0 flex-row items-center justify-evenly px-4 z-20">
          {/* Camera Button */}
          <View className="items-center">
            <Pressable
              onPress={() => setIsCameraOn(!isCameraOn)}
              className={`w-14 h-14 rounded-full items-center justify-center active:opacity-85 shadow-sm ${
                isCameraOn ? 'bg-white' : 'bg-white/40'
              }`}
            >
              <VideoCameraOutlineIcon color={isCameraOn ? '#6C4EF5' : '#FFFFFF'} />
            </Pressable>
            <Text className="text-[11px] font-poppins-semibold text-white/80 dark:text-neutral-text-secondary mt-1.5">
              Camera
            </Text>
          </View>

          {/* Mic Button */}
          <View className="items-center">
            <Pressable
              onPress={handleMicButtonPress}
              className={`w-16 h-16 rounded-full items-center justify-center active:opacity-85 shadow-md ${
                isListening
                  ? 'bg-[#58CC02]'
                  : isMuted
                  ? 'bg-red-500'
                  : 'bg-white'
              }`}
            >
              {isListening ? (
                <View className="flex-row items-center h-4">
                  <WaveBar delay={0} color="#FFFFFF" />
                  <WaveBar delay={80} color="#FFFFFF" />
                  <WaveBar delay={160} color="#FFFFFF" />
                </View>
              ) : (
                <MicIcon color={isMuted ? '#FFFFFF' : '#0D132B'} muted={isMuted} />
              )}
            </Pressable>
            <Text className="text-[11px] font-poppins-semibold text-white/80 dark:text-neutral-text-secondary mt-1.5">
              {isListening ? 'Listening' : 'Mic'}
            </Text>
          </View>

          {/* Subtitles Toggle */}
          <View className="items-center">
            <Pressable
              onPress={() => setShowSubtitles(!showSubtitles)}
              className={`w-14 h-14 rounded-full items-center justify-center active:opacity-85 shadow-sm ${
                showSubtitles ? 'bg-white' : 'bg-white/40'
              }`}
            >
              <TranslateIcon color={showSubtitles ? '#6C4EF5' : '#FFFFFF'} />
            </Pressable>
            <Text className="text-[11px] font-poppins-semibold text-white/80 dark:text-neutral-text-secondary mt-1.5">
              Subtitles
            </Text>
          </View>

          {/* End Call Button */}
          <View className="items-center">
            <Pressable
              onPress={onEndCall}
              className="w-14 h-14 bg-red-500 rounded-full items-center justify-center active:opacity-85 shadow-sm"
            >
              <EndCallIcon />
            </Pressable>
            <Text className="text-[11px] font-poppins-semibold text-white/80 dark:text-neutral-text-secondary mt-1.5">
              End Call
            </Text>
          </View>
        </View>
      </View>

      {/* ─── Feedback Indicator Panel ───────────────────────────────────────── */}
      <View className="px-6 pb-6">
        <View className="flex-row justify-between p-5 bg-white dark:bg-[#161F3D] rounded-[24px] border border-neutral-border dark:border-[#1E2540] shadow-sm">
          {/* Speaking Score */}
          <View className="flex-1 items-center border-r border-neutral-border dark:border-[#1E2540]">
            <Text className="text-xs font-poppins-semibold text-neutral-text-secondary dark:text-[#9CA3AF] mb-1">
              Speaking
            </Text>
            <Text className="text-[15px] font-poppins-bold text-[#58CC02]">
              {isConnecting ? 'Good' : currentStep.scores.speaking}
            </Text>
          </View>

          {/* Pronunciation Score */}
          <View className="flex-1 items-center border-r border-neutral-border dark:border-[#1E2540]">
            <Text className="text-xs font-poppins-semibold text-neutral-text-secondary dark:text-[#9CA3AF] mb-1">
              Pronunciation
            </Text>
            <Text className="text-[15px] font-poppins-bold text-[#3B82F6]">
              {isConnecting ? 'Good' : currentStep.scores.pronunciation}
            </Text>
          </View>

          {/* Grammar Score */}
          <View className="flex-1 items-center">
            <Text className="text-xs font-poppins-semibold text-neutral-text-secondary dark:text-[#9CA3AF] mb-1">
              Grammar
            </Text>
            <Text className="text-[15px] font-poppins-bold text-[#8B5CF6]">
              {isConnecting ? 'Good' : currentStep.scores.grammar}
            </Text>
          </View>
        </View>
      </View>

      {/* ─── Call Completed Congratulations Modal ───────────────────────────── */}
      {showCompletionModal && (
        <View className="absolute inset-0 bg-[#0D132B]/85 z-50 items-center justify-center p-6">
          <View className="bg-white dark:bg-[#161F3D] rounded-3xl w-full max-w-sm p-6 items-center border border-neutral-border dark:border-[#1E2540] shadow-2xl">
            {/* Mascot Celebrating */}
            <Image
              source={images.mascotWelcome}
              className="w-32 h-32 mb-4"
              contentFit="contain"
            />

            <Text className="text-2xl font-poppins-bold text-[#0D132B] dark:text-white text-center mb-1">
              Lesson Complete!
            </Text>

            <Text className="text-sm font-poppins text-neutral-text-secondary dark:text-[#9CA3AF] text-center mb-6 px-4">
              You successfully finished Lesson {lesson.number}: {lesson.title}
            </Text>

            {/* Rewards Card */}
            <View className="w-full bg-neutral-surface dark:bg-[#1E2540] rounded-2xl p-4 mb-6 border border-neutral-border dark:border-[#2E375B]">
              <View className="flex-row items-center justify-between mb-3.5">
                <View className="flex-row items-center gap-2">
                  <SymbolView
                    tintColor="#FF8A00"
                    name={{ ios: 'bolt.fill', android: 'flash_on', web: 'flash_on' } as any}
                    size={18}
                  />
                  <Text className="text-sm font-poppins-semibold text-[#0D132B] dark:text-white">
                    XP Reward
                  </Text>
                </View>
                <Text className="text-[17px] font-poppins-bold text-[#FF8A00]">
                  +{lesson.xpReward} XP
                </Text>
              </View>

              <View className="flex-row items-center justify-between mb-3.5">
                <View className="flex-row items-center gap-2">
                  <SymbolView
                    tintColor="#58CC02"
                    name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' } as any}
                    size={18}
                  />
                  <Text className="text-sm font-poppins-semibold text-[#0D132B] dark:text-white">
                    Accuracy
                  </Text>
                </View>
                <Text className="text-[17px] font-poppins-bold text-[#58CC02]">
                  100%
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <SymbolView
                    tintColor="#EF4444"
                    name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'flame.fill' } as any}
                    size={18}
                  />
                  <Text className="text-sm font-poppins-semibold text-[#0D132B] dark:text-white">
                    Streak Saved
                  </Text>
                </View>
                <Text className="text-[17px] font-poppins-bold text-[#EF4444]">
                  Active
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleFinishLesson}
              className="w-full py-4 bg-[#6C4EF5] dark:bg-[#5B3BF6] rounded-2xl items-center justify-center shadow-lg shadow-[#6C4EF5]/20 active:opacity-90"
            >
              <Text className="text-white font-poppins-bold text-[17px]">
                Continue
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
