import { useLang, t } from '../i18n';
import type { Tone } from '../types';

interface Props {
  value: Tone;
  onChange: (tone: Tone) => void;
}

const TONES: { id: Tone; key: string }[] = [
  { id: 'professional', key: 'tone.professional' },
  { id: 'casual',       key: 'tone.casual' },
  { id: 'promotional',  key: 'tone.promotional' },
  { id: 'storytelling', key: 'tone.storytelling' },
  { id: 'educational',  key: 'tone.educational' },
];

export default function ToneSelector({ value, onChange }: Props) {
  const { lang } = useLang();

  return (
    <div className="tone-selector">
      <label className="section-label">{t(lang, 'tone.label')}</label>
      <div className="tone-grid">
        {TONES.map(tone => (
          <button
            key={tone.id}
            className={`tone-btn ${value === tone.id ? 'active' : ''}`}
            onClick={() => onChange(tone.id)}
          >
            {t(lang, tone.key)}
          </button>
        ))}
      </div>
    </div>
  );
}
