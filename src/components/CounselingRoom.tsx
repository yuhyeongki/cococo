import React, { useState, useEffect, useRef } from 'react';
import { CounselingCategory, ChatMessage } from '@/src/types';
import {
  Send,
  Sparkles,
  User,
  Bot,
  Copy,
  Check,
  Share2,
  Trash2,
  HelpCircle,
  ShieldAlert,
  Users,
  GraduationCap,
  Briefcase,
  Flame,
} from 'lucide-react';

interface TabConfig {
  id: CounselingCategory;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  starters: string[];
  welcomeMsg: string;
}

const TABS: TabConfig[] = [
  {
    id: 'parent',
    label: '학부모 민원 대응',
    desc: '악성 민원, 무리한 요구, 퇴근 후 연락 스트레스',
    icon: ShieldAlert,
    starters: [
      '퇴근 후에도 계속 카톡이나 전화로 항의하는 학부모님이 계셔서 잠을 못 자겠어요.',
      '수업 중 정당한 생활지도를 했는데 아동학대라며 고소하겠다고 협박을 받았습니다.',
      '교우 갈등 사안에서 일방적으로 우리 아이 편만 들며 담임 교사를 탓하는 민원 때문에 무서워요.',
      '학부모 총회나 면담을 앞두고 극심한 불안과 가슴 두근거림이 찾아옵니다.',
    ],
    welcomeMsg:
      '선생님, 학부모 민원으로 인해 마음에 깊은 상처와 불안을 안고 계시군요. 홀로 견디시느라 얼마나 막막하고 두려우셨습니까. 선생님 탓이 아닙니다. 어떤 상황이 가장 힘들게 다가오시는지 차분히 털어놓아 주세요.',
  },
  {
    id: 'student',
    label: '학생 지도 및 상담',
    desc: '수업 방해, 무기력, 반항 학생 지도 및 교우 갈등',
    icon: GraduationCap,
    starters: [
      '수업 시간에 지속적으로 소리를 지르거나 엎드려 자며 반항하는 학생 때문에 기운이 빠집니다.',
      '교사의 지도를 비웃거나 친구들을 괴롭히는 학생에게 어떤 태도로 다가가야 할지 모르겠어요.',
      '학급 내 은따 및 교우관계 갈등을 중재하다가 양쪽 학생에게 모두 원망을 샀습니다.',
      '더 이상 아이들이 예뻐 보이지 않고, 눈을 마주치는 것조차 두려울 때가 있습니다.',
    ],
    welcomeMsg:
      '교실 안에서 홀로 고군분투하며 학생들과 씨름하시는 선생님의 지친 어깨가 느껴집니다. 아이들을 포기하지 않으려 애쓰셨기에 더 깊이 아프신 것이지요. 지금 가장 마음을 무겁게 짓누르는 학생 지도 고민을 들려주세요.',
  },
  {
    id: 'colleague',
    label: '동료 교사 및 교직원 관계',
    desc: '교무실 내 갈등, 업무 분장 마찰, 관리자와의 소통 고립',
    icon: Users,
    starters: [
      '업무 분장 회의 이후 동료 선생님과의 관계가 급격히 서먹해지고 눈치가 보여요.',
      '교장·교감 선생님의 일방적인 지시와 수직적인 학교 분위기에 숨이 막힙니다.',
      '교무실 안에서 나만 따돌림당하거나 고립되어 있는 듯한 외로움을 느껴요.',
      '동년배 교사들 사이에서 실력이나 인기로 비교당하는 것 같아 위축됩니다.',
    ],
    welcomeMsg:
      '가장 따뜻한 지지대가 되어야 할 학교 공간에서 인간관계로 고통받고 계시군요. 교무실이라는 닫힌 공간에서의 갈등은 일상을 온통 얼어붙게 만들지요. 선생님의 억울함과 외로움을 온전히 경청하겠습니다.',
  },
  {
    id: 'workload',
    label: '수업 및 과중한 업무',
    desc: '끝없는 공문, 방과후 업무, NEIS 입력, 수업 준비 부족',
    icon: Briefcase,
    starters: [
      '공문 처리와 각종 행정 사업에 쫓겨 정작 수업 준비는 밤늦게까지 야근해야 겨우 끝나요.',
      '내가 교사인지 행정직원인지 정체성을 잃어버릴 정도로 잡무가 쏟아집니다.',
      '학교 축제나 대형 행사를 혼자 떠안아 도망치고 싶은 심정입니다.',
      'NEIS 생활기록부 입력 기한이 다가올 때마다 가슴이 조여오고 숨이 턱 막힙니다.',
    ],
    welcomeMsg:
      '아이들을 가르치는 본질적인 기쁨보다 끝없는 행정과 공문에 에너지를 빼앗기셨군요. 선생님의 교육 열정이 서류 더미에 닳아가는 안타까움을 깊이 이해합니다. 오늘 선생님의 짐을 이곳에 조금 덜어두세요.',
  },
  {
    id: 'burnout',
    label: '소진 및 번아웃 극복',
    desc: '열정의 고갈, 교직 회의감, 무기력, 쉼의 죄책감',
    icon: Flame,
    starters: [
      '아침에 눈을 뜨면 학교에 가기 싫어 눈물이 나고 온몸이 무겁습니다.',
      '예전에는 교육에 대한 꿈이 컸는데, 지금은 그냥 아무 생각 없이 시간만 흘려보내고 싶어요.',
      '쉬는 날에도 교실 생각이 나며 제대로 쉬지 못하고 죄책감에 시달립니다.',
      '사직서를 매일 품에 넣고 다닐 만큼 마음의 에너지가 바닥났어요.',
    ],
    welcomeMsg:
      '선생님, 번아웃은 결코 선생님이 부족해서 찾아온 것이 아닙니다. 지금까지 아이들을 위해 온 마음을 쏟아붓고 모든 것을 태웠기에 찾아온 정당한 휴식의 신호입니다. 지금은 그저 편안히 기대어 쉬셔도 괜찮습니다.',
  },
];

