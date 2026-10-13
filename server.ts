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

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

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

// AI Counseling endpoint
app.post('/api/counsel', async (req, res) => {
  try {
    const { category, messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '대화 내역이 올바르지 않습니다.' });
    }

    if (!ai) {
      const fallbackReplies: Record<string, string> = {
        parent: '선생님, 학부모 민원으로 정말 고생 많으셨습니다. 선생님의 교육적 의도와 무관하게 쏟아지는 불만은 큰 상처가 됩니다. 지금은 혼자 모든 책임을 짊어지려 하지 마시고, 학교 교권보호 매뉴얼 및 관리자와 소통하며 마음의 안정을 먼저 찾으시길 바랍니다. (참고: .env 파일에 GEMINI_API_KEY를 등록하시면 더 맞춤형 대화가 가능합니다.)',
        student: '선생님, 교실에서 지친 학생들을 마주하느라 얼마나 많은 에너지를 쓰셨을까요. 학생의 행동은 교사를 향한 공격이 아닌 아이의 미성숙한 표현일 때가 많습니다. 오늘 하루 최선을 다하신 선생님 자신을 먼저 꼭 안아주세요.',
        colleague: '학교라는 좁은 공간에서 동료나 관리자와의 갈등은 일상을 참 무겁게 만듭니다. 모든 사람과 완벽한 관계를 유지할 필요는 없습니다. 선생님의 마음의 경계를 지키고, 따뜻한 온도를 나누어주는 동료와 먼저 이야기를 나누어 보세요.',
        workload: '서류와 공문에 파묻혀 본래의 교육 철학을 챙기기 어려우셨군요. 오늘 하루 애쓴 나 자신을 위해 완벽주의를 잠시 내려놓고, 따뜻한 차 한 잔과 함께 퇴근 후 나만의 시간을 누려보세요.',
        burnout: '선생님, 번아웃은 결코 부족해서가 아니라 지금까지 너무 뜨겁게 헌신하셨기 때문에 온 쉼의 신호입니다. 오늘만큼은 교사로서의 짐을 교실 문 앞에 벗어두고 온전히 쉬셔도 괜찮습니다.',
      };
      return res.json({ reply: fallbackReplies[category] || fallbackReplies.burnout });
    }

    const systemInstruction = COUNSELING_PROMPTS[category] || COUNSELING_PROMPTS.burnout;

    // Convert messages for Gemini
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

    const reply = response.text || '선생님, 지금 잠시 통신이 원활하지 않지만 제 마음은 늘 선생님 곁에 머물러 있습니다. 잠시 심호흡을 하신 후 다시 이야기해 주세요.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Counseling error:', error);
    res.status(500).json({
      error: '상담 연결 중 일시적인 오류가 발생했습니다.',
      details: error.message,
    });
  }
});

// Daily encouragement & mindfulness prompt endpoint
app.post('/api/daily-encouragement', async (req, res) => {
  try {
    const defaultResult = {
      quote: '오늘 하루도 교실을 지키느라 참 고생 많으셨습니다. 선생님은 이미 충분히 좋은 선생님입니다.',
      author: '마음쉼터 오늘의 온기',
      mindfulness: '가슴에 한 손을 얹고, 4초간 숨을 들이마시고 6초간 천천히 내쉬며 온기를 느껴보세요.',
      reflectionTip: '완벽하지 않아도 괜찮습니다. 오늘 내가 아이들에게 건넨 따뜻한 눈빛 하나를 기억해 주세요.',
    };

    if (!ai) {
      return res.json(defaultResult);
    }

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

    let result = {
      quote: '오늘 하루도 교실을 지키느라 참 고생 많으셨습니다. 선생님은 이미 충분히 좋은 선생님입니다.',
      author: '마음쉼터 오늘의 온기',
      mindfulness: '가슴에 한 손을 얹고, 4초간 숨을 들이마시고 6초간 천천히 내쉬며 온기를 느껴보세요.',
      reflectionTip: '완벽하지 않아도 괜찮습니다. 오늘 내가 아이들에게 건넨 따뜻한 눈빛 하나를 기억해 주세요.',
    };

    try {
      if (response.text) {
        result = JSON.parse(response.text.trim());
      }
    } catch (e) {
      console.warn('JSON parsing failed for encouragement, using fallback:', e);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Daily encouragement error:', error);
    res.json({
      quote: '지친 날에는 그저 아무것도 하지 않아도 괜찮습니다. 선생님의 평온이 가장 중요합니다.',
      author: '마음쉼터의 다정한 위로',
      mindfulness: '창밖의 먼 하늘을 30초간 바라보며 굳어진 시선과 어깨를 가볍게 풀어주세요.',
      reflectionTip: '퇴근 후에는 교실의 문을 닫듯, 마음속 생각의 문도 부드럽게 닫아주세요.',
    });
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
