import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  initAuth,
  fetchUserSpaces,
  sendChatMessageToSpace,
  ChatSpace,
} from '@/src/services/googleChat';
import { X, Send, LogOut, CheckCircle, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';

interface GoogleChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  sourceTitle?: string;
}

export const GoogleChatModal: React.FC<GoogleChatModalProps> = ({
  isOpen,
  onClose,
  initialMessage = '',
  sourceTitle = '따뜻한 격려 메시지',
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [messageText, setMessageText] = useState<string>(initialMessage);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Mandatory confirmation state before destructive/mutating send
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (initialMessage) {
      setMessageText(initialMessage);
    }
  }, [initialMessage]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        loadSpaces();
      },
      () => {
        setCurrentUser(null);
        setSpaces([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadSpaces = async () => {
    setIsLoadingSpaces(true);
    setErrorMsg(null);
    try {
      const spaceList = await fetchUserSpaces();
      setSpaces(spaceList);
      if (spaceList.length > 0 && !selectedSpace) {
        setSelectedSpace(spaceList[0].name);
      }
    } catch (err: any) {
      console.error('Failed to load chat spaces:', err);
      setErrorMsg(err.message || 'Google Chat 스페이스를 불러오지 못했습니다.');
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
        await loadSpaces();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setSpaces([]);
      setSelectedSpace('');
      setSuccessMsg(null);
    } catch (err: any) {
      setErrorMsg('로그아웃 처리 중 문제가 발생했습니다.');
    }
  };

  const handlePreSend = () => {
    if (!selectedSpace) {
      setErrorMsg('메시지를 전송할 Google Chat 스페이스를 선택해 주세요.');
      return;
    }
    if (!messageText.trim()) {
      setErrorMsg('전송할 메시지 내용을 입력해 주세요.');
      return;
    }
    setErrorMsg(null);
    // Show mandatory confirmation prompt
    setShowConfirmDialog(true);
  };

  const handleExecuteSend = async () => {
    setShowConfirmDialog(false);
    setIsSending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await sendChatMessageToSpace(selectedSpace, messageText);
      setSuccessMsg('Google Chat 스페이스에 메시지가 성공적으로 전송되었습니다!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setErrorMsg(err.message || '메시지 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const currentSpaceObj = spaces.find((s) => s.name === selectedSpace);
  const spaceDisplayName = currentSpaceObj?.displayName || selectedSpace;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Google Chat으로 공유</h3>
              <p className="text-xs text-slate-500">{sourceTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p>{errorMsg}</p>
                {errorMsg.includes('Google Cloud 콘솔') && (
                  <p className="text-[11px] text-rose-600">
                    참고: Google Chat API를 사용하려면 Google Cloud 콘솔(Chat API 구성)에서 앱 정보(이름 및 설명)를 등록해야 합니다.
                  </p>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* User Auth Section */}
          {!currentUser ? (
            <div className="text-center py-6 px-4 border border-dashed border-stone-200 rounded-xl bg-stone-50/50 space-y-3">
              <p className="text-xs text-slate-600">
                선생님의 Google 계정으로 로그인하여 학교 또는 동료 교사 Chat 스페이스에 메시지를 공유할 수 있습니다.
              </p>
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-300 rounded-xl shadow-xs text-xs font-medium text-slate-700 hover:bg-stone-50 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isLoggingIn ? '로그인 처리 중...' : 'Google 계정으로 로그인'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profile Bar */}
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
                <div className="flex items-center gap-2.5">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-semibold">
                      {currentUser.displayName?.[0] || 'T'}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {currentUser.displayName || '교사 사용자'}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-stone-200/50 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>로그아웃</span>
                </button>
              </div>

              {/* Space Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">전송 대상 Google Chat 스페이스</label>
                  <button
                    onClick={loadSpaces}
                    disabled={isLoadingSpaces}
                    className="flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingSpaces ? 'animate-spin' : ''}`} />
                    <span>새로고침</span>
                  </button>
                </div>

                {isLoadingSpaces ? (
                  <div className="p-3 text-center text-xs text-slate-500 bg-stone-50 rounded-xl border border-stone-200">
                    스페이스 목록을 불러오는 중입니다...
                  </div>
                ) : spaces.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 bg-stone-50 rounded-xl border border-stone-200">
                    참여 중인 Google Chat 스페이스가 없습니다. Chat에서 스페이스를 만든 후 다시 시도해 주세요.
                  </div>
                ) : (
                  <select
                    value={selectedSpace}
                    onChange={(e) => setSelectedSpace(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800"
                  >
                    {spaces.map((sp) => (
                      <option key={sp.name} value={sp.name}>
                        {sp.displayName || sp.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Message Editor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">공유할 메시지 내용</label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full p-3 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800 resize-none leading-relaxed"
                  placeholder="공유할 메시지를 입력해 주세요..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-stone-100 bg-[#FAF8F5]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-stone-200/50 rounded-xl transition-colors cursor-pointer"
          >
            닫기
          </button>
          {currentUser && (
            <button
              onClick={handlePreSend}
              disabled={isSending || spaces.length === 0 || !messageText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? '전송 중...' : '스페이스로 전송'}</span>
            </button>
          )}
        </div>

        {/* MANDATORY Explicit Confirmation Dialog (Destructive/Mutating API Safeguard) */}
        {showConfirmDialog && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-6 z-60 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-5 shadow-2xl border border-stone-200 max-w-sm w-full space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Google Chat 메시지 전송 확인</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    선택한 스페이스 <span className="font-semibold text-slate-800">[{spaceDisplayName}]</span>에 다음 메시지를 게시하시겠습니까?
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl text-xs text-slate-700 border border-stone-200 max-h-24 overflow-y-auto italic">
                "{messageText}"
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleExecuteSend}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
                >
                  네, 전송합니다
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
