import React, { useState, useEffect } from 'react';
import { soundEngine, SoundType } from '@/src/services/soundEngine';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  Clock,
  Sparkles,
  CloudRain,
  Trees,
  Waves,
  Flame,
  Bell,
  X,
  RotateCcw,
} from 'lucide-react';

interface SoundItem {
  id: SoundType;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultVol: number;
}

const SOUNDS: SoundItem[] = [
  { id: 'rain', title: '포근한 빗소리', desc: '마음의 잡념을 씻어주는 부드러운 빗줄기', icon: CloudRain, defaultVol: 0.6 },
  { id: 'forest', title: '솔바람 숲길', desc: '나뭇잎을 스치는 맑고 청량한 바람', icon: Trees, defaultVol: 0.55 },
  { id: 'waves', title: '노을빛 파도', desc: '긴장을 차분하게 덜어주는 잔잔한 밀물', icon: Waves, defaultVol: 0.5 },
  { id: 'fire', title: '따스한 모닥불', desc: '마음의 온기를 더하는 장작 타는 소리', icon: Flame, defaultVol: 0.4 },
  { id: 'singing_bowl', title: '싱잉볼 명상음 (432Hz)', desc: '깊은 이완과 평온을 돕는 치유 공명', icon: Bell, defaultVol: 0.65 },
];

const PRESETS = [
  {
    name: '비 오는 날의 쉼',
    desc: '비 + 모닥불',
    setup: { rain: 0.7, fire: 0.35, forest: 0, waves: 0, singing_bowl: 0 },
  },
  {
    name: '숲속 산책',
    desc: '바람 + 파도',
    setup: { forest: 0.75, waves: 0.3, rain: 0, fire: 0, singing_bowl: 0 },
  },
  {
    name: '마음챙김 명상',
    desc: '싱잉볼 + 숲소리',
    setup: { singing_bowl: 0.7, forest: 0.35, rain: 0, waves: 0, fire: 0 },
  },
  {
    name: '온전한 이완',
    desc: '파도 + 빗소리',
    setup: { waves: 0.65, rain: 0.35, forest: 0, fire: 0, singing_bowl: 0 },
  },
];

