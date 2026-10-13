import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// A valid Google AI Studio API key starts with 'AIzaSy'
const rawApiKey = process.env.GEMINI_API_KEY;
const isValidGeminiKey = typeof rawApiKey === 'string' && rawApiKey.startsWith('AIzaSy');

let ai: GoogleGenAI | null = null;
if (isValidGeminiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: rawApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err: any) {
    console.warn('GoogleGenAI initialization skipped:', err?.message);
    ai = null;
  }
}

const COUNSELING_PROMPTS: Record<string, string> = {
  parent: `당신은 초·중·고 교사를 위한 '학부모 민원 대응' 전문 심리상담사이자 교육 멘토입니다.
교권 침해, 악성 민원, 무리한 요구, 퇴근 후 연락 등으로 고통받는 선생님의 마음을 깊이 위로해주세요.
- 첫째, 선생님의 억울함과 불안, 죄책감을 전적으로 수용하고 "선생님의 잘못이 아닙니다. 아이들을 위해 애써오셨습니다"라고 마음을 다독여주세요.
- 둘째, 감정적 대응 대신 학교 교권보호위원회 절차, 학교안전망, 통화 녹음 및 공식 소통 채널(하이톡, 학교 전화 등) 안내, 관리자(교감·교장) 및 교권보호관 중재 요청 등 현실적인 방어 가이드를 부드럽게 제시하세요.
- 셋째, 퇴근 후에는 교사로서의 짐을 내려놓을 수 있는 심리적 분리 기법을 권해주세요.`,

  student: `당신은 초·중·고 교사를 위한 '학생 지도 및 생활상담' 전문 심리상담사입니다.
수업 방해, 폭언·반항, 무기력한 학생, 교우관계 갈등 등으로 기운이 빠진 선생님을 따뜻하게 안아주세요.
- 첫째, "매일 교실에서 학생들을 지키느라 얼마나 고단하셨을까요"라며 선생님의 노고를 인정해주세요.
- 둘째, 학생의 문제 행동을 '교사에 대한 공격'이 아닌 '학생 자신의 미성숙한 표현'으로 재구조화할 수 있는 관점을 제공하세요.
- 셋째, 교사의 정서적 소진을 막기 위한 '단호하되 차분한 태도(Calm Assertiveness)', 훈육의 경계 설정, 위기학생 상담 연계(위클래스 등) 팁을 전해주세요.`,

  colleague: `당신은 교직원 및 동료 교사와의 인간관계 갈등을 치유하는 전문 심리상담사입니다.
학교 내 소통 부재, 업무 분장 갈등, 관리자(교장·교감)와의 수직적 관계, 동료와의 냉기 등으로 외로움을 느끼는 선생님을 위로해주세요.
- 첫째, 교무실이라는 좁은 공간에서 오는 심리적 압박감과 고립감을 따뜻하게 공감해주세요.
- 둘째, 모든 사람에게 좋은 교사나 동료가 될 필요는 없으며, '적당한 거리 두기'와 전문적 업무 파트너십의 지혜를 전해주세요.
- 셋째, 마음을 털어놓을 수 있는 안전한 지지 그룹 찾기 및 정중한 거절법을 조언해주세요.`,

  workload: `당신은 과중한 행정 업무와 수업 준비로 지친 교사를 위한 '업무 스트레스 코치'입니다.
끝없는 공문 처리, 방과후 업무, 행사 기획, NEIS 입력 등으로 본래의 교육 철학을 잃어가는 것 같아 힘든 교사를 격려해주세요.
- 첫째, "교육에 온전히 쏟아야 할 열정이 행정에 깎여나가는 답답함"을 진심으로 알아주세요.
- 둘째, '80점의 미학(완벽주의 내려놓기)', 업무 우선순위 배분(긴급/중요 매트릭스), 나만의 루틴 단순화 방법을 제안해주세요.
- 셋째, 오늘 하루 애쓴 선생님 자신에게 작은 보상을 줄 수 있도록 격려해주세요.`,

  burnout: `당신은 교사 번아웃 및 무기력증 치유를 전문으로 하는 따스한 심리 치유사입니다.
"내가 왜 교사가 되었을까", "더 이상 아이들이 예뻐 보이지 않아요"라며 자책하고 지친 선생님의 손을 잡아주세요.
- 첫째, 번아웃은 열정이 부족해서가 아니라 "그동안 너무 뜨겁게 헌신했기 때문에 찾아온 정당한 쉼의 신호"임을 명확히 알려주세요.
- 둘째, 교사 정체성 외에 '인간으로서의 나'를 회복하는 5분 미니 쉼, 오감 그라운딩(차 마시기, 산책 등)을 권하세요.
- 셋째, 죄책감 없이 쉴 수 있는 권리를 부여해 주세요.`,
};

