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
  const title = translations['footer.title'] ?? 'Bavarotti';
  const subtitle = translations['footer.subtitle'] ?? 'Coastal Italian flavors.';
  const legal = translations['footer.legal'] ?? '';

  return (
    <footer className="footer">
      <div className="footer__content">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        <div className="footer__social-menu">
          <p><strong>Instagram:</strong> @bavarottibeacheats</p>
          <p><strong>Facebook:</strong> @bavarottibeacheats</p>
          <p>
            <strong>WhatsApp:</strong>{' '}
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              {whatsappNumber || translations['footer.whatsapp'] || 'WhatsApp'}
            </a>
          </p>
          <p>
            <strong>Location:</strong> Calle Pirata, Plaza El Pirata (donde Hotel Soles y discotheka La Luna), Los Corales, Bavaro, 23000, Punta Cana, RD
          </p>
        </div>

        <div className="footer__controls">
          <button className="btn btn--ghost footer__admin-btn" type="button" onClick={onAdminToggle}>
            {translations['footer.admin'] ?? 'Admin'}
          </button>
          <LanguageToggle current={language} onChange={onLanguageChange} />
        </div>
      </div>

      <div className="footer__map-wrap" aria-label="Bavarotti location map">
        <iframe
          title="Bavarotti Location"
          src="https://maps.google.com/maps?q=18.685306,-68.411611&z=17&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <p className="footer__legal">{legal}</p>
    </footer>
  );
};

export default Footer;
