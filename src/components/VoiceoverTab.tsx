import { useState, useCallback, useRef, useEffect } from 'react';
import { useLang } from '../i18n';
import { callAI } from '../lib/ai';
import type { AIConfig } from '../types';

/* ── Scene definitions ── */

interface VoiceScene {
  id: string;
  icon: string;
  labelKey: string;
  descKey: string;
  defaultRate: number;   // 0.1–10, Web Speech API
  defaultPitch: number;  // 0–2
  styleHint: string;     // prompt for AI polish
}

const VOICE_SCENES: VoiceScene[] = [
  { id: 'tiktok', icon: '🎬', labelKey: 'voice.scene.tiktok', descKey: 'voice.scene.tiktok.desc', defaultRate: 1.4, defaultPitch: 1.2, styleHint: 'Energetic short video narration, fast-paced, punchy, suitable for Douyin/TikTok.' },
  { id: 'podcast', icon: '🎙️', labelKey: 'voice.scene.podcast', descKey: 'voice.scene.podcast.desc', defaultRate: 0.9, defaultPitch: 1.0, styleHint: 'Warm conversational podcast style, natural rhythm, friendly and engaging.' },
  { id: 'product', icon: '🏷️', labelKey: 'voice.scene.product', descKey: 'voice.scene.product.desc', defaultRate: 1.0, defaultPitch: 1.0, styleHint: 'Professional product introduction, clear articulation, persuasive but credible.' },
  { id: 'emotional', icon: '💗', labelKey: 'voice.scene.emotional', descKey: 'voice.scene.emotional.desc', defaultRate: 0.7, defaultPitch: 0.9, styleHint: 'Gentle emotional monologue, soft and sincere, slow rhythm, for storytelling or confession.' },
  { id: 'educational', icon: '📚', labelKey: 'voice.scene.educational', descKey: 'voice.scene.educational.desc', defaultRate: 0.85, defaultPitch: 1.0, styleHint: 'Educational explainer, clear logical flow, patient tone, suitable for science or knowledge sharing.' },
  { id: 'gaming', icon: '🎮', labelKey: 'voice.scene.gaming', descKey: 'voice.scene.gaming.desc', defaultRate: 1.5, defaultPitch: 1.3, styleHint: 'High-energy gaming commentary, excited tone, fast reactions, engaging.' },
  { id: 'story', icon: '🧸', labelKey: 'voice.scene.story', descKey: 'voice.scene.story.desc', defaultRate: 0.75, defaultPitch: 1.1, styleHint: 'Children\'s story narration, warm and animated, expressive, with playful character voices.' },
  { id: 'news', icon: '📰', labelKey: 'voice.scene.news', descKey: 'voice.scene.news.desc', defaultRate: 1.05, defaultPitch: 1.0, styleHint: 'Formal news broadcast, steady pace, authoritative, neutral tone.' },
];

/* ── i18n helper ── */

function sceneLabel(scene: VoiceScene, lang: 'zh' | 'en'): string {
  const labels: Record<string, string> = {
    'voice.scene.tiktok':     lang === 'zh' ? '抖音解说' : 'TikTok Narration',
    'voice.scene.podcast':    lang === 'zh' ? '电台播客' : 'Podcast',
    'voice.scene.product':    lang === 'zh' ? '产品介绍' : 'Product Intro',
    'voice.scene.emotional':  lang === 'zh' ? '情感独白' : 'Emotional',
    'voice.scene.educational':lang === 'zh' ? '知识科普' : 'Educational',
    'voice.scene.gaming':     lang === 'zh' ? '游戏解说' : 'Gaming Commentary',
    'voice.scene.story':      lang === 'zh' ? '儿童故事' : 'Children\'s Story',
    'voice.scene.news':       lang === 'zh' ? '新闻播报' : 'News Broadcast',
  };
  return labels[scene.labelKey] || scene.labelKey;
}

function sceneDesc(scene: VoiceScene, lang: 'zh' | 'en'): string {
  const descs: Record<string, string> = {
    'voice.scene.tiktok.desc':     lang === 'zh' ? '快节奏、有冲击力' : 'Fast-paced, punchy',
    'voice.scene.podcast.desc':    lang === 'zh' ? '温暖自然、对话感' : 'Warm, conversational',
    'voice.scene.product.desc':    lang === 'zh' ? '专业清晰、有说服力' : 'Professional, persuasive',
    'voice.scene.emotional.desc':  lang === 'zh' ? '温柔缓慢、深情' : 'Gentle, slow, sincere',
    'voice.scene.educational.desc':lang === 'zh' ? '有条理、耐心讲解' : 'Clear, logical, patient',
    'voice.scene.gaming.desc':     lang === 'zh' ? '高能量、带动氛围' : 'High-energy, exciting',
    'voice.scene.story.desc':      lang === 'zh' ? '温暖活泼、有表现力' : 'Warm, animated',
    'voice.scene.news.desc':       lang === 'zh' ? '正式稳重、权威感' : 'Formal, authoritative',
  };
  return descs[scene.descKey] || scene.descKey;
}

