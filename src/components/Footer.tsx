import type { Translations } from '../services/types';
import LanguageToggle from './LanguageToggle';
import type { Language } from '../services/i18n';

type FooterProps = {
  translations: Translations;
  language: Language;
  whatsappNumber: string;
  onLanguageChange: (language: Language) => void;
  onAdminToggle: () => void;
};

const Footer = ({
  translations,
  language,
  whatsappNumber,
  onLanguageChange,
  onAdminToggle,
}: FooterProps) => {
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#';

  return (
    <footer className="footer">
      <div className="footer__content">
        <div>
          <h3>{translations['footer.title']}</h3>
          <p>{translations['footer.subtitle']}</p>
        </div>

        <div className="footer__social-menu">
          <p><strong>Instagram:</strong> @bavarottibeacheats</p>
          <p><strong>Facebook:</strong> @bavarottibeacheats</p>
          <p><strong>TikTok:</strong> @bavarottibeachvibes</p>
          <p>
            <strong>WhatsApp:</strong>{' '}
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              {whatsappNumber || translations['footer.whatsapp'] || 'WhatsApp'}
            </a>
          </p>
          <p>
            <strong>{translations['footer.weeklyTitle'] ?? 'Weekly party drops:'}</strong><br />
            {translations['footer.weekly'] ?? 'Tue Taco + DJ set • Thu Seafood sunset • Sat EDM beach combo'}
          </p>
          <p>
            <a className="btn btn--ghost" href={whatsappHref} target="_blank" rel="noreferrer">
              {translations['cta.questions'] ?? 'General questions on WhatsApp'}
            </a>
          </p>
          <p>
            <strong>Location:</strong><br/>
            Calle Pirata, Plaza El Pirata<br/>
            Donde Hotel Soles y discotheka La Luna<br/>
            Los Corales, Bavaro<br/>
            23000, Punta Cana<br/>
            República Dominicana<br/>
          </p>
        </div>

        <div className="footer__controls">
          <button className="btn btn--ghost footer__admin-btn" type="button" onClick={onAdminToggle}>
            {translations['footer.admin'] ?? 'Admin'}
          </button>
          <LanguageToggle current={language} onChange={onLanguageChange} />
        </div>
      </div>
      <p><br/></p>

      <div className="w-full border-0 m-0 p-0" aria-label="Bavarotti location map">
        <iframe className="border-0 w-full m-0 p-0" title="Bavarotti Location" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15118.15409415875!2d-68.41739715!3d18.684693250000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ea8edc7af46a015%3A0x51219d6d39aa594c!2sPlaza%20El%20Pirata!5e0!3m2!1sen!2sdo!4v1772724870456!5m2!1sen!2sdo" width="600" height="450" loading="lazy"></iframe>
      </div>

      <p className="footer__legal">{translations['footer.legal']}</p>
    </footer>
  );
};

export default Footer;
