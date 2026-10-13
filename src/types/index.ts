export type CounselingCategory = 'parent' | 'student' | 'colleague' | 'workload' | 'burnout';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export type MoodLevel = 'peaceful' | 'hopeful' | 'tired' | 'frustrated' | 'exhausted';

export interface EmotionEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mood: MoodLevel;
  score: number; // 1 to 5
  tags: string[];
  note: string;
}

export interface DailyEncouragement {
  quote: string;
  author: string;
  mindfulness: string;
  reflectionTip: string;
}
