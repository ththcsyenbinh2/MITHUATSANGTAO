
import React, { useState } from 'react';

interface Props {
  onSave: (key: string) => void;
  isOpen: boolean;
}

const ApiKeyModal: React.FC<Props> = ({ onSave, isOpen }) => {
  const [key, setKey] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Nhập API Key</h2>
          <p className="text-gray-500 mt-2">Để sử dụng AI sinh bài giảng, bạn cần cung cấp Gemini API Key.</p>
        </div>
        
        <div className="space-y-4">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste your API key here..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
          <button
            onClick={() => onSave(key)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-200"
          >
            Bắt đầu khám phá
          </button>
          <p className="text-xs text-center text-gray-400">
            Khóa của bạn được lưu an toàn trong trình duyệt (Local Storage).
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
