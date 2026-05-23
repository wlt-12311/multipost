import { useState } from 'react';
import type { AIConfig } from '../types';
import { PROVIDER_PRESETS } from '../types';
import { loadConfig, saveConfig, clearConfig } from '../lib/storage';

interface Props {
  config: AIConfig;
  onChange: (config: AIConfig) => void;
}

export default function ApiKeyConfig({ config, onChange }: Props) {
  const [show, setShow] = useState(false);
  const saved = loadConfig();

  const update = (patch: Partial<AIConfig>) => {
    const next = { ...config, ...patch };
    onChange(next);
    saveConfig(next);
  };

  const handleProviderChange = (provider: string) => {
    const preset = PROVIDER_PRESETS[provider];
    if (preset) {
      onChange({ ...config, provider: provider as any, baseUrl: preset.baseUrl, model: preset.models[0] || '' });
    }
  };

  const handleClear = () => {
    clearConfig();
    onChange({ ...config, apiKey: '' });
  };

  return (
    <div className="api-config">
      <div className="api-header" onClick={() => setShow(!show)}>
        <span>🔑 {saved ? 'API Key configured' : 'Configure AI Provider'}</span>
        <span className="toggle-arrow">{show ? '▲' : '▼'}</span>
      </div>
      {show && (
        <div className="api-body">
          <div className="field-row">
            <label>Provider</label>
            <select
              value={config.provider}
              onChange={e => handleProviderChange(e.target.value)}
            >
              <option value="yunfan">☁️ YunFan AI Gateway</option>
              <option value="openai">OpenAI</option>
              <option value="deepseek">DeepSeek</option>
              <option value="custom">Custom (OpenAI-compatible)</option>
            </select>
          </div>
          <div className="field-row">
            <label>Base URL</label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={e => update({ baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
            />
          </div>
          <div className="field-row">
            <label>Model</label>
            <input
              type="text"
              value={config.model}
              onChange={e => update({ model: e.target.value })}
              placeholder="gpt-4o-mini"
            />
          </div>
          <div className="field-row">
            <label>API Key</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={e => update({ apiKey: e.target.value })}
              placeholder="sk-..."
            />
          </div>
          {config.apiKey && (
            <button className="clear-btn" onClick={handleClear}>Clear API Key</button>
          )}
        </div>
      )}
    </div>
  );
}
