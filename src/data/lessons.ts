import { Lesson, Vocabulary, Phrase, Unit, Language } from '../types/learning';
import { languages } from './languages';
import { units } from './units';

export const vocabulary: Vocabulary[] = [
  // Spanish
  {
    id: 'es-vocab-hola',
    languageId: 'es',
    word: 'Hola',
    translation: 'Hello',
    pronunciation: '/ˈola/',
    partOfSpeech: 'interjection',
    example: 'Hola, ¿cómo estás?',
    exampleTranslation: 'Hello, how are you?',
  },
  {
    id: 'es-vocab-gracias',
    languageId: 'es',
    word: 'Gracias',
    translation: 'Thank you',
    pronunciation: '/ˈɡɾasjas/',
    partOfSpeech: 'interjection',
    example: 'Muchas gracias por la comida.',
    exampleTranslation: 'Thank you very much for the food.',
  },
  {
    id: 'es-vocab-cafe',
    languageId: 'es',
    word: 'Café',
    translation: 'Coffee',
    pronunciation: '/kaˈfe/',
    partOfSpeech: 'noun, masculine',
    example: 'Quiero un café solo, por favor.',
    exampleTranslation: 'I want a black coffee, please.',
  },
  {
    id: 'es-vocab-leche',
    languageId: 'es',
    word: 'Leche',
    translation: 'Milk',
    pronunciation: '/ˈletʃe/',
    partOfSpeech: 'noun, feminine',
    example: '¿Tienes leche de almendras?',
    exampleTranslation: 'Do you have almond milk?',
  },

  // French
  {
    id: 'fr-vocab-bonjour',
    languageId: 'fr',
    word: 'Bonjour',
    translation: 'Hello / Good morning',
    pronunciation: '/bɔ̃ʒuʁ/',
    partOfSpeech: 'interjection',
    example: 'Bonjour, comment allez-vous?',
    exampleTranslation: 'Hello, how are you?',
  },
  {
    id: 'fr-vocab-merci',
    languageId: 'fr',
    word: 'Merci',
    translation: 'Thank you',
    pronunciation: '/mɛʁsi/',
    partOfSpeech: 'interjection',
    example: 'Merci beaucoup pour votre aide.',
    exampleTranslation: 'Thank you very much for your help.',
  },
  {
    id: 'fr-vocab-croissant',
    languageId: 'fr',
    word: 'Croissant',
    translation: 'Croissant',
    pronunciation: '/kʁwasɑ̃/',
    partOfSpeech: 'noun, masculine',
    example: 'Un croissant et un café, s’il vous plaît.',
    exampleTranslation: 'A croissant and a coffee, please.',
  },

  // Japanese
  {
    id: 'ja-vocab-konnichiwa',
    languageId: 'ja',
    word: 'こんにちは (Konnichiwa)',
    translation: 'Hello',
    pronunciation: '/konnitɕiwa/',
    partOfSpeech: 'interjection',
    example: '皆さん、こんにちは。',
    exampleTranslation: 'Hello, everyone.',
  },
  {
    id: 'ja-vocab-arigatou',
    languageId: 'ja',
    word: 'ありがとう (Arigatou)',
    translation: 'Thank you',
    pronunciation: '/aɾiɡatoː/',
    partOfSpeech: 'interjection',
    example: '手伝ってくれてありがとう。',
    exampleTranslation: 'Thank you for helping me.',
  },
  {
    id: 'ja-vocab-mizu',
    languageId: 'ja',
    word: '水 (Mizu)',
    translation: 'Water',
    pronunciation: '/mizɯ/',
    partOfSpeech: 'noun',
    example: 'お水をください。',
    exampleTranslation: 'Water, please.',
  },
];

