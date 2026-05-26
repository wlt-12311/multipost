import { useState, useCallback, useRef } from 'react';
import type { PlatformId, Tone, OutputEntry, AIConfig } from './types';
import { DEFAULT_AI_CONFIG, PLATFORMS, TONES } from './types';
import { callAI, validateConfig } from './lib/ai';
import { buildSystemPrompt, buildUserMessage } from './lib/prompts';
import { loadConfig, saveConfig } from './lib/storage';
import { loadSource, saveSource } from './lib/storage';
import { LangContext, getStoredLang, storeLang, t } from './i18n';
import type { Lang } from './i18n';
import InputPanel from './components/InputPanel';
import PlatformSelector from './components/PlatformSelector';
import ToneSelector from './components/ToneSelector';
import ApiKeyConfig from './components/ApiKeyConfig';
import OutputPanel from './components/OutputPanel';
import LangSwitcher from './components/LangSwitcher';

const SITE_URL = 'https://www.yzrcloud.cn';
const AI_URL = 'https://ai.yzrcloud.cn';

export default function App() {
  const [source, setSource] = useState(() => loadSource());
  const [platforms, setPlatforms] = useState<PlatformId[]>(['twitter', 'linkedin', 'xiaohongshu']);
  const [tone, setTone] = useState<Tone>('professional');
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => loadConfig() || DEFAULT_AI_CONFIG);
  const [entries, setEntries] = useState<OutputEntry[]>([]);
  const [generating, setGenerating] = useState(false);
  const [lang, setLang] = useState<Lang>(() => getStoredLang());
  const abortRef = useRef<AbortController | null>(null);

  const handleLangChange = (next: Lang) => {
    setLang(next);
    storeLang(next);
    document.title = t(next, 'app.tagline');
  };

  const hasValidConfig = aiConfig.apiKey.trim().length > 0 && validateConfig(aiConfig) === null;

  const handleCancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setGenerating(false);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!source.trim() || platforms.length === 0) return;

    const validationError = validateConfig(aiConfig);
    if (validationError) {
      alert(validationError);
      return;
    }

    // Save config on each successful generation
    saveConfig(aiConfig);
    saveSource(source);

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

  const handleRegenerateSingle = useCallback(async (platformId: PlatformId) => {
    const validationError = validateConfig(aiConfig);
    if (validationError) {
      alert(validationError);
      return;
    }

    // Update single entry to loading state
    setEntries(prev => prev.map(e =>
      e.platformId === platformId ? { ...e, content: '', loading: true, error: null } : e
    ));

    try {
      const systemPrompt = buildSystemPrompt(platformId, tone);
      const userMessage = buildUserMessage(source, platformId);
      const content = await callAI(aiConfig, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ]);
      setEntries(prev => prev.map(e =>
        e.platformId === platformId ? { ...e, content, loading: false } : e
      ));
    } catch (err: any) {
      const errorMsg = err?.message || 'Unknown error';
      setEntries(prev => prev.map(e =>
        e.platformId === platformId ? { ...e, loading: false, error: errorMsg } : e
      ));
    }
  }, [source, tone, aiConfig]);

  return (
    <LangContext.Provider value={{ lang, setLang: handleLangChange }}>
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="logo">
            <span className="cn-name">宇之然-多境</span>
          </h1>
          <span className="tagline">{t(lang, 'app.tagline')}</span>
        </div>
        <div className="header-right">
          <LangSwitcher />
          <a className="github-link" href={SITE_URL} target="_blank" rel="noopener noreferrer">云帆</a>
          <a className="github-link" href={AI_URL} target="_blank" rel="noopener noreferrer">AI能力引擎</a>
          <a
            className="github-link"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t(lang, 'app.byok')}
          </a>
        </div>
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
            onCancel={handleCancel}
            generating={generating}
            hasConfig={hasValidConfig}
          />
          <OutputPanel entries={entries} onEdit={handleEdit} onRegenerate={handleRegenerateSingle} />
        </section>
      </main>

      <footer className="app-footer">
        <span>{t(lang, 'app.footer')}</span>
        <span className="footer-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">{t(lang, 'footer.github')}</a>
          {' · '}
          <a href="mailto:hello@yuzhiran.cn" rel="noopener noreferrer">{t(lang, 'footer.contact')}</a>
        </span>
        <br />
        <span style={{ opacity: 0.5, fontSize: '0.85em' }}>
          © 2026 北京宇之然科技中心
        </span>
        <br />
        <span style={{ opacity: 0.5, fontSize: '0.85em' }}>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>京ICP备2026007249号-5</a>
          <span style={{ margin: '0 6px' }}>|</span>
          <a href="https://beian.mps.gov.cn/#/query/webSearch?code=11011502039866" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
            <img src="/multiscene/images/gongan-beian.png" alt="公安备案图标" style={{ width: 16, height: 18, verticalAlign: 'middle', marginRight: 3 }} />
            京公网安备11011502039866号
          </a>
        </span>
      </footer>
    </div>
    </LangContext.Provider>
  );
}
