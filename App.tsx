
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import StudentDashboard from './pages/StudentDashboard';
import TeacherAdmin from './pages/TeacherAdmin';
import LessonDetail from './pages/LessonDetail';
import Settings from './pages/Settings';
import { UserState } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserState>({
    name: 'Minh Nguyễn',
    points: 350,
    level: 'Họa sĩ tập sự',
    role: 'student'
  });

  return (
    <HashRouter>
      <div className="min-h-screen bg-warm-bg text-white pb-24 lg:pb-0">
        <Routes>
          <Route path="/" element={<StudentDashboard user={user} />} />
          <Route path="/admin" element={<TeacherAdmin />} />
          <Route path="/lesson/:id" element={<LessonDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>

        {/* Bottom Nav for Mobile */}
        <nav className="fixed bottom-0 left-0 w-full bg-warm-surface border-t border-white/10 pb-6 pt-3 px-6 z-50 lg:hidden">
          <div className="flex justify-between items-center max-w-md mx-auto">
            <Link to="/" className="flex flex-col items-center gap-1 text-primary">
              <span className="material-symbols-outlined fill-1">home</span>
              <span className="text-[10px] font-bold">Trang chủ</span>
            </Link>
            <Link to="/settings" className="flex flex-col items-center gap-1 text-text-gold">
              <span className="material-symbols-outlined">settings</span>
              <span className="text-[10px] font-medium">Cài đặt</span>
            </Link>
            <div className="-mt-10 size-14 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(236,146,19,0.5)] border-4 border-warm-bg cursor-pointer hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-warm-bg text-3xl">brush</span>
            </div>
            <Link to="/admin" className="flex flex-col items-center gap-1 text-text-gold">
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span className="text-[10px] font-medium">Giáo viên</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center gap-1 text-text-gold">
              <span className="material-symbols-outlined">person</span>
              <span className="text-[10px] font-medium">Cá nhân</span>
            </Link>
          </div>
        </nav>
      </div>
    </HashRouter>
  );
};

export default App;