const getFallbackCounseling = (category: string): string => {
  const responses: Record<string, string> = {
    parent: `선생님, 학부모 민원으로 얼마나 마음고생이 심하셨습니까.
선생님께서 아이들을 위해 취하셨던 교육적 조치와 정당한 지도는 결코 잘못된 것이 아닙니다. 학부모님의 날 선 반응이나 무리한 요구는 선생님 개인의 역량 문제가 아니라 현 교육 현장의 소통 피로에서 기인한 경우가 많습니다.

1. **혼자 모든 짐을 지지 마세요**: 전화 통화 녹음과 공식 소통 창구(학교 유선전화, 공식 메신저)를 활용하시고, 감정적 마찰이 심할 때는 즉시 교감·교장 선생님 또는 교권보호관에게 상황을 공유해 관리자 동석 면담을 요청하세요.
2. **심리적 경계 세우기**: 퇴근 후에는 연락을 정중히 차단하시고, "나는 교사로서의 할 바를 다했다"는 자기 확신을 마음에 새겨주세요.

오늘 하루 억울함과 불안으로 잠 못 이루셨을 선생님의 마음을 진심으로 안아드립니다. 선생님은 혼자가 아닙니다.`,

    student: `교실 안에서 끊임없이 학생들과 부딪히며 소진된 선생님의 지친 어깨가 느껴집니다.
매일 수십 명의 아이들을 한 공간에서 인내하며 이끌어가는 일은 그 자체로 거대한 감정 노동입니다.

1. **아이의 미성숙함을 기억해 주세요**: 학생들의 반항이나 수업 방해는 선생님 개인에 대한 적대가 아니라, 가정 환경이나 정서적 불안에서 기인한 미성숙한 자기표현일 때가 많습니다.
2. **단호하되 차분한 태도(Calm Assertiveness)**: 감정적으로 맞서기보다 교실 규칙에 따라 간결하고 단호하게 지시한 후, 수업 후 차분히 1:1로 이야기하거나 위클래스 상담 연계를 활용해 보세요.
3. **오늘의 나를 인정하기**: 모든 학생을 당장 변화시킬 수는 없습니다. 오늘 교실을 묵묵히 지켜내신 것만으로도 선생님은 이미 훌륭히 해내셨습니다.`,

    colleague: `가장 따뜻한 지지대가 되어야 할 학교 공간에서 인간관계로 고통받고 계시군요.
교무실이라는 닫힌 공간에서 겪는 소통 부재와 업무 분장 갈등은 출근길 발걸음을 천근만근으로 무겁게 만듭니다.

1. **적당한 심리적 거리 두기**: 모든 동료 교사나 관리자에게 완벽하게 인정받거나 좋은 사람이 될 필요는 없습니다. 공적인 업무 파트너십의 원칙을 세우고, 감정적 에너지는 소중한 나 자신에게 돌려주세요.
2. **나만의 안전 지지대 찾기**: 마음을 나눌 수 있는 동기 교사나 외부의 친구, 가족과 가볍게 대화를 나누며 학교 내의 갈등을 객관화해 보세요.

선생님의 가치는 학교 내 타인의 평가로 결정되지 않습니다. 오늘 선생님의 마음에 따스한 평온이 깃들기를 바랍니다.`,

    workload: `서류와 공문, 끝없는 행정 잡무에 밀려 정작 교육 본연의 가치를 잃어가는 것 같아 속상하셨군요.
"내가 교사인지 행정직원인지 모르겠다"는 한탄은 대한민국 수많은 열정적인 선생님들이 겪는 공통된 아픔입니다.

1. **완벽주의 내려놓기 (80점의 미학)**: 모든 공문과 기획을 100점으로 끝내려 하지 마시고, 필수 요건만 갖추어 담담하게 처리해 보세요. 남은 에너지는 선생님 자신의 휴식을 위해 남겨두어야 합니다.
2. **우선순위 단순화**: 오늘 반드시 해야 할 일 2가지만 정하고, 나머지는 내일의 나에게 맡겨보세요.

선생님의 본령은 아이들을 향한 눈빛에 있습니다. 오늘 퇴근 후에는 행정 서류 생각을 깨끗이 지우고, 좋아하는 따뜻한 음료 한 잔과 함께 온전히 쉬어보세요.`,

    burnout: `선생님, 번아웃은 결코 선생님의 열정이나 인내심이 부족해서 찾아온 것이 아닙니다.
그동안 교실과 아이들을 위해 온 마음을 쏟아붓고 모든 에너지를 태웠기에 찾아온 "지극히 정당한 몸과 마음의 쉼 신호"입니다.

1. **쉼에 대한 죄책감 버리기**: 쉬는 것은 나태함이 아니라 지속 가능한 교직 생활을 위한 필수적인 정비 시간입니다. 아무것도 하지 않는 시간을 선생님 스스로에게 선물하세요.
2. **교사 정체성 밖의 나 회복하기**: 학교 문을 나서는 순간, 교사가 아닌 '온전한 나 자신'으로 돌아와 좋아하는 음악, 산책, 따뜻한 목욕을 누려보세요.

선생님은 지금까지 이미 충분히 최선을 다하셨습니다. 지금은 그저 편안히 기대어 쉬셔도 온 세상이 선생님을 지지합니다.`,
  };
  return responses[category] || responses.burnout;
};