interface CounselingRoomProps {
  onOpenGoogleChat: (message: string, sourceTitle: string) => void;
}

export const CounselingRoom: React.FC<CounselingRoomProps> = ({ onOpenGoogleChat }) => {
  const [activeTab, setActiveTab] = useState<CounselingCategory>('parent');
  const [conversations, setConversations] = useState<Record<CounselingCategory, ChatMessage[]>>({
    parent: [],
    student: [],
    colleague: [],
    workload: [],
    burnout: [],
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages from localStorage or defaults
  useEffect(() => {
    try {
      const saved = localStorage.getItem('teacher_mind_conversations');
      if (saved) {
        setConversations(JSON.parse(saved));
      } else {
        // Initialize with default greetings
        const initialMap: Record<CounselingCategory, ChatMessage[]> = {
          parent: [],
          student: [],
          colleague: [],
          workload: [],
          burnout: [],
        };
        TABS.forEach((t) => {
          initialMap[t.id] = [
            {
              id: `${t.id}-welcome`,
              role: 'model',
              content: t.welcomeMsg,
              timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            },
          ];
        });
        setConversations(initialMap);
      }
    } catch (e) {
      console.warn('Failed to load local conversations:', e);
    }
  }, []);

  // Save to localStorage
  const saveConversations = (updated: Record<CounselingCategory, ChatMessage[]>) => {
    setConversations(updated);
    try {
      localStorage.setItem('teacher_mind_conversations', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save conversations:', e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeTab, isLoading]);

  const currentTabConfig = TABS.find((t) => t.id === activeTab) || TABS[0];
  const currentMessages = conversations[activeTab] || [];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newTabMessages = [...currentMessages, userMsg];
    const nextConversations = {
      ...conversations,
      [activeTab]: newTabMessages,
    };
    saveConversations(nextConversations);
    setInputText('');
    setIsLoading(true);

    try {
      // Send conversation history to server
      const payload = newTabMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/counsel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeTab,
          messages: payload,
        }),
      });

      if (!res.ok) {
        throw new Error('상담 서버와의 통신에 실패했습니다.');
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      saveConversations({
        ...conversations,
        [activeTab]: [...newTabMessages, modelMsg],
      });
    } catch (error: any) {
      console.error('Counseling reply error:', error);
      const categoryFallbacks: Record<CounselingCategory, string> = {
        parent:
          '선생님, 학부모 민원으로 얼마나 마음고생이 심하셨습니까. 선생님께서 아이를 위해 취하셨던 교육적 조치는 결코 잘못된 것이 아닙니다. 혼자 감당하려 하지 마시고, 학교 교권보호 매뉴얼 및 관리자(교감·교장)와 소통하여 공식 채널을 통한 분리 상담을 요청하세요. 오늘 하루 고생하신 선생님의 마음에 따스한 위로를 전합니다.',
        student:
          '교실 안에서 끊임없이 학생들과 부딪히며 소진된 선생님의 마음이 느껴집니다. 학생들의 반항이나 거친 표현은 선생님 개인을 향한 공격이 아니라, 아이 내면의 미성숙함과 불안의 표현일 때가 많습니다. 선생님의 노고는 결코 헛되지 않았으니, 오늘 밤은 아이들의 모습 대신 선생님 자신의 쉼을 먼저 챙겨주세요.',
        colleague:
          '가장 든든한 동료여야 할 학교 구성원들과의 마찰은 매일 출근길을 무겁게 짓누르지요. 모든 동료에게 좋은 교사로 인정받을 필요는 없습니다. 심리적 경계를 건강하게 세우고, 업무는 원칙에 맞추어 담담하게 진행하시길 권합니다. 선생님을 진심으로 존중하는 이들이 곁에 있습니다.',
        workload:
          '서류와 공문, 각종 잡무에 밀려 정작 교육 본연의 가치를 잃어가는 것 같아 속상하셨군요. 교육 현장의 구조적 문제를 선생님 혼자의 노력으로 다 메울 수는 없습니다. 완벽주의를 잠시 내려놓고 오늘 완수한 일에 만족하며, 퇴근 후에는 교실의 문을 닫듯 업무 생각도 잠시 닫아주세요.',
        burnout:
          '선생님, 번아웃은 선생님의 열정이 부족해서가 아니라, 그동안 교실과 아이들을 위해 너무 뜨겁게 헌신하셨기 때문에 온 당연한 신호입니다. 선생님은 이미 충분히 좋은 선생님입니다. 지금은 어떤 죄책감도 없이 그저 푹 쉬셔도 괜찮습니다.',
      };

      const fallbackReply = categoryFallbacks[activeTab];
      const modelMsg: ChatMessage = {
        id: `model-fallback-${Date.now()}`,
        role: 'model',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      saveConversations({
        ...conversations,
        [activeTab]: [...newTabMessages, modelMsg],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('현재 탭의 상담 대화 내용을 초기화하시겠습니까?')) {
      const resetTabMessages: ChatMessage[] = [
        {
          id: `${activeTab}-welcome-reset`,
          role: 'model',
          content: currentTabConfig.welcomeMsg,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ];
      saveConversations({
        ...conversations,
        [activeTab]: resetTabMessages,
      });
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col h-[750px] max-h-[85vh]">
      {/* Category Tabs Header */}
      <div className="border-b border-stone-200 bg-[#FAF8F5] p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">교사 마음 공감 상담소</h2>
              <p className="text-xs text-slate-500">고민 상황에 맞는 전문 상담 탭을 선택해 주세요</p>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            title="현재 탭 대화 비우기"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">대화 초기화</span>
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-stone-100/80 rounded-xl">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-teal-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/30">
        {/* Tab Description Banner */}
        <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl text-xs text-teal-800 flex items-center gap-2">
          <currentTabConfig.icon className="w-4 h-4 shrink-0 text-teal-700" />
          <span>{currentTabConfig.desc}에 대해 무엇이든 편안하게 말씀해 주세요.</span>
        </div>

        {currentMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isUser
                    ? 'bg-teal-700 text-white'
                    : 'bg-white border border-stone-200 text-teal-800 shadow-2xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-teal-800 text-white rounded-tr-xs'
                    : 'bg-white border border-stone-200/80 text-slate-800 rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div
                  className={`flex items-center justify-between gap-3 mt-2.5 pt-2 border-t text-[11px] ${
                    isUser
                      ? 'border-teal-700/60 text-teal-100'
                      : 'border-stone-100 text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:text-slate-700 transition-colors p-1"
                        title="답변 복사"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          onOpenGoogleChat(
                            `[교사 마음 상담 요약 성찰]\n\n"${msg.content.slice(0, 300)}..."\n\n- 마음쉼터 AI 상담 처방전`,
                            `${currentTabConfig.label} 상담 성찰`
                          )
                        }
                        className="hover:text-teal-700 transition-colors p-1"
                        title="Google Chat으로 성찰 공유"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-stone-200 text-teal-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-stone-200/80 rounded-2xl rounded-tl-xs p-4 shadow-xs text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                <span>선생님의 마음을 헤아리며 온기를 담아 답변을 작성하고 있습니다...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Buttons */}
      <div className="px-4 py-2 bg-stone-50 border-t border-stone-200/70 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max pb-1">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
            <HelpCircle className="w-3 h-3" /> 추천 고민:
          </span>
          {currentTabConfig.starters.map((starter, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(starter)}
              disabled={isLoading}
              className="px-2.5 py-1 text-[11px] text-slate-600 bg-white hover:bg-stone-100 hover:text-slate-900 border border-stone-200 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {starter.length > 28 ? `${starter.slice(0, 28)}...` : starter}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box Footer */}
      <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="선생님의 마음속 고충을 자유롭게 털어놓아 주세요... (Enter로 전송, Shift+Enter 줄바꿈)"
            className="flex-1 p-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-700 text-slate-800 resize-none leading-relaxed"
          />

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-4 py-3 bg-teal-800 hover:bg-teal-900 active:scale-98 text-white rounded-xl shadow-xs transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0"
            title="메시지 전송"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
