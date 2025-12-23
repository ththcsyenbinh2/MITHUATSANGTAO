import React, { useState, useEffect } from 'react';
import { InteractionType, LessonContent, QuizQuestion, MatchingPair, CategorizationData } from '../types';

interface Props {
  lesson: LessonContent;
  onBack: () => void;
}

const InteractivePlayer: React.FC<Props> = ({ lesson, onBack }) => {
  const [step, setStep] = useState<'playing' | 'review'>('playing');
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any>({});
  const [shuffledData, setShuffledData] = useState<any>(null);
  
  // Selection states for Matching
  const [matchSelectedLeft, setMatchSelectedLeft] = useState<string | null>(null);

  useEffect(() => {
    if (lesson.type === InteractionType.MATCHING || lesson.type === InteractionType.PAIRING) {
      const data = lesson.data as MatchingPair[];
      setShuffledData({
        left: [...data].sort(() => Math.random() - 0.5),
        right: [...data].sort(() => Math.random() - 0.5)
      });
    } else if (lesson.type === InteractionType.WORD_DRAG || lesson.type === InteractionType.IMAGE_DRAG) {
      const data = lesson.data as CategorizationData;
      setShuffledData({
        ...data,
        items: [...data.items].sort(() => Math.random() - 0.5)
      });
    }
  }, [lesson]);

  const handleQuizChoice = (idx: number) => {
    const isCorrect = idx === (lesson.data as QuizQuestion[])[currentIndex].correctAnswer;
    setUserAnswers({ ...userAnswers, [currentIndex]: idx });
    if (isCorrect) setScore(s => s + 1);

    if (currentIndex < (lesson.data as QuizQuestion[]).length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      setStep('review');
    }
  };

  const handleMatchSelect = (id: string, side: 'left' | 'right') => {
    if (side === 'left') {
      setMatchSelectedLeft(id);
    } else if (side === 'right' && matchSelectedLeft) {
      // Connect Left ID to Right ID
      setUserAnswers({ ...userAnswers, [matchSelectedLeft]: id });
      setMatchSelectedLeft(null);
    }
  };

  const checkMatchingResult = () => {
    let correctCount = 0;
    const originalPairs = lesson.data as MatchingPair[];
    originalPairs.forEach(pair => {
      // If user matched the left ID to its own ID (correct pair)
      if (userAnswers[pair.id] === pair.id) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setStep('review');
  };

  const handleCategoryPlace = (cat: string) => {
    if (!matchSelectedLeft) return; // reused state as selected item
    setUserAnswers({ ...userAnswers, [matchSelectedLeft]: cat });
    setMatchSelectedLeft(null);
  };

  const checkCategorizationResult = () => {
    let correct = 0;
    const data = lesson.data as CategorizationData;
    data.items.forEach(item => {
      if (userAnswers[item.id] === item.correctCategory) correct++;
    });
    setScore(correct);
    setStep('review');
  };

  const renderQuiz = () => {
    const q = (lesson.data as QuizQuestion[])[currentIndex];
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest">
            Câu hỏi {currentIndex + 1} / {(lesson.data as QuizQuestion[]).length}
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight px-4">{q.question}</h2>
          {/* Fix: QuizQuestion now properly includes imageUrl in types.ts */}
          {q.imageUrl && (
            <div className="max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-1">
              <img src={q.imageUrl} alt="Minh họa" className="w-full h-auto object-cover max-h-[300px]" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleQuizChoice(i)}
              className="p-6 text-left rounded-3xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all font-bold text-gray-700 flex items-center group shadow-sm"
            >
              <span className="w-10 h-10 rounded-2xl bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center mr-4 transition-colors font-black shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderMatching = () => {
    if (!shuffledData) return null;
    const matchedLeftIds = Object.keys(userAnswers);
    const matchedRightIds = Object.values(userAnswers);

    return (
      <div className="space-y-10">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900">Nối các cặp nội dung tương ứng</h2>
          <p className="text-slate-500 mt-2 font-medium">Chọn một mục ở cột trái, sau đó chọn mục tương ứng ở cột phải.</p>
        </div>

        <div className="grid grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h4 className="text-center font-black text-slate-400 uppercase text-xs tracking-widest mb-6">Cột A</h4>
            {shuffledData.left.map((item: any) => (
              <button
                key={item.id}
                disabled={matchedLeftIds.includes(item.id)}
                onClick={() => handleMatchSelect(item.id, 'left')}
                className={`w-full p-5 rounded-2xl border-2 transition-all font-bold text-sm text-center shadow-sm ${
                  matchedLeftIds.includes(item.id) 
                  ? 'bg-indigo-50 border-indigo-100 text-indigo-300 opacity-50' 
                  : matchSelectedLeft === item.id 
                    ? 'border-indigo-600 bg-indigo-600 text-white scale-105 shadow-xl rotate-1' 
                    : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-200'
                }`}
              >
                {item.left}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-center font-black text-slate-400 uppercase text-xs tracking-widest mb-6">Cột B</h4>
            {shuffledData.right.map((item: any) => (
              <button
                key={item.id}
                disabled={matchedRightIds.includes(item.id)}
                onClick={() => handleMatchSelect(item.id, 'right')}
                className={`w-full p-5 rounded-2xl border-2 transition-all font-bold text-sm text-center shadow-sm ${
                  matchedRightIds.includes(item.id) 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-300 opacity-50' 
                  : matchSelectedLeft 
                    ? 'border-indigo-200 bg-white hover:border-indigo-600 hover:bg-indigo-50 animate-pulse' 
                    : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-200'
                }`}
              >
                {item.right}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center pt-8">
           {matchedLeftIds.length === shuffledData.left.length ? (
             <button onClick={checkMatchingResult} className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl hover:scale-105 transition-all">
               Kiểm tra kết quả
             </button>
           ) : (
             <p className="text-indigo-400 font-bold italic animate-pulse">Hãy nối hết các cặp để nộp bài...</p>
           )}
        </div>
      </div>
    );
  };

  const renderCategorization = () => {
    if (!shuffledData) return null;
    const data = lesson.data as CategorizationData;
    return (
      <div className="space-y-10">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900">Phân loại kiến thức</h2>
          <p className="text-slate-500 mt-2 font-medium">Chọn một mục ở dưới, sau đó chọn nhóm để đặt vào.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.categories.map(cat => (
            <div 
              key={cat} 
              onClick={() => handleCategoryPlace(cat)}
              className={`min-h-[200px] p-6 rounded-[2.5rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center group ${
                matchSelectedLeft ? 'border-indigo-400 bg-indigo-50/50 scale-[1.02]' : 'border-slate-100 bg-slate-50/50'
              }`}
            >
              <h4 className="font-black text-indigo-900 mb-6 bg-white px-4 py-1 rounded-full shadow-sm">{cat}</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {Object.entries(userAnswers)
                  .filter(([_, targetCat]) => targetCat === cat)
                  .map(([itemId]) => (
                    <div key={itemId} className="bg-white px-4 py-2 rounded-xl shadow-md border border-slate-50 text-xs font-black animate-popIn">
                      {data.items.find(i => i.id === itemId)?.content}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-inner flex flex-wrap justify-center gap-4">
          {shuffledData.items.filter((item: any) => !userAnswers[item.id]).map((item: any) => (
            <button
              key={item.id}
              onClick={() => setMatchSelectedLeft(item.id)}
              className={`px-8 py-4 rounded-2xl font-black transition-all shadow-sm flex flex-col items-center ${
                matchSelectedLeft === item.id 
                ? 'bg-indigo-600 text-white scale-110 shadow-2xl rotate-2' 
                : 'bg-white border-2 border-slate-100 text-slate-700 hover:border-indigo-400'
              }`}
            >
              {item.imageUrl && (
                 <img src={item.imageUrl} className="w-10 h-10 object-cover rounded-lg mb-2" alt="" />
              )}
              {item.content}
            </button>
          ))}
          {shuffledData.items.filter((item: any) => !userAnswers[item.id]).length === 0 && (
            <button onClick={checkCategorizationResult} className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl animate-bounce">Nộp bài kiểm tra</button>
          )}
        </div>
      </div>
    );
  };

  const renderReview = () => {
    const isQuiz = lesson.type === InteractionType.QUIZ;
    const originalData = isQuiz ? (lesson.data as QuizQuestion[]) : 
                         (lesson.type === InteractionType.MATCHING || lesson.type === InteractionType.PAIRING) ? (lesson.data as MatchingPair[]) :
                         (lesson.data as CategorizationData).items;
    
    const total = originalData.length;
    const percent = Math.round((score / total) * 100);

    return (
      <div className="text-center space-y-12 animate-bounceIn py-10">
        <div className="relative inline-block scale-125">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto ${percent >= 80 ? 'bg-emerald-100' : percent >= 50 ? 'bg-indigo-100' : 'bg-rose-100'}`}>
             <span className={`text-4xl font-black ${percent >= 80 ? 'text-emerald-600' : percent >= 50 ? 'text-indigo-600' : 'text-rose-600'}`}>{percent}%</span>
          </div>
          <div className="absolute -top-4 -right-4 bg-yellow-400 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-2xl animate-pulse">
            {percent === 100 ? '👑' : percent >= 80 ? '🎨' : '📝'}
          </div>
        </div>

        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">Hoàn thành!</h2>
          <p className="text-slate-400 mt-4 text-xl font-medium">Bạn đã trả lời đúng <span className="text-indigo-600 font-black">{score}/{total}</span> câu hỏi.</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4 text-left">
           {isQuiz && (lesson.data as QuizQuestion[]).map((q, i) => (
             <div key={i} className={`p-6 rounded-[2rem] border-2 text-left flex items-start space-x-4 shadow-sm ${userAnswers[i] === q.correctAnswer ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black ${userAnswers[i] === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {userAnswers[i] === q.correctAnswer ? '✓' : '✕'}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-slate-800">{q.question}</p>
                  <p className="text-sm text-slate-500 mt-2 italic font-medium">Lý do: {q.explanation}</p>
                </div>
             </div>
           ))}
           {!isQuiz && (
             <p className="text-slate-400 font-bold italic text-center">Xem lại kết quả tổng quát ở trên.</p>
           )}

           {/* MANDATORY: Extract and list grounding source URLs when googleSearch tool is used */}
           {lesson.groundingChunks && lesson.groundingChunks.length > 0 && (
             <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
               <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6 ml-2">Nguồn tài liệu tham khảo:</h4>
               <ul className="grid grid-cols-1 gap-3">
                 {lesson.groundingChunks.map((chunk: any, idx: number) => (
                   chunk.web && (
                     <li key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 hover:border-indigo-200 transition-colors">
                       <a 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center group"
                       >
                         <svg className="w-5 h-5 mr-3 text-slate-300 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                         <span className="line-clamp-1">{chunk.web.title || chunk.web.uri}</span>
                       </a>
                     </li>
                   )
                 ))}
               </ul>
             </div>
           )}
        </div>

        <div className="pt-8">
          <button 
            onClick={onBack}
            className="px-14 py-6 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-3xl shadow-indigo-100 hover:scale-105 transition-all text-xl"
          >
            Trở về Thư viện
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-[4rem] shadow-4xl p-8 md:p-20 min-h-[700px] flex flex-col justify-center border border-slate-50 relative overflow-hidden">
        {step === 'playing' ? (
          <>
            {lesson.type === InteractionType.QUIZ && renderQuiz()}
            {(lesson.type === InteractionType.MATCHING || lesson.type === InteractionType.PAIRING) && renderMatching()}
            {(lesson.type === InteractionType.WORD_DRAG || lesson.type === InteractionType.IMAGE_DRAG) && renderCategorization()}
          </>
        ) : renderReview()}
        
        {/* Background Decorative Element */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-50 rounded-full opacity-30 blur-[100px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-8">
           <button onClick={onBack} className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
      </div>
    </div>
  );
};

export default InteractivePlayer;
