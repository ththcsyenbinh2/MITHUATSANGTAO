
import React from 'react';
import { LessonContent, InteractionType } from '../types';

interface Props {
  lesson: LessonContent;
  onSelect: (lesson: LessonContent) => void;
}

const LessonCard: React.FC<Props> = ({ lesson, onSelect }) => {
  const getTypeBadge = (type: InteractionType) => {
    const styles: Record<InteractionType, string> = {
      [InteractionType.QUIZ]: "bg-blue-100 text-blue-700",
      [InteractionType.MATCHING]: "bg-purple-100 text-purple-700",
      [InteractionType.IMAGE_DRAG]: "bg-orange-100 text-orange-700",
      [InteractionType.WORD_DRAG]: "bg-green-100 text-green-700",
      [InteractionType.PAIRING]: "bg-rose-100 text-rose-700",
    };
    
    const labels: Record<InteractionType, string> = {
      [InteractionType.QUIZ]: "Trắc nghiệm",
      [InteractionType.MATCHING]: "Ghép đôi",
      [InteractionType.IMAGE_DRAG]: "Kéo thả hình",
      [InteractionType.WORD_DRAG]: "Kéo thả từ",
      [InteractionType.PAIRING]: "Nối cột",
    };

    return (
      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  return (
    <div 
      onClick={() => onSelect(lesson)}
      className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
    >
      <div className="aspect-video w-full rounded-xl bg-gray-50 mb-4 overflow-hidden relative">
        {lesson.imageUrl ? (
          <img src={lesson.imageUrl} alt={lesson.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex justify-between items-start mb-2">
        {getTypeBadge(lesson.type)}
        <span className="text-[10px] text-gray-400">{new Date(lesson.createdAt).toLocaleDateString('vi-VN')}</span>
      </div>
      <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1">{lesson.title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2">{lesson.description}</p>
    </div>
  );
};

export default LessonCard;
