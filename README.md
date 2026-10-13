# 마음쉼터 (Mind Shelter) - 교사를 위한 따뜻한 공감 상담소

지친 선생님의 마음을 어루만져 주는 AI 전문 상담, 매일의 짧은 명상과 격려, 감정 변화 통계 대시보드, 힐링 자연음 사운드스케이프 및 Google Chat 연동 플랫폼입니다.

---

## 🚀 빠른 시작 가이드 (로컬 실행)

깃허브(GitHub)에서 프로젝트를 클론받은 후 로컬 컴퓨터에서 실행하는 방법입니다.

### 1. 패키지 설치
터미널을 열고 다음 명령어를 실행하여 필요한 의존성을 설치합니다:
```bash
npm install
```

### 2. 환경 변수 설정 (.env)
루트 디렉토리에 `.env` 파일을 생성하고 Gemini API 키를 설정합니다. (`.env.example` 파일 참고)
```env
GEMINI_API_KEY="선생님의_GEMINI_API_KEY"
PORT=3000
```
> **참고**: API 키가 없어도 기본 내장 심리 상담 답변과 명상, 통계, 힐링 자연음 사운드는 정상 작동합니다.

### 3. 개발 서버 실행
```bash
npm run dev
```
서버가 시작되면 브라우저에서 `http://localhost:3000`으로 접속합니다.

- 프론트엔드 전용으로만 빠르게 띄우고 싶다면:
```bash
npm run dev:client
```

### 4. 프로덕션 빌드 & 실행
```bash
npm run build
npm start
```

---

## 🌐 깃허브(GitHub) 연동 및 배포 안내

### 1. "Secret scanning alerts (1)" 경고가 뜰 때 해결법
보내주신 화면의 `Security and quality (1)` 알림은 GitHub의 자동 비밀키 탐지 기능이 `firebase-applet-config.json`의 Firebase 클라이언트 식별자(`apiKey`)를 감지한 것입니다.

- **안전 여부**: Firebase 웹 클라이언트 키(`AIzaSy...`)는 원래 브라우저에서 프로젝트를 식별하기 위한 공개 식별자이므로 유출되어도 보안 문제가 발생하지 않습니다.
- **경고 해제 방법**:
  1. 깃허브 화면에서 **`Secret scanning alerts`** 옆의 **`View detected secrets`** 클릭
  2. 감지된 항목(`Google API key in firebase-applet-config.json`) 클릭
  3. 우측 상단의 **"Close alert"** 클릭 후 사유로 **"False positive (오탐)"** 또는 **"Used in tests"** 선택

### 2. GitHub Pages 자동 배포 (웹사이트 띄우기)
`.github/workflows/deploy.yml` 파일이 저장소에 추가되어 있어 푸시 시 자동으로 빌드 및 배포됩니다:
1. 깃허브 저장소 상단 메뉴의 **`Settings`** 클릭
2. 좌측 메뉴에서 **`Pages`** 선택
3. **Build and deployment > Source** 항목을 `Deploy from a branch`에서 **`GitHub Actions`**로 변경
4. 변경 즉시 1~2분 내로 나만의 웹사이트 주소(`https://<아이디>.github.io/<저장소명>/`)가 상단에 생성되어 접속할 수 있습니다.

---

## 🌟 주요 기능

1. **상황별 교사 전문 AI 상담실 (5대 탭)**
   - 학부모 민원 대응 (교권 침해, 악성 민원, 퇴근 후 연락)
   - 학생 지도 및 생활상담 (수업 방해, 무기력, 반항 학생 지도)
   - 동료 교사 및 교직원 관계 (교무실 소통, 업무 분장, 관리자 갈등)
   - 수업 및 과중한 업무 (공문 처리, NEIS 입력, 행사 기획)
   - 소진 및 번아웃 극복 (열정 고갈, 회의감 치유, 쉼의 권리)

2. **매일의 쉼 & 1분 마음챙김 호흡**
   - 매일 전하는 따뜻한 격려 글귀 및 실천 팁
   - 4-4-6-2 박스 호흡 가이드 애니메이션

3. **감정 변화 통계 & 일기 대시보드**
   - 5단계 기분 체크인 및 상황 태그 기록
   - 최근 7일 / 30일 SVG 감정 추이 시각화 그래프 및 맞춤 심리 리포트

4. **힐링 사운드스케이프 (Web Audio API)**
   - 포근한 빗소리, 솔바람 숲길, 노을빛 파도, 모닥불, 432Hz 싱잉볼 명상음
   - 개별 볼륨 슬라이더 및 자동 종료 타이머 탑재

5. **Google Chat 연동**
   - 따뜻한 격려 문구와 상담 성찰 내용을 Google Chat 스페이스로 안전하게 공유
