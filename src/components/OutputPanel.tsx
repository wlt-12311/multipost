import { useState } from 'react';
import type { OutputEntry, PlatformId } from '../types';
import { PLATFORMS } from '../types';

interface Props {
  entries: OutputEntry[];
  onEdit: (platformId: PlatformId, content: string) => void;
}

export default function OutputPanel({ entries, onEdit }: Props) {
  const done = entries.filter(e => !e.loading && !e.error && e.content);
  if (done.length === 0 && entries.length === 0) return null;

  return (
    <div className="output-panel">
      <h2 className="output-title">📋 Adapted Versions</h2>
      <div className="output-grid">
        {entries.map(entry => {
          const platform = PLATFORMS.find(p => p.id === entry.platformId);
          if (!platform) return null;

          return (
            <div key={entry.platformId} className="output-card" style={{ borderTopColor: platform.color }}>
              <div className="output-card-header">
                <span className="platform-icon">{platform.icon}</span>
                <span className="platform-label">{platform.label}</span>
                {entry.loading && <span className="badge loading-badge">⌛</span>}
                {entry.error && <span className="badge error-badge">⚠️</span>}
                {!entry.loading && !entry.error && entry.content && <span className="badge done-badge">✓</span>}
              </div>
              <div className="output-card-body">
                {entry.loading && (
                  <div className="loading-pulse">
                    <div className="pulse-bar" />
                    <div className="pulse-bar short" />
                    <div className="pulse-bar" />
                    <div className="pulse-bar medium" />
                  </div>
                )}
                {entry.error && (
                  <div className="error-msg">
                    <strong>Error:</strong> {entry.error}
                  </div>
                )}
                {!entry.loading && !entry.error && !entry.content && (
                  <div className="empty-msg">Waiting...</div>
                )}
                {!entry.loading && !entry.error && entry.content && (
                  <OutputContent
                    content={entry.content}
                    platformId={entry.platformId}
                    onEdit={c => onEdit(entry.platformId, c)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OutputContent({ content, platformId, onEdit }: { content: string; platformId: PlatformId; onEdit: (c: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="output-content">
      <textarea
        className="output-textarea"
        value={content}
        onChange={e => onEdit(e.target.value)}
        rows={8}
      />
      <div className="output-actions">
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
        <span className="word-count">
          {platformId === 'twitter'
            ? `${content.split('---').length} tweets`
            : `${content.length} chars`
          }
        </span>
      </div>
    </div>
  );
}
