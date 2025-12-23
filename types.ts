
export enum InteractionType {
  QUIZ = 'QUIZ',
  IMAGE_DRAG = 'IMAGE_DRAG',
  WORD_DRAG = 'WORD_DRAG',
  MATCHING = 'MATCHING',
  PAIRING = 'PAIRING'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface DragDropItem {
  id: string;
  content: string;
  category: string;
}

export interface LessonContent {
  id: string;
  title: string;
  description: string;
  type: InteractionType;
  data: any; // Dynamic based on type
  imageUrl?: string;
  createdAt: number;
}

export interface AppState {
  apiKey: string;
  lessons: LessonContent[];
  currentLesson: LessonContent | null;
  isGenerating: boolean;
}
