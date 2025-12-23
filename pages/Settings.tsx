
import React, { useState, useEffect } from 'react';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('GEMINI_API_KEY');
    if (stored) setApiKey(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
      </header>

      <section className="bg-warm-surface p-6 rounded-2xl border border-white/5 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold mb-1">Cấu hình AI (Gemini)</h2>
          <p className="text-sm text-text-gold mb-4">Nhập API Key để kích hoạt tính năng trợ lý ảo và tạo bài tập tự động.</p>
          
          <div className="space-y-4">
            <div className="relative">
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Nhập Gemini API Key của bạn..."
                className="w-full bg-warm-bg border-white/10 rounded-xl px-4 py-3 focus:ring-primary pr-12"
              />
              <span className="absolute right-4 top-3.5 material-symbols-outlined text-text-gold">key</span>
            </div>
            
            <div className="flex items-center justify-between">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary text-xs font-bold hover:underline">Lấy API Key miễn phí tại đây</a>
              <button 
                onClick={handleSave}
                className="bg-primary text-warm-bg px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
              >
                Lưu cài đặt
              </button>
            </div>

            {saved && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg text-sm flex items-center gap-2 animate-bounce">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Đã lưu thành công!
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-warm-surface p-6 rounded-2xl border border-white/5 opacity-50 cursor-not-allowed">
        <h2 className="text-lg font-bold mb-1">Cài đặt giao diện</h2>
        <p className="text-sm text-text-gold">Tùy chỉnh màu sắc và phông chữ của ứng dụng.</p>
      </section>
    </div>
  );
};

export default Settings;
