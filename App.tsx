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
  const [loadingMsg, setLoadingMsg] = useState('');
  const [newLesson, setNewLesson] = useState({ title: '', topic: '', type: InteractionType.QUIZ });

  useEffect(() => {
    localStorage.setItem('ARTEDU_LESSONS', JSON.stringify(state.lessons));
  }, [state.lessons]);

  const handleGenerate = async () => {
    if (!state.apiKey || !newLesson.topic) return;
    
    setState(prev => ({ ...prev, isGenerating: true }));
    setShowCreateModal(false);
    setLoadingMsg('AI đang nghiên cứu kiến thức Mỹ thuật...');

    try {
      const gemini = new GeminiService(state.apiKey);
      
      const contentPromise = gemini.generateContent(newLesson.topic, newLesson.type);
      const imagePromise = gemini.generateIllustrativeImage(newLesson.topic);

      const [content, image] = await Promise.all([contentPromise, imagePromise]);

      const lesson: LessonContent = {
        id: Date.now().toString(),
        title: newLesson.title || newLesson.topic,
        description: `Bài học khám phá về ${newLesson.topic}`,
        type: newLesson.type,
        data: content,
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
    <div className="min-h-screen bg-[#fcfdff] text-slate-900 font-sans">
      <ApiKeyModal isOpen={!state.apiKey} onSave={(k) => { localStorage.setItem('GEMINI_API_KEY', k); setState({...state, apiKey: k}); }} />

      <header className="h-24 px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-slate-100">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl rotate-6 shadow-xl flex items-center justify-center text-white">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">ArtEdu AI</h1>
            <p className="text-[10px] uppercase font-black text-indigo-500 tracking-widest">Mastering Art with Intelligence</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Soạn bài mới
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {state.currentLesson ? (
          <InteractivePlayer lesson={state.currentLesson} onBack={() => setState({...state, currentLesson: null})} />
        ) : (
          <div className="space-y-12">
            {/* Progress Section */}
            {state.isGenerating && (
              <div className="bg-white border-2 border-indigo-100 rounded-[2.5rem] p-12 text-center space-y-6 animate-pulse">
                <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="text-2xl font-black text-slate-800">{loadingMsg}</h3>
                <p className="text-slate-400 font-medium italic">Gemini đang vẽ tranh minh họa và soạn câu hỏi cho bạn...</p>
              </div>
            )}

            {/* Library Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {state.lessons.map(l => (
                <LessonCard key={l.id} lesson={l} onSelect={(lesson) => setState({...state, currentLesson: lesson})} />
              ))}
            </div>

            {state.lessons.length === 0 && !state.isGenerating && (
              <div className="py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-2xl font-black text-slate-400">Thư viện bài giảng đang trống</h2>
                <p className="text-slate-400 mt-2 font-medium">Bấm "Soạn bài mới" để bắt đầu cùng AI</p>
              </div>
            )}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[3rem] shadow-3xl max-w-xl w-full p-10 space-y-8 animate-fadeIn">
            <h2 className="text-3xl font-black text-slate-900">Thiết kế bài giảng</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-2 tracking-widest">Tên bài học</label>
                <input 
                  type="text" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl outline-none font-bold transition-all"
                  placeholder="VD: Thế giới hội họa Phục Hưng"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-2 tracking-widest">Nội dung trọng tâm</label>
                <textarea 
                  value={newLesson.topic} onChange={e => setNewLesson({...newLesson, topic: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl outline-none font-bold transition-all h-32 resize-none"
                  placeholder="VD: Tìm hiểu về màu sắc nóng lạnh, các họa sĩ tiêu biểu Việt Nam..."
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-slate-400 ml-2 tracking-widest">Hình thức làm bài</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {id: InteractionType.QUIZ, label: 'Trắc nghiệm'},
                    {id: InteractionType.WORD_DRAG, label: 'Phân loại (Kéo thả)'},
                    {id: InteractionType.MATCHING, label: 'Ghép đôi'},
                    {id: InteractionType.PAIRING, label: 'Nối cột'}
                  ].map(t => (
                    <button 
                      key={t.id} onClick={() => setNewLesson({...newLesson, type: t.id})}
                      className={`py-4 rounded-2xl font-black text-sm border-2 transition-all ${newLesson.type === t.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600">Hủy bỏ</button>
                <button 
                  onClick={handleGenerate} disabled={!newLesson.topic}
                  className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 disabled:opacity-50"
                >
                  Sinh bài bằng AI
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
