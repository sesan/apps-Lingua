export interface Language {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
  accentColor: string;
}

export interface Unit {
  id: string;
  languageId: string;
  number: number;
  title: string;
  description: string;
  accentColor: string;
}

export interface Vocabulary {
  id: string;
  languageId: string;
  word: string;
  translation: string;
  pronunciation: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface Phrase {
  id: string;
  languageId: string;
  text: string;
  translation: string;
  pronunciation: string;
  context?: string;
  exampleScenario?: string;
  audioUrl?: string;
}

export interface AITeacherPrompt {
  persona: string;
  scenario: string;
  instructions: string;
  expectedVocabulary: string[]; // vocab IDs
  expectedPhrases: string[]; // phrase IDs
}

export type ActivityType =
  | 'vocabulary'
  | 'phrase'
  | 'matching'
  | 'multiple-choice'
  | 'speaking'
  | 'listening';

export interface BaseActivity {
  id: string;
  lessonId: string;
  type: ActivityType;
  title: string;
  instruction: string;
}

export interface VocabularyActivity extends BaseActivity {
  type: 'vocabulary';
  vocabId: string;
}

export interface PhraseActivity extends BaseActivity {
  type: 'phrase';
  phraseId: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface MatchingActivity extends BaseActivity {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface MultipleChoiceActivity extends BaseActivity {
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface SpeakingActivity extends BaseActivity {
  type: 'speaking';
  promptText: string;
  acceptableAnswers: string[];
}

export interface ListeningActivity extends BaseActivity {
  type: 'listening';
  audioUrl?: string;
  transcript: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export type Activity =
  | VocabularyActivity
  | PhraseActivity
  | MatchingActivity
  | MultipleChoiceActivity
  | SpeakingActivity
  | ListeningActivity;

export interface Lesson {
  id: string;
  unitId: string;
  number: number;
  title: string;
  description: string;
  icon: string; // SF symbol or styling name
  xpReward: number;
  goals: string[]; // Lesson goals/objectives
  aiTeacherPrompt: AITeacherPrompt;
  activities: Activity[];
}
