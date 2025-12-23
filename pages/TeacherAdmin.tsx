
import React, { useState } from 'react';
import { generateQuizFromTopic } from '../services/geminiService';

const TeacherAdmin: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const result = await generateQuizFromTopic(topic);
      if (result) {
        setLessons([
          { title: topic, date: new Date().toLocaleDateString(), questions: result },
          ...lessons
        ]);
        setTopic('');
      }
    } catch (e) {
      alert("Lỗi khi tạo câu hỏi. Hãy kiểm tra API Key!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-accent text-4xl">admin_panel_settings</span>
          Quản lý Giáo viên
        </h1>
        <p className="text-text-gold mt-1">Thiết kế bài giảng và theo dõi tiến độ học sinh.</p>
      </header>

      {/* AI Lesson Generator */}
      <section className="bg-warm-surface p-6 rounded-2xl border border-white/5 shadow-2xl space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          Trợ lý AI soạn bài
        </h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Nhập chủ đề (vd: Màu bổ túc, Tranh cổ động...)"
            className="flex-1 bg-warm-bg border-white/10 rounded-xl px-4 focus:ring-primary focus:border-primary"
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-primary text-warm-bg px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="animate-spin material-symbols-outlined">sync</span>
            ) : (
              <span className="material-symbols-outlined">rocket_launch</span>
            )}
            Tạo bài tập AI
          </button>
        </div>
      </section>

      {/* Content List */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold">Bài học đã tạo</h3>
        <div className="grid gap-4">
          {lessons.length === 0 ? (
            <div className="text-center py-20 bg-warm-surface rounded-2xl border border-dashed border-white/10 opacity-50">
              Chưa có bài học nào được tạo.
            </div>
          ) : (
            lessons.map((l, idx) => (
              <div key={idx} className="bg-warm-surface p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{l.title}</h4>
                  <p className="text-xs text-text-gold">{l.date} • {l.questions.length} câu hỏi</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="p-2 hover:text-accent transition-colors">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default TeacherAdmin;
