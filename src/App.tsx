/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Navbar } from '@/src/components/Navbar';
import { DailyMeditation } from '@/src/components/DailyMeditation';
import { CounselingRoom } from '@/src/components/CounselingRoom';
import { EmotionTracker } from '@/src/components/EmotionTracker';
import { SoundscapePlayer } from '@/src/components/SoundscapePlayer';
import { GoogleChatModal } from '@/src/components/GoogleChatModal';
import { initAuth } from '@/src/services/googleChat';
import {
  Heart,
  MessageCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<'meditation' | 'counseling' | 'emotions'>('meditation');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Google Chat Modal State
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatSourceTitle, setChatSourceTitle] = useState<string>('오늘의 격려 문구');

  useEffect(() => {
    const unsub = initAuth(
      (user) => setUserEmail(user.email || null),
      () => setUserEmail(null)
    );
    return () => unsub();
  }, []);

  const handleOpenGoogleChat = (
    message: string = '오늘 하루도 교실에서 묵묵히 헌신하신 선생님, 진심으로 응원합니다.',
    sourceTitle: string = '교사 마음 나눔'
  ) => {
    setChatMessage(message);
    setChatSourceTitle(sourceTitle);
    setIsChatModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col antialiased selection:bg-teal-100 selection:text-teal-900 pb-24">
      {/* Top Bar Header */}
      <Navbar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onOpenGoogleChat={() => handleOpenGoogleChat()}
        userEmail={userEmail}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Editorial Subheader & Quick Jump */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200/70">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {activeSection === 'meditation'
                ? '오늘의 쉼과 호흡'
                : activeSection === 'counseling'
                ? '교사 마음 공감 상담소'
                : '감정 변화 통계 & 일기'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {activeSection === 'meditation'
                ? '매일 전하는 따뜻한 격려와 1분 마음챙김 호흡으로 심리적 온기를 충전하세요.'
                : activeSection === 'counseling'
                ? '학부모 민원, 학생 지도, 동료 갈등, 업무 피로에 지친 마음을 털어놓으세요.'
                : '선생님의 감정 흐름을 기록하고 주간·월간 마음 평온도를 확인해 보세요.'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <button
              onClick={() => setActiveSection('meditation')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                activeSection === 'meditation'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>오늘의 쉼</span>
            </button>
            <button
              onClick={() => setActiveSection('counseling')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                activeSection === 'counseling'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>AI 전문상담</span>
            </button>
            <button
              onClick={() => setActiveSection('emotions')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                activeSection === 'emotions'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>감정 통계</span>
            </button>
          </div>
        </div>

        {/* Dynamic Section Render */}
        <section className="transition-opacity duration-200">
          {activeSection === 'meditation' && (
            <DailyMeditation onOpenGoogleChat={handleOpenGoogleChat} />
          )}

          {activeSection === 'counseling' && (
            <CounselingRoom onOpenGoogleChat={handleOpenGoogleChat} />
          )}

          {activeSection === 'emotions' && <EmotionTracker />}
        </section>

        {/* Quiet Footer */}
        <footer className="pt-8 text-center text-xs text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1 text-slate-500">
            <Sparkles className="w-3 h-3 text-teal-700" />
            <span>마음쉼터 · 대한민국 모든 선생님들의 평온한 일상을 응원합니다.</span>
          </p>
          <p className="text-[11px] text-slate-400">
            기록된 감정 데이터는 브라우저 로컬 저장소에 안전하게 보관됩니다.
          </p>
        </footer>
      </main>

      {/* Persistent Floating Soundscape Player */}
      <SoundscapePlayer />

      {/* Google Chat Modal */}
      <GoogleChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        initialMessage={chatMessage}
        sourceTitle={chatSourceTitle}
      />
    </div>
  );
}
