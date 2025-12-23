
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { INITIAL_LESSONS } from '../constants';
import { TaskType, Question } from '../types';

const LessonDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const lesson = INITIAL_LESSONS.find(l => l.id === id);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!lesson) return <div>Không tìm thấy bài học</div>;

  const currentQuestion = lesson.questions[currentStep];

  const handleNext = () => {
    if (currentStep < lesson.questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const renderTask = () => {
    switch (currentQuestion.type) {
      case TaskType.QUIZ:
        return (
          <div className="space-y-4">
             <h2 className="text-xl font-bold">{currentQuestion.title}</h2>
             <div className="grid gap-3">
               {currentQuestion.options?.map((opt, idx) => (
                 <button 
                  key={idx} 
                  onClick={() => {
                    if (opt === currentQuestion.correctAnswer) setScore(s => s + 10);
                    handleNext();
                  }}
                  className="w-full p-4 rounded-xl bg-warm-surface border border-white/5 hover:border-primary text-left transition-colors active:scale-[0.98]"
                >
                   {opt}
                 </button>
               ))}
             </div>
          </div>
        );
      case TaskType.DRAG_TEXT:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{currentQuestion.title}</h2>
            <p className="text-text-gold text-sm">{currentQuestion.description}</p>
            
            <div className="flex gap-4 justify-center py-4">
               {currentQuestion.items?.map((item) => (
                 <div key={item.id} className="px-4 py-2 bg-primary text-warm-bg rounded-lg font-bold shadow-lg cursor-move">
                   {item.text}
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center bg-warm-surface">
                Nóng
              </div>
              <div className="h-32 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center bg-warm-surface">
                Lạnh
              </div>
            </div>

            <button onClick={handleNext} className="w-full py-4 bg-accent rounded-xl font-bold shadow-xl">Xác nhận kết quả</button>
          </div>
        );
      case TaskType.MATCHING:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{currentQuestion.title}</h2>
            <div className="flex flex-col gap-4">
              {currentQuestion.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                   <div className="flex-1 p-3 bg-warm-surface rounded-lg border border-primary/30 text-sm">{item.left}</div>
                   <span className="material-symbols-outlined text-primary">link</span>
                   <div className="flex-1 p-3 bg-warm-surface rounded-lg border border-white/10 text-sm min-h-[44px]"></div>
                </div>
              ))}
            </div>
             <button onClick={handleNext} className="w-full py-4 bg-primary text-warm-bg rounded-xl font-bold">Hoàn thành</button>
          </div>
        )
      default:
        return <div>Đang phát triển...</div>;
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="size-24 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-2xl">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Tuyệt vời!</h1>
        <p className="text-text-gold mb-8">Bạn đã hoàn thành bài học <b>{lesson.title}</b> và nhận được {score + 50} điểm kinh nghiệm.</p>
        <button onClick={() => navigate('/')} className="px-10 py-4 bg-primary text-warm-bg font-bold rounded-full shadow-xl">Quay về trang chủ</button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pt-10">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="size-10 rounded-full bg-warm-surface flex items-center justify-center border border-white/10">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex-1 h-2 bg-warm-surface rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${((currentStep + 1) / lesson.questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-text-gold">{currentStep + 1}/{lesson.questions.length}</span>
      </div>

      <div className="bg-warm-bg min-h-[60vh]">
        {renderTask()}
      </div>
    </div>
  );
};

export default LessonDetail;
