
import React, { useState, useEffect } from 'react';
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
  const [loadingStatus, setLoadingStatus] = useState('');
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
    if (!newLesson.topic) {
      alert("Vui lòng nhập chủ đề bài học.");
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true }));
    setLoadingStatus('Đang khởi tạo AI...');
    setShowCreateModal(false);

    try {
      const gemini = new GeminiService(state.apiKey);
      
      setLoadingStatus('Đang soạn thảo nội dung bài tập...');
      const contentPromise = gemini.generateContent(newLesson.topic, newLesson.type);
      
      setLoadingStatus('Đang sáng tác hình ảnh minh họa...');
      const imagePromise = gemini.generateIllustrativeImage(newLesson.topic);

      const [content, imageUrl] = await Promise.all([
        contentPromise,
        imagePromise
      ]);

      const lesson: LessonContent = {
        id: Date.now().toString(),
        title: newLesson.title || newLesson.topic,
        description: `Bài tập về chủ đề: ${newLesson.topic}`,
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
      setLoadingStatus('');
    } catch (error: any) {
      console.error("Lỗi khi sinh nội dung:", error);
      let msg = "Đã xảy ra lỗi khi tạo bài giảng. ";
      if (error.message?.includes("403") || error.message?.includes("API key")) {
        msg += "API Key của bạn có thể không hợp lệ hoặc hết hạn.";
      } else {
        msg += "Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";
      }
      alert(msg);
      setState(prev => ({ ...prev, isGenerating: false }));
      setLoadingStatus('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100">
      <ApiKeyModal 
        isOpen={!state.apiKey} 
        onSave={handleSaveApiKey} 
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setState(prev => ({ ...prev, currentLesson: null }))}>
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-xl rotate-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gray-900 leading-none">
                ArtEdu AI
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mt-1">Hệ sinh thái Mĩ thuật Số</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="hidden sm:flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Thiết kế bài mới
            </button>
            <button 
              onClick={() => {
                if (confirm("Bạn có muốn đổi API Key mới?")) {
                  localStorage.removeItem('GEMINI_API_KEY');
                  window.location.reload();
                }
              }}
              className="p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 rounded-xl transition-all"
              title="Cài đặt"
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
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {state.currentLesson ? (
          <InteractivePlayer 
            lesson={state.currentLesson} 
            onBack={() => setState(prev => ({ ...prev, currentLesson: null }))}
          />
        ) : (
          <div className="space-y-12">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-rose-600 rounded-[3rem] p-10 md:p-20 text-white relative overflow-hidden shadow-3xl">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                  ✨ Trí tuệ nhân tạo hỗ trợ giảng dạy
                </span>
                <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                  Sáng tạo không giới hạn bài giảng Mĩ thuật.
                </h2>
                <p className="text-indigo-100 text-lg mb-10 leading-relaxed font-medium">
                  Hệ thống AI thông minh giúp giáo viên soạn giáo án, bài tập tương tác chỉ trong 30 giây. 
                  Tự động hóa hoàn toàn quy trình ra đề và minh họa hình ảnh.
                </p>
                <div className="flex flex-wrap gap-4">
                   <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-white text-indigo-800 px-10 py-5 rounded-2xl font-black shadow-2xl hover:bg-gray-50 transition-all active:scale-95 flex items-center"
                  >
                    Bắt đầu ngay
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-20 -right-20 w-[60%] h-[60%] bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
            </section>

            {/* Content Library */}
            <section className="space-y-8">
              <div className="flex items-end justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-3xl font-black text-gray-900">Thư viện bài giảng</h3>
                  <p className="text-gray-500 mt-1 font-medium">Lưu trữ các bài tập AI đã tạo dành riêng cho học sinh của bạn.</p>
                </div>
                <div className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase tracking-widest">
                  {state.lessons.length} Bài giảng
                </div>
              </div>
              
              {state.isGenerating && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-white border-2 border-dashed border-indigo-200 rounded-[2rem] p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[300px] animate-pulse">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{loadingStatus}</h4>
                      <p className="text-gray-400 text-sm mt-1 italic">Vui lòng không đóng trình duyệt...</p>
                    </div>
                  </div>
                </div>
              )}

              {state.lessons.length === 0 && !state.isGenerating ? (
                <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                   <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                   </div>
                   <h4 className="text-2xl font-black text-gray-900">Không gian sáng tạo đang chờ</h4>
                   <p className="text-gray-500 mt-3 max-w-md mx-auto font-medium">Bạn chưa có bài giảng nào. Hãy để AI giúp bạn soạn bài ngay bây giờ!</p>
                   <button 
                    onClick={() => setShowCreateModal(true)}
                    className="mt-8 text-indigo-600 font-bold hover:underline"
                   >
                     Tạo bài tập đầu tiên &rarr;
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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

      {/* Modern Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-[3rem] shadow-3xl max-w-xl w-full p-8 md:p-12 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Thiết kế bài tập</h2>
                <p className="text-gray-500 text-sm mt-1 font-medium italic">Sử dụng sức mạnh của Gemini 3 Flash</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Tên bài giảng</label>
                <input 
                  type="text" 
                  value={newLesson.title}
                  onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                  placeholder="VD: Thế giới màu sắc"
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Chủ đề chi tiết (Art Prompt)</label>
                <textarea 
                  value={newLesson.topic}
                  onChange={e => setNewLesson({...newLesson, topic: e.target.value})}
                  placeholder="VD: Các họa sĩ nổi tiếng của Việt Nam thời kỳ hiện đại, tác phẩm Sơn mài..."
                  rows={3}
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none font-medium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">Hình thức tương tác</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: InteractionType.QUIZ, label: 'Trắc nghiệm' },
                    { val: InteractionType.MATCHING, label: 'Ghép đôi' },
                    { val: InteractionType.WORD_DRAG, label: 'Phân loại từ' },
                    { val: InteractionType.PAIRING, label: 'Nối cột' }
                  ].map(type => (
                    <button
                      key={type.val}
                      onClick={() => setNewLesson({...newLesson, type: type.val})}
                      className={`px-4 py-3.5 rounded-2xl border-2 text-sm font-black transition-all ${
                        newLesson.type === type.val 
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]' 
                        : 'border-gray-100 text-gray-400 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerateLesson}
                disabled={!newLesson.topic || state.isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 group"
              >
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="text-lg">Sinh bài tập ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest border-t border-gray-50 mt-20">
        &copy; 2024 ArtEdu AI Ecosystem. Powered by Google Gemini 3.
      </footer>
    </div>
  );
};

export default App;
