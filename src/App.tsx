import { useState, useCallback, useRef, useEffect } from 'react';
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
import VoiceoverTab from './components/VoiceoverTab';

type Tab = 'rewrite' | 'voiceover';

const SITE_URL = 'https://github.com/yuzhiran/multipost';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('rewrite');
  const [source, setSource] = useState(() => loadSource());
  const [platforms, setPlatforms] = useState<PlatformId[]>(['twitter', 'linkedin', 'xiaohongshu']);
  const [tone, setTone] = useState<Tone>('professional');
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => loadConfig() || DEFAULT_AI_CONFIG);
  const [entries, setEntries] = useState<OutputEntry[]>([]);
  const [generating, setGenerating] = useState(false);
  const [lang, setLang] = useState<Lang>(() => getStoredLang());
  const abortRef = useRef<AbortController | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 窗口宽度变化时自动关闭移动端侧边栏
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
          <button
            className={`hamburger-btn${sidebarOpen ? ' active' : ''}`}
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label="Toggle sidebar"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
          <h1 className="logo">
            <span className="cn-name">{t(lang, 'app.logo')}</span>
          </h1>
          <span className="tagline">{t(lang, 'app.tagline')}</span>
        </div>
        <div className="header-center">
          <nav className="tab-nav">
            <button
              className={`tab-btn ${activeTab === 'rewrite' ? 'active' : ''}`}
              onClick={() => setActiveTab('rewrite')}
            >
              ✍️ {t(lang, 'tab.rewrite')}
            </button>
            <button
              className={`tab-btn ${activeTab === 'voiceover' ? 'active' : ''}`}
              onClick={() => setActiveTab('voiceover')}
            >
              🎙️ {t(lang, 'tab.voiceover')}
            </button>
          </nav>
        </div>
        <div className="header-right">
          <LangSwitcher />
          <a className="github-link" href={SITE_URL} target="_blank" rel="noopener noreferrer">⭐ Star on GitHub</a>
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
        <aside className={`config-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
          <ApiKeyConfig config={aiConfig} onChange={setAiConfig} />
          {activeTab === 'rewrite' && (
            <>
              <ToneSelector value={tone} onChange={setTone} />
              <PlatformSelector selected={platforms} onChange={setPlatforms} />
            </>
          )}
        </aside>
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

        <section className="content-area">
          {activeTab === 'rewrite' && (
            <>
              <InputPanel
                value={source}
                onChange={setSource}
                onGenerate={handleGenerate}
                onCancel={handleCancel}
                generating={generating}
                hasConfig={hasValidConfig}
              />
              <OutputPanel entries={entries} onEdit={handleEdit} onRegenerate={handleRegenerateSingle} />
            </>
          )}
          {activeTab === 'voiceover' && (
            <VoiceoverTab aiConfig={aiConfig} />
          )}
        </section>
      </main>

      <footer className="app-footer">
        <div className="footer-info">
          <span>{t(lang, 'app.footer')}</span>
          <span className="footer-links">
            <a href="https://github.com/yuzhiran/multipost" target="_blank" rel="noopener noreferrer">GitHub</a>
            {' · '}
            <a href="mailto:hello@yuzhiran.cn" rel="noopener noreferrer">{t(lang, 'footer.contact')}</a>
            {' · '}
            MIT License
          </span>
        </div>
      </footer>
    </div>
    </LangContext.Provider>
  );
}
