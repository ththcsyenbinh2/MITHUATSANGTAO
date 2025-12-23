
import React, { useState, useEffect } from 'react';
import { InteractionType, LessonContent, AppState } from './types';
import { GeminiService } from './services/geminiService';
import LessonCard from './components/LessonCard';
import InteractivePlayer from './components/InteractivePlayer';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    lessons: JSON.parse(localStorage.getItem('ARTEDU_LESSONS') || '[]'),
    currentLesson: null,
    isGenerating: false
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [newLesson, setNewLesson] = useState({ title: '', topic: '', type: InteractionType.QUIZ });

  useEffect(() => {
    localStorage.setItem('ARTEDU_LESSONS', JSON.stringify(state.lessons));
  }, [state.lessons]);

  const openSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Giả định chọn thành công và thử lại
      setShowQuotaModal(false);
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    if (!newLesson.topic) return;
    
    setState(prev => ({ ...prev, isGenerating: true }));
    setShowCreateModal(false);
    setLoadingMsg('AI đang phân tích kiến thức nghệ thuật...');

    try {
      const gemini = new GeminiService();
      
      setLoadingMsg('Đang tìm kiếm dữ liệu từ Google Search...');
      const contentPromise = gemini.generateContent(newLesson.topic, newLesson.type);
      const imagePromise = gemini.generateIllustrativeImage(newLesson.topic);

      const [contentResult, image] = await Promise.all([contentPromise, imagePromise]);

      const lesson: LessonContent = {
        id: Date.now().toString(),
        title: newLesson.title || newLesson.topic,
        description: `Khám phá chuyên sâu về ${newLesson.topic}`,
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
      console.error("Error generating content:", e);
      setState(prev => ({ ...prev, isGenerating: false }));
      
      // Kiểm tra lỗi Quota (429)
      if (e.message?.includes("429") || e.status === "RESOURCE_EXHAUSTED" || JSON.stringify(e).includes("quota")) {
        setShowQuotaModal(true);
      } else {
        alert("Có lỗi xảy ra trong quá trình khởi tạo. Vui lòng kiểm tra kết nối mạng và thử lại.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdff] text-slate-900 font-sans selection:bg-indigo-100">
      <header className="h-24 px-12 flex items-center justify-between sticky top-0 bg-white/70 backdrop-blur-3xl z-40 border-b border-slate-100">
        <div className="flex items-center space-x-6 cursor-pointer group" onClick={() => setState({...state, currentLesson: null})}>
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 rounded-[1.25rem] rotate-6 shadow-2xl flex items-center justify-center text-white ring-4 ring-white transition-transform group-hover:rotate-0">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">ArtEdu AI</h1>
            <p className="text-[10px] uppercase font-black text-indigo-500 tracking-[0.3em] mt-1">Nâng tầm giáo dục mĩ thuật</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black shadow-3xl shadow-indigo-100 flex items-center transition-all active:scale-95 group"
          >
            <svg className="w-6 h-6 mr-2 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Soạn bài mới
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 md:p-12">
        {state.currentLesson ? (
          <InteractivePlayer lesson={state.currentLesson} onBack={() => setState({...state, currentLesson: null})} />
        ) : (
          <div className="space-y-24">
            {/* Banner Section */}
            <section className={`relative overflow-hidden transition-all duration-700 ${state.lessons.length === 0 ? 'bg-white rounded-[5rem] p-16 md:p-24 shadow-4xl' : 'bg-indigo-900 rounded-[3rem] p-12 shadow-2xl text-white'}`}>
              <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
                <div className="flex-1 space-y-8 text-center md:text-left">
                  {state.lessons.length === 0 ? (
                    <>
                      <span className="inline-block px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Trợ lý mĩ thuật THCS</span>
                      <h2 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                        Thiết kế bài tập <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-rose-500">tương tác bằng AI.</span>
                      </h2>
                      <p className="text-slate-400 text-xl font-medium max-w-xl leading-relaxed">
                        Tự động sinh trắc nghiệm, ghép đôi và kéo thả hình ảnh từ kho dữ liệu nghệ thuật thế giới.
                      </p>
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-indigo-600 text-white px-14 py-6 rounded-[2.5rem] font-black text-2xl shadow-4xl shadow-indigo-200 hover:scale-105 transition-all flex items-center mx-auto md:mx-0"
                      >
                        Bắt đầu thiết kế ngay
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-4xl font-black tracking-tight leading-none">Thư viện bài tập mĩ thuật số</h2>
                      <p className="text-indigo-100/70 text-lg font-medium mt-2">Nâng cao hiệu quả giảng dạy và trải nghiệm học tập của học sinh.</p>
                    </>
                  )}
                </div>
                
                {state.lessons.length === 0 && (
                  <div className="flex-1 relative group w-full max-w-md">
                    <div className="aspect-square bg-gradient-to-tr from-indigo-100 via-white to-rose-100 rounded-[5rem] shadow-inner relative overflow-hidden rotate-3 group-hover:rotate-0 transition-all duration-1000">
                       <img src="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover mix-blend-multiply opacity-70" alt="Banner" />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Progress Section */}
            {state.isGenerating && (
              <div className="bg-white border-4 border-indigo-50 rounded-[5rem] p-24 text-center space-y-10 animate-pulse shadow-4xl">
                <div className="w-32 h-32 border-[10px] border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto shadow-2xl"></div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">{loadingMsg}</h3>
                  <p className="text-slate-400 font-medium text-xl mt-4">Vui lòng chờ trong giây lát, AI đang chuẩn bị tư liệu hình ảnh...</p>
                </div>
              </div>
            )}

            {/* Content Library */}
            {!state.isGenerating && (
              <div className="space-y-12">
                <div className="flex items-end justify-between border-b-4 border-slate-50 pb-10">
                  <div className="space-y-2">
                     <h3 className="text-4xl font-black text-slate-900 tracking-tight">Bài giảng đã soạn</h3>
                     <p className="text-slate-400 font-bold text-lg">Bạn có {state.lessons.length} bài tập tương tác trong kho lưu trữ.</p>
                  </div>
                </div>

                {state.lessons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {state.lessons.map(l => (
                      <LessonCard key={l.id} lesson={l} onSelect={(lesson) => setState({...state, currentLesson: lesson})} />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-300">
                    <svg className="w-24 h-24 mx-auto mb-6 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    <p className="text-xl font-bold italic">Chưa có bài tập nào được tạo.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal soạn bài */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-2xl flex items-center justify-center z-50 p-6 animate-fadeIn">
          <div className="bg-white rounded-[4rem] shadow-5xl max-w-2xl w-full p-12 md:p-16 space-y-12 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Thiết kế bài mới</h2>
              <button onClick={() => setShowCreateModal(false)} className="w-16 h-16 flex items-center justify-center bg-slate-50 rounded-[1.5rem] text-slate-300 hover:text-rose-500 transition-all">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-400 ml-4 tracking-[0.3em]">Tiêu đề</label>
                <input 
                  type="text" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                  className="w-full px-10 py-6 bg-slate-50 border-4 border-transparent focus:bg-white focus:border-indigo-600 rounded-[2rem] outline-none font-bold text-xl transition-all"
                  placeholder="VD: Tìm hiểu về tranh dân gian"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-400 ml-4 tracking-[0.3em]">Chủ đề chi tiết</label>
                <textarea 
                  value={newLesson.topic} onChange={e => setNewLesson({...newLesson, topic: e.target.value})}
                  className="w-full px-10 py-6 bg-slate-50 border-4 border-transparent focus:bg-white focus:border-indigo-600 rounded-[2rem] outline-none font-bold h-36 resize-none"
                  placeholder="VD: Giới thiệu tranh Đông Hồ, Hàng Trống và các nghệ nhân nổi tiếng..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {id: InteractionType.QUIZ, label: 'Trắc nghiệm', icon: '📝'},
                  {id: InteractionType.MATCHING, label: 'Nối Cột', icon: '🔗'},
                  {id: InteractionType.WORD_DRAG, label: 'Kéo Thả Từ', icon: '🎯'},
                  {id: InteractionType.IMAGE_DRAG, label: 'Kéo Thả Ảnh', icon: '🖼️'}
                ].map(t => (
                  <button 
                    key={t.id} onClick={() => setNewLesson({...newLesson, type: t.id})}
                    className={`py-6 rounded-[2rem] font-black text-sm border-4 transition-all ${newLesson.type === t.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl' : 'bg-white border-slate-50 text-slate-400 hover:border-indigo-200'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleGenerate} disabled={!newLesson.topic}
                className="w-full bg-indigo-600 text-white py-8 rounded-[2.5rem] font-black text-2xl shadow-4xl disabled:opacity-50 transition-all hover:scale-[1.02]"
              >
                KHỞI TẠO BẰNG AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thông báo lỗi Quota (429) */}
      {showQuotaModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-2xl flex items-center justify-center z-[100] p-6 animate-fadeIn">
          <div className="bg-white rounded-[4rem] shadow-5xl max-w-xl w-full p-12 md:p-16 text-center space-y-10 relative overflow-hidden border border-rose-100">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Hết lượt sử dụng miễn phí</h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                Tài khoản dùng chung đã đạt giới hạn quota (Error 429). 
                Để tiếp tục sử dụng ổn định với các model Pro mạnh mẽ hơn, vui lòng sử dụng API Key cá nhân của bạn.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <button 
                onClick={openSelectKey}
                className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-4xl hover:bg-indigo-700 transition-all flex items-center justify-center"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                Dùng API Key Cá Nhân
              </button>
              
              <p className="text-sm text-slate-400 font-bold">
                Cần hướng dẫn? <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Xem tài liệu Billing của Google</a>
              </p>
              
              <button 
                onClick={() => setShowQuotaModal(false)}
                className="w-full py-4 text-slate-400 font-black hover:text-slate-600"
              >
                Đóng thông báo
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .shadow-5xl { box-shadow: 0 40px 80px -20px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
};

export default App;