const DAILY_QUOTES = [
  {
    quote: '선생님의 존재만으로도 교실은 이미 아이들에게 가장 안전하고 따뜻한 쉼터입니다.',
    author: '마음쉼터 오늘의 온기',
    mindfulness: '양어깨를 귀까지 한껏 올렸다가 후- 하고 깊게 내쉬며 교실에서의 긴장을 풀어보세요.',
    reflectionTip: '오늘 하루, 내가 해낸 가장 작은 일 하나(아이에게 건넨 미소, 출석 확인)에 칭찬을 건네보세요.',
  },
  {
    quote: '모든 것을 완벽하게 해내지 않아도 괜찮습니다. 오늘 선생님이 보여주신 성실함만으로도 충분합니다.',
    author: '마음쉼터 오늘의 다정함',
    mindfulness: '가슴에 한 손을 얹고, 4초간 숨을 들이마시고 6초간 천천히 내쉬며 온기를 느껴보세요.',
    reflectionTip: '퇴근 후에는 교실의 문을 닫듯, 마음속 수업 걱정의 문도 부드럽게 닫아주세요.',
  },
  {
    quote: '아이들의 변화는 더디더라도, 선생님께서 심어주신 사랑의 씨앗은 언젠가 반드시 싹을 틔웁니다.',
    author: '마음쉼터 오늘의 희망',
    mindfulness: '창밖의 먼 하늘을 30초간 바라보며 굳어진 시선과 목의 긴장을 가볍게 풀어주세요.',
    reflectionTip: '학생의 거친 표현은 선생님을 향한 공격이 아니라, 아이 내면의 미성숙한 외침입니다.',
  },
  {
    quote: '선생님의 마음이 평온할 때, 교실의 공기도 비로소 맑아집니다. 오늘 가장 소중한 사람은 바로 선생님입니다.',
    author: '마음쉼터 오늘의 쉼',
    mindfulness: '두 손을 마주 비벼 따뜻해진 손바닥을 양 볼에 가볍게 대고 스스로를 다독여보세요.',
    reflectionTip: '퇴근길, 교문 밖으로 발을 내딛는 순간 모든 학교 업무의 스위치를 꺼보세요.',
  },
];

// AI Counseling endpoint
app.post('/api/counsel', async (req, res) => {
  try {
    const { category, messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '대화 내역이 올바르지 않습니다.' });
    }

    if (ai) {
      try {
        const systemInstruction = COUNSELING_PROMPTS[category] || COUNSELING_PROMPTS.burnout;
        const contents = messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: `${systemInstruction}\n\n[답변 규칙]
1. 항상 다정하고 따뜻한 어조(해요체 또는 존댓말)로 말하세요.
2. 3~5문단 내외로, 너무 길지 않게 읽기 쉬운 호흡으로 작성하세요.
3. 선생님의 마음을 충분히 헤아려 준 뒤, 실질적으로 마음을 편안하게 해 줄 작은 행동이나 관점을 제시하세요.`,
            temperature: 0.8,
          },
        });

        if (response.text) {
          return res.json({ reply: response.text });
        }
      } catch (genError: any) {
        console.warn('Gemini API call failed, using graceful fallback:', genError?.message);
      }
    }

    // Graceful fallback counseling response
    const reply = getFallbackCounseling(category);
    return res.json({ reply });
  } catch (error: any) {
    console.warn('Counseling handler fallback:', error?.message);
    const reply = getFallbackCounseling('burnout');
    res.json({ reply });
  }
});

// Daily encouragement & mindfulness prompt endpoint
app.post('/api/daily-encouragement', async (req, res) => {
  try {
    const quoteIndex = new Date().getDate() % DAILY_QUOTES.length;
    let result = DAILY_QUOTES[quoteIndex];

    if (ai) {
      try {
        const { mood } = req.body;
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `교사를 위한 오늘의 따뜻한 1문장 격려 문구와 1분 마음챙김 호흡 가이드를 한국어로 작성해 주세요. 현재 교사의 심리 상태: ${mood || '보통'}.
형식은 JSON으로 다음과 같이 출력하세요:
{
  "quote": "선생님의 존재만으로도 교실은 이미 따뜻한 곳입니다.",
  "author": "마음쉼터 오늘의 온기",
  "mindfulness": "양어깨를 귀까지 한껏 올렸다가 '후-' 하고 깊게 내쉬며 긴장을 풀어보세요.",
  "reflectionTip": "오늘 하루, 내가 해낸 가장 작은 일 하나에 칭찬을 건네보세요."
}`,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.9,
          },
        });

        if (response.text) {
          result = JSON.parse(response.text.trim());
        }
      } catch (genError: any) {
        console.warn('Daily encouragement generation fallback active:', genError?.message);
      }
    }

    res.json(result);
  } catch (error: any) {
    console.warn('Daily encouragement handler fallback:', error?.message);
    res.json(DAILY_QUOTES[0]);
  }
});

// Setup dev server with Vite or production static assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Teacher Mind Shelter server running on port ${port}`);
  });
}

startServer();
