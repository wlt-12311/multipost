import { useState, useCallback, useRef } from 'react';
import type { PlatformId, Tone, OutputEntry, AIConfig } from './types';
import { DEFAULT_AI_CONFIG, PLATFORMS } from './types';
import { callAI, validateConfig } from './lib/ai';
import { buildSystemPrompt, buildUserMessage } from './lib/prompts';
import { loadConfig, saveConfig } from './lib/storage';
import InputPanel from './components/InputPanel';
import PlatformSelector from './components/PlatformSelector';
import ToneSelector from './components/ToneSelector';
import ApiKeyConfig from './components/ApiKeyConfig';
import OutputPanel from './components/OutputPanel';

export default function App() {
  const [source, setSource] = useState('');
  const [platforms, setPlatforms] = useState<PlatformId[]>(['twitter', 'linkedin', 'xiaohongshu']);
  const [tone, setTone] = useState<Tone>('professional');
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => loadConfig() || DEFAULT_AI_CONFIG);
  const [entries, setEntries] = useState<OutputEntry[]>([]);
  const [generating, setGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const hasValidConfig = aiConfig.apiKey.trim().length > 0 && validateConfig(aiConfig) === null;

  const handleGenerate = useCallback(async () => {
    if (!source.trim() || platforms.length === 0) return;

    const validationError = validateConfig(aiConfig);
    if (validationError) {
      alert(validationError);
      return;
    }

    // Save config on each successful generation
    saveConfig(aiConfig);

    // Initialise all entries
    const initialEntries: OutputEntry[] = platforms.map(pid => ({
      platformId: pid,
      content: '',
      loading: true,
      error: null,
    }));
    setEntries(initialEntries);

    // Create abort controller for cancellation
    const controller = new AbortController();
    abortRef.current = controller;
    setGenerating(true);

    // Generate all platforms in parallel
    const results = await Promise.allSettled(
      platforms.map(async (pid) => {
        const systemPrompt = buildSystemPrompt(pid, tone);
        const userMessage = buildUserMessage(source, pid);
        return await callAI(aiConfig, [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ], controller.signal);
      })
    );

    // Update entries with results
    setEntries(prev => prev.map((entry, i) => {
      if (i >= results.length) return entry;
      const result = results[i];
      if (result.status === 'fulfilled') {
        return { ...entry, content: result.value, loading: false, error: null };
      } else {
        const errorMsg = result.reason instanceof DOMException && result.reason.name === 'AbortError'
          ? 'Cancelled'
          : result.reason?.message || 'Unknown error';
        return { ...entry, loading: false, error: errorMsg };
      }
    }));
    setGenerating(false);
    abortRef.current = null;
  }, [source, platforms, tone, aiConfig]);

  const handleEdit = (platformId: PlatformId, content: string) => {
    setEntries(prev => prev.map(e =>
      e.platformId === platformId ? { ...e, content } : e
    ));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="logo">一篇多发 <small>MultiPost</small></h1>
          <span className="tagline">Write Once · Publish Everywhere</span>
        </div>
        <a
          className="github-link"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          BYOK · v0.1
        </a>
      </header>

      <main className="app-main">
        <aside className="config-sidebar">
          <ApiKeyConfig config={aiConfig} onChange={setAiConfig} />
          <ToneSelector value={tone} onChange={setTone} />
          <PlatformSelector selected={platforms} onChange={setPlatforms} />
        </aside>

        <section className="content-area">
          <InputPanel
            value={source}
            onChange={setSource}
            onGenerate={handleGenerate}
            generating={generating}
            hasConfig={hasValidConfig}
          />
          <OutputPanel entries={entries} onEdit={handleEdit} />
        </section>
      </main>

      <footer className="app-footer">
        <span>一篇多发 — 你的内容，你的 API Key，数据不出浏览器</span>
        <span className="footer-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          {' · '}
          <a href="mailto:hello@yuzhiran.cn" rel="noopener noreferrer">Contact</a>
        </span>
      </footer>
    </div>
  );
}
