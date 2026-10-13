import React, { useState, useEffect } from 'react';
import { DailyEncouragement } from '@/src/types';
import {
  Heart,
  Sparkles,
  Share2,
  RefreshCw,
  Play,
  RotateCcw,
  CheckCircle2,
  Quote,
  Feather,
} from 'lucide-react';

interface DailyMeditationProps {
  onOpenGoogleChat: (message: string, sourceTitle: string) => void;
}

const DEFAULT_ENCOURAGEMENT: DailyEncouragement = {
  quote: '선생님의 따뜻한 눈빛 하나가 아이의 하루를, 그리고 평생을 밝혀주는 등대가 됩니다.',
  author: '마음쉼터 오늘의 온기',
  mindfulness: '어깨의 힘을 툭 빼고, 가슴에 손을 얹은 채 내 호흡의 따스한 온도를 느껴보세요.',
  reflectionTip: '모든 아이를 바꿀 수는 없지만, 오늘 선생님이 건넨 미소는 분명 전해졌습니다.',
};

export const DailyMeditation: React.FC<DailyMeditationProps> = ({ onOpenGoogleChat }) => {
  const [encouragement, setEncouragement] = useState<DailyEncouragement>(DEFAULT_ENCOURAGEMENT);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  // Breathing meditation state
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    setIsLoadingQuote(true);
    try {
      const res = await fetch('/api/daily-encouragement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: 'restful' }),
      });
      if (res.ok) {
        const data = await res.json();
        setEncouragement(data);
      }
    } catch (err) {
      console.warn('Failed to fetch daily quote, using default:', err);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // 1-minute box/resonant breathing loop: Inhale (4s) -> Hold (4s) -> Exhale (6s) -> Rest (2s) = 16s per cycle. 4 cycles = ~64s.
  useEffect(() => {
    let timer: any = null;
    if (isBreathingActive && !isFinished) {
      timer = setInterval(() => {
        setPhaseSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition to next phase
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              return 4;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              return 6;
            } else if (breathPhase === 'exhale') {
              setBreathPhase('rest');
              return 2;
            } else {
              // Cycle completed
              const nextCycle = cycleCount + 1;
              setCycleCount(nextCycle);
              if (nextCycle >= 3) {
                // Done 3 cycles (~48s)
                setIsFinished(true);
                setIsBreathingActive(false);
                return 0;
              } else {
                setBreathPhase('inhale');
                return 4;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathPhase, cycleCount, isFinished]);

  const startBreathing = () => {
    setIsFinished(false);
    setCycleCount(0);
    setBreathPhase('inhale');
    setPhaseSecondsLeft(4);
    setIsBreathingActive(true);
  };

  const resetBreathing = () => {
    setIsBreathingActive(false);
    setIsFinished(false);
    setCycleCount(0);
    setBreathPhase('inhale');
    setPhaseSecondsLeft(4);
  };

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case 'inhale':
        return { text: '코로 깊고 맑은 숨을 들이마십니다', sub: '가슴과 배가 편안하게 부풀어 오릅니다' };
      case 'hold':
        return { text: '숨을 멈추고 고요함을 느껴보세요', sub: '온몸의 긴장이 멈춥니다' };
      case 'exhale':
        return { text: '입으로 후- 하고 길게 내쉽니다', sub: '교실에서의 모든 피로와 걱정을 밖으로 보냅니다' };
      case 'rest':
        return { text: '편안하게 자연스러운 상태로 비웁니다', sub: '다음 숨을 준비합니다' };
    }
  };

  const getCircleScale = () => {
    if (!isBreathingActive) return 'scale-100';
    switch (breathPhase) {
      case 'inhale':
        return 'scale-125 transition-transform duration-4000 ease-out';
      case 'hold':
        return 'scale-125 transition-none';
      case 'exhale':
        return 'scale-90 transition-transform duration-6000 ease-in-out';
      case 'rest':
        return 'scale-95 transition-transform duration-2000 ease-in';
    }
  };

  const currentInfo = getBreathInstruction();

  return (
    <div className="space-y-6">
      {/* Top Banner & Daily Quote Card */}
      <div className="bg-gradient-to-br from-emerald-50/70 via-stone-50 to-amber-50/50 rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-4 right-4 text-stone-200/60 pointer-events-none">
          <Quote className="w-24 h-24 stroke-1 opacity-20" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800">
            <Feather className="w-4 h-4" />
            <span>오늘의 교사 마음 처방전</span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-500 font-normal">{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</span>
          </div>

          <blockquote className="text-lg sm:text-xl font-medium text-slate-800 leading-relaxed text-balance">
            "{encouragement.quote}"
          </blockquote>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-200/60">
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-medium text-slate-700 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                <span>마음 챙김 팁:</span> {encouragement.reflectionTip}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={fetchQuote}
                disabled={isLoadingQuote}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-stone-200/50 transition-colors cursor-pointer"
                title="새로운 격려 메시지 받기"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingQuote ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() =>
                  onOpenGoogleChat(
                    `[교사 마음쉼터 오늘의 격려]\n\n"${encouragement.quote}"\n\n- ${encouragement.author}\n\n오늘도 교실을 지키느라 애쓰신 모든 선생님들을 응원합니다.`,
                    '오늘의 격려 문구'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-white hover:bg-teal-50 border border-stone-200 rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Google Chat으로 공유</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Minute Mindfulness Breathing Guide */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">1분 마음챙김 호흡 가이드</h3>
              <p className="text-xs text-slate-500">교실의 소음을 잠시 내려놓고 나 자신을 찾는 시간</p>
            </div>
          </div>

          {isBreathingActive && (
            <button
              onClick={resetBreathing}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>그만하기</span>
            </button>
          )}
        </div>

        {/* Breathing Circle Visualizer */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative flex items-center justify-center w-56 h-56">
            {/* Background glowing rings */}
            <div
              className={`absolute inset-0 rounded-full bg-teal-100/50 blur-xl ${
                isBreathingActive ? 'opacity-80' : 'opacity-30'
              }`}
            />
            <div
              className={`absolute w-44 h-44 rounded-full border border-teal-200/60 transition-transform ${getCircleScale()}`}
            />
            <div
              className={`relative z-10 w-36 h-36 rounded-full bg-gradient-to-tr from-teal-600 via-teal-700 to-emerald-600 text-white flex flex-col items-center justify-center shadow-lg transition-transform ${getCircleScale()}`}
            >
              {isFinished ? (
                <div className="text-center p-2">
                  <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-200 mb-1" />
                  <span className="text-xs font-semibold">마음 평온</span>
                </div>
              ) : isBreathingActive ? (
                <div className="text-center">
                  <span className="text-2xl font-bold font-mono tabular-nums leading-none block">
                    {phaseSecondsLeft}
                  </span>
                  <span className="text-[11px] font-medium tracking-tight mt-1 block text-teal-100">
                    {breathPhase === 'inhale'
                      ? '들이쉬기'
                      : breathPhase === 'hold'
                      ? '숨 멈춤'
                      : breathPhase === 'exhale'
                      ? '내쉬기'
                      : '비우기'}
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <Heart className="w-6 h-6 mx-auto text-rose-200 mb-1" />
                  <span className="text-xs font-medium text-teal-50">1분 호흡</span>
                </div>
              )}
            </div>
          </div>

          {/* Text Guidance */}
          <div className="text-center mt-6 space-y-1 max-w-sm">
            {isFinished ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-teal-900">1분간의 쉼이 완성되었습니다</p>
                <p className="text-xs text-slate-600">
                  선생님, 지금의 차분하고 가벼워진 호흡을 기억하며 남은 하루도 평온하게 보내시길 바랍니다.
                </p>
                <button
                  onClick={startBreathing}
                  className="mt-3 px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
                >
                  한 번 더 진행하기
                </button>
              </div>
            ) : isBreathingActive ? (
              <>
                <p className="text-sm font-semibold text-slate-800">{currentInfo.text}</p>
                <p className="text-xs text-slate-500">{currentInfo.sub}</p>
                <div className="pt-2 text-[11px] font-medium text-teal-700">
                  진행 {cycleCount + 1} / 3 사이클
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  교실에서의 긴장과 스트레스로 굳어진 호흡을 4-4-6-2 호흡법으로 부드럽게 이완시켜 줍니다.
                </p>
                <button
                  onClick={startBreathing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>1분 호흡 명상 시작하기</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
