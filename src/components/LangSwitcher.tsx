import { useLang, t } from '../i18n';

export default function LangSwitcher() {
  const { lang, setLang } = useLang();

  const toggle = () => {
    setLang(lang === 'zh' ? 'en' : 'zh');
  };

  return (
    <button className="lang-btn" onClick={toggle} title={t(lang, 'app.langBtn')}>
      <span className="lang-btn-text">{t(lang, 'app.langBtn')}</span>
    </button>
  );
}
