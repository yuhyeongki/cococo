import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';

interface NavbarProps {
  activeSection: 'meditation' | 'counseling' | 'emotions';
  onSelectSection: (section: 'meditation' | 'counseling' | 'emotions') => void;
  onOpenGoogleChat: () => void;
  userEmail?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onSelectSection,
  onOpenGoogleChat,
  userEmail,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onSelectSection('meditation');
          }}
          className="flex items-center gap-2 text-base font-bold tracking-tight text-teal-900 whitespace-nowrap shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-teal-800 text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>마음쉼터</span>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectSection('meditation')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeSection === 'meditation'
                ? 'text-teal-900 font-semibold border-b-2 border-teal-800 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            오늘의 쉼
          </button>
          <button
            onClick={() => onSelectSection('counseling')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeSection === 'counseling'
                ? 'text-teal-900 font-semibold border-b-2 border-teal-800 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            AI 전문상담
          </button>
          <button
            onClick={() => onSelectSection('emotions')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeSection === 'emotions'
                ? 'text-teal-900 font-semibold border-b-2 border-teal-800 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            감정 통계
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenGoogleChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-900 bg-white hover:bg-teal-50 border border-stone-200 rounded-xl shadow-2xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
            title="Google Chat 연동"
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
            <span className="hidden sm:inline">
              {userEmail ? 'Google Chat 연결됨' : 'Google Chat 연동'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
