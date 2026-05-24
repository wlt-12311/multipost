import type { AIConfig } from '../types';

const CONFIG_KEY = 'yuzhiran-ai-config';
const SOURCE_KEY = 'yuzhiran-source';

export function loadConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveConfig(config: AIConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearConfig(): void {
  localStorage.removeItem(CONFIG_KEY);
}

export function loadSource(): string {
  try {
    return localStorage.getItem(SOURCE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveSource(text: string): void {
  try {
    localStorage.setItem(SOURCE_KEY, text);
  } catch { /* quota exceeded, ignore */ }
}
