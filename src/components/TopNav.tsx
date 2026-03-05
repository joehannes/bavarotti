import LanguageToggle from './LanguageToggle';
import type { Language } from '../services/i18n';
import type { Translations } from '../services/types';

type TopNavProps = {
  translations: Translations;
  language: Language;
  brandName: string;
  onLanguageChange: (language: Language) => void;
  onOrderClick: () => void;
};

const TopNav = ({
  translations,
  language,
  brandName,
  onLanguageChange,
  onOrderClick,
}: TopNavProps) => (
  <header className="top-nav">
    <div className="top-nav__inner">
      <a className="top-nav__brand" href="#top" aria-label={brandName}>
        <img src="/favicon-96x96.png" alt={brandName} loading="eager" />
        <span>{brandName.toUpperCase()}</span>
      </a>
      <div className="top-nav__actions">
        <button type="button" className="btn btn--ghost top-nav__order" onClick={onOrderClick}>
          {translations['cta.order'] ?? 'Order'}
        </button>
        <LanguageToggle current={language} onChange={onLanguageChange} />
      </div>
    </div>
  </header>
);

export default TopNav;
