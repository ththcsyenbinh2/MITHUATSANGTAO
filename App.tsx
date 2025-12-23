import React, { useState, useEffect } from 'react';
import { InteractionType, LessonContent, AppState } from './types';
import { GeminiService } from './services/geminiService';
import ApiKeyModal from './components/ApiKeyModal';
import LessonCard from './components/LessonCard';
import InteractivePlayer from './components/InteractivePlayer';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    // API key is handled via process.env.API_KEY globally as per guidelines
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
    setLoadingMsg('AI đang nghiên cứu kiến thức Mỹ thuật...');

    try {
      // GeminiService uses process.env.API_KEY automatically
      const gemini = new GeminiService();
      
      setLoadingMsg('Đang thu thập hình ảnh và soạn thảo...');
      const contentPromise = gemini.generateContent(newLesson.topic, newLesson.type);
      const imagePromise = gemini.generateIllustrativeImage(newLesson.topic);

      const [contentResult, image] = await Promise.all([contentPromise, imagePromise]);

      const lesson: LessonContent = {
        id: Date.now().toString(),
        title: newLesson.title || newLesson.topic,
        description: `Bài học khám phá về ${newLesson.topic}`,
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
      alert("Lỗi: " + (e.message || "Không thể kết nối API"));
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900 font-sans selection:bg-indigo-100">
      {/* ApiKeyModal is kept for structure but disabled via props per SDK guidelines */}
      <ApiKeyModal isOpen={false} onSave={() => {}} />

      <header className="h-24 px-10 flex items-center justify-between sticky top-0 bg-white/60 backdrop-blur-2xl z-40 border-b border-slate-100">
        <div className="flex items-center space-x-5 cursor-pointer" onClick={() => setState({...state, currentLesson: null})}>
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl rotate-3 shadow-2xl flex items-center justify-center text-white ring-4 ring-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">ArtEdu AI</h1>
            <p className="text-[10px] uppercase font-black text-indigo-500 tracking-widest mt-1">Trợ Lý Mỹ Thuật Thông Minh</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black shadow-2xl shadow-indigo-100 flex items-center transition-all active:scale-95"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Tạo bài học
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10">
        {state.currentLesson ? (
          <InteractivePlayer lesson={state.currentLesson} onBack={() => setState({...state, currentLesson: null})} />
        ) : (
          <div className="space-y-20">
            {/* Banner Section */}
            {!state.isGenerating && state.lessons.length === 0 && (
              <section className="bg-white rounded-[4rem] p-16 md:p-24 shadow-4xl flex flex-col md:flex-row items-center gap-16 relative overflow-hidden border border-slate-50">
                <div className="flex-1 space-y-8 relative z-10 text-center md:text-left">
                  <span className="inline-block px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">Chào mừng bạn đến với ArtEdu</span>
                  <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                    Nâng tầm giảng dạy <br/><span className="text-indigo-600">Mỹ thuật với AI.</span>
                  </h2>
                  <p className="text-slate-400 text-xl font-medium max-w-xl">
                    Biến các khái niệm nghệ thuật khô khan thành bài tập tương tác sinh động. 
                    Tự động tìm kiếm tư liệu tranh vẽ và họa sĩ thực tế.
                  </p>
                  <div className="flex justify-center md:justify-start">
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-xl shadow-3xl shadow-indigo-200 hover:scale-105 transition-all"
                    >
                      Bắt đầu soạn bài ngay
                    </button>
                  </div>
                </div>
                <div className="flex-1 relative group">
                  <div className="w-full aspect-square bg-gradient-to-tr from-indigo-100 to-rose-100 rounded-[4rem] shadow-inner relative overflow-hidden rotate-2 group-hover:rotate-0 transition-transform duration-700">
                     <img src="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover mix-blend-multiply opacity-80" />
                     <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-white p-4 rounded-3xl shadow-2xl animate-bounce -rotate-3">
                     <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover rounded-2xl" />
                  </div>
                </div>
              </section>
            )}

            {/* Progress Section */}
            {state.isGenerating && (
              <div className="bg-white border-2 border-indigo-50 rounded-[4rem] p-20 text-center space-y-8 animate-pulse shadow-4xl">
                <div className="w-24 h-24 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900">{loadingMsg}</h3>
                  <p className="text-slate-400 font-medium text-lg mt-3">Chúng tôi đang tìm link ảnh thực tế từ Google Search để bài học thêm sinh động...</p>
                </div>
              </div>
            )}

            {/* Content Library */}
            <div className="space-y-10">
              <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                <div>
                   <h3 className="text-3xl font-black text-slate-900">Bài học đã soạn</h3>
                   <p className="text-slate-400 font-medium mt-1">Sử dụng các bài tập này để giảng dạy trực tiếp trên lớp.</p>
                </div>
                <div className="bg-white px-6 py-2 rounded-full border border-slate-100 font-black text-indigo-600 text-sm shadow-sm">
                  {state.lessons.length} Bài giảng
                </div>
              </div>

              {state.lessons.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {state.lessons.map(l => (
                    <LessonCard key={l.id} lesson={l} onSelect={(lesson) => setState({...state, currentLesson: lesson})} />
                  ))}
                </div>
              )}

              {state.lessons.length === 0 && !state.isGenerating && (
                <div className="py-20 text-center">
                  <p className="text-slate-300 font-black italic">Hãy tạo bài tập đầu tiên để lấp đầy không gian nghệ thuật này.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-50 p-6 animate-fadeIn">
          <div className="bg-white rounded-[4rem] shadow-4xl max-w-2xl w-full p-12 md:p-16 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
            
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Soạn bài giảng AI</h2>
              <button onClick={() => setShowCreateModal(false)} className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-100">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-slate-400 ml-2 tracking-widest">Tiêu đề bài học</label>
                <input 
                  type="text" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-3xl outline-none font-bold text-lg transition-all"
                  placeholder="VD: Hội họa Phục Hưng Italia"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-slate-400 ml-2 tracking-widest">Chủ đề chi tiết cho AI</label>
                <textarea 
                  value={newLesson.topic} onChange={e => setNewLesson({...newLesson, topic: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-3xl outline-none font-bold transition-all h-36 resize-none"
                  placeholder="VD: Tìm hiểu về các tác phẩm của Leonardo da Vinci, Raphael, Michelangelo..."
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-400 ml-2 tracking-widest">Hình thức làm bài</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {id: InteractionType.QUIZ, label: 'Trắc nghiệm'},
                    {id: InteractionType.MATCHING, label: 'Ghép đôi (Nối)'},
                    {id: InteractionType.WORD_DRAG, label: 'Phân loại nhóm'},
                    {id: InteractionType.PAIRING, label: 'Nối cột'}
                  ].map(t => (
                    <button 
                      key={t.id} onClick={() => setNewLesson({...newLesson, type: t.id})}
                      className={`py-5 rounded-3xl font-black text-sm border-2 transition-all active:scale-95 ${newLesson.type === t.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-6 pt-6">
                <button 
                  onClick={handleGenerate} disabled={!newLesson.topic}
                  className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-4xl shadow-indigo-100 disabled:opacity-50 transition-all hover:bg-indigo-700 active:scale-95"
                >
                  Bắt đầu sinh bài tập &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
