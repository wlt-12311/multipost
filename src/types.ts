export type PlatformId =
  | 'twitter'
  | 'linkedin'
  | 'newsletter'
  | 'wechat'
  | 'xiaohongshu'
  | 'reddit';

export type Tone = 'professional' | 'casual' | 'promotional' | 'storytelling' | 'educational';

export interface PlatformInfo {
  id: PlatformId;
  label: string;
  icon: string;
  color: string;
  maxLen: string; // displayed hint
  description: string;
}

export interface OutputEntry {
  platformId: PlatformId;
  content: string;
  loading: boolean;
  error: string | null;
}

export interface AIConfig {
  provider: 'openai' | 'deepseek' | 'yunfan' | 'custom';
  apiKey: string;
  baseUrl: string;
  model: string;
}

export const PLATFORMS: PlatformInfo[] = [
  { id: 'twitter',       label: 'X / Twitter',    icon: '𝕏',  color: '#1d9bf0', maxLen: '~280 chars/tweet',  description: 'Thread format, punchy hook' },
  { id: 'linkedin',      label: 'LinkedIn',        icon: '💼', color: '#0a66c2', maxLen: '~3,000 chars',      description: 'Professional tone, narrative' },
  { id: 'newsletter',    label: 'Newsletter',      icon: '📬', color: '#e54a4a', maxLen: '~5,000 chars',      description: 'Full article with subject line' },
  { id: 'wechat',        label: '微信公众平台',     icon: '📱', color: '#07c160', maxLen: '~20,000 chars',     description: '中文长文，正式教育调性' },
  { id: 'xiaohongshu',   label: '小红书',           icon: '📕', color: '#ff2442', maxLen: '~1,000 chars',      description: '视觉化叙述，emoji，经验分享' },
  { id: 'reddit',        label: 'Reddit',           icon: '🗣️', color: '#ff4500', maxLen: '~10,000 chars',     description: 'Conversational, community-aware' },
];

export const TONES: { id: Tone; label: string }[] = [
  { id: 'professional', label: 'Professional' },
  { id: 'casual',       label: 'Casual / Friendly' },
  { id: 'promotional',  label: 'Promotional / Sales' },
  { id: 'storytelling', label: 'Storytelling' },
  { id: 'educational',  label: 'Educational' },
];

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'yunfan',
  apiKey: import.meta.env.VITE_YUNFAN_API_KEY || '',
  baseUrl: import.meta.env.VITE_YUNFAN_BASE_URL || 'http://localhost:8100/v1',
  model: 'deepseek-v4-flash',
};

export const PROVIDER_PRESETS: Record<string, { baseUrl: string; models: string[] }> = {
  openai:   { baseUrl: 'https://api.openai.com/v1',       models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4'] },
  deepseek: { baseUrl: 'https://api.deepseek.com/v1',      models: ['deepseek-chat', 'deepseek-reasoner'] },
  yunfan:   { baseUrl: 'http://localhost:8100/v1',         models: ['deepseek-v4-flash', 'sensenova-6.7-flash-lite'] },
  custom:   { baseUrl: '',                                  models: [] },
};
