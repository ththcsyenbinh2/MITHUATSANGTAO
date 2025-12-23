
import React, { useState } from 'react';
import { LessonContent, InteractionType, QuizQuestion, MatchingPair } from '../types';

interface Props {
  lesson: LessonContent;
  onBack: () => void;
}

const InteractivePlayer: React.FC<Props> = ({ lesson, onBack }) => {
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    const pairs = lesson.data as MatchingPair[];
    return (
      <div className="space-y-4">
        <p className="text-center text-gray-600 italic">Dạng bài: Ghép các khái niệm/hình ảnh tương ứng</p>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
             {pairs.map((p, i) => (
               <div key={i} className="p-4 bg-white border rounded-xl shadow-sm text-center font-semibold text-indigo-700">
                 {p.left}
               </div>
             ))}
          </div>
          <div className="space-y-3">
             {[...pairs].sort(() => Math.random() - 0.5).map((p, i) => (
               <div key={i} className="p-4 bg-white border border-dashed rounded-xl shadow-sm text-center font-medium text-gray-600 hover:border-indigo-400 cursor-pointer">
                 {p.right}
               </div>
             ))}
          </div>
        </div>
        <div className="mt-8 text-center">
           <button onClick={() => setCompleted(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg">Gửi Bài</button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>
        <div className="text-right">
          <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 min-h-[400px] flex flex-col justify-center border border-indigo-50">
        {!completed ? (
          <>
            {lesson.type === InteractionType.QUIZ && renderQuiz()}
            {lesson.type === InteractionType.MATCHING && renderMatching()}
            {lesson.type !== InteractionType.QUIZ && lesson.type !== InteractionType.MATCHING && (
              <div className="text-center space-y-4">
                <p className="text-xl font-medium">Hình thức {lesson.type} đang được cập nhật giao diện chơi...</p>
                <div className="p-6 bg-gray-50 rounded-2xl overflow-auto text-left">
                  <pre className="text-xs">{JSON.stringify(lesson.data, null, 2)}</pre>
                </div>
                <button onClick={() => setCompleted(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-full">Xác nhận hoàn thành</button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center animate-bounceIn">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tuyệt vời!</h2>
            <p className="text-gray-500 mb-8">Bạn đã hoàn thành bài học: <span className="font-semibold">{lesson.title}</span></p>
            {lesson.type === InteractionType.QUIZ && (
              <div className="text-5xl font-extrabold text-indigo-600 mb-8">
                {score} / {(lesson.data as QuizQuestion[]).length}
              </div>
            )}
            <button 
              onClick={onBack}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95"
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