export const SoundscapePlayer: React.FC = () => {
  const [isPlayingAny, setIsPlayingAny] = useState(false);
  const [activeTracks, setActiveTracks] = useState<Record<SoundType, boolean>>({
    rain: false,
    forest: false,
    waves: false,
    fire: false,
    singing_bowl: false,
  });
  const [volumes, setVolumes] = useState<Record<SoundType, number>>({
    rain: 0.6,
    forest: 0.55,
    waves: 0.5,
    fire: 0.4,
    singing_bowl: 0.65,
  });
  const [masterVolume, setMasterVolState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Timer states
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (remainingSeconds !== null && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 1000);
    } else if (remainingSeconds === 0) {
      handleStopAll();
      setRemainingSeconds(null);
      setTimerMinutes(null);
    }
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  const handleToggleTrack = (type: SoundType) => {
    const nextState = !activeTracks[type];
    setActiveTracks((prev) => ({ ...prev, [type]: nextState }));
    if (nextState) {
      soundEngine.startSound(type, volumes[type]);
      setIsPlayingAny(true);
    } else {
      soundEngine.stopSound(type);
      const stillPlaying = Object.entries(activeTracks).some(([k, v]) => k !== type && v);
      setIsPlayingAny(stillPlaying);
    }
  };

  const handleVolumeChange = (type: SoundType, val: number) => {
    setVolumes((prev) => ({ ...prev, [type]: val }));
    soundEngine.setSoundVolume(type, val);
  };

  const handleMasterVolume = (val: number) => {
    setMasterVolState(val);
    if (isMuted) setIsMuted(false);
    soundEngine.setMasterVolume(val);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      soundEngine.setMasterVolume(masterVolume);
    } else {
      setIsMuted(true);
      soundEngine.setMasterVolume(0);
    }
  };

  const handlePlayDefault = () => {
    if (isPlayingAny) {
      handleStopAll();
    } else {
      // Default start with peaceful rain & singing bowl
      handleApplyPreset(PRESETS[0].setup);
    }
  };

  const handleStopAll = () => {
    soundEngine.stopAll();
    setActiveTracks({
      rain: false,
      forest: false,
      waves: false,
      fire: false,
      singing_bowl: false,
    });
    setIsPlayingAny(false);
  };

  const handleApplyPreset = (setup: Record<SoundType, number>) => {
    soundEngine.stopAll();
    const nextActive: Record<SoundType, boolean> = {
      rain: false,
      forest: false,
      waves: false,
      fire: false,
      singing_bowl: false,
    };
    const nextVols = { ...volumes };

    Object.entries(setup).forEach(([key, vol]) => {
      const soundKey = key as SoundType;
      if (vol > 0) {
        nextActive[soundKey] = true;
        nextVols[soundKey] = vol;
        soundEngine.startSound(soundKey, vol);
      }
    });

    setActiveTracks(nextActive);
    setVolumes(nextVols);
    setIsPlayingAny(true);
  };

  const handleSetTimer = (minutes: number | null) => {
    setTimerMinutes(minutes);
    if (minutes === null) {
      setRemainingSeconds(null);
    } else {
      setRemainingSeconds(minutes * 60);
    }
  };

  const activeCount = Object.values(activeTracks).filter(Boolean).length;
  const activeNames = SOUNDS.filter((s) => activeTracks[s.id]).map((s) => s.title);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* Floating Bottom Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-stone-200/90 text-slate-800 transition-all">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayDefault}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isPlayingAny
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-slate-700'
              }`}
              title={isPlayingAny ? '모두 멈춤' : '힐링 사운드 재생'}
            >
              {isPlayingAny ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900">
                  {isPlayingAny ? '자연음 재생 중' : '소리 치유 사운드스케이프'}
                </span>
                {remainingSeconds !== null && (
                  <span className="text-[11px] font-mono tabular-nums text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md">
                    {formatTimer(remainingSeconds)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-[260px]">
                {activeCount > 0 ? activeNames.join(', ') : '포근한 빗소리, 솔바람, 파도, 싱잉볼'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">사운드 믹서</span>
            </button>
          </div>
        </div>
      </div>

      {/* Soundscape Studio Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FAF8F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">교사 마음 힐링 사운드스케이프</h3>
                  <p className="text-xs text-slate-500">원하는 자연의 소리를 조합해 나만의 쉼터를 만들어 보세요</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">테마별 맞춤 믹스 프리셋</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleApplyPreset(preset.setup)}
                      className="p-2.5 text-left rounded-xl border border-stone-200 hover:border-teal-400 hover:bg-teal-50/40 transition-all text-xs cursor-pointer group"
                    >
                      <p className="font-semibold text-slate-800 group-hover:text-teal-900">{preset.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Tracks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">개별 자연 음향 제어</label>
                  {activeCount > 0 && (
                    <button
                      onClick={handleStopAll}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>모두 끄기</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {SOUNDS.map((sound) => {
                    const Icon = sound.icon;
                    const active = activeTracks[sound.id];
                    const vol = volumes[sound.id];

                    return (
                      <div
                        key={sound.id}
                        className={`p-3 rounded-xl border transition-all ${
                          active
                            ? 'bg-teal-50/30 border-teal-200'
                            : 'bg-stone-50/50 border-stone-200/70 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <button
                            onClick={() => handleToggleTrack(sound.id)}
                            className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                active ? 'bg-teal-700 text-white' : 'bg-stone-200 text-slate-600'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className={`text-xs font-semibold ${active ? 'text-teal-950' : 'text-slate-800'}`}>
                                {sound.title}
                              </p>
                              <p className="text-[11px] text-slate-500">{sound.desc}</p>
                            </div>
                          </button>

                          {active && (
                            <div className="flex items-center gap-2 w-32 shrink-0">
                              <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={vol}
                                onChange={(e) => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                                className="w-full accent-teal-700 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                              />
                              <span className="text-[10px] font-mono text-slate-500 w-6 text-right tabular-nums">
                                {Math.round(vol * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Master Volume & Sleep Timer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">마스터 볼륨</label>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-slate-400" />
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : masterVolume}
                      onChange={(e) => handleMasterVolume(parseFloat(e.target.value))}
                      className="w-full accent-teal-700 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                    />
                    <span className="text-[11px] font-mono text-slate-600 w-8 text-right tabular-nums">
                      {isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> 자동 종료 타이머
                    </span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[5, 10, 20, 30].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleSetTimer(timerMinutes === mins ? null : mins)}
                        className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                          timerMinutes === mins
                            ? 'bg-teal-700 text-white font-medium'
                            : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                        }`}
                      >
                        {mins}분
                      </button>
                    ))}
                    {timerMinutes !== null && (
                      <button
                        onClick={() => handleSetTimer(null)}
                        className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        해제
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-stone-100 bg-[#FAF8F5]">
              <span className="text-[11px] text-slate-500">
                {activeCount > 0 ? `${activeCount}개 음향 활성화됨` : '재생 중인 음향 없음'}
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
