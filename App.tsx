
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
  const [loadingMsg, setLoadingMsg] = useState('');
  const [newLesson, setNewLesson] = useState({ title: '', topic: '', type: InteractionType.QUIZ });

  useEffect(() => {
    localStorage.setItem('ARTEDU_LESSONS', JSON.stringify(state.lessons));
  }, [state.lessons]);

  const handleGenerate = async () => {
    if (!newLesson.topic) return;
    
    setState(prev => ({ ...prev, isGenerating: true }));
    setShowCreateModal(false);
    setLoadingMsg('AI đang phân tích kiến thức nghệ thuật...');

    try {
      const gemini = new GeminiService();
      
      setLoadingMsg('Đang tìm kiếm link ảnh từ Google Search...');
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
      console.error(e);
      alert("Hệ thống đang quá tải hoặc lỗi kết nối. Vui lòng thử lại sau.");
      setState(prev => ({ ...prev, isGenerating: false }));
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
            <p className="text-[10px] uppercase font-black text-indigo-500 tracking-[0.3em] mt-1">Artistic Education Intelligence</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black shadow-3xl shadow-indigo-100 flex items-center transition-all active:scale-95 group"
          >
            <svg className="w-6 h-6 mr-2 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Thiết kế bài tập
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 md:p-12">
        {state.currentLesson ? (
          <InteractivePlayer lesson={state.currentLesson} onBack={() => setState({...state, currentLesson: null})} />
        ) : (
          <div className="space-y-24">
            {/* Banner Section - Always show on home if no lessons, or show mini version */}
            <section className={`relative overflow-hidden transition-all duration-700 ${state.lessons.length === 0 ? 'bg-white rounded-[5rem] p-16 md:p-24 shadow-4xl' : 'bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-[3rem] p-12 shadow-2xl text-white'}`}>
              <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
                <div className="flex-1 space-y-8 text-center md:text-left">
                  {state.lessons.length === 0 ? (
                    <>
                      <span className="inline-block px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Kỷ nguyên mĩ thuật số</span>
                      <h2 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                        Khám phá nghệ thuật <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-rose-500">cùng Trí tuệ nhân tạo.</span>
                      </h2>
                      <p className="text-slate-400 text-xl font-medium max-w-xl leading-relaxed">
                        Nâng tầm bài giảng mĩ thuật THCS với các bài tập tương tác kéo thả, nối cột sinh động. 
                        Tự động tìm kiếm link ảnh tác phẩm thực tế từ Google.
                      </p>
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-indigo-600 text-white px-14 py-6 rounded-[2.5rem] font-black text-2xl shadow-4xl shadow-indigo-200 hover:scale-105 transition-all flex items-center mx-auto md:mx-0"
                      >
                        Bắt đầu ngay
                        <svg className="w-6 h-6 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-4xl font-black tracking-tight leading-none">Thư viện bài giảng <span className="text-indigo-300">Sáng tạo</span></h2>
                      <p className="text-indigo-100/70 text-lg font-medium mt-2">Nơi những ý tưởng nghệ thuật được hiện thực hóa bởi AI.</p>
                    </>
                  )}
                </div>
                
                {state.lessons.length === 0 && (
                  <div className="flex-1 relative group w-full max-w-md">
                    <div className="aspect-square bg-gradient-to-tr from-indigo-100 via-white to-rose-100 rounded-[5rem] shadow-inner relative overflow-hidden rotate-3 group-hover:rotate-0 transition-all duration-1000">
                       <img src="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover mix-blend-multiply opacity-70" alt="Banner" />
                       <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent"></div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-white p-5 rounded-[2.5rem] shadow-4xl animate-float -rotate-6">
                       <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover rounded-[1.8rem]" alt="Art" />
                    </div>
                    <div className="absolute -top-6 -left-6 w-32 h-32 bg-indigo-600 p-4 rounded-3xl shadow-2xl flex items-center justify-center text-white font-black text-2xl rotate-12">
                       AI+
                    </div>
                  </div>
                )}
              </div>
              
              {state.lessons.length === 0 && (
                <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-indigo-50 rounded-full opacity-30 blur-[150px] pointer-events-none"></div>
              )}
            </section>

            {/* Progress Section */}
            {state.isGenerating && (
              <div className="bg-white border-4 border-indigo-50 rounded-[5rem] p-24 text-center space-y-10 animate-pulse shadow-4xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600 origin-left animate-progress"></div>
                <div className="w-32 h-32 border-[10px] border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto shadow-2xl"></div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">{loadingMsg}</h3>
                  <p className="text-slate-400 font-medium text-xl mt-4">Gemini đang trích xuất link ảnh thực tế từ các nguồn mĩ thuật uy tín...</p>
                </div>
              </div>
            )}

            {/* Content Library */}
            {!state.isGenerating && (
              <div className="space-y-12">
                <div className="flex items-end justify-between border-b-4 border-slate-50 pb-10">
                  <div className="space-y-2">
                     <h3 className="text-4xl font-black text-slate-900 tracking-tight">Thư viện bài giảng</h3>
                     <p className="text-slate-400 font-bold text-lg">Tổng cộng {state.lessons.length} bài tập đã được AI thiết kế.</p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-indigo-200 rounded-full"></div>
                    <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                  </div>
                </div>

                {state.lessons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {state.lessons.map(l => (
                      <LessonCard key={l.id} lesson={l} onSelect={(lesson) => setState({...state, currentLesson: lesson})} />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center opacity-30 grayscale pointer-events-none">
                    <svg className="w-32 h-32 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <p className="text-2xl font-black uppercase tracking-widest">Không gian mĩ thuật trống</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modern Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-2xl flex items-center justify-center z-50 p-6 animate-fadeIn">
          <div className="bg-white rounded-[4rem] shadow-5xl max-w-2xl w-full p-12 md:p-16 space-y-12 relative overflow-hidden border border-white">
            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-indigo-600 via-purple-500 to-rose-500"></div>
            
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Soạn bài giảng AI</h2>
                <p className="text-slate-400 font-bold mt-1">Cung cấp chủ đề mĩ thuật, AI lo phần còn lại.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="w-16 h-16 flex items-center justify-center bg-slate-50 rounded-[1.5rem] text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-400 ml-4 tracking-[0.3em]">Tiêu đề bài giảng</label>
                <input 
                  type="text" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                  className="w-full px-10 py-6 bg-slate-50 border-4 border-transparent focus:bg-white focus:border-indigo-600 rounded-[2rem] outline-none font-bold text-xl transition-all shadow-inner"
                  placeholder="VD: Hội họa thời kỳ Phục Hưng"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-400 ml-4 tracking-[0.3em]">Chủ đề & Kiến thức cần khai thác</label>
                <textarea 
                  value={newLesson.topic} onChange={e => setNewLesson({...newLesson, topic: e.target.value})}
                  className="w-full px-10 py-6 bg-slate-50 border-4 border-transparent focus:bg-white focus:border-indigo-600 rounded-[2rem] outline-none font-bold transition-all h-44 resize-none shadow-inner"
                  placeholder="VD: Tìm hiểu về phong cách của Vincent van Gogh, tập trung vào tranh Đêm đầy sao và Hoa hướng dương..."
                />
              </div>
              <div className="space-y-6">
                <label className="text-xs font-black uppercase text-slate-400 ml-4 tracking-[0.3em]">Hình thức tương tác</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {id: InteractionType.QUIZ, label: 'Trắc nghiệm', icon: '📝'},
                    {id: InteractionType.MATCHING, label: 'Nối Cột', icon: '🔗'},
                    {id: InteractionType.WORD_DRAG, label: 'Kéo Thả Từ', icon: '🎯'},
                    {id: InteractionType.IMAGE_DRAG, label: 'Kéo Thả Ảnh', icon: '🖼️'}
                  ].map(t => (
                    <button 
                      key={t.id} onClick={() => setNewLesson({...newLesson, type: t.id})}
                      className={`py-6 rounded-[2rem] font-black text-sm border-4 transition-all active:scale-95 flex flex-col items-center justify-center space-y-2 ${newLesson.type === t.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl' : 'bg-white border-slate-50 text-slate-400 hover:border-indigo-200 shadow-sm'}`}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-6">
                <button 
                  onClick={handleGenerate} disabled={!newLesson.topic}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-8 rounded-[2.5rem] font-black text-2xl shadow-4xl shadow-indigo-100 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center group"
                >
                  <svg className="w-8 h-8 mr-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM14.243 14.243a1 1 0 101.414-1.414l-.707-.707a1 1 0 10-1.414 1.414l.707.707zM6.464 14.95a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 011.414-1.414l.707.707z" /></svg>
                  KHỞI TẠO BÀI GIẢNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-20px) rotate(-3deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-progress {
          animation: progress 10s linear infinite;
        }
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .shadow-5xl {
          box-shadow: 0 50px 100px -20px rgba(79, 70, 229, 0.2), 0 30px 60px -30px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default App;
