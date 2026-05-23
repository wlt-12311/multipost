import type { AIConfig } from '../types';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature: number;
  max_tokens: number;
}

export async function callAI(
  config: AIConfig,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const body: ChatCompletionRequest = {
    model: config.model,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  };

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`API Error ${response.status}: ${errBody || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content in API response');
  return content.trim();
}

export function validateConfig(config: AIConfig): string | null {
  if (!config.apiKey.trim()) return 'API Key is required';
  if (!config.baseUrl.trim()) return 'API Base URL is required';
  if (!config.model.trim()) return 'Model name is required';
  try { new URL(config.baseUrl); } catch { return 'Invalid Base URL'; }
  return null;
}
