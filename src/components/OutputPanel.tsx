import { useState } from 'react';
import type { OutputEntry, PlatformId } from '../types';
import { PLATFORMS } from '../types';
import { useLang, t } from '../i18n';

interface Props {
  entries: OutputEntry[];
  onEdit: (platformId: PlatformId, content: string) => void;
  onRegenerate?: (platformId: PlatformId) => void;
}

export default function OutputPanel({ entries, onEdit, onRegenerate }: Props) {
  const { lang } = useLang();
  const done = entries.filter(e => !e.loading && !e.error && e.content);
  const loading = entries.filter(e => e.loading).length;
  const total = entries.length;
  if (done.length === 0 && entries.length === 0) return null;

  const handleExportMarkdown = () => {
    const platformLabels: Record<string, string> = {
      twitter: t(lang, 'platform.twitter'),
      linkedin: t(lang, 'platform.linkedin'),
      newsletter: t(lang, 'platform.newsletter'),
      wechat: t(lang, 'platform.wechat'),
      xiaohongshu: t(lang, 'platform.xiaohongshu'),
      reddit: t(lang, 'platform.reddit'),
    };
    const lines = done.map(e => {
      const label = platformLabels[e.platformId] || e.platformId;
      return `## ${label}\n\n${e.content}\n\n---\n`;
    });
    const md = `${t(lang, 'export.title')}\n\n${t(lang, 'export.generated')}\n\n${lines.join('\n')}`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t(lang, 'export.filename')}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="output-panel">
      <div className="output-header">
        <div className="output-header-left">
          <h2 className="output-title">{t(lang, 'output.title')}</h2>
          {loading > 0 && (
            <span className="progress-badge">{t(lang, 'output.progress', { done, total })}</span>
          )}
        </div>
        {done.length > 0 && (
          <button className="export-btn" onClick={handleExportMarkdown}>
            {t(lang, 'output.download')}
          </button>
        )}
      </div>
      <div className="output-grid">
        {entries.map(entry => {
          const platform = PLATFORMS.find(p => p.id === entry.platformId);
          if (!platform) return null;

          return (
            <div key={entry.platformId} className="output-card" style={{ borderTopColor: platform.color }}>
              <div className="output-card-header">
                <span className="platform-icon">{platform.icon}</span>
                <span className="platform-label">{t(lang, `platform.${platform.id}`)}</span>
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
                    <strong>{t(lang, 'output.error')}</strong> {entry.error}
                  </div>
                )}
                {!entry.loading && !entry.error && !entry.content && (
                  <div className="empty-msg">{t(lang, 'output.waiting')}</div>
                )}
                {!entry.loading && !entry.error && entry.content && (
                  <OutputContent
                    content={entry.content}
                    platformId={entry.platformId}
                    onEdit={c => onEdit(entry.platformId, c)}
                    loading={entry.loading}
                    onRegenerate={onRegenerate ? () => onRegenerate(entry.platformId) : undefined}
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

function OutputContent({ content, platformId, onEdit, loading, onRegenerate }: { content: string; platformId: PlatformId; onEdit: (c: string) => void; loading?: boolean; onRegenerate?: () => void }) {
  const [copied, setCopied] = useState(false);
  const { lang } = useLang();

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
        <div className="output-actions-left">
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? t(lang, 'output.copied') : t(lang, 'output.copy')}
          </button>
          {onRegenerate && !loading && (
            <button className="regenerate-btn" onClick={onRegenerate}>
              {t(lang, 'output.regenerate')}
            </button>
          )}
        </div>
        <span className="word-count">
          {platformId === 'twitter'
            ? `${content.split('---').length} ${t(lang, 'output.tweets')}`
            : `${content.length} ${t(lang, 'output.chars')}`
          }
        </span>
      </div>
    </div>
  );
}
