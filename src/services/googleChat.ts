import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '@/firebase-applet-config.json';

export const CHAT_SCOPES = [
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.messages.create',
];

let authInstance: any = null;
let providerInstance: GoogleAuthProvider | null = null;

try {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  providerInstance = new GoogleAuthProvider();
  CHAT_SCOPES.forEach((scope: string) => providerInstance?.addScope(scope));
} catch (e) {
  console.warn('Firebase init deferred or failed:', e);
}

export const auth = authInstance;
export const provider = providerInstance;

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth || !provider) {
    throw new Error('Google 로그인을 위한 인증 설정이 준비되지 않았습니다.');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google 계정 인증 토큰을 가져오지 못했습니다.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface ChatSpace {
  name: string;
  displayName?: string;
  type?: string;
  spaceType?: string;
}

export async function fetchUserSpaces(): Promise<ChatSpace[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google 계정 로그인이 필요합니다.');
  }

  const response = await fetch('https://chat.googleapis.com/v1/spaces', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 404) {
      throw new Error(
        'Google Cloud 콘솔에서 Google Chat API 앱 구성(이름 및 설명 설정)이 완료되어야 Chat 스페이스 조회가 가능합니다.'
      );
    }
    throw new Error(errorData?.error?.message || `Google Chat 스페이스 목록 조회 실패 (${response.status})`);
  }

  const data = await response.json();
  return data.spaces || [];
}

export async function sendChatMessageToSpace(spaceName: string, text: string): Promise<any> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google 계정 로그인이 필요합니다.');
  }

  const url = `https://chat.googleapis.com/v1/${spaceName}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 404) {
      throw new Error(
        'Google Cloud 콘솔에서 Google Chat 앱이 활성화되어 있지 않거나 스페이스 권한이 없습니다.'
      );
    }
    throw new Error(errorData?.error?.message || `Google Chat 메시지 전송 실패 (${response.status})`);
  }

  return await response.json();
}
