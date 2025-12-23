import React, { useState, useEffect } from 'react';
import { LessonContent, InteractionType, QuizQuestion, MatchingPair } from '../types';

interface Props {
  lesson: LessonContent;
  onBack: () => void;
}

const InteractivePlayer: React.FC<Props> = ({ lesson, onBack }) => {
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledData, setShuffledData] = useState<any>(null);
  const [userSelections, setUserSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    // Prepare data based on interaction type
    if (lesson.type === InteractionType.MATCHING || lesson.type === InteractionType.PAIRING) {
      const pairs = lesson.data as MatchingPair[];
      setShuffledData({
        left: [...pairs].sort(() => Math.random() - 0.5),
        right: [...pairs].sort(() => Math.random() - 0.5)
      });
    } else if (lesson.type === InteractionType.WORD_DRAG || lesson.type === InteractionType.IMAGE_DRAG) {
      setShuffledData({
        categories: lesson.data.categories,
        items: [...lesson.data.items].sort(() => Math.random() - 0.5)
      });
    }
  }, [lesson]);

  const handleQuizAnswer = (idx: number) => {
    const questions = lesson.data as QuizQuestion[];
    if (idx === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      setCompleted(true);
    }
  };

  const checkMatching = () => {
    // Simplified evaluation for matching/pairing
    setCompleted(true);
  };

  const renderQuiz = () => {
    const questions = lesson.data as QuizQuestion[];
    const q = questions[currentIndex];
    
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center">
          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Câu {currentIndex + 1} / {questions.length}
          </span>
          <h2 className="text-2xl font-bold mt-4 text-gray-900">{q.question}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleQuizAnswer(i)}
              className="p-6 text-left rounded-2xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all font-medium text-gray-700 group flex items-center"
            >
              <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-indigo-200 flex items-center justify-center mr-4 shrink-0 font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderMatching = () => {
    if (!shuffledData) return null;
    return (
      <div className="space-y-6">
        <p className="text-center text-gray-600 italic">Dạng bài: Nối cột hoặc Ghép các cặp tương ứng</p>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
             {shuffledData.left.map((p: any, i: number) => (
               <div key={i} className="p-4 bg-white border-2 border-indigo-100 rounded-xl shadow-sm text-center font-semibold text-indigo-700">
                 {p.left}
               </div>
             ))}
          </div>
          <div className="space-y-3">
             {shuffledData.right.map((p: any, i: number) => (
               <div key={i} className="p-4 bg-white border-2 border-dashed border-gray-200 rounded-xl shadow-sm text-center font-medium text-gray-600 hover:border-indigo-400 cursor-pointer active:scale-95 transition-all">
                 {p.right}
               </div>
             ))}
          </div>
        </div>
        <div className="mt-8 text-center">
           <button onClick={checkMatching} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold shadow-xl transition-all">Nộp bài</button>
        </div>
      </div>
    );
  };

  const renderCategorization = () => {
    if (!shuffledData) return null;
    return (
      <div className="space-y-8">
        <p className="text-center text-gray-600 italic">Dạng bài: Phân loại vào các nhóm đúng</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {shuffledData.categories.map((cat: string) => (
             <div key={cat} className="bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-2xl p-6 min-h-[150px]">
               <h4 className="text-center font-bold text-indigo-900 mb-4 border-b border-indigo-100 pb-2">{cat}</h4>
               <div className="flex flex-wrap gap-2">
                 {Object.entries(userSelections)
                   .filter(([itemId, targetCat]) => targetCat === cat)
                   .map(([itemId]) => {
                     const item = shuffledData.items.find((i: any) => i.id === itemId);
                     return (
                       <div key={itemId} className="bg-white px-3 py-1.5 rounded-lg border shadow-sm text-xs font-medium">
                         {item?.content}
                       </div>
                     );
                   })}
               </div>
             </div>
           ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          {shuffledData.items
            .filter((item: any) => !userSelections[item.id])
            .map((item: any) => (
              <div 
                key={item.id} 
                className="bg-white px-4 py-2.5 rounded-xl border-2 border-gray-100 shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-400 transition-colors"
                onClick={() => {
                  // Simplified interaction for non-drag environments: Click category then click item
                  const nextCat = shuffledData.categories[0]; // Example: assign to first for now
                  setUserSelections(prev => ({ ...prev, [item.id]: nextCat }));
                }}
              >
                {item.content}
              </div>
            ))}
        </div>
        <div className="text-center">
           <button onClick={() => setCompleted(true)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl">Hoàn tất phân loại</button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-indigo-600 font-medium transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách
        </button>
        <div className="text-right">
          <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{lesson.type}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-14 min-h-[500px] flex flex-col justify-center border border-indigo-50 relative overflow-hidden">
        {lesson.imageUrl && !completed && (
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none grayscale blur-sm">
             <img src={lesson.imageUrl} alt="" className="w-full h-full object-cover rounded-bl-[2rem]" />
          </div>
        )}

        {!completed ? (
          <>
            {lesson.type === InteractionType.QUIZ && renderQuiz()}
            {(lesson.type === InteractionType.MATCHING || lesson.type === InteractionType.PAIRING) && renderMatching()}
            {(lesson.type === InteractionType.WORD_DRAG || lesson.type === InteractionType.IMAGE_DRAG) && renderCategorization()}
          </>
        ) : (
          <div className="text-center animate-bounceIn">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Chúc mừng bạn!</h2>
            <p className="text-gray-500 mb-10 text-lg">Bạn đã hoàn thành xuất sắc bài tập Mĩ thuật này.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
               <div className="bg-indigo-50 p-4 rounded-2xl">
                 <div className="text-2xl font-black text-indigo-600">100%</div>
                 <div className="text-[10px] text-indigo-400 uppercase font-bold">Hoàn thành</div>
               </div>
               <div className="bg-rose-50 p-4 rounded-2xl">
                 <div className="text-2xl font-black text-rose-600">A+</div>
                 <div className="text-[10px] text-rose-400 uppercase font-bold">Xếp loại</div>
               </div>
            </div>

            <button 
              onClick={onBack}
              className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-2xl shadow-indigo-200 transition-all active:scale-95 text-lg"
            >
              Về Trang Chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractivePlayer;