/* ── Component ── */

interface Props {
  aiConfig: AIConfig;
}

export default function VoiceoverTab({ aiConfig }: Props) {
  const { lang } = useLang();

  // Scene state
  const [selectedScene, setSelectedScene] = useState<VoiceScene>(VOICE_SCENES[0]);
  const [text, setText] = useState('');
  const [rate, setRate] = useState(VOICE_SCENES[0].defaultRate);
  const [pitch, setPitch] = useState(VOICE_SCENES[0].defaultPitch);

  // TTS state
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState('');
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // AI polish state
  const [polishing, setPolishing] = useState(false);

  // Load voices
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const loadVoices = () => {
      const all = synthRef.current?.getVoices() || [];
      // Sort: Chinese voices first, then English
      const chinese = all.filter(v => v.lang.startsWith('zh'));
      const rest = all.filter(v => !v.lang.startsWith('zh'));
      const sorted = [...chinese, ...rest];
      setVoices(sorted);
      if (sorted.length > 0 && !selectedVoiceUri) {
        setSelectedVoiceUri(sorted[0].voiceURI);
      }
    };
    loadVoices();
    if (synthRef.current) {
      synthRef.current.onvoiceschanged = loadVoices;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
        synthRef.current.onvoiceschanged = null;
      }
    };
  }, []);

  // Switch scene → reset rate/pitch
  const handleSceneSelect = useCallback((scene: VoiceScene) => {
    setSelectedScene(scene);
    setRate(scene.defaultRate);
    setPitch(scene.defaultPitch);
  }, []);

  // TTS speak
  const handleSpeak = useCallback(() => {
    if (!text.trim() || !synthRef.current) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Pick voice: prefer selected, fallback to first Chinese
    if (selectedVoiceUri) {
      const found = voices.find(v => v.voiceURI === selectedVoiceUri);
      if (found) utterance.voice = found;
    }
    if (!utterance.voice) {
      const chinese = voices.find(v => v.lang.startsWith('zh'));
      if (chinese) utterance.voice = chinese;
    }

    utteranceRef.current = utterance;
    setSpeaking(true);
    setPaused(false);

    utterance.onend = () => { setSpeaking(false); setPaused(false); };
    utterance.onerror = () => { setSpeaking(false); setPaused(false); };

    synthRef.current.speak(utterance);
  }, [text, rate, pitch, selectedVoiceUri, voices]);

  const handlePause = useCallback(() => {
    if (synthRef.current?.speaking) {
      synthRef.current.pause();
      setPaused(true);
    }
  }, []);

  const handleResume = useCallback(() => {
    if (synthRef.current?.paused) {
      synthRef.current.resume();
      setPaused(false);
    }
  }, []);

  const handleStop = useCallback(() => {
    synthRef.current?.cancel();
    setSpeaking(false);
    setPaused(false);
  }, []);

  // AI polish
  const handlePolish = useCallback(async () => {
    if (!text.trim() || !aiConfig.apiKey) return;
    setPolishing(true);
    try {
      const systemPrompt = `You are a professional copywriter. Rewrite the following text to be suitable for voiceover in this scene: ${selectedScene.styleHint}
- Make it flow naturally when spoken aloud
- Use short, clear sentences
- Keep the original meaning and facts intact
- Output ONLY the rewritten text, no explanations`;
      const result = await callAI(aiConfig, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ]);
      setText(result);
    } catch (err: any) {
      alert('AI polish failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setPolishing(false);
    }
  }, [text, aiConfig, selectedScene]);

  const isZh = lang === 'zh';

  return (
    <div className="voiceover-tab">
      {/* ── Scene Selection ── */}
      <div className="vo-section">
        <label className="section-label">{isZh ? '🎯 选择配音场景' : '🎯 Select Voice Scene'}</label>
        <div className="vo-scene-grid">
          {VOICE_SCENES.map(scene => (
            <button
              key={scene.id}
              className={`vo-scene-btn ${selectedScene.id === scene.id ? 'active' : ''}`}
              onClick={() => handleSceneSelect(scene)}
            >
              <span className="vo-scene-icon">{scene.icon}</span>
              <span className="vo-scene-name">{sceneLabel(scene, lang)}</span>
              <span className="vo-scene-desc">{sceneDesc(scene, lang)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Text Input ── */}
      <div className="vo-section">
        <div className="vo-text-header">
          <label className="section-label">{isZh ? '📝 配音文案' : '📝 Voiceover Script'}</label>
          <span className="char-count">{text.length} {isZh ? '字' : 'chars'}</span>
        </div>
        <textarea
          className="vo-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={isZh
            ? '输入配音文案…\n\n💡 点击「AI润色」可以优化文案使其更适合当前场景的语音风格'
            : 'Enter your voiceover script…\n\n💡 Click "AI Polish" to optimize it for the selected scene'
          }
          rows={6}
        />
        <div className="vo-text-actions">
          <button
            className="vo-polish-btn"
            onClick={handlePolish}
            disabled={polishing || !text.trim() || !aiConfig.apiKey}
          >
            {polishing ? (isZh ? '⏳ 润色中...' : '⏳ Polishing...')
              : (isZh ? '✨ AI 润色' : '✨ AI Polish')}
          </button>
          <span className="vo-hint">
            {!aiConfig.apiKey ? (isZh ? '⚠️ 需先配置 API Key' : '⚠️ API Key required')
              : (isZh ? 'AI 润色使用已配置的服务商' : 'Uses your configured AI provider')}
          </span>
        </div>
      </div>

      {/* ── Voice Settings ── */}
      <div className="vo-section">
        <label className="section-label">{isZh ? '🎛️ 声音设置' : '🎛️ Voice Settings'}</label>
        <div className="vo-settings-grid">
          <div className="vo-setting">
            <label>{isZh ? '语速' : 'Speed'}: {rate.toFixed(1)}x</label>
            <input type="range" min="0.5" max="2.0" step="0.1" value={rate}
              onChange={e => setRate(parseFloat(e.target.value))} />
          </div>
          <div className="vo-setting">
            <label>{isZh ? '音调' : 'Pitch'}: {pitch.toFixed(1)}</label>
            <input type="range" min="0.5" max="1.5" step="0.1" value={pitch}
              onChange={e => setPitch(parseFloat(e.target.value))} />
          </div>
          <div className="vo-setting">
            <label>{isZh ? '音色' : 'Voice'}</label>
            <select value={selectedVoiceUri} onChange={e => setSelectedVoiceUri(e.target.value)}
              className="vo-voice-select">
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Playback Controls ── */}
      <div className="vo-section vo-player-section">
        <div className="vo-player">
          {!speaking && !paused && (
            <button className="vo-play-btn" onClick={handleSpeak} disabled={!text.trim()}>
              ▶ {isZh ? '播放' : 'Play'}
            </button>
          )}
          {speaking && !paused && (
            <>
              <button className="vo-play-btn vo-pause-btn" onClick={handlePause}>
                ⏸ {isZh ? '暂停' : 'Pause'}
              </button>
              <button className="vo-stop-btn" onClick={handleStop}>
                ⏹ {isZh ? '停止' : 'Stop'}
              </button>
            </>
          )}
          {paused && (
            <>
              <button className="vo-play-btn" onClick={handleResume}>
                ▶ {isZh ? '继续' : 'Resume'}
              </button>
              <button className="vo-stop-btn" onClick={handleStop}>
                ⏹ {isZh ? '停止' : 'Stop'}
              </button>
            </>
          )}
        </div>
        {speaking && (
          <div className="vo-wave">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        )}
      </div>

      {/* ── Tips ── */}
      <div className="vo-section vo-tips">
        <details>
          <summary>{isZh ? '💡 使用技巧' : '💡 Tips'}</summary>
          <ul>
            <li>{isZh
              ? '选择场景后，语速和音调会自动调整为推荐值，你可以进一步微调'
              : 'Rate and pitch auto-adjust when you select a scene. Fine-tune as needed.'}</li>
            <li>{isZh
              ? '先用 "AI润色" 让文案更适合口播，再生成语音'
              : 'Use "AI Polish" first to make the script more natural for speaking.'}</li>
            <li>{isZh
              ? '语音通过浏览器原生 Speech API 生成，所有数据不会离开你的电脑'
              : 'TTS uses the browser\'s built-in Speech API — your data never leaves your device.'}</li>
            <li>{isZh
              ? '如需更高品质语音，建议使用 Edge/Chrome 浏览器（中文语音质量最佳）'
              : 'For best Chinese voice quality, use Edge or Chrome browser.'}</li>
          </ul>
        </details>
      </div>
    </div>
  );
}
