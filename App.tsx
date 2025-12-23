
import React, { useState, useEffect, useCallback } from 'react';
import { InteractionType, LessonContent, AppState } from './types';
import { GeminiService } from './services/geminiService';
import ApiKeyModal from './components/ApiKeyModal';
import LessonCard from './components/LessonCard';
import InteractivePlayer from './components/InteractivePlayer';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    apiKey: localStorage.getItem('GEMINI_API_KEY') || '',
    lessons: JSON.parse(localStorage.getItem('ARTEDU_LESSONS') || '[]'),
    currentLesson: null,
    isGenerating: false
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    topic: '',
    type: InteractionType.QUIZ
  });

  useEffect(() => {
    localStorage.setItem('ARTEDU_LESSONS', JSON.stringify(state.lessons));
  }, [state.lessons]);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('GEMINI_API_KEY', key);
    setState(prev => ({ ...prev, apiKey: key }));
  };

  const handleGenerateLesson = async () => {
    if (!state.apiKey) return;
    setState(prev => ({ ...prev, isGenerating: true }));
    setShowCreateModal(false);

    try {
      const gemini = new GeminiService(state.apiKey);
      
      // Parallel requests for content and imagery
      const [content, imageUrl] = await Promise.all([
        gemini.generateContent(newLesson.topic, newLesson.type),
        gemini.generateIllustrativeImage(newLesson.topic)
      ]);

      const lesson: LessonContent = {
        id: Date.now().toString(),
        title: newLesson.title || newLesson.topic,
        description: `Bài tập về chủ đề ${newLesson.topic}`,
        type: newLesson.type,
        data: content,
        imageUrl: imageUrl || '',
        createdAt: Date.now()
      };

      setState(prev => ({
        ...prev,
        lessons: [lesson, ...prev.lessons],
        isGenerating: false
      }));
    } catch (error) {
      console.error("Lỗi khi sinh nội dung:", error);
      alert("Đã xảy ra lỗi khi tạo bài giảng. Vui lòng kiểm tra lại API Key hoặc kết nối.");
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ApiKeyModal 
        isOpen={!state.apiKey} 
        onSave={handleSaveApiKey} 
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                ArtEdu AI
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Smart Art Teacher Assistant</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="hidden md:flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-indigo-100 active:scale-95"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Tạo bài giảng mới
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('GEMINI_API_KEY');
                window.location.reload();
              }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Cài đặt API Key"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        {state.currentLesson ? (
          <InteractivePlayer 
            lesson={state.currentLesson} 
            onBack={() => setState(prev => ({ ...prev, currentLesson: null }))}
          />
        ) : (
          <div className="space-y-10">
            {/* Banner Section */}
            <section className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-rose-500 rounded-[2.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                  Biến kiến thức Mĩ thuật trở nên sống động với AI.
                </h2>
                <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
                  Thiết kế bài giảng tương tác chỉ trong giây lát. Trắc nghiệm, nối cột, kéo thả hình ảnh - tất cả đều tự động hóa.
                </p>
                <div className="flex flex-wrap gap-4">
                   <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Bắt đầu thiết kế bài tập
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                 <svg className="w-full h-full" viewBox="0 0 100 100">
                    <path d="M0 100 Q 25 0 50 100 T 100 100" fill="none" stroke="currentColor" strokeWidth="2" />
                 </svg>
              </div>
            </section>

            {/* Content Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Thư viện bài giảng của bạn</h3>
                <div className="text-sm font-medium text-gray-500">{state.lessons.length} bài đã lưu</div>
              </div>
              
              {state.isGenerating && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
                    <div className="aspect-video bg-gray-100 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                  </div>
                </div>
              )}

              {state.lessons.length === 0 && !state.isGenerating ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                   </div>
                   <h4 className="text-xl font-bold text-gray-900">Chưa có bài giảng nào</h4>
                   <p className="text-gray-500 mt-2 max-w-xs mx-auto">Hãy tạo bài giảng đầu tiên để bắt đầu trải nghiệm trợ lý AI.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {state.lessons.map(lesson => (
                    <LessonCard 
                      key={lesson.id} 
                      lesson={lesson} 
                      onSelect={(l) => setState(prev => ({ ...prev, currentLesson: l }))}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 md:p-10 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">Thiết kế bài giảng</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tên bài học</label>
                <input 
                  type="text" 
                  value={newLesson.title}
                  onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                  placeholder="VD: Tìm hiểu về màu sắc cơ bản"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Chủ đề chi tiết (Nội dung cho AI)</label>
                <textarea 
                  value={newLesson.topic}
                  onChange={e => setNewLesson({...newLesson, topic: e.target.value})}
                  placeholder="VD: Màu nóng, màu lạnh, các cặp màu tương phản trong hội họa..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Hình thức tương tác</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: InteractionType.QUIZ, label: 'Trắc nghiệm' },
                    { val: InteractionType.MATCHING, label: 'Ghép đôi' },
                    { val: InteractionType.IMAGE_DRAG, label: 'Phân loại hình' },
                    { val: InteractionType.PAIRING, label: 'Nối cột' }
                  ].map(type => (
                    <button
                      key={type.val}
                      onClick={() => setNewLesson({...newLesson, type: type.val})}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        newLesson.type === type.val 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerateLesson}
                disabled={!newLesson.topic}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 011.414-1.414l.707.707zM16 18a1 1 0 100-2h-1a1 1 0 100 2h1z" />
                </svg>
                <span>Sinh bài giảng bằng AI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action for Mobile */}
      <button 
        onClick={() => setShowCreateModal(true)}
        className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl z-50 active:scale-95"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <footer className="py-10 text-center text-gray-400 text-sm">
        &copy; 2024 ArtEdu AI. Thiết kế dành riêng cho giáo viên Mĩ thuật THCS.
      </footer>
    </div>
  );
};

export default App;
