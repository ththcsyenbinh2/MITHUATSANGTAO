
import React from 'react';
import { Link } from 'react-router-dom';
import { UserState } from '../types';
import { INITIAL_LESSONS } from '../constants';

interface Props {
  user: UserState;
}

const StudentDashboard: React.FC<Props> = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-warm-bg/95 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full border-2 border-primary bg-cover bg-center" style={{backgroundImage: `url('https://picsum.photos/seed/avatar/100')`}}></div>
          <div className="flex flex-col">
            <span className="text-xs text-text-gold">Chào buổi sáng,</span>
            <span className="text-sm font-bold">{user.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-warm-surface px-3 py-1.5 rounded-full border border-white/5">
          <span className="material-symbols-outlined text-primary text-[20px] fill-1">local_fire_department</span>
          <p className="text-primary text-sm font-bold">{user.points} Điểm</p>
        </div>
      </header>

      <main className="px-4 pt-6 space-y-8">
        {/* Progress Card */}
        <section>
          <h1 className="text-2xl font-bold mb-4">Sáng tạo mỗi ngày! <span className="text-primary">🎨</span></h1>
          <div className="bg-warm-surface rounded-2xl p-5 border border-white/5 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-text-gold text-xs uppercase tracking-widest font-bold">Cấp độ hiện tại</p>
                <p className="text-lg font-bold">{user.level}</p>
              </div>
              <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">workspace_premium</span>
              </div>
            </div>
            <div className="w-full bg-warm-bg rounded-full h-3 mb-2 overflow-hidden">
              <div className="bg-primary h-full transition-all duration-1000 ease-out" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between text-xs font-bold text-text-gold">
              <span>65% Kinh nghiệm</span>
              <span>Level 12</span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {[
              { icon: 'brush', label: 'Vẽ tự do', color: 'text-primary' },
              { icon: 'emoji_events', label: 'Thử thách', color: 'text-accent' },
              { icon: 'quiz', label: 'Đố vui AI', color: 'text-blue-400' },
              { icon: 'auto_awesome', label: 'Sáng tạo', color: 'text-purple-400' }
            ].map((action, idx) => (
              <button key={idx} className="flex-shrink-0 flex flex-col items-center gap-2 group">
                <div className="size-16 rounded-2xl bg-warm-surface flex items-center justify-center border border-white/5 group-hover:border-primary transition-all shadow-lg active:scale-95">
                  <span className={`material-symbols-outlined text-3xl ${action.color}`}>{action.icon}</span>
                </div>
                <span className="text-xs font-medium text-text-gold group-hover:text-white">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Lessons */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Bài học mới</h3>
            <button className="text-primary text-sm font-bold">Xem tất cả</button>
          </div>
          <div className="grid gap-4">
            {INITIAL_LESSONS.map((lesson) => (
              <Link key={lesson.id} to={`/lesson/${lesson.id}`} className="block group">
                <div className="bg-warm-surface rounded-2xl overflow-hidden border border-white/5 shadow-lg group-hover:translate-y-[-2px] transition-transform">
                  <div className="h-40 bg-cover bg-center relative" style={{backgroundImage: `url('${lesson.image}')`}}>
                    <div className="absolute inset-0 bg-gradient-to-t from-warm-surface via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-primary text-warm-bg text-[10px] font-black uppercase tracking-wider">{lesson.category}</span>
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{lesson.title}</h4>
                      <p className="text-xs text-text-gold mt-1">{lesson.questions.length} hoạt động tương tác</p>
                    </div>
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center text-warm-bg">
                      <span className="material-symbols-outlined">play_arrow</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