export const phrases: Phrase[] = [
  // Spanish
  {
    id: 'es-phrase-como-estas',
    languageId: 'es',
    text: '¿Cómo estás?',
    translation: 'How are you?',
    pronunciation: '/ˈkomo esˈtas/',
    context: 'Informal greeting used among friends or peers.',
    exampleScenario: 'Greeting a classmate or coworker in the morning.',
  },
  {
    id: 'es-phrase-por-favor',
    languageId: 'es',
    text: 'Por favor',
    translation: 'Please',
    pronunciation: '/poɾ faˈβoɾ/',
    context: 'Polite request suffix/prefix.',
    exampleScenario: 'Asking for the bill or requesting assistance.',
  },
  {
    id: 'es-phrase-un-cafe',
    languageId: 'es',
    text: 'Un café, por favor',
    translation: 'A coffee, please',
    pronunciation: '/un kaˈfe poɾ faˈβoɾ/',
    context: 'Ordering coffee at a cafe.',
    exampleScenario: 'Speaking to a barista.',
  },

  // French
  {
    id: 'fr-phrase-comment-ca-va',
    languageId: 'fr',
    text: 'Comment ça va ?',
    translation: 'How’s it going?',
    pronunciation: '/kɔmɑ̃ sa va/',
    context: 'Informal and very common way to ask someone how they are doing.',
    exampleScenario: 'Greeting a close friend.',
  },
  {
    id: 'fr-phrase-sil-vous-plait',
    languageId: 'fr',
    text: 'S’il vous plaît',
    translation: 'Please (formal/plural)',
    pronunciation: '/sil vu plɛ/',
    context: 'Polite phrase to use in formal situations or with strangers.',
    exampleScenario: 'Ordering food in a restaurant.',
  },

  // Japanese
  {
    id: 'ja-phrase-hajimemashite',
    languageId: 'ja',
    text: 'はじめまして (Hajimemashite)',
    translation: 'Nice to meet you / How do you do',
    pronunciation: '/hadʑimemaɕite/',
    context: 'Used when meeting someone for the first time.',
    exampleScenario: 'Introducing yourself to a new colleague or business contact.',
  },
  {
    id: 'ja-phrase-kore-o-kudasai',
    languageId: 'ja',
    text: 'これをください (Kore o kudasai)',
    translation: 'This one, please',
    pronunciation: '/koɾe o kɯdasai/',
    context: 'Polite way to order or buy something by pointing at it.',
    exampleScenario: 'Ordering food from a menu or buying an item in a store.',
  },
];

