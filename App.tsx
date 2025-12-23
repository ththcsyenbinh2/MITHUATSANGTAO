
import React, { useState, useEffect } from 'react';
import { InteractionType, LessonContent, AppState } from './types';
import { GeminiService } from './services/geminiService';
import LessonCard from './components/LessonCard';
import InteractivePlayer from './components/InteractivePlayer';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    lessons: JSON.parse(localStorage.getItem('ARTEDU_LESSONS') || '[]'),
    currentLesson: null,
    isGenerating: false
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [newLesson, setNewLesson] = useState({ title: '', topic: '', type: InteractionType.QUIZ });

  useEffect(() => {
    localStorage.setItem('ARTEDU_LESSONS', JSON.stringify(state.lessons));
  }, [state.lessons]);

  const handleGenerate = async () => {
    if (!newLesson.topic) return;
    
    // Kiểm tra API Key trước khi bắt đầu
    const apiKey = localStorage.getItem('USER_ARTEDU_API_KEY') || process.env.API_KEY;
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true }));
    setShowCreateModal(false);
    setErrorMessage(null);
    setLoadingMsg('AI đang soạn thảo bài tập...');

    try {
      const gemini = new GeminiService();
      
      setLoadingMsg('Đang tìm tư liệu hình ảnh...');
      const contentPromise = gemini.generateContent(newLesson.topic, newLesson.type);
      const imagePromise = gemini.generateIllustrativeImage(newLesson.topic);

      const [contentResult, image] = await Promise.all([contentPromise, imagePromise]);

      const lesson: LessonContent = {
        id: Date.now().toString(),
        title: newLesson.title || newLesson.topic,
        description: `Bài tập tương tác: ${newLesson.topic}`,
        type: newLesson.type,
        data: contentResult.data,
        groundingChunks: contentResult.groundingChunks,
        imageUrl: image || '',
        createdAt: Date.now()
      };

      setState(prev => ({
        ...prev,
        lessons: [lesson, ...prev.lessons],
        isGenerating: false
      }));
    } catch (e: any) {
      console.error(e);
      setState(prev => ({ ...prev, isGenerating: false }));
      
      if (e.message?.includes("429")) {
        setErrorMessage("Hệ thống đang quá tải hoặc hết Quota. Vui lòng thử lại sau hoặc nhập API Key cá nhân mới.");
      } else if (e.message?.includes("API Key")) {
        setShowKeyModal(true);
      } else {
        setErrorMessage("Lỗi: " + (e.message || "Không thể kết nối AI."));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdff] text-slate-900 font-sans selection:bg-indigo-100">
      <header className="h-20 px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-slate-100">
        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setState({...state, currentLesson: null})}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">ArtEdu AI</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowKeyModal(true)}
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            title="Cấu hình API Key"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md flex items-center transition-all active:scale-95"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Soạn bài
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        {state.currentLesson ? (
          <InteractivePlayer lesson={state.currentLesson} onBack={() => setState({...state, currentLesson: null})} />
        ) : (
          <div className="space-y-16">
            {/* Simple Banner */}
            {state.lessons.length === 0 && !state.isGenerating && (
              <section className="bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-white text-center space-y-8 shadow-2xl">
                <h2 className="text-4xl md:text-6xl font-black leading-tight">Soạn bài tập mĩ thuật <br/>trong chớp mắt với AI</h2>
                <p className="text-indigo-100 text-lg max-w-2xl mx-auto">Tự động thiết kế trắc nghiệm, ghép đôi và phân loại hình ảnh. Lưu API Key của riêng bạn để sử dụng ổn định hơn.</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all w-full md:w-auto"
                  >
                    Bắt đầu ngay
                  </button>
                  <button 
                    onClick={() => setShowKeyModal(true)}
                    className="bg-indigo-500/30 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-2xl font-black text-xl hover:bg-indigo-500/50 transition-all w-full md:w-auto"
                  >
                    Cấu hình API Key
                  </button>
                </div>
              </section>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-center text-rose-600 font-bold space-x-4 animate-fadeIn">
                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="flex-1">
                  <span>{errorMessage}</span>
                  {errorMessage.includes("Quota") && (
                    <button onClick={() => setShowKeyModal(true)} className="ml-2 underline hover:no-underline">Nhập key mới tại đây.</button>
                  )}
                </div>
                <button onClick={() => setErrorMessage(null)} className="ml-auto text-rose-300 hover:text-rose-500">✕</button>
              </div>
            )}

            {/* Progress */}
            {state.isGenerating && (
              <div className="bg-white border-2 border-slate-50 rounded-[3rem] p-16 text-center space-y-6 shadow-xl animate-pulse">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="text-2xl font-black text-slate-800">{loadingMsg}</h3>
              </div>
            )}

            {/* Content List */}
            {!state.isGenerating && (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <h3 className="text-2xl font-black text-slate-900">Thư viện bài giảng</h3>
                  <span className="bg-slate-100 px-4 py-1 rounded-full text-sm font-bold text-slate-500">{state.lessons.length} bài</span>
                </div>

                {state.lessons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {state.lessons.map(l => (
                      <LessonCard key={l.id} lesson={l} onSelect={(lesson) => setState({...state, currentLesson: lesson})} />
                    ))}
                  </div>
                ) : !state.isGenerating && (
                  <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-bold italic">Chưa có bài tập nào. Hãy nhấn "Soạn bài" để bắt đầu.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Soạn bài Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full p-8 md:p-12 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">Thiết kế bài tập mới</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-300 hover:text-rose-500">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Chủ đề mĩ thuật</label>
                <input 
                  type="text" value={newLesson.topic} onChange={e => setNewLesson({...newLesson, topic: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl outline-none font-bold"
                  placeholder="VD: Hội họa thời Phục Hưng"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {id: InteractionType.QUIZ, label: 'Trắc nghiệm'},
                  {id: InteractionType.MATCHING, label: 'Nối Cột'},
                  {id: InteractionType.WORD_DRAG, label: 'Kéo Thả Từ'},
                  {id: InteractionType.IMAGE_DRAG, label: 'Kéo Thả Ảnh'}
                ].map(t => (
                  <button 
                    key={t.id} onClick={() => setNewLesson({...newLesson, type: t.id})}
                    className={`py-4 rounded-2xl font-bold text-sm border-2 transition-all ${newLesson.type === t.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleGenerate} disabled={!newLesson.topic}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg disabled:opacity-50 transition-all hover:bg-indigo-700"
              >
                KHỞI TẠO BẰNG AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={showKeyModal} 
        onClose={() => setShowKeyModal(false)} 
        onSave={() => {
          setErrorMessage(null);
        }}
      />
    </div>
  );
};

export default App;
