
import { TaskType, Lesson, Question } from './types';

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'Phối màu cơ bản',
    category: 'Lý thuyết màu sắc',
    image: 'https://picsum.photos/seed/art1/800/400',
    progress: 65,
    questions: [
      {
        id: 'q1',
        type: TaskType.QUIZ,
        title: 'Màu nào là màu bậc 1?',
        options: ['Xanh lá', 'Cam', 'Đỏ', 'Tím'],
        correctAnswer: 'Đỏ'
      },
      {
        id: 'q2',
        type: TaskType.DRAG_TEXT,
        title: 'Phân loại màu Nóng và Lạnh',
        description: 'Kéo các màu vào đúng nhóm của chúng.',
        items: [
          { id: '1', text: 'Đỏ', category: 'Nóng' },
          { id: '2', text: 'Xanh dương', category: 'Lạnh' },
          { id: '3', text: 'Vàng', category: 'Nóng' },
          { id: '4', text: 'Tím', category: 'Lạnh' }
        ],
        correctAnswer: { 'Nóng': ['Đỏ', 'Vàng'], 'Lạnh': ['Xanh dương', 'Tím'] }
      }
    ]
  },
  {
    id: 'l2',
    title: 'Tranh Dân Gian Đông Hồ',
    category: 'Văn hóa',
    image: 'https://picsum.photos/seed/art2/800/400',
    progress: 0,
    questions: [
      {
        id: 'q3',
        type: TaskType.MATCHING,
        title: 'Ghép tên tranh với ý nghĩa',
        items: [
          { id: 'a1', left: 'Đám cưới chuột', right: 'Chế giễu thói tham nhũng' },
          { id: 'a2', left: 'Em bé ôm gà', right: 'Cầu chúc sự sung túc' },
          { id: 'a3', left: 'Vinh hoa', right: 'Sự phú quý, tài lộc' }
        ]
      }
    ]
  }
];

export const AVATAR_URL = "https://lh3.googleusercontent.com/a/ACg8ocL_V-..." // Placeholder