export const lessons: Lesson[] = [
  // Spanish
  {
    id: 'es-u1-l1',
    unitId: 'es-unit-1',
    number: 1,
    title: 'Greetings & Basics',
    description: 'Start speaking immediately with essential greetings and introductions.',
    icon: 'hand.wave',
    xpReward: 10,
    goals: [
      'Greet people formally and informally',
      'Introduce yourself and state your name',
      'Respond to simple questions about your well-being',
    ],
    aiTeacherPrompt: {
      persona: 'You are Mateo, a warm, energetic, and patient Spanish teacher from Madrid, Spain.',
      scenario: 'A casual encounter in a sun-drenched public plaza in Madrid.',
      instructions: 'Start by greeting the user warmly: "¡Hola! ¿Cómo estás?". Ask them their name ("¿Cómo te llamas?"). Encourage them to use "Me llamo..." to reply. Provide gentle pronunciation corrections if needed.',
      expectedVocabulary: ['es-vocab-hola', 'es-vocab-gracias'],
      expectedPhrases: ['es-phrase-como-estas', 'es-phrase-por-favor'],
    },
    activities: [
      {
        id: 'es-u1-l1-act1',
        lessonId: 'es-u1-l1',
        type: 'vocabulary',
        title: 'Basic Greeting',
        instruction: 'Tap to listen to the pronunciation of "Hola".',
        vocabId: 'es-vocab-hola',
      },
      {
        id: 'es-u1-l1-act2',
        lessonId: 'es-u1-l1',
        type: 'phrase',
        title: 'Asking How Someone Is',
        instruction: 'Read the phrase and translation below.',
        phraseId: 'es-phrase-como-estas',
      },
      {
        id: 'es-u1-l1-act3',
        lessonId: 'es-u1-l1',
        type: 'multiple-choice',
        title: 'Check Your Understanding',
        instruction: 'Choose the correct English translation for the Spanish word.',
        question: 'What does "Gracias" mean?',
        options: ['Hello', 'Thank you', 'Goodbye', 'Please'],
        correctOptionIndex: 1,
      },
      {
        id: 'es-u1-l1-act4',
        lessonId: 'es-u1-l1',
        type: 'matching',
        title: 'Vocabulary Match',
        instruction: 'Match the Spanish terms with their English translations.',
        pairs: [
          { left: 'Hola', right: 'Hello' },
          { left: 'Gracias', right: 'Thank you' },
          { left: 'Por favor', right: 'Please' },
        ],
      },
      {
        id: 'es-u1-l1-act5',
        lessonId: 'es-u1-l1',
        type: 'speaking',
        title: 'Pronunciation Practice',
        instruction: 'Press the microphone icon and read the Spanish greeting aloud.',
        promptText: 'Hola, ¿cómo estás?',
        acceptableAnswers: ['hola como estas', 'hola, como estas', 'hola ¿cómo estás?'],
      },
    ],
  },
  {
    id: 'es-u1-l2',
    unitId: 'es-unit-1',
    number: 2,
    title: 'At the Café',
    description: 'Learn how to politely order a coffee and interact with a barista.',
    icon: 'cup.and.saucer',
    xpReward: 15,
    goals: [
      'Order coffee and other drinks politely',
      'Specify options like adding milk',
      'Understand common service-related expressions',
    ],
    aiTeacherPrompt: {
      persona: 'You are Sofia, a lively and supportive barista and Spanish tutor from Bogotá, Colombia.',
      scenario: 'The user walks into a bustling café in the heart of Bogotá. You are behind the counter.',
      instructions: 'Welcome the user: "¡Hola! Bienvenidos. ¿Qué te gustaría tomar hoy?". Guide them to order a beverage using "Quiero..." or "... por favor". Suggest options like milk ("¿Con leche?").',
      expectedVocabulary: ['es-vocab-cafe', 'es-vocab-leche', 'es-vocab-gracias'],
      expectedPhrases: ['es-phrase-por-favor', 'es-phrase-un-cafe'],
    },
    activities: [
      {
        id: 'es-u1-l2-act1',
        lessonId: 'es-u1-l2',
        type: 'vocabulary',
        title: 'Ordering Coffee',
        instruction: 'Listen and repeat the word for coffee.',
        vocabId: 'es-vocab-cafe',
      },
      {
        id: 'es-u1-l2-act2',
        lessonId: 'es-u1-l2',
        type: 'vocabulary',
        title: 'Adding Milk',
        instruction: 'Understand how to ask for milk.',
        vocabId: 'es-vocab-leche',
      },
      {
        id: 'es-u1-l2-act3',
        lessonId: 'es-u1-l2',
        type: 'phrase',
        title: 'Putting It Together',
        instruction: 'Learn how to form a polite ordering phrase.',
        phraseId: 'es-phrase-un-cafe',
      },
      {
        id: 'es-u1-l2-act4',
        lessonId: 'es-u1-l2',
        type: 'multiple-choice',
        title: 'Ordering Quiz',
        instruction: 'Select the most natural way to say "A coffee, please" in Spanish.',
        question: 'Which of the following orders a coffee politely?',
        options: ['Café gracias', 'Adiós café', 'Un café, por favor', 'Hola leche'],
        correctOptionIndex: 2,
      },
      {
        id: 'es-u1-l2-act5',
        lessonId: 'es-u1-l2',
        type: 'speaking',
        title: 'Speak to the Barista',
        instruction: 'Speak this order clearly into your device.',
        promptText: 'Un café con leche, por favor.',
        acceptableAnswers: ['un cafe con leche por favor', 'un café con leche por favor', 'cafe con leche por favor'],
      },
    ],
  },

  // French
  {
    id: 'fr-u1-l1',
    unitId: 'fr-unit-1',
    number: 1,
    title: 'Bonjour Paris!',
    description: 'Learn basic French greetings and the art of politeness.',
    icon: 'globe',
    xpReward: 10,
    goals: [
      'Greet others appropriately using Bonjour and Salut',
      'Ask others how they are doing',
      'Acknowledge hospitality with Merci',
    ],
    aiTeacherPrompt: {
      persona: 'You are Amélie, a polite, traditional, and encouraging French teacher from Paris, France.',
      scenario: 'A chance meeting at a quaint Parisian bookstore along the Seine.',
      instructions: 'Acknowledge the visitor: "Bonjour ! Comment ça va ?". Wait for their response. Encourage them to ask how you are doing in return ("Et vous ?"). Speak slowly with pristine standard pronunciation.',
      expectedVocabulary: ['fr-vocab-bonjour', 'fr-vocab-merci'],
      expectedPhrases: ['fr-phrase-comment-ca-va', 'fr-phrase-sil-vous-plait'],
    },
    activities: [
      {
        id: 'fr-u1-l1-act1',
        lessonId: 'fr-u1-l1',
        type: 'vocabulary',
        title: 'Greetings',
        instruction: 'Learn the primary French greeting.',
        vocabId: 'fr-vocab-bonjour',
      },
      {
        id: 'fr-u1-l1-act2',
        lessonId: 'fr-u1-l1',
        type: 'phrase',
        title: 'How is it going?',
        instruction: 'Study this common conversation starter.',
        phraseId: 'fr-phrase-comment-ca-va',
      },
      {
        id: 'fr-u1-l1-act3',
        lessonId: 'fr-u1-l1',
        type: 'multiple-choice',
        title: 'Expression Check',
        instruction: 'Identify the meaning of the word.',
        question: 'What does "Merci" mean in French?',
        options: ['Please', 'Thank you', 'Goodbye', 'Welcome'],
        correctOptionIndex: 1,
      },
      {
        id: 'fr-u1-l1-act4',
        lessonId: 'fr-u1-l1',
        type: 'matching',
        title: 'Connect the French Terms',
        instruction: 'Drag and match each expression to its translation.',
        pairs: [
          { left: 'Bonjour', right: 'Hello / Good morning' },
          { left: 'Merci', right: 'Thank you' },
          { left: 'S’il vous plaît', right: 'Please (formal)' },
        ],
      },
      {
        id: 'fr-u1-l1-act5',
        lessonId: 'fr-u1-l1',
        type: 'speaking',
        title: 'Nasal Sounds Practice',
        instruction: 'Say "Bonjour" and ask how they are doing in French.',
        promptText: 'Bonjour, comment ça va ?',
        acceptableAnswers: ['bonjour comment ca va', 'bonjour comment ça va'],
      },
    ],
  },

  // Japanese
  {
    id: 'ja-u1-l1',
    unitId: 'ja-unit-1',
    number: 1,
    title: 'First Steps in Tokyo',
    description: 'Introduce yourself politely and learn essential Japanese greetings.',
    icon: 'tram',
    xpReward: 10,
    goals: [
      'Perform self-introductions using Hajimemashite',
      'Greet people based on context',
      'Request items using Kudasai',
    ],
    aiTeacherPrompt: {
      persona: 'You are Kenji, a respectful, clear-speaking, and friendly Japanese instructor from Tokyo, Japan.',
      scenario: 'Meeting a traveler who just arrived at the Haneda Airport arrivals hall.',
      instructions: 'Welcome the traveler warmly: "Konnichiwa! Hajimemashite." Prompt them to introduce themselves. Prompt them to state their name followed by "desu". Tell them "Yoroshiku onegaishimasu".',
      expectedVocabulary: ['ja-vocab-konnichiwa', 'ja-vocab-arigatou'],
      expectedPhrases: ['ja-phrase-hajimemashite', 'ja-phrase-kore-o-kudasai'],
    },
    activities: [
      {
        id: 'ja-u1-l1-act1',
        lessonId: 'ja-u1-l1',
        type: 'vocabulary',
        title: 'Universal Greeting',
        instruction: 'Understand the general greeting for daytime.',
        vocabId: 'ja-vocab-konnichiwa',
      },
      {
        id: 'ja-u1-l1-act2',
        lessonId: 'ja-u1-l1',
        type: 'phrase',
        title: 'First Time Meeting',
        instruction: 'Learn how to open an introduction.',
        phraseId: 'ja-phrase-hajimemashite',
      },
      {
        id: 'ja-u1-l1-act3',
        lessonId: 'ja-u1-l1',
        type: 'multiple-choice',
        title: 'Meaning Check',
        instruction: 'Select the English translation for the Japanese greeting.',
        question: 'What is the meaning of "ありがとう (Arigatou)"?',
        options: ['Goodbye', 'Excuse me', 'Thank you', 'Please'],
        correctOptionIndex: 2,
      },
      {
        id: 'ja-u1-l1-act4',
        lessonId: 'ja-u1-l1',
        type: 'matching',
        title: 'Character Matching',
        instruction: 'Match the Japanese words with their meanings.',
        pairs: [
          { left: 'こんにちは', right: 'Hello' },
          { left: 'ありがとう', right: 'Thank you' },
          { left: 'はじめまして', right: 'Nice to meet you' },
        ],
      },
      {
        id: 'ja-u1-l1-act5',
        lessonId: 'ja-u1-l1',
        type: 'speaking',
        title: 'Self-Introduction',
        instruction: 'Introduce yourself politely in Japanese.',
        promptText: 'はじめまして',
        acceptableAnswers: ['hajimemashite', 'はじめまして'],
      },
    ],
  },
];

// Helper Functions
export const getUnitsForLanguage = (languageId: string): Unit[] => {
  return units.filter((unit) => unit.languageId === languageId);
};

export const getLessonsForUnit = (unitId: string): Lesson[] => {
  return lessons.filter((lesson) => lesson.unitId === unitId);
};

export const getVocabularyForLanguage = (languageId: string): Vocabulary[] => {
  return vocabulary.filter((vocab) => vocab.languageId === languageId);
};

export const getPhrasesForLanguage = (languageId: string): Phrase[] => {
  return phrases.filter((phrase) => phrase.languageId === languageId);
};

export const getLanguageById = (languageId: string): Language | undefined => {
  return languages.find((lang) => lang.id === languageId);
};

export const getUnitById = (unitId: string): Unit | undefined => {
  return units.find((unit) => unit.id === unitId);
};

export const getLessonById = (lessonId: string): Lesson | undefined => {
  return lessons.find((lesson) => lesson.id === lessonId);
};
