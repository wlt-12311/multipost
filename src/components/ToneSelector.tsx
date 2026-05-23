import type { Tone } from '../types';
import { TONES } from '../types';

interface Props {
  value: Tone;
  onChange: (tone: Tone) => void;
}

export default function ToneSelector({ value, onChange }: Props) {
  return (
    <div className="tone-selector">
      <label className="section-label">🎭 Tone</label>
      <div className="tone-grid">
        {TONES.map(t => (
          <button
            key={t.id}
            className={`tone-btn ${value === t.id ? 'active' : ''}`}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
