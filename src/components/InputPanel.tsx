import { useState } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  generating: boolean;
  hasConfig: boolean;
}

export default function InputPanel({ value, onChange, onGenerate, generating, hasConfig }: Props) {
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setCharCount(v.length);
    onChange(v);
  };

  return (
    <div className="input-panel">
      <div className="input-header">
        <label className="section-label">📝 Source Content</label>
        <span className="char-count">{charCount} chars</span>
      </div>
      <textarea
        className="source-input"
        value={value}
        onChange={handleChange}
        placeholder={`Paste your blog post, script, notes, or bullet points here...

Example: paste a full article, a podcast transcript, or just your key points.`}
        rows={10}
      />
      <button
        className="generate-btn"
        onClick={onGenerate}
        disabled={!value.trim() || generating || !hasConfig}
      >
        {generating ? (
          <span className="generating-spinner">⟳ Adapting...</span>
        ) : (
          <span>✨ Generate Platform Versions</span>
        )}
      </button>
      {!hasConfig && (
        <p className="hint">⚠️ Configure your API Key above to enable generation</p>
      )}
    </div>
  );
}
