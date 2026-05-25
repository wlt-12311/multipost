import type { PlatformId } from '../types';
import { PLATFORMS } from '../types';
import { useLang, t } from '../i18n';

interface Props {
  selected: PlatformId[];
  onChange: (platforms: PlatformId[]) => void;
}

export default function PlatformSelector({ selected, onChange }: Props) {
  const { lang } = useLang();

  const toggle = (id: PlatformId) => {
    if (selected.includes(id)) {
      onChange(selected.filter(p => p !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="platform-selector">
      <div className="platform-header">
        <label className="section-label">{t(lang, 'platform.label')}</label>
        <div className="platform-actions">
          <button className="select-all-btn" onClick={() => onChange(PLATFORMS.map(p => p.id))}>
            {t(lang, 'platform.selectAll')}
          </button>
          <button className="select-all-btn" onClick={() => onChange([])}>
            {t(lang, 'platform.none')}
          </button>
        </div>
      </div>
      <div className="platform-grid">
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            className={`platform-btn ${selected.includes(p.id) ? 'active' : ''}`}
            style={selected.includes(p.id) ? { borderColor: p.color, boxShadow: `0 0 8px ${p.color}44` } : {}}
            onClick={() => toggle(p.id)}
          >
            <span className="platform-icon">{p.icon}</span>
            <span className="platform-label">{t(lang, `platform.${p.id}`)}</span>
            <span className="platform-desc">{t(lang, `platform.${p.id}.desc`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
