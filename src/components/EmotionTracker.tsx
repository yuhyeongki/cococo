import React, { useState, useEffect } from 'react';
import { EmotionEntry, MoodLevel } from '@/src/types';
import {
  Smile,
  Meh,
  Frown,
  Sparkles,
  TrendingUp,
  Calendar,
  Plus,
  Trash2,
  Tag,
  Check,
} from 'lucide-react';

interface MoodConfig {
  id: MoodLevel;
  score: number;
  label: string;
  sub: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MOODS: MoodConfig[] = [
  {
    id: 'peaceful',
    score: 5,
    label: '평온해요',
    sub: '마음이 차분하고 여유로움',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: Smile,
  },
  {
    id: 'hopeful',
    score: 4,
    label: '희망차요',
    sub: '아이들과 보람찬 순간',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Sparkles,
  },
  {
    id: 'tired',
    score: 3,
    label: '피곤해요',
    sub: '일상적인 에너지 소모',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    icon: Meh,
  },
  {
    id: 'frustrated',
    score: 2,
    label: '답답해요',
    sub: '민원이나 업무로 속상함',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: Frown,
  },
  {
    id: 'exhausted',
    score: 1,
    label: '소진되었어요',
    sub: '깊은 쉼이 절실한 상태',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    icon: Frown,
  },
];

const COMMON_TAGS = [
  '학부모 면담',
  '수업 보람',
  '공문 마감',
  '학생 칭찬',
  '동료와 대화',
  '교우 갈등 중재',
  '휴식 필요',
  '정시 퇴근',
];

const INITIAL_SEEDED_DATA: EmotionEntry[] = [
  {
    id: 'seed-1',
    date: '2026-10-06',
    time: '17:30',
    mood: 'tired',
    score: 3,
    tags: ['공문 마감'],
    note: '방과후 취합 공문이 많아서 종일 서류에 매달렸던 날.',
  },
  {
    id: 'seed-2',
    date: '2026-10-07',
    time: '16:50',
    mood: 'frustrated',
    score: 2,
    tags: ['학부모 면담'],
    note: '방과후 학부모님 통화가 길어져 조금 지치고 답답했다.',
  },
  {
    id: 'seed-3',
    date: '2026-10-08',
    time: '18:10',
    mood: 'hopeful',
    score: 4,
    tags: ['수업 보람', '학생 칭찬'],
    note: '수업 시간에 소외되던 아이가 발표를 멋지게 해내어 칭찬해주었다.',
  },
  {
    id: 'seed-4',
    date: '2026-10-09',
    time: '17:00',
    mood: 'peaceful',
    score: 5,
    tags: ['정시 퇴근', '휴식 필요'],
    note: '금요일 정시 퇴근 후 따뜻한 차 한 잔 마시며 휴식.',
  },
  {
    id: 'seed-5',
    date: '2026-10-10',
    time: '14:20',
    mood: 'peaceful',
    score: 5,
    tags: ['휴식 필요'],
    note: '주말 푹 쉬며 숲속 소리 들으며 재충전.',
  },
  {
    id: 'seed-6',
    date: '2026-10-11',
    time: '20:10',
    mood: 'tired',
    score: 3,
    tags: ['동료와 대화'],
    note: '내일 월요일 수업 준비를 가볍게 마치고 잠자리에 들기 전.',
  },
  {
    id: 'seed-7',
    date: '2026-10-12',
    time: '16:40',
    mood: 'hopeful',
    score: 4,
    tags: ['수업 보람'],
    note: '아이들과 함께한 모둠 활동이 화기애애하게 끝났다.',
  },
];

export const EmotionTracker: React.FC = () => {
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodLevel>('hopeful');
  const [selectedTags, setSelectedTags] = useState<string[]>(['수업 보람']);
  const [note, setNote] = useState('');
  const [timeframe, setTimeframe] = useState<'7days' | '30days'>('7days');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('teacher_mind_emotions');
      if (saved) {
        setEntries(JSON.parse(saved));
      } else {
        setEntries(INITIAL_SEEDED_DATA);
        localStorage.setItem('teacher_mind_emotions', JSON.stringify(INITIAL_SEEDED_DATA));
      }
    } catch (e) {
      setEntries(INITIAL_SEEDED_DATA);
    }
  }, []);

  const saveEntries = (updated: EmotionEntry[]) => {
    setEntries(updated);
    try {
      localStorage.setItem('teacher_mind_emotions', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save emotions:', e);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleLogEmotion = (e: React.FormEvent) => {
    e.preventDefault();
    const moodConfig = MOODS.find((m) => m.id === selectedMood) || MOODS[1];
    const todayStr = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    const newEntry: EmotionEntry = {
      id: `entry-${Date.now()}`,
      date: todayStr,
      time: nowTime,
      mood: selectedMood,
      score: moodConfig.score,
      tags: selectedTags,
      note: note.trim(),
    };

    const nextEntries = [newEntry, ...entries];
    saveEntries(nextEntries);
    setNote('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('이 감정 기록을 삭제하시겠습니까?')) {
      saveEntries(entries.filter((entry) => entry.id !== id));
    }
  };

  // Filter entries for chart
  const daysLimit = timeframe === '7days' ? 7 : 30;
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const recentEntries = sortedEntries.slice(-daysLimit);

  // Statistics calculations
  const totalCount = entries.length;
  const avgScore =
    recentEntries.length > 0
      ? (recentEntries.reduce((acc, curr) => acc + curr.score, 0) / recentEntries.length).toFixed(1)
      : '0.0';

  const moodCounts = entries.reduce((acc, curr) => {
    acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantMoodKey = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'peaceful';
  const dominantMoodObj = MOODS.find((m) => m.id === dominantMoodKey) || MOODS[0];

  // SVG Chart Dimensions
  const chartHeight = 160;
  const chartWidth = 560;
  const paddingX = 40;
  const paddingY = 25;

  const points = recentEntries.map((entry, idx) => {
    const x =
      recentEntries.length > 1
        ? paddingX + (idx / (recentEntries.length - 1)) * (chartWidth - paddingX * 2)
        : chartWidth / 2;
    // score 1 to 5 maps to y
    const y = chartHeight - paddingY - ((entry.score - 1) / 4) * (chartHeight - paddingY * 2);
    return { x, y, entry };
  });

  const polylinePath = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Top Section: Check-In Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">오늘의 감정 체크인</h3>
              <p className="text-xs text-slate-500">오늘 하루 교실에서 마주한 내 마음의 온도를 기록해 보세요</p>
            </div>
          </div>

          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> 기록 완료
            </span>
          )}
        </div>

        <form onSubmit={handleLogEmotion} className="space-y-5">
          {/* Mood Selector Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">현재 마음 상태</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MOODS.map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${m.bgColor} ${m.borderColor} ring-2 ring-teal-600/30 shadow-xs`
                        : 'bg-stone-50/70 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-4 h-4 ${m.color}`} />
                      <span className="text-[10px] font-mono tabular-nums text-slate-400">{m.score}점</span>
                    </div>
                    <div className="mt-2">
                      <p className={`text-xs font-semibold ${m.color}`}>{m.label}</p>
                      <p className="text-[10px] text-slate-500 truncate">{m.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              <span className="inline-flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" /> 오늘 마주한 주요 상황
              </span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => {
                const isChecked = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-teal-700 text-white font-medium'
                        : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">한 줄 마음 일기 (선택)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="오늘 마음에 남은 생각이나 감정을 가볍게 적어보세요..."
                className="flex-1 p-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-700 text-slate-800"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-800 hover:bg-teal-900 active:scale-98 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>기록하기</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Analytics Dashboard */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">감정 변화 통계 대시보드</h3>
              <p className="text-xs text-slate-500">교사 감정의 흐름을 한눈에 살펴보는 심리 통계</p>
            </div>
          </div>

          {/* Timeframe Switcher */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setTimeframe('7days')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                timeframe === '7days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              최근 7일
            </button>
            <button
              onClick={() => setTimeframe('30days')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                timeframe === '30days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              최근 30일
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
            <p className="text-xs text-slate-500">평균 마음 평온도</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{avgScore}</span>
              <span className="text-xs text-slate-400">/ 5.0 점</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
            <p className="text-xs text-slate-500">가장 자주 느낀 감정</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-base font-semibold ${dominantMoodObj.color}`}>
                {dominantMoodObj.label}
              </span>
              <span className="text-xs text-slate-400 font-mono tabular-nums">({moodCounts[dominantMoodKey] || 0}회)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
            <p className="text-xs text-slate-500">누적 마음 기록</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{totalCount}</span>
              <span className="text-xs text-slate-400">일의 흔적</span>
            </div>
          </div>
        </div>

        {/* SVG Emotion Trend Graph */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>마음 지수 추이 그래프</span>
            <span className="font-mono text-[11px]">5점: 평온 · 1점: 소진</span>
          </div>

          <div className="p-4 bg-stone-50/60 rounded-xl border border-stone-200/70 overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 min-w-[460px] overflow-visible"
            >
              {/* Horizontal grid lines */}
              {[1, 2, 3, 4, 5].map((lvl) => {
                const y = chartHeight - paddingY - ((lvl - 1) / 4) * (chartHeight - paddingY * 2);
                return (
                  <g key={lvl}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94A3B8"
                      className="font-mono"
                    >
                      {lvl}
                    </text>
                  </g>
                );
              })}

              {/* Connecting line */}
              {points.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#5B8A72"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylinePath}
                />
              )}

              {/* Point circles */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    className="fill-white stroke-teal-700 stroke-2 hover:r-6 transition-all"
                  />
                  <text
                    x={pt.x}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#64748B"
                    className="font-mono"
                  >
                    {pt.entry.date.slice(5)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Personalized Teacher Psychology Insight */}
        <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-1">
          <p className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" /> 교사 맞춤 심리 리포트
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            {Number(avgScore) >= 4.0
              ? '선생님께서는 최근 긍정적인 교직 에너지를 잘 유지하고 계십니다. 아이들과 나눈 보람찬 순간들을 마음에 간직하며 편안한 주말을 맞이해 보세요.'
              : Number(avgScore) >= 2.5
              ? '업무와 민원 등으로 일시적인 피로감이 누적된 상태입니다. 퇴근 후에는 교실과의 심리적 경계를 세우고, 1분 호흡 명상이나 힐링 사운드스케이프로 이완해 주세요.'
              : '현재 심리적 소진과 피로가 위험 수준에 다다랐습니다. 완벽주의를 잠시 내려놓고 관리자 및 동료에게 업무 조정을 요청하거나, 전문 상담실에서 마음을 충분히 털어놓으시기를 권합니다.'}
          </p>
        </div>

        {/* Recent History Table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold text-slate-800">최근 감정 기록 목록</h4>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {entries.map((entry) => {
              const moodObj = MOODS.find((m) => m.id === entry.mood) || MOODS[0];
              const Icon = moodObj.icon;
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${moodObj.bgColor}`}>
                      <Icon className={`w-4 h-4 ${moodObj.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{moodObj.label}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {entry.date} {entry.time}
                        </span>
                      </div>
                      {entry.note && <p className="text-slate-600 mt-0.5">{entry.note}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {entry.tags.map((t) => (
                        <span key={t} className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-stone-200">
                          {t}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                      title="기록 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
