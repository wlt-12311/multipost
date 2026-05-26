import { useState } from 'react';
import { useLang, t } from '../i18n';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  onCancel?: () => void;
  generating: boolean;
  hasConfig: boolean;
}

export default function InputPanel({ value, onChange, onGenerate, onCancel, generating, hasConfig }: Props) {
  const [charCount, setCharCount] = useState(value.length);
  const { lang } = useLang();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setCharCount(v.length);
    onChange(v);
  };

  return (
    <div className="input-panel">
      <div className="input-header">
        <label className="section-label">{t(lang, 'input.label')}</label>
        <span className="char-count">{charCount} {t(lang, 'input.chars')}</span>
      </div>
      <textarea
        className="source-input"
        value={value}
        onChange={handleChange}
        placeholder={t(lang, 'input.placeholder')}
        rows={10}
      />
      <button
        className={`generate-btn ${generating ? 'cancel-btn' : ''}`}
        onClick={generating && onCancel ? onCancel : onGenerate}
        disabled={!generating && (!value.trim() || !hasConfig)}
      >
        {generating ? (
          <span className="cancel-label">{t(lang, 'input.cancel')}</span>
        ) : (
          <span>{t(lang, 'input.generate')}</span>
        )}
      </button>
      {!hasConfig && (
        <p className="hint">⚠️ {t(lang, 'input.hint')}</p>
      )}
    </div>
  );
}
