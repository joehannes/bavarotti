import type { Translations } from '../services/types';
import LanguageToggle from './LanguageToggle';
import type { Language } from '../services/i18n';

type FooterProps = {
  translations: Translations;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onAdminToggle: () => void;
};

const Footer = ({ translations, language, onLanguageChange, onAdminToggle }: FooterProps) => (
  <footer className="footer">
    <div className="footer__content">
      <div>
        <h3>{translations['footer.title']}</h3>
        <p>{translations['footer.subtitle']}</p>
      </div>
      <div className="footer__links">
        <a
          href={translations['footer.whatsappUrl'] ?? '#'}
          target="_blank"
          rel="noreferrer"
        >
          {translations['footer.whatsapp']}
        </a>
        <a
          href={translations['footer.instagramUrl'] ?? '#'}
          target="_blank"
          rel="noreferrer"
        >
          {translations['footer.instagram']}
        </a>
        <button className="link-button" type="button" onClick={onAdminToggle}>
          {translations['footer.admin']}
        </button>
      </div>
      <LanguageToggle current={language} onChange={onLanguageChange} />
    </div>
    <p className="footer__legal">{translations['footer.legal']}</p>
  </footer>
);

export default Footer;
