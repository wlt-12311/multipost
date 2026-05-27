import { useState } from 'react';
import type { AIConfig } from '../types';
import { PROVIDER_PRESETS } from '../types';
import { loadConfig, saveConfig, clearConfig } from '../lib/storage';
import { useLang, t } from '../i18n';

interface Props {
  config: AIConfig;
  onChange: (config: AIConfig) => void;
}

export default function ApiKeyConfig({ config, onChange }: Props) {
  const [show, setShow] = useState(false);
  const { lang } = useLang();
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

  const isYunfan = config.provider === 'yunfan';

  return (
    <div className="api-config">
      <div className="api-header" onClick={() => setShow(!show)}>
        <span>🔑 {saved ? t(lang, 'config.configured') : t(lang, 'config.configure')}</span>
        <span className="toggle-arrow">{show ? '▲' : '▼'}</span>
      </div>
      {show && (
        <div className="api-body">
          <div className="field-row">
            <label>{t(lang, 'config.provider')}</label>
            <select
              value={config.provider}
              onChange={e => handleProviderChange(e.target.value)}
            >
              <option value="yunfan">{t(lang, 'config.provider.yunfan')}</option>
              <option value="openai">{t(lang, 'config.provider.openai')}</option>
              <option value="deepseek">{t(lang, 'config.provider.deepseek')}</option>
              <option value="custom">{t(lang, 'config.provider.custom')}</option>
            </select>
          </div>
          {isYunfan ? (
            <div className="yunfan-status">
              <span className="yunfan-status-icon">✓</span>
              <span>{t(lang, 'config.yunfan.connected')}</span>
            </div>
          ) : (
            <>
              <div className="field-row">
                <label>{t(lang, 'config.baseUrl')}</label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={e => update({ baseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div className="field-row">
                <label>{t(lang, 'config.model')}</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={e => update({ model: e.target.value })}
                  placeholder="gpt-4o-mini"
                />
              </div>
              <div className="field-row">
                <label>{t(lang, 'config.apiKey')}</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={e => update({ apiKey: e.target.value })}
                  placeholder="sk-..."
                />
              </div>
              {config.apiKey && (
                <button className="clear-btn" onClick={handleClear}>{t(lang, 'config.clear')}</button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
