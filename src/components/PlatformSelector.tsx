import type { PlatformId } from '../types';
import { PLATFORMS } from '../types';

interface Props {
  selected: PlatformId[];
  onChange: (platforms: PlatformId[]) => void;
}

export default function PlatformSelector({ selected, onChange }: Props) {
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
        <label className="section-label">📤 Publish to</label>
        <div className="platform-actions">
          <button className="select-all-btn" onClick={() => onChange(PLATFORMS.map(p => p.id))}>
            Select All
          </button>
          <button className="select-all-btn" onClick={() => onChange([])}>
            None
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
            <span className="platform-label">{p.label}</span>
            <span className="platform-desc">{p.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
