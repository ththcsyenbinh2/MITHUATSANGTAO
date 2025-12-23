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
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [shuffledData, setShuffledData] = useState<any>(null);

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

  const handleCategoryPlace = (cat: string) => {
    if (!selectedItem) return;
    setUserAnswers({ ...userAnswers, [selectedItem]: cat });
    setSelectedItem(null);
  };

  const checkCategorization = () => {
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
        <div className="text-center space-y-4">
          <div className="inline-block px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold">Câu hỏi {currentIndex + 1}</div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">{q.question}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleQuizChoice(i)}
              className="p-6 text-left rounded-2xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all font-bold text-gray-700 flex items-center group shadow-sm hover:shadow-md"
            >
              <span className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center mr-4 transition-colors font-black">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
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
          <h2 className="text-2xl font-black text-gray-900">Phân loại nội dung vào nhóm đúng</h2>
          <p className="text-gray-500 mt-2">Chọn một mục ở dưới, sau đó chọn nhóm để đặt vào.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.categories.map(cat => (
            <div 
              key={cat} 
              onClick={() => handleCategoryPlace(cat)}
              className={`min-h-[180px] p-6 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center ${
                selectedItem ? 'border-indigo-400 bg-indigo-50/50 scale-[1.02]' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <h4 className="font-black text-indigo-900 mb-4">{cat}</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {Object.entries(userAnswers)
                  .filter(([_, targetCat]) => targetCat === cat)
                  .map(([itemId]) => (
                    <div key={itemId} className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 text-xs font-bold animate-popIn">
                      {data.items.find(i => i.id === itemId)?.content}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-inner flex flex-wrap justify-center gap-3">
          {shuffledData.items.filter((item: any) => !userAnswers[item.id]).map((item: any) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item.id)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all shadow-sm ${
                selectedItem === item.id 
                ? 'bg-indigo-600 text-white scale-110 shadow-indigo-200' 
                : 'bg-white border-2 border-gray-100 text-gray-700 hover:border-indigo-200'
              }`}
            >
              {item.content}
            </button>
          ))}
          {shuffledData.items.filter((item: any) => !userAnswers[item.id]).length === 0 && (
            <button onClick={checkCategorization} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl animate-bounce">Nộp bài kiểm tra</button>
          )}
        </div>
      </div>
    );
  };

  const renderReview = () => {
    const isQuiz = lesson.type === InteractionType.QUIZ;
    const total = isQuiz ? (lesson.data as QuizQuestion[]).length : (lesson.data as CategorizationData).items.length;
    const percent = Math.round((score / total) * 100);

    return (
      <div className="text-center space-y-8 animate-bounceIn">
        <div className="relative inline-block">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 ${percent >= 50 ? 'bg-green-100' : 'bg-orange-100'}`}>
             <span className={`text-4xl font-black ${percent >= 50 ? 'text-green-600' : 'text-orange-600'}`}>{percent}%</span>
          </div>
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg">
            {percent === 100 ? '⭐' : '📝'}
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-black text-gray-900">Hoàn thành bài tập!</h2>
          <p className="text-gray-500 mt-2 font-medium">Bạn đã trả lời đúng {score} trên tổng số {total} nội dung.</p>
        </div>

        <div className="max-w-md mx-auto space-y-3">
           {isQuiz && (lesson.data as QuizQuestion[]).map((q, i) => (
             <div key={i} className={`p-4 rounded-2xl border-2 text-left flex items-start space-x-3 ${userAnswers[i] === q.correctAnswer ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${userAnswers[i] === q.correctAnswer ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {userAnswers[i] === q.correctAnswer ? '✓' : '✕'}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{q.question}</p>
                  <p className="text-xs text-gray-500 mt-1 italic">{q.explanation}</p>
                </div>
             </div>
           ))}
        </div>

        <button 
          onClick={onBack}
          className="px-12 py-5 bg-indigo-600 text-white font-black rounded-[2rem] shadow-2xl shadow-indigo-200 hover:scale-105 transition-all"
        >
          Quay lại thư viện
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-[3rem] shadow-3xl p-8 md:p-16 min-h-[600px] flex flex-col justify-center border border-gray-50 relative overflow-hidden">
        {step === 'playing' ? (
          <>
            {lesson.type === InteractionType.QUIZ && renderQuiz()}
            {(lesson.type === InteractionType.WORD_DRAG || lesson.type === InteractionType.IMAGE_DRAG) && renderCategorization()}
            {/* Other types would follow similar pattern */}
          </>
        ) : renderReview()}
        
        {/* Background Decorative Element */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default InteractivePlayer;
