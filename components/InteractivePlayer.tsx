
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
  
  // States for Drag & Drop
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
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

  const onDragStart = (id: string) => {
    setDraggedItemId(id);
  };

  const onDrop = (category: string) => {
    if (!draggedItemId) return;
    setUserAnswers({ ...userAnswers, [draggedItemId]: category });
    setDraggedItemId(null);
  };

  const handleMatchSelect = (id: string, side: 'left' | 'right') => {
    if (side === 'left') {
      setMatchSelectedLeft(id);
    } else if (side === 'right' && matchSelectedLeft) {
      setUserAnswers({ ...userAnswers, [matchSelectedLeft]: id });
      setMatchSelectedLeft(null);
    }
  };

  const checkMatchingResult = () => {
    let correctCount = 0;
    const originalPairs = lesson.data as MatchingPair[];
    originalPairs.forEach(pair => {
      if (userAnswers[pair.id] === pair.id) correctCount++;
    });
    setScore(correctCount);
    setStep('review');
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
          {q.imageUrl && (
            <div className="max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-1 transition-transform hover:rotate-0">
              <img src={q.imageUrl} alt="Tác phẩm mĩ thuật" className="w-full h-auto object-cover max-h-[350px]" onError={(e) => (e.currentTarget.style.display = 'none')} />
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
          <h2 className="text-2xl font-black text-gray-900">Nối Cột: Tác phẩm & Họa sĩ</h2>
          <p className="text-slate-500 mt-2 font-medium">Chọn một mục ở cột trái, sau đó chọn mục tương ứng ở cột phải.</p>
        </div>

        <div className="grid grid-cols-2 gap-12 max-w-5xl mx-auto relative">
          <div className="space-y-4">
            <h4 className="text-center font-black text-slate-400 uppercase text-xs tracking-widest mb-6">Cột A</h4>
            {shuffledData.left.map((item: any) => (
              <div key={item.id} className="relative">
                <button
                  disabled={matchedLeftIds.includes(item.id)}
                  onClick={() => handleMatchSelect(item.id, 'left')}
                  className={`w-full p-6 rounded-2xl border-2 transition-all font-bold text-sm text-center shadow-sm flex items-center justify-center space-x-3 ${
                    matchedLeftIds.includes(item.id) 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                    : matchSelectedLeft === item.id 
                      ? 'border-indigo-600 bg-indigo-600 text-white scale-105 shadow-xl' 
                      : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-400'
                  }`}
                >
                  {item.imageUrl && <img src={item.imageUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />}
                  <span>{item.left}</span>
                  {matchedLeftIds.includes(item.id) && <span className="ml-2">✓</span>}
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-center font-black text-slate-400 uppercase text-xs tracking-widest mb-6">Cột B</h4>
            {shuffledData.right.map((item: any) => (
              <button
                key={item.id}
                disabled={matchedRightIds.includes(item.id)}
                onClick={() => handleMatchSelect(item.id, 'right')}
                className={`w-full p-6 rounded-2xl border-2 transition-all font-bold text-sm text-center shadow-sm ${
                  matchedRightIds.includes(item.id) 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 opacity-50' 
                  : matchSelectedLeft 
                    ? 'border-indigo-300 bg-indigo-50 hover:border-indigo-600 hover:bg-white animate-pulse' 
                    : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-400'
                }`}
              >
                {item.right}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center pt-8">
           {matchedLeftIds.length === shuffledData.left.length ? (
             <button onClick={checkMatchingResult} className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl hover:scale-105 transition-all text-xl">
               Hoàn thành bài tập
             </button>
           ) : (
             <div className="flex items-center justify-center space-x-2 text-indigo-400 font-bold italic">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></span>
                <span>Hãy nối hết {shuffledData.left.length - matchedLeftIds.length} cặp còn lại...</span>
             </div>
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
          <h2 className="text-3xl font-black text-gray-900">Phân loại kiến thức</h2>
          <p className="text-slate-500 mt-2 font-medium italic">Kéo thả các thẻ bên dưới vào các nhóm tương ứng.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.categories.map(cat => (
            <div 
              key={cat} 
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(cat)}
              className={`min-h-[250px] p-8 rounded-[3rem] border-4 border-dashed transition-all flex flex-col items-center group relative ${
                draggedItemId ? 'border-indigo-400 bg-indigo-50/50 scale-[1.02]' : 'border-slate-100 bg-slate-50/50'
              }`}
            >
              <h4 className="font-black text-indigo-900 mb-6 bg-white px-6 py-2 rounded-full shadow-md text-lg">{cat}</h4>
              <div className="flex flex-wrap justify-center gap-3">
                {Object.entries(userAnswers)
                  .filter(([_, targetCat]) => targetCat === cat)
                  .map(([itemId]) => {
                    const item = data.items.find(i => i.id === itemId);
                    return (
                      <div key={itemId} className="bg-white p-4 rounded-2xl shadow-lg border border-slate-50 text-sm font-black animate-popIn flex flex-col items-center max-w-[150px]">
                        {item?.imageUrl && <img src={item.imageUrl} className="w-full h-20 object-cover rounded-xl mb-2" alt="" />}
                        <span className="text-center">{item?.content}</span>
                      </div>
                    );
                  })}
              </div>
              {draggedItemId && <div className="absolute inset-0 bg-indigo-100/10 rounded-[3rem] animate-pulse"></div>}
            </div>
          ))}
        </div>

        <div className="bg-white p-12 rounded-[4rem] border-2 border-slate-50 shadow-inner flex flex-wrap justify-center gap-6 min-h-[150px]">
          {shuffledData.items.filter((item: any) => !userAnswers[item.id]).map((item: any) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => onDragStart(item.id)}
              onClick={() => {
                // Hỗ trợ cả click cho cảm ứng
                if (matchSelectedLeft === item.id) setMatchSelectedLeft(null);
                else setMatchSelectedLeft(item.id);
                setDraggedItemId(item.id);
              }}
              className={`px-8 py-5 rounded-[2rem] font-black transition-all shadow-lg cursor-grab active:cursor-grabbing flex flex-col items-center border-2 ${
                draggedItemId === item.id || matchSelectedLeft === item.id
                ? 'bg-indigo-600 text-white scale-110 shadow-indigo-200 border-indigo-600' 
                : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-400 hover:shadow-xl'
              }`}
            >
              {item.imageUrl && (
                 <img src={item.imageUrl} className="w-20 h-20 object-cover rounded-2xl mb-3 shadow-md" alt="" />
              )}
              <span className="text-lg">{item.content}</span>
            </div>
          ))}
          {shuffledData.items.filter((item: any) => !userAnswers[item.id]).length === 0 && (
            <button onClick={checkCategorizationResult} className="bg-indigo-600 text-white px-16 py-6 rounded-[2.5rem] font-black shadow-3xl animate-bounce text-xl">
              Nộp bài ngay
            </button>
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
          <div className={`w-36 h-36 rounded-full flex items-center justify-center mx-auto shadow-2xl ${percent >= 80 ? 'bg-emerald-100' : percent >= 50 ? 'bg-indigo-100' : 'bg-rose-100'}`}>
             <span className={`text-5xl font-black ${percent >= 80 ? 'text-emerald-600' : percent >= 50 ? 'text-indigo-600' : 'text-rose-600'}`}>{percent}%</span>
          </div>
          <div className="absolute -top-4 -right-4 bg-yellow-400 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl animate-pulse">
            {percent === 100 ? '🥇' : percent >= 80 ? '🎨' : '📝'}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">KẾT QUẢ BÀI TẬP</h2>
          <p className="text-slate-400 text-xl font-medium">Bạn đạt được <span className="text-indigo-600 font-black text-3xl">{score}/{total}</span> điểm.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 text-left">
           {isQuiz && (lesson.data as QuizQuestion[]).map((q, i) => (
             <div key={i} className={`p-8 rounded-[2.5rem] border-2 text-left flex items-start space-x-6 shadow-sm transition-all hover:scale-[1.01] ${userAnswers[i] === q.correctAnswer ? 'border-emerald-100 bg-emerald-50/20' : 'border-rose-100 bg-rose-50/20'}`}>
                <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg font-black ${userAnswers[i] === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {userAnswers[i] === q.correctAnswer ? '✓' : '✕'}
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold text-slate-800 mb-3">{q.question}</p>
                  <div className="bg-white/60 p-4 rounded-2xl border border-slate-100">
                    <p className="text-sm text-slate-600 font-medium italic"><span className="text-indigo-600 font-black uppercase text-[10px] mr-2">Kiến thức:</span> {q.explanation}</p>
                  </div>
                  {q.imageUrl && <img src={q.imageUrl} className="mt-4 w-32 h-32 object-cover rounded-2xl shadow-md border-2 border-white" alt="" />}
                </div>
             </div>
           ))}
           {!isQuiz && (
             <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 text-center">
                <p className="text-slate-500 font-bold text-lg mb-4">Mời thầy/cô và các em xem lại kết quả trực quan ở trên.</p>
                <div className="flex justify-center space-x-2">
                  {[...Array(score)].map((_, i) => <span key={i} className="text-3xl animate-bounce" style={{animationDelay: `${i*100}ms`}}>⭐</span>)}
                </div>
             </div>
           )}

           {lesson.groundingChunks && lesson.groundingChunks.length > 0 && (
             <div className="mt-16 p-10 bg-indigo-900 rounded-[3rem] shadow-3xl text-white overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
               </div>
               <h4 className="text-xs font-black uppercase text-indigo-300 tracking-[0.2em] mb-8 flex items-center">
                 <span className="w-8 h-px bg-indigo-300 mr-4"></span>
                 Nguồn tư liệu thực tế (Google Search)
               </h4>
               <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {lesson.groundingChunks.map((chunk: any, idx: number) => (
                   chunk.web && (
                     <li key={idx}>
                       <a 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-white/10 hover:bg-white/20 p-5 rounded-2xl flex items-center transition-all group backdrop-blur-md border border-white/5"
                       >
                         <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-white font-bold text-sm truncate">{chunk.web.title || "Tài liệu mĩ thuật"}</p>
                           <p className="text-indigo-200 text-[10px] truncate opacity-60 uppercase font-black mt-1">Nguồn xác thực</p>
                         </div>
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
            className="px-16 py-7 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-4xl shadow-indigo-100 hover:scale-105 transition-all text-2xl"
          >
            Quay lại thư viện
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-[5rem] shadow-4xl p-10 md:p-24 min-h-[800px] flex flex-col justify-center border border-slate-50 relative overflow-hidden">
        {step === 'playing' ? (
          <>
            {lesson.type === InteractionType.QUIZ && renderQuiz()}
            {(lesson.type === InteractionType.MATCHING || lesson.type === InteractionType.PAIRING) && renderMatching()}
            {(lesson.type === InteractionType.WORD_DRAG || lesson.type === InteractionType.IMAGE_DRAG) && renderCategorization()}
          </>
        ) : renderReview()}
        
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-indigo-50 rounded-full opacity-30 blur-[150px] pointer-events-none"></div>
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-rose-50 rounded-full opacity-30 blur-[150px] pointer-events-none"></div>
        
        <div className="absolute top-0 right-0 p-12">
           <button onClick={onBack} className="w-16 h-16 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-3xl flex items-center justify-center text-slate-300 transition-all active:scale-90 shadow-sm border border-slate-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
      </div>
    </div>
  );
};

export default InteractivePlayer;
