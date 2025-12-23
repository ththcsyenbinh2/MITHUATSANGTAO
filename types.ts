
export enum TaskType {
  QUIZ = 'QUIZ',
  DRAG_IMAGE = 'DRAG_IMAGE',
  DRAG_TEXT = 'DRAG_TEXT',
  MATCHING = 'MATCHING',
  COLUMN_MATCHING = 'COLUMN_MATCHING'
}

export interface Question {
  id: string;
  type: TaskType;
  title: string;
  description?: string;
  image?: string;
  options?: string[]; // For QUIZ
  correctAnswer?: any;
  items?: any[]; // For Drag/Matching
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  image: string;
  progress: number;
  questions: Question[];
}

export interface UserState {
  name: string;
  points: number;
  level: string;
  role: 'student' | 'teacher';
}
