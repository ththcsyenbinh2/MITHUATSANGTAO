
import React, { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('USER_ARTEDU_API_KEY') || '';
    setKey(savedKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('USER_ARTEDU_API_KEY', key);
    onSave(key);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-4xl max-w-md w-full p-10 space-y-8 relative overflow-hidden border border-slate-100">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">Cấu hình API Key</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Nhập API Key của bạn để sử dụng dịch vụ AI. Key sẽ được <strong>lưu an toàn trên trình duyệt của bạn</strong> và không gửi đi đâu khác.
          </p>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Google Gemini API Key</label>
            <div className="relative">
              <input 
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-indigo-600 rounded-2xl outline-none font-mono text-sm transition-all pr-12"
                placeholder="AIzaSy..."
              />
              <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showKey ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-2xl">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold text-indigo-600 flex items-center justify-center hover:underline"
            >
              Lấy API Key miễn phí tại đây
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
          >
            Lưu vào trình duyệt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
