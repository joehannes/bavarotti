import type { Language } from '../services/i18n';

type LanguageToggleProps = {
  current: Language;
  onChange: (language: Language) => void;
};

const LanguageToggle = ({ current, onChange }: LanguageToggleProps) => (
  <div className="language-toggle">
    <button
      className={`language-toggle__btn ${current === 'es' ? 'is-active' : ''}`}
      onClick={() => onChange('es')}
      type="button"
    >
      ES
    </button>
    <button
      className={`language-toggle__btn ${current === 'en' ? 'is-active' : ''}`}
      onClick={() => onChange('en')}
      type="button"
    >
      EN
    </button>
  </div>
);

export default LanguageToggle;
