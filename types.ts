export enum InteractionType {
  QUIZ = 'QUIZ',
  IMAGE_DRAG = 'IMAGE_DRAG', // Phân loại hình ảnh/thuật ngữ vào nhóm
  WORD_DRAG = 'WORD_DRAG',  // Sắp xếp từ vào câu/định nghĩa
  MATCHING = 'MATCHING',   // Ghép đôi (Cột A - Cột B)
  PAIRING = 'PAIRING'      // Nối cặp tương ứng
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface CategoryItem {
  id: string;
  content: string;
  correctCategory: string;
}

export interface CategorizationData {
  categories: string[];
  items: CategoryItem[];
}

export interface LessonContent {
  id: string;
  title: string;
  description: string;
  type: InteractionType;
  data: any; 
  imageUrl?: string;
  createdAt: number;
}

export interface AppState {
  apiKey: string;
  lessons: LessonContent[];
  currentLesson: LessonContent | null;
  isGenerating: boolean;
}
